// T4: allowlist of official links per checklist item. Guide steps may only link to these.
// Only add URLs that are known official landing pages; an empty list is better than a guess.
import type { ItemId } from './types';

export const LINKS: Record<ItemId, string[]> = {
  google_profile: ['https://business.google.com', 'https://support.google.com/business'],
  website: [],
  impressum: [],
  consistent_info: ['https://business.google.com'],
  mobile_friendly: [],
  review_replies: ['https://support.google.com/business/answer/3474050'],
  online_booking: [],
  social_channel: ['https://business.instagram.com', 'https://www.facebook.com/business'],
  card_payment: [],
  customer_list: ['https://business.whatsapp.com'],
  ai_assistant: ['https://claude.ai'],
  bookkeeping: [],
};
