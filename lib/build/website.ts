// "Build it: website + Impressum" (T2). Called by app/api/build/route.ts.
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { MODEL } from '@/lib/prompt';
import { WEBSITE_SYSTEM_PROMPT, websiteUserPrompt } from '@/lib/prompts/website';
import { SITE_CSS, SITE_FONTS_HREF } from './siteTheme';
import type { BuildRequest, BuildResponse } from '@/lib/types';

const MIN_BODY_LENGTH = 1500;

const SiteSchema = z.object({ lang: z.string(), title: z.string(), body: z.string(), learn: z.string() });

// Structured output instead of a forced tool call: claude-sonnet-5-5 rejects tool_choice 'tool' / 'any'.
const SITE_FORMAT: Anthropic.Messages.JSONOutputFormat = {
  type: 'json_schema',
  schema: {
    type: 'object',
    properties: {
      lang: { type: 'string', description: 'BCP 47 language code for the page, e.g. "de".' },
      title: { type: 'string', description: 'The page <title>.' },
      body: { type: 'string', description: 'Inner HTML of <body>, using only the design-system classes.' },
      learn: { type: 'string', description: '2-3 plain sentences for the owner.' },
    },
    required: ['lang', 'title', 'body', 'learn'],
    additionalProperties: false,
  },
};

export async function buildWebsite(req: BuildRequest): Promise<BuildResponse> {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY server-side

  // One retry: a too-short page means the model skipped sections.
  for (let attempt = 1; attempt <= 2; attempt++) {
    const started = Date.now();
    // Streaming avoids the SDK's timeout guard for long non-streaming responses.
    const message = await client.messages
      .stream({
        model: MODEL,
        max_tokens: 16000,
        system: WEBSITE_SYSTEM_PROMPT,
        output_config: { format: SITE_FORMAT },
        messages: [{ role: 'user', content: websiteUserPrompt(req.audit) }],
      })
      .finalMessage();

    console.log(
      `[build/website] attempt ${attempt}: ${Date.now() - started}ms, ` +
        `${message.usage.input_tokens} in / ${message.usage.output_tokens} out tokens, stop=${message.stop_reason}`,
    );

    const text = message.content.find((b) => b.type === 'text')?.text;
    const parsed = SiteSchema.safeParse(parseJson(text));
    if (!parsed.success) {
      console.warn(`[build/website] attempt ${attempt}: output is not valid { lang, title, body, learn } JSON`);
      continue;
    }

    const body = sanitizeBody(parsed.data.body);
    if (body.length < MIN_BODY_LENGTH) {
      console.warn(`[build/website] attempt ${attempt}: body too short (${body.length} chars)`);
      continue;
    }
    return { kind: 'html', html: wrapDocument(parsed.data, body), learn: parsed.data.learn };
  }

  throw new Error('The website could not be generated. Please try again.');
}

function parseJson(text: string | undefined): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

// The head and stylesheet are ours, so every built site uses the design system no matter what the model writes.
function wrapDocument({ lang, title }: { lang: string; title: string }, body: string): string {
  const safeLang = /^[a-z]{2}(-[A-Za-z]{2})?$/.test(lang) ? lang : 'de';
  return `<!doctype html>
<html lang="${safeLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="${SITE_FONTS_HREF}">
<style>${SITE_CSS}</style>
</head>
<body>
${body}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Safety net on top of the prompt: the page is shown in our app and downloaded by the owner.
// Inline styles and stylesheets are stripped too, so the design system can't be overridden.
export function sanitizeBody(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed|svg)\b[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<(script|style|iframe|object|embed|svg|link|meta|img|base)\b[^>]*>/gi, '')
    .replace(/<\/?(html|head|body)\b[^>]*>/gi, '')
    .replace(/\s+(on[a-z]+|style)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["']?)\s*javascript:[^"'\s>]*\2/gi, '$1="#"');
}
