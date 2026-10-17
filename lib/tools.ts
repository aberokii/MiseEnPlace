import type Anthropic from '@anthropic-ai/sdk';

// Server-side tools Claude can use to look a business up on the web.
// They run on Anthropic's side; nothing to execute locally.
// Type strings verified against @anthropic-ai/sdk 0.135 and docs.claude.com (Oct 2026):
// newest versions are web_search_20260318 and web_fetch_20260318 (Claude 4.6+ models).
export const WEB_TOOLS: Anthropic.Messages.ToolUnion[] = [
  { type: 'web_search_20260318', name: 'web_search', max_uses: 6 },
  { type: 'web_fetch_20260318', name: 'web_fetch', max_uses: 4 },
];
