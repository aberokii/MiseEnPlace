// T4: system prompt + submit_guide tool for /api/guide.
import type Anthropic from '@anthropic-ai/sdk';
import { getItem } from '@/lib/checklist';
import { LINKS } from '@/lib/links';
import type { AuditItem, AuditResult } from '@/lib/types';

export const SUBMIT_GUIDE_TOOL: Anthropic.Messages.Tool = {
  name: 'submit_guide',
  description: 'Submit the finished step-by-step guide. Call this exactly once.',
  input_schema: {
    type: 'object',
    properties: {
      steps: {
        type: 'array',
        description: '3 to 5 steps in the order the owner should do them.',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Short imperative title, max 6 words.' },
            detail: { type: 'string', description: '1-3 plain sentences.' },
            link: { type: 'string', description: 'Optional. Must be exactly one of the allowed links, else omit.' },
          },
          required: ['title', 'detail'],
        },
      },
      learn: {
        type: 'string',
        description: '2-3 sentences: what the AI looked at, plus one tip with an example prompt the owner could type.',
      },
    },
    required: ['steps', 'learn'],
  },
};

export const GUIDE_SYSTEM_PROMPT = `You write short how-to guides for a busy, non-technical small business owner.

Style:
- Plain words, no jargon. If a technical term is unavoidable, explain it in about 5 words.
- Write in English, but keep German terms where they are the real names (Impressum, Datenschutzerklärung).
- 3 to 5 steps. Each step: a short imperative title (max 6 words) and a 1-3 sentence detail.
- Start from the owner's ACTUAL status and evidence. If the thing partly exists, do not tell them to create it; start with what is missing.
- Mention time for a step only when it is obvious ("about 10 minutes"). Never mention prices unless something is free.
- If the item needs the owner's input (askOwner) and the status is "unknown", step 1 is a quick self-check question they can answer in a minute.
- A step may include a link ONLY if it is exactly one of the allowed links for this item. Otherwise leave link out. Never invent URLs.

"learn" is 2-3 sentences: say what the AI looked at to make this guide (the audit evidence about their business), and give one tip for using an AI assistant on this kind of task themselves next time, including an example prompt they could type.

Call submit_guide exactly once.`;

export function guideUserPrompt(item_id: AuditItem['item_id'], audit: AuditResult): string {
  const item = getItem(item_id);
  const found = audit.items.find((i) => i.item_id === item_id);
  const links = LINKS[item_id];
  return `Business: ${audit.business.name} (${audit.business.category})${audit.business.address ? `, ${audit.business.address}` : ''}
Checklist item: ${item.title}. ${item.description}
Needs owner input (askOwner): ${item.askOwner ? 'yes' : 'no'}
Status: ${found?.status ?? 'unknown'}
Evidence: ${found?.evidence ?? 'Not checked'}
Why it matters: ${found?.why ?? ''}
Allowed links: ${links.length ? links.join(', ') : 'none (do not include any link)'}`;
}
