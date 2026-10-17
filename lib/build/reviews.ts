// "Build it: review reply drafts" (T3). Called by app/api/build/route.ts.
// Reviews come from, in this order: the request body, fixtures/<slug>-reviews.json, Claude + web search.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { MODEL } from '@/lib/prompt';
import {
  FIND_REVIEWS_SYSTEM_PROMPT,
  REPLIES_SYSTEM_PROMPT,
  SUBMIT_REPLIES_FORMAT,
  SUBMIT_REVIEWS_TOOL,
  findReviewsUserPrompt,
  repliesUserPrompt,
} from '@/lib/prompts/reviews';
import type { AuditResult, Business, BuildRequest, BuildResponse, Review } from '@/lib/types';

const MAX_REVIEWS = 8; // one Claude call drafts every reply
const MAX_SEARCHED_REVIEWS = 5;
const MAX_SEARCH_TURNS = 5;
const FIXTURES_DIR = path.join(process.cwd(), 'fixtures');

// Words that mean a reply promised a discount or compensation; one retry if any reply contains them.
const COMPENSATION =
  /(rabatt|gutschein|voucher|coupon|discount|kostenlos|gratis|for free|on the house|aufs haus|refund|erstatt|indirim|ücretsiz|\d+\s?%)/i;

const ReviewSchema = z.object({
  text: z.string().trim().min(1),
  rating: z.number().min(1).max(5).optional(),
  author: z.string().trim().min(1).optional(),
});
const ReviewsFileSchema = z.array(ReviewSchema);
const SubmitRepliesSchema = z.object({
  replies: z.array(z.object({ index: z.number().int(), reply: z.string().trim().min(1) })),
  learn: z.string().trim().min(1),
});
const SubmitReviewsSchema = z.object({
  reviews: z.array(z.object({ text: z.string(), rating: z.number().nullable(), author: z.string().nullable() })),
});

type Reply = { review: Review; reply: string };
type ReviewSource = 'request' | 'fixture' | 'web_search';

export async function buildReviewReplies(req: BuildRequest): Promise<BuildResponse> {
  const client = new Anthropic(); // ANTHROPIC_API_KEY from .env, server-side only
  const name = req.audit.business.name;

  const { reviews, source } = await resolveReviews(client, req);
  console.log(`[build/reviews] ${name}: ${reviews.length} review(s) from ${source}`);
  if (reviews.length === 0) {
    return { kind: 'replies', replies: [], learn: noReviewsLearn(name) };
  }

  const { replies, learn } = await draftReplies(client, req.audit, reviews);
  return { kind: 'replies', replies, learn };
}

// ---------- Where the reviews come from ----------

async function resolveReviews(client: Anthropic, req: BuildRequest): Promise<{ reviews: Review[]; source: ReviewSource }> {
  const fromRequest = cleanReviews(req.reviews ?? []);
  if (fromRequest.length > 0) return { reviews: fromRequest.slice(0, MAX_REVIEWS), source: 'request' };

  const fromFixture = await readFixtureReviews(slugify(req.audit.business.name));
  if (fromFixture.length > 0) return { reviews: fromFixture.slice(0, MAX_REVIEWS), source: 'fixture' };

  return { reviews: await searchReviews(client, req.audit.business), source: 'web_search' };
}

/** "Café Le Vent" -> "cafe-le-vent" (fixtures/cafe-le-vent-reviews.json). */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// "cafe-le-vent" also finds le-vent-reviews.json: the home search says "Café Le Vent", the research fixture "Le Vent".
async function findFixtureFile(slug: string): Promise<string | undefined> {
  let files: string[];
  try {
    files = await readdir(FIXTURES_DIR);
  } catch {
    return undefined;
  }
  const exact = `${slug}-reviews.json`;
  if (files.includes(exact)) return exact;
  return files.find((f) => f.endsWith('-reviews.json') && slug.endsWith(`-${f.slice(0, -'-reviews.json'.length)}`));
}

async function readFixtureReviews(slug: string): Promise<Review[]> {
  if (!slug) return [];
  const name = await findFixtureFile(slug);
  if (!name) return [];
  const file = path.join(FIXTURES_DIR, name);
  let raw: string;
  try {
    raw = await readFile(file, 'utf8');
  } catch {
    return []; // no fixture for this business: fine, we search instead
  }
  try {
    return cleanReviews(ReviewsFileSchema.parse(JSON.parse(raw)));
  } catch (err) {
    console.warn(`[build/reviews] ${path.basename(file)} is not a valid Review[] file, skipping it`, err);
    return [];
  }
}

/** Drops empty or duplicate reviews and anything that is not a Review. */
function cleanReviews(input: Review[]): Review[] {
  const seen = new Set<string>();
  const out: Review[] = [];
  for (const candidate of input) {
    const parsed = ReviewSchema.safeParse(candidate);
    if (!parsed.success) continue;
    const key = parsed.data.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(parsed.data);
  }
  return out;
}

