// T1: real audit. POST BusinessInput -> NDJSON stream of AuditEvent (one JSON object per line).
// ?cached=1 streams fixtures/le-vent-audit.json (stage fallback). Contract is unchanged from the T0 stub.
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import fixture from '@/fixtures/le-vent-audit.json';
import { CHECKLIST } from '@/lib/checklist';
import { MODEL } from '@/lib/prompt';
import { SUBMIT_AUDIT_TOOL, buildAuditSystemPrompt, buildAuditUserMessage } from '@/lib/prompts/audit';
import { computeScore } from '@/lib/score';
import { STATS } from '@/lib/stats';
import { WEB_TOOLS } from '@/lib/tools';
import {
  AuditItemSchema,
  AuditResultSchema,
  BusinessSchema,
  type AuditEvent,
  type AuditItem,
  type AuditResult,
  type Business,
  type BusinessInput,
} from '@/lib/types';

export const maxDuration = 120;

const MAX_TURNS = 6;
const NDJSON_HEADERS = { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-cache' };

const BusinessInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  city: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1).max(80),
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Body must be JSON' }, { status: 400 });
  }
  const parsed = BusinessInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Expected { name, city, category } as non-empty strings' }, { status: 400 });
  }
  const input = parsed.data;

  const cached = new URL(req.url).searchParams.get('cached') === '1';
  return cached ? streamFixture(input) : streamRealAudit(input, req.signal);
}

// ---------- Demo fallback: same flow as the T0 stub ----------

function streamFixture(input: BusinessInput): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AuditEvent) => controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
      const steps: AuditEvent[] = [
        { type: 'tool', name: 'web_search', detail: `${input.name} ${input.city}` },
        { type: 'tool', name: 'web_fetch', detail: 'https://www.google.com/maps/search/Le+Vent+Berlin' },
        { type: 'tool', name: 'web_search', detail: `${input.name} reviews` },
      ];
      for (const step of steps) {
        send(step);
        await sleep(700);
      }
      const base = fixture as AuditResult;
      send({
        type: 'result',
        result: {
          ...base,
          business: { ...base.business, name: input.name, category: input.category || base.business.category },
          generatedAt: new Date().toISOString(),
        },
      });
      controller.close();
    },
  });
  return new Response(stream, { headers: NDJSON_HEADERS });
}

// ---------- Real audit ----------

function streamRealAudit(input: BusinessInput, signal: AbortSignal): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AuditEvent) => controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
      try {
        const result = await runAudit(input, send, signal);
        send({ type: 'result', result });
      } catch (err) {
        send({ type: 'error', message: describeError(err) });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: NDJSON_HEADERS });
}

