// Score 0-100 from audit items. OWNED BY DEV 1.
import { getItem } from './checklist';
import type { AuditItem, Status, Tier } from './types';

const TIER_WEIGHT: Record<Tier, number> = { must: 3, good: 2, nice: 1 };
const STATUS_VALUE: Record<Exclude<Status, 'unknown'>, number> = { have: 1, partial: 0.5, missing: 0 };

/** Weighted score; 'unknown' items are skipped entirely. Returns 0-100 rounded. */
export function computeScore(items: AuditItem[]): number {
  let earned = 0;
  let possible = 0;
  for (const item of items) {
    if (item.status === 'unknown') continue;
    const weight = TIER_WEIGHT[getItem(item.item_id).tier];
    earned += weight * STATUS_VALUE[item.status];
    possible += weight;
  }
  if (possible === 0) return 0;
  return Math.round((earned / possible) * 100);
}

// Tiny self-check, only runs under NODE_ENV=test (no test framework needed).
if (process.env.NODE_ENV === 'test') {
  const base = { evidence: '', why: '', impact_stat_id: null, effort: 'hours' as const };
  const a = computeScore([
    { ...base, item_id: 'website', status: 'have' }, // must, 3
    { ...base, item_id: 'review_replies', status: 'partial' }, // good, 2 -> 1
    { ...base, item_id: 'bookkeeping', status: 'missing' }, // nice, 1 -> 0
    { ...base, item_id: 'card_payment', status: 'unknown' }, // skipped
  ]);
  // (3 + 1 + 0) / (3 + 2 + 1) = 4/6 = 67
  if (a !== 67) throw new Error(`computeScore expected 67, got ${a}`);
  if (computeScore([]) !== 0) throw new Error('computeScore([]) should be 0');
  console.log('score.ts self-check passed');
}
