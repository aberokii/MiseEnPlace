// The 12 fixed checklist items. OWNED BY DEV 1 - do not change in other tasks.
import type { ChecklistItem, ItemId, Tier } from './types';

export const CHECKLIST: ChecklistItem[] = [
  // ---- Must have ----
  {
    id: 'google_profile',
    tier: 'must',
    title: 'Google Business Profile, claimed and complete',
    description: 'Your business shows up on Google Maps with correct hours, phone number and photos.',
    checkHint:
      'Search "<name> <city>" on Google. Check whether a Maps listing exists, whether it looks claimed, and whether hours, phone and photos are present.',
    action: 'guide',
    askOwner: false,
  },
  {
    id: 'website',
    tier: 'must',
    title: 'Website or one-page site',
    description: 'A simple page that tells people what you offer, where you are and how to reach you.',
    checkHint:
      'Search for an official site for "<name> <city>" (ignore directories like Yelp or TripAdvisor). If found, fetch it and confirm it belongs to this business.',
    action: 'build',
    askOwner: false,
  },
  {
    id: 'impressum',
    tier: 'must',
    title: 'Impressum and privacy notice',
    description: 'The legal notice and privacy page every German business website must have.',
    checkHint:
      'If a website exists, fetch it and look for an "Impressum" and "Datenschutz" link or page. No website means this is missing too.',
    action: 'guide',
    askOwner: false,
  },
  {
    id: 'consistent_info',
    tier: 'must',
    title: 'Same contact details and hours everywhere',
    description: 'Your address, phone number and opening hours match on Google, your site and social media.',
    checkHint:
      'Compare address, phone and opening hours between the Google listing, the website and any social profile. Note each mismatch.',
    action: 'guide',
    askOwner: false,
  },
  {
    id: 'mobile_friendly',
    tier: 'must',
    title: 'Site works on phones',
    description: 'Your website is easy to read and tap on a mobile phone, where most customers look.',
    checkHint:
      'Fetch the website and check for a viewport meta tag and responsive layout. No website means unknown is not allowed: mark missing.',
    action: 'guide',
    askOwner: false,
  },
  // ---- Good to have ----
  {
    id: 'review_replies',
    tier: 'good',
    title: 'Owner replies to reviews',
    description: 'You answer Google reviews, which shows customers you listen and care.',
    checkHint:
      'Search "<name> <city> reviews". Read recent Google reviews and count how many have an owner reply.',
    action: 'build',
    askOwner: false,
  },
  {
    id: 'online_booking',
    tier: 'good',
    title: 'Online booking or ordering',
    description: 'Customers can reserve, book or order from you online without calling.',
    checkHint:
      'Look for a reservation, booking or ordering link on the website or Google listing (e.g. OpenTable, Treatwell, Lieferando, Shopify).',
    action: 'guide',
    askOwner: false,
  },
  {
    id: 'social_channel',
    tier: 'good',
    title: 'One active social channel',
    description: 'At least one Instagram, Facebook or TikTok account with a post in the last month or two.',
    checkHint:
      'Search Instagram and Facebook for "<name> <city>". Check the date of the most recent post.',
    action: 'guide',
    askOwner: false,
  },
  {
    id: 'card_payment',
    tier: 'good',
    title: 'Card and contactless payment',
    description: 'Customers can pay by card or phone, not only cash.',
    checkHint:
      'Usually not visible online. Check Google listing attributes if present; otherwise mark unknown and ask the owner.',
    action: 'guide',
    askOwner: true,
  },
  // ---- Nice to have ----
  {
    id: 'customer_list',
    tier: 'nice',
    title: 'Email or WhatsApp customer list',
    description: 'A simple list of customers you can message about news, offers or events.',
    checkHint: 'Not visible online. Mark unknown and ask the owner.',
    action: 'guide',
    askOwner: true,
  },
  {
    id: 'ai_assistant',
    tier: 'nice',
    title: 'AI helper for FAQs and messages',
    description: 'An AI tool that answers common questions and drafts replies so you save time.',
    checkHint: 'Not visible online. Mark unknown and ask the owner.',
    action: 'guide',
    askOwner: true,
  },
  {
    id: 'bookkeeping',
    tier: 'nice',
    title: 'Simple invoicing or bookkeeping tool',
    description: 'A tool that writes invoices and keeps your books tidy for tax time.',
    checkHint: 'Not visible online. Mark unknown and ask the owner.',
    action: 'guide',
    askOwner: true,
  },
];

export function getItem(id: ItemId): ChecklistItem {
  const item = CHECKLIST.find((i) => i.id === id);
  if (!item) throw new Error(`Unknown checklist item: ${id}`);
  return item;
}

export function itemsByTier(): Record<Tier, ChecklistItem[]> {
  return {
    must: CHECKLIST.filter((i) => i.tier === 'must'),
    good: CHECKLIST.filter((i) => i.tier === 'good'),
    nice: CHECKLIST.filter((i) => i.tier === 'nice'),
  };
}