// Claude + Anthropic's server-side web search (max 3 searches), finishing with a submit_reviews tool call.
// claude-sonnet-5-5 rejects a forced tool_choice, so the prompt asks for the call and we nudge once if it is missing.
async function searchReviews(client: Anthropic, business: Business): Promise<Review[]> {
  const started = Date.now();
  const tools: Anthropic.Messages.ToolUnion[] = [
    { type: 'web_search_20260318', name: 'web_search', max_uses: 3 },
    SUBMIT_REVIEWS_TOOL,
  ];
  const messages: Anthropic.Messages.MessageParam[] = [{ role: 'user', content: findReviewsUserPrompt(business) }];
  let nudged = false;

  for (let turn = 1; turn <= MAX_SEARCH_TURNS; turn++) {
    const message = await client.messages
      .stream({ model: MODEL, max_tokens: 8000, system: FIND_REVIEWS_SYSTEM_PROMPT, tools, messages })
      .finalMessage();
    messages.push({ role: 'assistant', content: message.content });

    const submit = message.content.find(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use' && b.name === 'submit_reviews',
    );
    if (submit) {
      const parsed = SubmitReviewsSchema.safeParse(submit.input);
      const reviews = parsed.success
        ? cleanReviews(
            parsed.data.reviews.map((r) => ({
              text: r.text,
              rating: r.rating !== null && r.rating >= 1 && r.rating <= 5 ? r.rating : undefined,
              author: r.author ?? undefined,
            })),
          )
        : [];
      console.log(`[build/reviews] web search: ${reviews.length} review(s) in ${turn} turn(s), ${Date.now() - started}ms`);
      return reviews.slice(0, MAX_SEARCHED_REVIEWS);
    }
    if (message.stop_reason === 'pause_turn') continue; // the server resumes the search loop with the same messages
    if (message.stop_reason === 'refusal' || nudged) break;
    nudged = true;
    messages.push({
      role: 'user',
      content: 'Now call submit_reviews exactly once with the reviews you found (an empty list if there are none).',
    });
  }

  console.warn(`[build/reviews] web search ended without submit_reviews after ${Date.now() - started}ms`);
  return [];
}

// ---------- Drafting ----------

async function draftReplies(client: Anthropic, audit: AuditResult, reviews: Review[]): Promise<{ replies: Reply[]; learn: string }> {
  const name = audit.business.name;
  const messages: Anthropic.Messages.MessageParam[] = [{ role: 'user', content: repliesUserPrompt(audit, reviews) }];
  let best: { replies: Reply[]; learn: string } | undefined;

  // One retry: covers invalid JSON, a review that got no reply, or a reply that slipped in a discount.
  for (let attempt = 1; attempt <= 2; attempt++) {
    const started = Date.now();
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: REPLIES_SYSTEM_PROMPT,
      output_config: { format: SUBMIT_REPLIES_FORMAT },
      messages,
    });
    console.log(
      `[build/reviews] attempt ${attempt}: ${Date.now() - started}ms, ` +
        `${message.usage.input_tokens} in / ${message.usage.output_tokens} out tokens, stop=${message.stop_reason}`,
    );

    const text = message.content.find((b) => b.type === 'text')?.text;
    const parsed = SubmitRepliesSchema.safeParse(parseJson(text));
    if (!parsed.success) {
      console.warn(`[build/reviews] attempt ${attempt}: output is not valid { replies, learn } JSON`);
      continue;
    }

    // Map back by index: an index that doesn't exist is dropped, a review gets at most one reply.
    const byIndex = new Map<number, string>();
    for (const { index, reply } of parsed.data.replies) {
      if (!Number.isInteger(index) || index < 0 || index >= reviews.length || byIndex.has(index)) continue;
      byIndex.set(index, withSignature(reply, name));
    }
    const replies: Reply[] = reviews.flatMap((review, i) => {
      const reply = byIndex.get(i);
      return reply ? [{ review, reply }] : [];
    });
    if (replies.length === 0) {
      console.warn(`[build/reviews] attempt ${attempt}: no reply matched a review index`);
      continue;
    }

    const problems = [
      replies.length < reviews.length ? `${reviews.length - replies.length} review(s) got no reply` : null,
      replies.some((r) => COMPENSATION.test(r.reply)) ? 'a reply offers a discount, refund or free item' : null,
    ].filter((p): p is string => p !== null);

    const result = { replies, learn: parsed.data.learn };
    if (problems.length === 0) return result;
    best = best && best.replies.length >= replies.length ? best : result;
    console.warn(`[build/reviews] attempt ${attempt}: ${problems.join('; ')}`);
    messages.push(
      { role: 'assistant', content: message.content },
      {
        role: 'user',
        content: `Please redo all replies. Problems: ${problems.join('; ')}. Return exactly one reply per index and never offer discounts, vouchers, refunds, free items or any compensation.`,
      },
    );
  }

  if (best) return best; // better an imperfect draft than nothing on stage; the warning is in the server log
  throw new Error('The replies could not be drafted. Please try again.');
}

function withSignature(reply: string, name: string): string {
  const trimmed = reply.trim();
  return trimmed.includes(`Team ${name}`) ? trimmed : `${trimmed}\n– Team ${name}`;
}

function noReviewsLearn(name: string): string {
  return (
    `We looked for public reviews of ${name} online and could not find any yet, so there is nothing to reply to right now. ` +
    'The easiest way to get your first reviews is to ask happy customers in person right after a good visit and to show the link or QR code to your Google listing at the counter or on the receipt. ' +
    'Once reviews come in, run this again and we will draft a reply for each one.'
  );
}

function parseJson(text: string | undefined): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
