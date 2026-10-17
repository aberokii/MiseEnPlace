// T4: POST GuideRequest -> GuideResponse. One forced submit_guide tool call; links filtered to lib/links.ts.
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { LINKS } from '@/lib/links';
import { GUIDE_SYSTEM_PROMPT, SUBMIT_GUIDE_TOOL, guideUserPrompt } from '@/lib/prompts/guide';
import { MODEL } from '@/lib/prompt';
import { AuditResultSchema, ItemIdSchema, type GuideResponse } from '@/lib/types';

export const maxDuration = 60;

const BodySchema = z.object({ item_id: ItemIdSchema, audit: AuditResultSchema });
const OutputSchema = z.object({
  steps: z.array(z.object({ title: z.string(), detail: z.string(), link: z.string().optional() })).min(1).max(6),
  learn: z.string(),
});

// ponytail: in-memory cache per server instance, lost on restart/cold start.
const cache = new Map<string, GuideResponse>();

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request: unknown item_id or malformed audit.' }, { status: 400 });
  }
  const { item_id, audit } = parsed.data;
  const status = audit.items.find((i) => i.item_id === item_id)?.status ?? 'unknown';
  const key = `${audit.business.name}:${item_id}:${status}`;
  const hit = cache.get(key);
  if (hit) return NextResponse.json(hit);

  try {
    // This model rejects a forced tool_choice, so rely on the prompt and retry once if no tool call comes back.
    const messages: Anthropic.Messages.MessageParam[] = [{ role: 'user', content: guideUserPrompt(item_id, audit) }];
    let block: Anthropic.Messages.ToolUseBlock | undefined;
    for (let attempt = 0; attempt < 2 && !block; attempt++) {
      const res = await new Anthropic().messages.create({
        model: MODEL,
        max_tokens: 1500,
        system: GUIDE_SYSTEM_PROMPT,
        tools: [SUBMIT_GUIDE_TOOL],
        messages,
      });
      block = res.content.find((b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use');
      if (!block) {
        messages.push({ role: 'assistant', content: res.content }, { role: 'user', content: 'Now call submit_guide.' });
      }
    }
    const out = OutputSchema.parse(block?.input);
    const allowed = new Set(LINKS[item_id]);
    const response: GuideResponse = {
      steps: out.steps.map(({ link, ...s }) => (link && allowed.has(link) ? { ...s, link } : s)),
      learn: out.learn,
    };
    cache.set(key, response);
    return NextResponse.json(response);
  } catch (err) {
    console.error('guide failed', err);
    return NextResponse.json({ error: 'Could not write the guide right now. Please try again.' }, { status: 502 });
  }
}
