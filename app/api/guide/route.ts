// STUB - replaced in T4.
// POST GuideRequest -> GuideResponse after ~1s.
import { NextResponse } from 'next/server';
import { getItem } from '@/lib/checklist';
import type { GuideRequest, GuideResponse } from '@/lib/types';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  const body = (await req.json()) as GuideRequest;
  await sleep(1000);

  const item = getItem(body.item_id);
  const response: GuideResponse = {
    steps: [
      { title: 'Open the right tool', detail: `Go to the official page for "${item.title}" and sign in with your business email.`, link: 'https://business.google.com' },
      { title: 'Fill in the basics', detail: 'Add your name, address, phone number and opening hours exactly as they appear on your door.' },
      { title: 'Check it on your phone', detail: 'Search for your business on your phone and confirm what customers see matches what you entered.' },
    ],
    learn: `The AI looked at what is already online about your business and turned "${item.title}" into three concrete steps. Next time, you can ask any AI assistant: "Give me 3 steps to set up ${item.title.toLowerCase()} for my ${body.audit?.business?.category ?? 'business'}".`,
  };

  return NextResponse.json(response);
}