async function runAudit(input: BusinessInput, send: (e: AuditEvent) => void, signal: AbortSignal): Promise<AuditResult> {
  const startedAt = Date.now();
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set. Copy .env.example to .env and paste your key, then restart the server.');
  }
  const client = new Anthropic(); // ANTHROPIC_API_KEY from .env, server-side only
  const system = buildAuditSystemPrompt();
  const tools: Anthropic.Messages.ToolUnion[] = [...WEB_TOOLS, SUBMIT_AUDIT_TOOL];
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: buildAuditUserMessage(input) }];

  let inputTokens = 0;
  let outputTokens = 0;
  let turns = 0;
  let forceSubmit = false;
  let rawSubmit: unknown = undefined;

  while (turns < MAX_TURNS && rawSubmit === undefined) {
    turns += 1;
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      system,
      messages,
      tools,
      ...(forceSubmit ? { tool_choice: { type: 'tool' as const, name: 'submit_audit' } } : {}),
    });
    const onAbort = () => stream.abort();
    signal.addEventListener('abort', onAbort, { once: true });

    // Collect streamed tool inputs so we can show the query / URL as soon as the block completes.
    const pendingTools = new Map<number, { name: string; json: string }>();
    const pendingText = new Map<number, string>();

    try {
      for await (const event of stream) {
        if (event.type === 'content_block_start') {
          const block = event.content_block;
          if (block.type === 'server_tool_use') pendingTools.set(event.index, { name: block.name, json: '' });
          else if (block.type === 'text') pendingText.set(event.index, '');
        } else if (event.type === 'content_block_delta') {
          const tool = pendingTools.get(event.index);
          if (tool && event.delta.type === 'input_json_delta') tool.json += event.delta.partial_json;
          const text = pendingText.get(event.index);
          if (text !== undefined && event.delta.type === 'text_delta') pendingText.set(event.index, text + event.delta.text);
        } else if (event.type === 'content_block_stop') {
          const tool = pendingTools.get(event.index);
          if (tool) {
            send({ type: 'tool', name: tool.name, detail: toolDetail(tool.json) });
            pendingTools.delete(event.index);
          }
          const text = pendingText.get(event.index)?.trim();
          if (text) send({ type: 'text', text });
          pendingText.delete(event.index);
        }
      }
    } finally {
      signal.removeEventListener('abort', onAbort);
    }

    const message = await stream.finalMessage();
    inputTokens += message.usage.input_tokens;
    outputTokens += message.usage.output_tokens;
    messages.push({ role: 'assistant', content: message.content });

    const submit = message.content.find(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use' && b.name === 'submit_audit',
    );
    if (submit) {
      rawSubmit = submit.input;
      break;
    }
    if (message.stop_reason === 'pause_turn') continue; // server resumes the web search loop automatically
    if (message.stop_reason === 'refusal') throw new Error('Claude declined to audit this business.');
    if (forceSubmit) break;
    // Ended without the tool call: ask once more, forcing submit_audit.
    forceSubmit = true;
    messages.push({
      role: 'user',
      content: 'Now call submit_audit exactly once with the business and all 12 checklist items based on what you found. Use status "unknown" with evidence "Not checked" for anything you could not verify.',
    });
  }

  if (rawSubmit === undefined) throw new Error('Claude finished without submitting an audit. Please try again.');

  const result = normalizeAudit(rawSubmit, input);
  const ms = Date.now() - startedAt;
  console.log(
    `[audit] ${input.name}, ${input.city}: ${turns} turn(s), ${inputTokens} input + ${outputTokens} output tokens, ${(ms / 1000).toFixed(1)}s, score ${result.score}`,
  );
  return result;
}

/** Turn the raw submit_audit input into a valid AuditResult, fixing what can be fixed. */
function normalizeAudit(raw: unknown, input: BusinessInput): AuditResult {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as { business?: unknown; items?: unknown };

  const businessParsed = BusinessSchema.safeParse(obj.business);
  const business: Business = businessParsed.success ? businessParsed.data : { name: input.name, category: input.category };
  if (!business.name.trim()) business.name = input.name;
  if (!business.category.trim()) business.category = input.category;

  const byId = new Map<string, AuditItem>();
  const rawItems = Array.isArray(obj.items) ? obj.items : [];
  for (const rawItem of rawItems) {
    const candidate = rawItem && typeof rawItem === 'object' ? { ...(rawItem as Record<string, unknown>) } : {};
    if (candidate.impact_stat_id === undefined) candidate.impact_stat_id = null;
    const parsed = AuditItemSchema.safeParse(candidate);
    if (!parsed.success) continue; // unknown item_id, bad status/effort, etc.
    if (!byId.has(parsed.data.item_id)) byId.set(parsed.data.item_id, parsed.data);
  }

  const items: AuditItem[] = CHECKLIST.map((def) => {
    const item = byId.get(def.id) ?? {
      item_id: def.id,
      status: 'unknown' as const,
      evidence: 'Not checked',
      why: def.description,
      impact_stat_id: null,
      effort: 'hours' as const,
    };
    const stat = item.impact_stat_id ? STATS.find((s) => s.id === item.impact_stat_id) : undefined;
    return { ...item, impact_stat_id: stat && stat.item_id === item.item_id ? stat.id : null };
  });

  return AuditResultSchema.parse({
    business,
    items,
    score: computeScore(items),
    generatedAt: new Date().toISOString(),
  });
}

function toolDetail(json: string): string {
  try {
    const input = JSON.parse(json || '{}') as Record<string, unknown>;
    const value = input.query ?? input.url;
    return typeof value === 'string' ? value : '';
  } catch {
    return '';
  }
}

function describeError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) return 'The Claude API key is missing or invalid. Add ANTHROPIC_API_KEY to .env.';
  if (err instanceof Anthropic.RateLimitError) return 'Claude is busy right now (rate limit). Please try again in a moment.';
  if (err instanceof Anthropic.APIError) return `Claude API error ${err.status ?? ''}: ${err.message}`;
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}
