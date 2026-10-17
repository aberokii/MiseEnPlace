// Shared contracts for Mise en Place. OWNED BY DEV 1 - do not change in other tasks.
import { z } from 'zod';

export type Tier = 'must' | 'good' | 'nice';
/** unknown = we can't tell from the web; ask the owner */
export type Status = 'have' | 'partial' | 'missing' | 'unknown';
export type Effort = 'minutes' | 'hours' | 'days';

export const ITEM_IDS = [
  'google_profile',
  'website',
  'impressum',
  'consistent_info',
  'mobile_friendly',
  'review_replies',
  'online_booking',
  'social_channel',
  'card_payment',
  'customer_list',
  'ai_assistant',
  'bookkeeping',
] as const;
export type ItemId = (typeof ITEM_IDS)[number];

export interface ChecklistItem {
  id: ItemId;
  tier: Tier;
  title: string;
  description: string;
  /** Tells the auditor how to verify this item. */
  checkHint: string;
  action: 'build' | 'guide';
  /** True when the web can't tell us; the UI should ask the owner. */
  askOwner: boolean;
}

export interface BusinessInput {
  name: string;
  city: string;
  category: string;
}

export interface Business {
  name: string;
  category: string;
  address?: string;
  website?: string;
  mapsUrl?: string;
}

export interface AuditItem {
  item_id: ItemId;
  status: Status;
  evidence: string;
  why: string;
  impact_stat_id: string | null;
  effort: Effort;
}

export interface AuditResult {
  business: Business;
  items: AuditItem[];
  /** 0-100, see lib/score.ts */
  score: number;
  /** ISO timestamp */
  generatedAt: string;
}

export interface Stat {
  id: string;
  item_id: ItemId;
  claim: string;
  value: string;
  source: string;
  url: string;
  year: number;
}

export interface Review {
  text: string;
  rating?: number;
  author?: string;
}

/** One NDJSON line from POST /api/audit. */
export type AuditEvent =
  | { type: 'tool'; name: string; detail?: string }
  | { type: 'text'; text: string }
  | { type: 'result'; result: AuditResult }
  | { type: 'error'; message: string };

export interface BuildRequest {
  item_id: 'website' | 'review_replies';
  audit: AuditResult;
  reviews?: Review[];
}

export type BuildResponse =
  | { kind: 'html'; html: string; learn: string }
  | { kind: 'replies'; replies: { review: Review; reply: string }[]; learn: string };

export interface GuideRequest {
  item_id: ItemId;
  audit: AuditResult;
}

export interface GuideResponse {
  steps: { title: string; detail: string; link?: string }[];
  learn: string;
}

// ---- zod schemas (use to validate Claude's submit_audit output and API bodies) ----

export const ItemIdSchema = z.enum(ITEM_IDS);
export const StatusSchema = z.enum(['have', 'partial', 'missing', 'unknown']);
export const EffortSchema = z.enum(['minutes', 'hours', 'days']);

export const AuditItemSchema = z.object({
  item_id: ItemIdSchema,
  status: StatusSchema,
  evidence: z.string(),
  why: z.string(),
  impact_stat_id: z.string().nullable(),
  effort: EffortSchema,
});

export const BusinessSchema = z.object({
  name: z.string(),
  category: z.string(),
  address: z.string().optional(),
  website: z.string().optional(),
  mapsUrl: z.string().optional(),
});

export const AuditResultSchema = z.object({
  business: BusinessSchema,
  items: z.array(AuditItemSchema),
  score: z.number().min(0).max(100),
  generatedAt: z.string(),
});

// Compile-time check that the zod schemas match the TS interfaces.
type _AssertItem = z.infer<typeof AuditItemSchema> extends AuditItem ? true : never;
type _AssertResult = z.infer<typeof AuditResultSchema> extends AuditResult ? true : never;
const _assertItem: _AssertItem = true;
const _assertResult: _AssertResult = true;
void _assertItem;
void _assertResult;
