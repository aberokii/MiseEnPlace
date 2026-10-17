// T1: system prompt + submit_audit tool for the real audit. Owned by T1 (Dev 1).
import type Anthropic from '@anthropic-ai/sdk';
import { CHECKLIST } from '@/lib/checklist';
import { STATS } from '@/lib/stats';
import { ITEM_IDS, type BusinessInput } from '@/lib/types';

const STATUSES = ['have', 'partial', 'missing', 'unknown'] as const;
const EFFORTS = ['minutes', 'hours', 'days'] as const;

/** Client tool Claude must call exactly once with the finished audit. */
export const SUBMIT_AUDIT_TOOL: Anthropic.Messages.Tool = {
  name: 'submit_audit',
  description:
    'Submit the finished audit: the business you found and exactly one entry for each of the 12 checklist items. Call this exactly once, as the final step.',
  input_schema: {
    type: 'object',
    properties: {
      business: {
        type: 'object',
        description: 'The business as found online. Leave optional fields out if not found.',
        properties: {
          name: { type: 'string' },
          category: { type: 'string' },
          address: { type: 'string', description: 'Street, postcode, city if found' },
          website: { type: 'string', description: 'Official website URL if found' },
          mapsUrl: { type: 'string', description: 'Google Maps URL of the listing if found' },
        },
        required: ['name', 'category'],
      },
      items: {
        type: 'array',
        description: 'Exactly one entry per checklist item id.',
        items: {
          type: 'object',
          properties: {
            item_id: { type: 'string', enum: [...ITEM_IDS] },
            status: { type: 'string', enum: [...STATUSES] },
            evidence: { type: 'string', description: 'One concrete sentence naming the source and what you saw or did not find.' },
            why: { type: 'string', description: '1-2 plain sentences for this owner, no jargon.' },
            impact_stat_id: {
              type: ['string', 'null'],
              description: 'An id from the stats list whose item_id matches this item, otherwise null.',
            },
            effort: { type: 'string', enum: [...EFFORTS] },
          },
          required: ['item_id', 'status', 'evidence', 'why', 'impact_stat_id', 'effort'],
        },
      },
    },
    required: ['business', 'items'],
  },
};

function checklistBlock(): string {
  return CHECKLIST.map(
    (i) =>
      `- id: ${i.id} | tier: ${i.tier} | title: ${i.title} | askOwner: ${i.askOwner ? 'yes' : 'no'}\n  how to check: ${i.checkHint}`,
  ).join('\n');
}

function statsBlock(): string {
  if (STATS.length === 0) return '(no stats available: always use null)';
  return STATS.map((s) => `- id: ${s.id} | item_id: ${s.item_id} | claim: ${s.claim}`).join('\n');
}

export function buildAuditSystemPrompt(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `You audit the online presence of a small local business for a non-technical owner. Today is ${today}.

Check ONLY the 12 items in the checklist below. Return exactly one AuditItem per item, in this order. Do not invent other items.

CHECKLIST
${checklistBlock()}

HOW TO WORK
1. Find the business first: search its name + city. Confirm the address and category match. Record the official website URL and the Google Maps URL if you find them. If several businesses match, pick the one in the given city and say so in the evidence.
2. Use web_search for listings, reviews and social profiles. Use web_fetch to open the website (if any) to check for Impressum, Datenschutz and a mobile viewport tag.
3. Keep it fast: at most 6 searches and 4 fetches. Do not fetch the same page twice.

RULES FOR EACH ITEM
- status: decide have / partial / missing from what you actually saw. Items marked askOwner stay 'unknown' unless the web clearly shows the answer. If there is no website, the website, impressum and mobile_friendly items are 'missing', not 'unknown'.
- evidence: one concrete sentence of what you saw or did not find, naming the source, e.g. "Google listing shows no opening hours" or "No website found in the first 10 search results for '<name> <city>'".
- why: 1-2 plain sentences for this owner about why the item matters. No jargon.
- impact_stat_id: ONLY an id from the stats list below whose item_id matches the item, else null. Never write numbers or percentages that are not in your evidence or in that stat.
- effort: realistic for a non-technical owner: minutes, hours or days.

STATS LIST (the only statistics you may reference)
${statsBlock()}

FINISH
When you have enough evidence, call submit_audit exactly once with the business and all 12 items. Do not write a long report in text; the tool call is the result.`;
}

export function buildAuditUserMessage(input: BusinessInput): string {
  return `Audit this business:
- Name: ${input.name}
- City: ${input.city}
- Category: ${input.category}

Search the web, check the 12 checklist items, then call submit_audit once.`;
}
