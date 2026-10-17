// Small helpers over data/stats.json. Handles any number of entries (the file is replaced in T8).
import statsJson from '@/data/stats.json';
import type { ItemId, Stat } from './types';

export const STATS: Stat[] = statsJson as Stat[];

export function getStat(id: string | null | undefined): Stat | undefined {
  if (!id) return undefined;
  return STATS.find((s) => s.id === id);
}

export function statsForItem(itemId: ItemId): Stat[] {
  return STATS.filter((s) => s.item_id === itemId);
}
