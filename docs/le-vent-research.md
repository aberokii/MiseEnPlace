# Le Vent: research for the demo business

Collected 2026-10-17 from public sources. Free sources came first; Apify filled the gaps for about $0.48 in total. Reviewer names, staff names and personal phone numbers are left out on purpose: the repo is public and the team rule is "no real personal data". The raw dataset (321 reviews, social posts, run logs) stays with Gerad and is not committed.

## The real business
| Fact | Value | Source |
|---|---|---|
| Name on Google | Café Le Vent (also shown as "Le Vent Coffee Bar") | Google Maps |
| Address | Köpenicker Str. 44, 10179 Berlin, near Michaelkirchplatz, about 200 m from Taxfix | Google Maps |
| Category | Café: coffee, French-style pastries, sandwiches, ice cream. The team also fixes bikes | Google Maps, Yelp (owner text), Techspace blog 2020 |
| Google rating | ★4.6 from 321 reviews | Google Maps via Apify, 2026-10-17 |
| Google hours | Mo–Fr 08:00–16:00, Sa–So 10:00–15:00 | Google Maps |
| Google website field | facebook.com/LeVentCoffee (no website) | Google Maps |
| Google phone | none listed | Google Maps |
| Google photos | 94; no menu, ordering or booking link | Google Maps |
| Instagram | @cafe_le_vent, 242 followers, 6 posts, last post 16 May 2023 | Instagram via Apify |
| Facebook | 118 followers, last post 5 Mar 2021, 3 recommendations (all positive, 2019–2021) | Facebook via Apify |
| Digital stamp card | Joined gobonki in June 2026 (gobonki's collab post) | Instagram |
| Delivery / surplus | Uber Eats listing with full menu, delivery switched off; Too Good To Go active (★4.3) | Uber Eats, Too Good To Go |
| Payment | Cash, Maestro, contactless / Apple Pay | OpenStreetMap, Apple Maps |

**Note for Dev 1:** `fixtures/le-vent-audit.json` currently describes a different, invented Le Vent (Weserstraße 32, Neukölln, ★4.5/128, @levent.berlin with ~2,100 followers). None of that matches the real café. The suggested statuses below are based on real evidence. The fixture is a shared contract, so this PR doesn't change it.

## What the 321 Google reviews say
- **Stars:** 255 five-star, 36 four-star, 10 three-star, 7 two-star, 13 one-star. 217 have text.
- **Owner replies: 1 of 321**, from 2019.
- **Languages:** English 111, German 87, Spanish 8, Turkish 4, Dutch 2, other 3. The rest are star-only. An owner reply tool has to work in several languages.
- **Most mentioned (keyword match, 217 texts):** coffee 143, friendly service 91, pastries and croissants 37, price 37, sandwiches 36, atmosphere 27, ice cream 13.
- **The September 2026 cluster:** five reviews on 5–6 Sep 2026 (1–2★) all describe rude staff. One is in Turkish and asks the owner to get in touch. **None has a reply.** These are the most recent negative reviews and the natural demo for the review-replies build.
- **Other recurring complaints:** extra charges for ice and oat milk (2025), Too Good To Go and Uber Eats orders cancelled at the last minute (2024), and one guest who found the café closed when it was listed as open (Apr 2025).

`fixtures/le-vent-reviews.json` holds five recent reviews in the `Review` shape (text and rating, no author): three from the September cluster (EN, DE, TR) and two recent 5★ reviews.

## Suggested audit statuses for the 12 checklist items
| item_id | Suggested status | Evidence |
|---|---|---|
| google_profile | partial | Listing has hours and 94 photos, but no phone, and the website field points to a dormant Facebook page |
| website | missing | No website anywhere. Google links to Facebook (last post 2021) |
| impressum | missing | No website, so no Impressum. A legal notice exists only on the Uber Eats listing |
| consistent_info | missing | Three different phone numbers and three versions of opening hours across Google, Apple, Yelp, OSM and directories. A 2025 review: listed as open, found closed |
| mobile_friendly | missing | No website to check |
| review_replies | missing | 1 owner reply in 321 Google reviews. 0 replies to the five negative reviews from Sep 2026 |
| online_booking | missing | No booking, ordering or menu link on Google. Uber Eats delivery is off |
| social_channel | partial | Instagram exists (242 followers) but has been inactive since May 2023. Facebook inactive since 2021 |
| card_payment | have | Cash, Maestro and contactless/Apple Pay (OSM, Apple Maps) |
| customer_list | partial | Digital stamp card via gobonki since June 2026. No newsletter or WhatsApp list found |
| ai_assistant | unknown | Ask the owner |
| bookkeeping | unknown | Ask the owner |

## Sources checked with nothing found
TripAdvisor (unclaimed, 0 reviews), Yelp (claimed, 0 reviews), TikTok (45 search results, none about this café), Instagram hashtags #leventcoffee and #cafelevent (no posts), Instagram location page (no posts), Foursquare (no matching venue), YouTube, X, Mastodon. Reddit, Threads and Pinterest blocked logged-out access. This is absence of evidence, not proof the café has no presence there.

## Method
- **Free:** web search, Google Maps (logged out), Uber Eats, Too Good To Go, Yelp, TripAdvisor, Apple Maps, OpenStreetMap, review aggregators (top-rated.online, Restaurant Guru, speisekarte.menu), HappyCow, Facebook and Instagram (logged out). This gave 46 distinct reviews and 25 social items.
- **Apify** (capped per run, reviewer names dropped at collection): compass/Google-Maps-Reviews-Scraper (321 reviews, $0.19), compass/crawler-google-places ($0.02), apify/facebook-reviews-scraper, apify/facebook-posts-scraper, apify/instagram-profile-scraper, apify/instagram-scraper, clockworks/tiktok-scraper ($0.17), zen-studio/swarm-place-reviews-scraper. Total about $0.48.
- Google's and Meta's terms restrict automated scraping. This was a one-off research pull on one public business for the demo. The product itself should use the Google Places API and the owner's own access.
