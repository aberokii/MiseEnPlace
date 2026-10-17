# PRD: Mise en Place, an AI Coach for Small Businesses (Impact Lab MVP)

Product: Mise en Place · Team: BizOnPlus · Claude Impact Lab Berlin · 17 Oct 2026

## TL;DR

We're building **Mise en Place**, an AI coach that tells a small business owner what digital basics they have, what's missing, and what each gap costs them. It then helps them fix the gaps, building the simple ones on the spot. It fits the theme "AI education for everyone": the owner learns why each item matters and sees AI do real work for their business.

**One-line pitch:** "Type your business name. In two minutes you know what's missing, what it's costing you, and the first fix is already built."

## Problem and user

Small business owners know they "should do something online", but not what, in which order, or whether it's worth it. Agencies are expensive, and generic advice doesn't fit their situation. So the basics stay undone: no website, an unclaimed Google profile, unanswered reviews.

**Target user (MVP):** any small local business with 1–10 people, such as a café, salon, repair shop, bakery or tradesperson. They have low tech confidence and no budget for an agency. The MVP stays business-agnostic because the must-haves are the same for almost everyone. The business category only changes which good-to-have and nice-to-have items appear.

**Demo persona:** Le Vent café/bar in Berlin as the show-case example.

## Goals and non-goals

### Goals for today

- A deployed, working prototype that audits a real business from its name and city.
- A checklist sorted into Must have, Good to have and Nice to have. Each item shows its status, why it matters, its impact with a cited source, and the effort it takes.
- Two items built live (website and review replies): the AI produces usable results the owner can take away.
- Every item has a plain-language explanation, so the owner learns and doesn't just get a to-do list.

### Non-goals (not today)

- Accounts, logins, saving progress, payments.
- Building every item automatically. Only two items are built for real; the others get guided steps.
- Deep niche or industry-specific recommendations.
- Connecting to the owner's real accounts (Google, Instagram, booking tools).

## User flow

1. **Start:** the owner enters the business name, city and category. As a fallback they can answer three quick questions if they're barely online yet ("no presence" is a valid starting point).
2. **Live audit:** the AI searches the web and checks what exists: website, Google profile, reviews, social accounts, Impressum. The owner sees each check happen in real time.
3. **Checklist:** results appear as cards in three tiers. Each card shows its status (Have / Partial / Missing), why it matters in one or two plain sentences, the impact with its source, and the effort (minutes, hours or days).
4. **Act on a card:** the owner either gets a *Build it* result (the AI produces it now) or a *Guide me* step-by-step in plain language.
5. **Learn:** every result ends with a short "what the AI just did, and how you can do it yourself next time". This is the education part of the theme.
6. **Take-away:** a one-page summary with the owner's score, their top three next steps and the item that was built.

## Checklist catalog v1

Twelve items, fixed for the MVP so results are consistent and the impact data can be checked beforehand. The AI decides each item's status and explains it; it doesn't invent new items.

| Tier | Item | How the audit checks it | Action |
|---|---|---|---|
| Must have | Google Business Profile, claimed and complete | Search the name + city; check hours, photos, phone | Guide me |
| Must have | Website or one-page site | Search for an official site; fetch it | Build it |
| Must have | Impressum + privacy notice (legally required in DE) | Fetch the site and look for an Impressum page | Build it (template) |
| Must have | Correct contact details and opening hours everywhere | Compare the site and Google listing | Guide me |
| Must have | Mobile-friendly site | Fetch the site; check the viewport and layout | Guide me |
| Good to have | Replies to reviews | Read recent reviews; count the replies | Build it (draft replies) |
| Good to have | Online booking or ordering | Look for a booking link or provider | Guide me |
| Good to have | One active social channel | Search Instagram / Facebook; check the last post | Guide me |
| Good to have | Card and contactless payment | Ask the owner | Guide me |
| Nice to have | Email or WhatsApp customer list | Ask the owner | Guide me |
| Nice to have | AI assistant for FAQs and messages | Ask the owner | Guide me |
| Nice to have | Simple bookkeeping / invoicing tool | Ask the owner | Guide me |

The *Build it* items for the live demo are the website and review replies. The website is the most visual result and includes the Impressum. Review replies show the AI writing in the owner's voice within seconds.

## Impact and data

The AI never makes up a statistic. Every impact number comes from a small library of sourced figures that the team checks today. The audit itself uses live web data.

- **Stat library (`data/stats.json`):** about 10–15 entries, each with item, claim, number, source name, URL and year. Example field: "share of consumers who read online reviews before visiting a local business." Only use studies we've actually opened, ideally recent and EU or Germany-based.
- **Rule in the prompt:** impact text may only quote numbers from the library and must show the source on the card. If no statistic fits, the card gives a reason in words, not a number.
- **Audit data:** Claude's server-side web search and web fetch tools look up the business. Every status shows the evidence it's based on (e.g. "no website found in search results"), so the owner and the judges can see why.
- **Owner-specific numbers (stretch goal):** a simple estimate such as "8 unanswered reviews" or "0 of 7 days of opening hours listed". These are counts from the audit, not predictions.

## Tech approach

We build on the existing Next.js + Claude starter (streaming, tool loop, deployed on Vercel), so no setup time is needed.

| Piece | What it does |
|---|---|
| `POST /api/audit` | Takes name, city and category. Claude runs web search and web fetch, then must finish by calling `submit_audit` with a strict schema: an array of `{item_id, status, evidence, why, impact_stat_id, effort}` |
| `lib/checklist.ts` | The 12 fixed items with tier, how-to-check hints and their action type |
| `data/stats.json` | The sourced stat library; its ids are the only numbers the AI may cite |
| `POST /api/build` | Takes an item id and the audit context. For the website: returns a single-page HTML site with an Impressum template, shown in a preview and downloadable. For review replies: one draft per recent review, ready to copy |
| `POST /api/guide` | Takes an item id. Returns 3–5 plain-language steps plus a "what the AI did" learning note |
| UI | Input form → live audit with tool chips → tiered cards → build/guide panel → summary |

**Model:** `claude-sonnet-5-5` for speed; switch to Opus only if the audit's reasoning is weak. Fallback if web search is slow on stage: a cached audit of the demo business.

## Team, timeline and demo

### Roles

| Role | Owns |
|---|---|
| App & backend (Akram) | Audit, build and guide routes; deploy |
| Data & research | Stat library with sources; demo business; checks the audit output for errors |
| Design & UX | Card layout, wording for non-technical owners, summary page |
| Pitch | Demo script, slides (if any), rehearsal, backup recording |

### Timeline (relative to now; adjust once we know the demo time)

1. **+30 min:** PRD agreed, demo business picked, stat library started.
2. **+2 h:** the audit works end to end on the deployed URL, even if it looks ugly.
3. **+3.5 h:** cards, both builds (website, review replies) and guide steps working; stat library merged.
4. **Feature freeze 2 h before demos:** polish, cached fallback, rehearse twice, record a backup video.

### Demo script (3 min)

1. The owner's problem in 30 seconds: a real Berlin business, what they're missing.
2. Type the name and watch the live audit.
3. Walk through three cards: one Must have, with its impact number and source.
4. Click *Build it* and their website with an Impressum appears; then draft replies to their latest reviews.
5. Close: "They learned what AI did and can do the next one themselves."

## Risks

- **Web search slow or wrong on stage** → cached audit of the demo business.
- **Unsourced numbers** → the stat library rule; the data person reviews every card.
- **Scope creep** → two *Build it* items only (website, review replies); everything else is *Guide me*.
- **Wrong business found** → the owner confirms the match (name, address) before the audit runs.
