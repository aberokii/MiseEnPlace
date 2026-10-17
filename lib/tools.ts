import type Anthropic from '@anthropic-ai/sdk';

// Server-side tools Claude can use to look a business up on the web.
// These run on Anthropic's side; nothing to execute locally.
export const WEB_TOOLS: Anthropic.Messages.ToolUnion[] = [
  { type: 'web_search_20260209', name: 'web_search', max_uses: 8 },
  { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 5 },
];
