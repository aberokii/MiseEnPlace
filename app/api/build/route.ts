// POST BuildRequest -> BuildResponse. Dispatcher: 'website' (T2) and 'review_replies' (T3).
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildWebsite } from '@/lib/build/website';
import { AuditResultSchema } from '@/lib/types';
import type { BuildRequest, BuildResponse } from '@/lib/types';

export const maxDuration = 60;

const BuildRequestSchema = z.object({
  item_id: z.enum(['website', 'review_replies']),
  audit: AuditResultSchema,
  reviews: z
    .array(z.object({ text: z.string(), rating: z.number().optional(), author: z.string().optional() }))
    .optional(),
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  const parsed = BuildRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid BuildRequest', issues: parsed.error.issues }, { status: 400 });
  }
  const body: BuildRequest = parsed.data;

  try {
    if (body.item_id === 'website') {
      return NextResponse.json(await buildWebsite(body));
    }
    return NextResponse.json(await stubReviewReplies(body));
  } catch (err) {
    console.error('[build]', err);
    const message = err instanceof Error ? err.message : 'Something went wrong while building.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// STUB - replaced in T3.
async function stubReviewReplies(body: BuildRequest): Promise<BuildResponse> {
  await sleep(1500);
  const name = body.audit.business.name;
  return {
    kind: 'replies',
    replies: [
      {
        review: { text: 'Super gemütlich, tolle Drinks und nette Leute!', rating: 5, author: 'Lena' },
        reply: `Liebe Lena, vielen Dank für Ihre lieben Worte! Schön, dass Sie sich bei uns wohlgefühlt haben – wir freuen uns auf Ihren nächsten Besuch. – Team ${name}`,
      },
      {
        review: { text: 'Am Wochenende sehr langsamer Service.', rating: 2, author: 'Tom' },
        reply: `Lieber Tom, danke für Ihre ehrliche Rückmeldung. Es tut uns leid, dass Sie warten mussten. Schreiben Sie uns gern an [E-Mail], damit wir mehr erfahren. – Team ${name}`,
      },
    ],
    learn: 'The AI read your recent reviews and drafted one reply for each in your voice. Copy a reply, open your Google Business Profile, go to Reviews and paste it under "Reply".',
  };
}
