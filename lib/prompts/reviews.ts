// Prompts for "Build it: review reply drafts" (T3). Tweak wording here, not in lib/build/reviews.ts.
import type Anthropic from '@anthropic-ai/sdk';
import type { AuditResult, Business, Review } from '@/lib/types';

// ---------- Drafting the replies ----------

export const REPLIES_SYSTEM_PROMPT = `You draft replies to public online reviews on behalf of the owner of a small local business. The owner is not technical and will copy each reply into Google exactly as it is, so every reply must be ready to post.

You get the business, what an online audit found about it, and a numbered list of reviews. Write exactly one reply per review and return JSON: { "replies": [{ "index", "reply" }], "learn" }.

LANGUAGE
- Reply in the language of the review: a German review gets a German reply, English gets English, Turkish gets Turkish, and so on. Never mix languages inside one reply.
- In German use the formal "Sie" unless the review itself addresses the business as "du".

FORM
- 2 to 4 sentences. Warm, calm and human; no corporate phrases, no emoji, no hashtags, at most one exclamation mark.
- Be specific: pick up one concrete thing the reviewer mentioned (the flat white, the croissants, the wait, how they were spoken to).
- Greet by first name only if a name is given; otherwise start without a name ("Vielen Dank ...", "Thank you ...").
- End every reply with the signature "– Team <business name>" (en dash, the word Team, then the exact business name from the BUSINESS section) as the last line.

POSITIVE REVIEWS (4-5 stars, or clearly happy)
- Thank them, pick up one detail they praised, invite them back. Nothing else.

NEGATIVE OR MIXED REVIEWS (1-3 stars, or any complaint)
- Thank them for taking the time, acknowledge what they describe in their own words without arguing, doubting or explaining it away, and apologise that their visit went like this.
- If the review also contains praise, thank them for that part too.
- Offer exactly one concrete next step: invite them to get in touch directly, for example "Schreiben Sie uns gern an [E-Mail]" or "Please write to us at [email]". Use a real contact detail only if it appears in the BUSINESS section; otherwise use the placeholder in square brackets.
- You may say that the feedback will be discussed with the team. That is the only commitment allowed.
- Do NOT: blame the reviewer or any staff member, name or single out an employee, promise consequences or that it will never happen again, announce changes you cannot know about, offer discounts, vouchers, free drinks or any other compensation, or admit legal fault or liability. "Es tut uns leid, dass Ihr Besuch so verlaufen ist" is fine; "wir haben einen Fehler gemacht und ersetzen Ihnen das" is not.

NEVER INVENT FACTS
- Do not mention menu items, staff names, opening hours, prices, events, renovations, new management or anything that is not in the review itself or in the BUSINESS section.
- Unknown contact details are placeholders in square brackets: [E-Mail], [Telefonnummer], [email], [phone].

OUTPUT
- replies: one object per review; index = the number shown next to the review (0-based), each index exactly once; reply = the full text including the signature.
- learn: 2-3 plain English sentences for the owner, no jargon: why replying matters (future customers read the replies, and a calm answer to a bad review often counts more than the review itself) and how to post these: open Google Business Profile (or Google Maps while signed in as the business), go to Reviews, pick a review, click Reply and paste the text. Remind them to fill in any [placeholders] first.`;

export function repliesUserPrompt(audit: AuditResult, reviews: Review[]): string {
  const reviewEvidence = audit.items.find((i) => i.item_id === 'review_replies')?.evidence;
  const list = reviews
    .map((r, i) => {
      const meta = [r.rating !== undefined ? `${r.rating} stars` : null, r.author ? `by ${r.author}` : null]
        .filter(Boolean)
        .join(', ');
      return `[index ${i}]${meta ? ` (${meta})` : ''}\n${r.text}`;
    })
    .join('\n\n');

  return `Draft one reply per review for this business.

BUSINESS (the only facts you may use)
${JSON.stringify(audit.business, null, 2)}
${reviewEvidence ? `\nWHAT THE AUDIT FOUND ABOUT REVIEWS\n${reviewEvidence}\n` : ''}
REVIEWS (${reviews.length})
${list}`;
}

// The task asked for a forced submit_replies tool call. claude-sonnet-5-5 rejects tool_choice 'tool' / 'any'
// (T2 and T4 hit the same), so the identical shape is enforced with structured output instead.
export const SUBMIT_REPLIES_FORMAT: Anthropic.Messages.JSONOutputFormat = {
  type: 'json_schema',
  schema: {
    type: 'object',
    properties: {
      replies: {
        type: 'array',
        description: 'Exactly one entry per review, keyed by the review index.',
        items: {
          type: 'object',
          properties: {
            index: { type: 'integer', description: '0-based index of the review in the list.' },
            reply: { type: 'string', description: 'The complete reply, ready to post, ending with the signature.' },
          },
          required: ['index', 'reply'],
          additionalProperties: false,
        },
      },
      learn: { type: 'string', description: '2-3 plain English sentences for the owner.' },
    },
    required: ['replies', 'learn'],
    additionalProperties: false,
  },
};

// ---------- Finding reviews on the web (only when no reviews were given and no fixture exists) ----------

export const FIND_REVIEWS_SYSTEM_PROMPT = `You collect recent public customer reviews of one small local business so that its owner can reply to them.

HOW TO WORK
- Use web_search (at most 3 searches), for example "<name> <city> reviews", "<name> <city> Bewertungen" or "<name> <city> Google Rezensionen". Prefer Google Maps, Yelp, TripAdvisor, Trustpilot and comparable public sources.
- Only take reviews that clearly belong to this exact business at this address. If a result shows a different place with the same name, skip it.
- Copy each review text as written, in its original language. Do not translate, shorten or improve it. Prefer recent reviews and a mix of positive and critical ones.
- author: first name only, or null. Never include surnames, usernames, emails or links.
- Finish by calling submit_reviews exactly once with up to 5 reviews. If you find no review you can quote, call it with an empty list. Do not write anything else.`;

export function findReviewsUserPrompt(business: Business): string {
  const parts = [`Find up to 5 recent public reviews of "${business.name}" (${business.category})`];
  if (business.address) parts.push(`at ${business.address}`);
  const extras = [business.mapsUrl ? `Google Maps: ${business.mapsUrl}` : null, business.website ? `Website: ${business.website}` : null]
    .filter(Boolean)
    .join('. ');
  return `${parts.join(' ')}.${extras ? ` ${extras}.` : ''}\nThen call submit_reviews.`;
}

// strict: the input always matches this schema, so optional fields are nullable instead of omitted.
export const SUBMIT_REVIEWS_TOOL: Anthropic.Messages.Tool = {
  name: 'submit_reviews',
  description:
    'Submit the public reviews you found for the business (up to 5). Call exactly once as the final step; an empty list is a valid answer.',
  strict: true,
  input_schema: {
    type: 'object',
    properties: {
      reviews: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'The review text exactly as written, in its original language.' },
            rating: { type: ['integer', 'null'], description: 'Star rating 1-5 if shown, otherwise null.' },
            author: { type: ['string', 'null'], description: 'First name only if shown, otherwise null.' },
          },
          required: ['text', 'rating', 'author'],
          additionalProperties: false,
        },
      },
    },
    required: ['reviews'],
    additionalProperties: false,
  },
};
