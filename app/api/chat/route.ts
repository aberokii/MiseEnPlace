import Anthropic from '@anthropic-ai/sdk';
import { MODEL, CHAT_SYSTEM_PROMPT } from '@/lib/prompt';

// Minimal streaming chat endpoint from the starter. POST { messages: MessageParam[] } -> text stream.
export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: Anthropic.MessageParam[] };
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY server-side

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    system: CHAT_SYSTEM_PROMPT,
    messages,
  });

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(enc.encode(event.delta.text));
          }
        }
      } catch (err) {
        controller.enqueue(enc.encode(`\n[error] ${err instanceof Error ? err.message : 'unknown error'}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
