// POST BuildRequest -> BuildResponse. Dispatcher: 'website' (T2, lib/build/website.ts) and 'review_replies' (T3, lib/build/reviews.ts).
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildReviewReplies } from '@/lib/build/reviews';
import { buildWebsite } from '@/lib/build/website';
import { AuditResultSchema } from '@/lib/types';
import type { BuildRequest } from '@/lib/types';

// A website build takes 13-31s and may retry once, so 60s is not enough headroom.
export const maxDuration = 120;

const BuildRequestSchema = z.object({
  item_id: z.enum(['website', 'review_replies']),
  audit: AuditResultSchema,
  reviews: z
    .array(z.object({ text: z.string(), rating: z.number().optional(), author: z.string().optional() }))
    .optional(),
});

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
    return NextResponse.json(await buildReviewReplies(body));
  } catch (err) {
    // Raw SDK errors carry API JSON and request ids; log them, show the owner a friendly line.
    console.error('[build]', err);
    return NextResponse.json({ error: 'We could not build this right now. Please try again.' }, { status: 500 });
  }
}
