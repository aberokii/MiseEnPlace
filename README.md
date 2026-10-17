# Mise en Place

**One line:** An AI coach that audits a small business's digital basics, explains what's missing and why it matters, and builds the first fix on the spot.

📄 Full product spec: [docs/PRD.md](docs/PRD.md) · Event rules and judging: [docs/EVENT.md](docs/EVENT.md)

**Who it's for:** owners of small local businesses (1–10 people: cafés, salons, repair shops, bakeries) with low tech confidence and no agency budget.
**Their problem with AI today:** they know they "should do something online", but not what, in which order, or how AI could do it for them.
**What the demo lets them do:** type their business name, watch Claude check their online presence, and get the first fix (a website with Impressum, or replies to their reviews) built in seconds.

## The problem
Small business owners know the basics matter (a Google profile, a website, answered reviews), but nobody tells them what *their* business is missing, what each gap costs them, or how to fix it. Agencies are expensive and generic advice doesn't fit. So the basics stay undone, and customers go to the place down the street that shows up properly on Google.

## What it does
1. **Search** your business by name and city.
2. **Live audit:** Claude searches and reads the web the way a customer would and checks 12 fixed digital basics (Google profile, website, Impressum, consistent hours, mobile, review replies, booking, social, card payment, customer list, AI assistant, bookkeeping).
3. **Checklist in three tiers** (Must have / Good to have / Nice to have). Every card shows the status, the evidence Claude found, why it matters in plain words, a sourced impact number, and the effort.
4. **Build it:** a one-page website with an Impressum and privacy notice (every unknown fact is a highlighted placeholder, never invented), or a ready-to-post reply to each recent review, in the reviewer's language.
5. **Guide me:** 3–5 plain-language steps for every other item, with official links only.
6. **Learn:** every result ends with "What the AI just did", so the owner can do the next one themselves.

## How Claude is used
- **Model:** `claude-sonnet-5-5` (set with `ANTHROPIC_MODEL`), called from Next.js route handlers; the API key stays on the server.
- **`/api/audit`:** Claude with Anthropic's server-side **web search** and **web fetch** tools looks up the business and finishes with a `submit_audit` tool call (validated with zod). Progress is streamed as NDJSON. `?cached=1` replays a recorded Le Vent audit as a stage fallback.
- **`/api/build`:** structured JSON output. Website: Claude writes the page content, the server wraps it in our design-system stylesheet and strips scripts. Review replies: reviews from a fixture or web search, one reply per review in the reviewer's language, no discounts or invented facts.
- **`/api/guide`:** steps tailored to the business's actual status, links only from an allowlist (`lib/links.ts`).
- **No made-up numbers:** impact figures come only from `data/stats.json`, 12 statistics the team checked on their source pages. All prompts live in `lib/prompts/`.

## How to run it
```bash
cp .env.example .env    # paste your ANTHROPIC_API_KEY into .env
npm install
npm run dev             # open http://localhost:3000
```

Demo without waiting for a live web search: open
`http://localhost:3000/audit?name=Café+Le+Vent&city=Berlin&trade=Café&cached=1`

**Live link (if any):** https://mise-en-place-dun.vercel.app

## Screenshots / demo
Demo video: <add the video link>

## Team

| Name | Role / background |
|---|---|
| Rohan Khinvasara | Builder: contracts, real audit, review replies |
| Akram Alfawakheeri | Builder: website builder, wiring the UI to the APIs |
| Hanny Kumar | Builder: guide steps, sourced statistics |
| Felix | Product & design: search, audit and results screens |
| Gerad Ambrose | Research & pitch: Le Vent data and reviews, demo |

## Credits
- [Next.js](https://nextjs.org), [React](https://react.dev), [Tailwind CSS](https://tailwindcss.com)
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript) (Claude with web search + web fetch)
- [zod](https://zod.dev)
- [Leaflet](https://leafletjs.com) with map tiles © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- Fonts: [Inter](https://rsms.me/inter/) and [Syne](https://fonts.google.com/specimen/Syne) via Google Fonts
- Statistics: sources listed per entry in `data/stats.json`
