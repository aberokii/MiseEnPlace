// STUB - replaced in T1.
// POST BusinessInput -> NDJSON stream of AuditEvent (one JSON object per line).
import fixture from '@/fixtures/le-vent-audit.json';
import type { AuditEvent, AuditResult, BusinessInput } from '@/lib/types';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  const input = (await req.json()) as BusinessInput;
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
      const result: AuditResult = {
        ...base,
        business: { ...base.business, name: input.name || base.business.name, category: input.category || base.business.category },
        generatedAt: new Date().toISOString(),
      };
      send({ type: 'result', result });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-cache' },
  });
}
