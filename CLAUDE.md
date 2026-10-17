# CLAUDE.md · Claude Impact Lab team project

You are helping a mixed team (not all developers) build a working demo in ONE day at the Claude Impact Lab Berlin.
Hard submission deadline: **16:00**. **Shipping a working demo beats perfect code.**

Read this whole file at the start of every session and follow it. When the team is unsure about a rule, answer from this file.

## The challenge
Theme: **AI education for everyone.** Build a working prototype that helps one real audience learn or use AI
(for example older adults, small business owners, job seekers, parents, newcomers, people with disabilities,
or workers in non-tech jobs). Another audience is fine if it is a real group of people.

At the start, help the team write down in the README, in one sentence each:
1. Who exactly is the audience?
2. What is their problem with AI today?
3. What will our demo let them do?

## Event rules (remind the team if they drift)
1. **Build today.** Ideas and research can come from before; the code is written on the day. No pre-built projects.
2. **Claude must be part of the product**, not just the tool that wrote it.
3. **Teams of 5**: at least 1 builder, 1 product or design and 1 domain expert; the other 2 seats can be a founder or anyone.
4. **Public repo** with a README anyone can follow.
5. **No secrets in Git.** API keys live in `.env` (git-ignored).
6. **Open-source libraries, APIs and assets are fine.** Credit them in the README.
7. **Be kind.** Help other teams and respect the venue.
8. **16:00 is final.** Late submissions are not judged.

## How the team is judged (optimise for this)
| Criteria | Points | What judges ask |
|---|---|---|
| Impact | 40 | Does it help a real audience learn or use AI? Would they actually use it? |
| Working demo | 20 | Does it really run? |
| Technical quality | 20 | Is it well built? |
| Creativity | 20 | Is the idea fresh? |

Judges watch the 2-minute demo video first, then read the README. So a clear audience, a demo that works,
and a README that explains it matter more than extra features.

## Plan for the day (keep the team on time)
- **11:00** Agree on audience, problem and the smallest demo. Write it in the README.
- **11:30** Skeleton running end to end (ugly is fine).
- **13:00 to 13:45** Lunch. Something must already run before lunch.
- **13:45** Improve the core flow, test it with the domain expert's eyes.
- **15:00** Feature freeze. Record the 2-minute demo video. Finish the README.
- **15:45** Submit. Do not wait for 15:59.

If the team is behind, suggest cutting scope instead of working faster.

## Team collaboration
- **Roles:** the builder drives the code; product or design shapes the user flow and the demo script;
  the domain expert speaks for the audience and tests every screen; the founder owns the pitch, the problem
  statement and the README. Everyone can prompt Claude.
- **One repo, one owner.** The owner created it from the template and added teammates as collaborators.
- **Before you start working: `git pull`.** After each small step: commit and push.
- **Split the work by file or folder** so two people never edit the same file at the same time.
  If two people must, use branches and merge often.
- **If there is a merge conflict,** resolve it, keep both sides' intent, and explain to the team in plain words what you kept.
- Non-engineers can work in Claude.ai or edit the README directly on GitHub. That counts.

## How to work (instructions for Claude)
- Ask 1 or 2 short questions first if the goal is unclear, then build.
- Build the **smallest thing that demos well**. Suggest cutting scope early.
- Prefer simple stacks: a single HTML file, Python, or Next.js. No complex infra.
- Explain what you did in plain language. Some teammates are not engineers.
- Make small commits with clear messages so the team can follow along.
- After each step, tell the team how to run or see it.

## Hard rules
- **Never put API keys or secrets in code or commits.** Read them from `.env` (`ANTHROPIC_API_KEY`).
- Never commit `.env`, `node_modules`, or large data files.
- Only use data the team is allowed to use. No real personal data. Use fake or sample data.
- Credit open-source libraries and assets in the README.
- Don't delete files the team created without asking.

## API key
- Each person can claim $100 in API credits with the QR code in the room: sign in with the Claude Console account
  you will use today. Your organization is filled in for you; add your name and submit once.
- Credits can take a while to arrive (the claim page says 1 to 2 business days). If yours are not there yet,
  build with a teammate's key in the meantime. Credits work with the API only, not Claude.ai subscriptions.
- Create an API key in the Console, run `cp .env.example .env` and paste the key into `.env`.

## Using Claude in the product
- Use the Anthropic API with a current model (check docs.claude.com for model names).
- Keep prompts in one clear place (e.g. `prompts/`) so they're easy to tweak.
- Handle errors simply: show a friendly message if the API call fails.

## Before the deadline
- Keep `README.md` filled in: what it does, who it's for, how to run it, screenshots, credits.
- At 15:00, remind the team to record the 2-minute demo video. It is required.
- One person per team submits the form: https://tally.so/r/1WPr9Q
  (team name, members, repo link, demo video link, who it is for). Make sure the repo is public
  and the video link opens for anyone.
- Agenda, rules and judging are also in the event repo:
  https://github.com/Claude-Community-Berlin/claude-impact-lab-berlin-2026-10-17

---

# Mise en Place: how this repo is split (read before coding)

## DESIGN: HARD RULES (apply to every task, every Claude Code session)
The product's look and feel comes ONLY from the design handoff that was merged from the `t5-design-ui` branch
(commit a3f9f9c on main, "T5: company search and audit screens from the Claude Design handoff"). Nothing else.
1. **Use only the design-branch code for UI.** Every screen, component, colour, font, spacing, button, badge, card and
   animation must come from, or be built with, these files and nothing else:
   - `components/search/SearchHome.tsx` + `search.css` + `companies.ts` (home: company search)
   - `components/audit/AuditClient.tsx` + `auditMarkup.ts` + `audit.css` + `auditDemo.js` (confirm -> live audit -> results)
   - `components/DesignFonts.tsx` (Inter + Syne), `app/page.tsx`, `app/(ui)/audit/page.tsx`
   - design tokens are the CSS variables in `components/audit/audit.css` `:root`
     (`--red #FF385C`, `--red-d`, `--red-ink`, `--pink`, `--ink #222`, `--mute #717171`, `--line`, `--soft`, `--ok`, `--ok-bg`, `--warn`, `--warn-bg`, `--ease`).
   - reusable classes: `.btn.pri` / `.btn.sec` / `.btn.sm`, `.card`, `.chip`, `.st.have|.partial|.missing|.ask` (status badges), `.eyebrow`, `.lede`, `.tier`, `.legend`, `.next`, `.top`, `.logo`, `.steps`.
2. **Do not invent new visuals.** No new colours, fonts, radii, shadows, icons sets or layouts. No Tailwind utility classes
   for product UI, no UI libraries, no component kits, no "quick restyle". If a screen you need does not exist in the design,
   compose it from the classes and tokens above and keep it visually identical in spirit. Ask the designer before adding anything.
3. **Do not delete or rewrite the design files.** Wiring real data into them is fine (see 4); changing their look is not.
4. **Wiring real data = replace demo data, keep the markup.** `auditDemo.js` currently runs on demo data for Café Le Vent.
   The remaining UI work (T5/T6) is to feed it from `/api/audit`, `/api/build` and `/api/guide` while keeping the exact same
   markup, classes and animations. Known mappings the wiring must handle without touching `lib/types.ts`:
   - design status `ask` == contract status `unknown`
   - design item ids `gbp, web, imp, nap, mob, rev, book, soc, pay, list, ai, book2` == contract ids
     `google_profile, website, impressum, consistent_info, mobile_friendly, review_replies, online_booking, social_channel, card_payment, customer_list, ai_assistant, bookkeeping` (same order)
   - the home search passes `?name=&city=&trade=` to `/audit`; `trade` is our `category`.
5. **Backend tasks do not touch UI.** T1-T4 and T8 never edit anything under `components/` or `app/(ui)/`.
6. `leaflet` (map) is the one UI dependency the design added. Do not add others.


Product spec: `docs/PRD.md`. Stack: Next.js (App Router) + TypeScript strict + Tailwind + `@anthropic-ai/sdk` + `zod`, deployed on Vercel.
Run locally: `npm install`, `cp .env.example .env` (paste `ANTHROPIC_API_KEY`), `npm run dev`. Before pushing: `npm run typecheck && npm run build`.
No new dependencies without telling the team in the PR. The API key stays server-side (route handlers only, never in client components).

## Contracts (owned by Dev 1 / T0, do not change in other tasks)
These files are the shared agreement between all five people. If you think one must change, ask Dev 1 instead of editing:
- `lib/types.ts`: all TypeScript types + zod schemas (`AuditItem`, `AuditResult`, `AuditEvent`, `BuildRequest/Response`, `GuideRequest/Response`, `Stat`, ...).
- `lib/checklist.ts`: the 12 fixed checklist items (`CHECKLIST`, `getItem`, `itemsByTier`). The AI never invents new items.
- `lib/score.ts`: `computeScore(items)` (must 3 / good 2 / nice 1; have 1 / partial 0.5 / missing 0; `unknown` skipped).
- `lib/stats.ts`: helpers over `data/stats.json` (`getStat`, `statsForItem`). Works with any number of entries.
- `fixtures/le-vent-audit.json`: the demo business audit, also the cached fallback on stage.
- The API shapes:
  - `POST /api/audit` body `BusinessInput` -> streams NDJSON (`Content-Type: application/x-ndjson`), one `AuditEvent` per line, last line is `{type:'result', result: AuditResult}`.
  - `POST /api/build` body `BuildRequest` -> JSON `BuildResponse` (`kind: 'html'` for website, `kind: 'replies'` for review replies).
  - `POST /api/guide` body `GuideRequest` -> JSON `GuideResponse`.
- Starter files, leave alone: `app/api/chat/route.ts`, `lib/prompt.ts` (exports the shared `MODEL`), `lib/tools.ts` (web_search / web_fetch tool definitions).

The three API routes are currently STUBS that return fixture data (marked `// STUB - replaced in T…`). The UI can be built against them today; replacing a stub must keep the exact request/response shape.

## Who owns which folder
| Task | Owner | Folders / files | What it does |
|---|---|---|---|
| T0 | Dev 1 | contracts above, scaffold, `CLAUDE.md` | Done. Shared types, checklist, stubs. |
| T1 | Akram (Dev 1) | `app/api/audit/`, `lib/prompts/audit.ts` | Real audit: Claude + web_search/web_fetch, must finish with a `submit_audit` tool call validated by `AuditResultSchema`; stream `AuditEvent`s; fall back to the fixture if search fails. |
| T2 | Dev 2 | `app/api/build/` (dispatcher + website branch), `lib/build/website.ts`, `lib/prompts/website.ts` | One-page HTML site with Impressum template from the audit. |
| T3 | Dev 2 | `app/api/build/` (replies branch), `lib/build/reviews.ts`, `lib/prompts/reviews.ts` | One draft reply per review in the owner's voice. Reads `fixtures/<slug>-reviews.json` if present. |
| T4 | Dev 2 | `app/api/guide/`, `lib/prompts/guide.ts`, `lib/links.ts` | 3-5 plain-language steps + "what the AI did" note. Links only from the `lib/links.ts` allowlist. |
| T5-T6 | Dev 3 + designer | `app/(ui)/`, `components/`, `app/page.tsx`, `app/globals.css` | Design screens are merged (see DESIGN rules above). Remaining: wire `/audit` to `/api/audit` (live tool events, real statuses), card buttons to `/api/build` and `/api/guide`, keep the design 1:1. |
| T8 | research | `data/stats.json` | 6-8 sourced stats, replace the two PLACEHOLDER entries. Keep the `Stat` shape; every `item_id` must be a valid `ItemId`. |
| T9 | research & pitch | `fixtures/le-vent-reviews.json`, demo script | 4-5 real public reviews as `Review[]` (text, rating, first name only), Le Vent facts, demo script, backup video. |
| Pitch | founder | `README.md`, demo video | README, demo script, submission. |

Prompts live in `lib/prompts/` (one file per route) so non-engineers can tweak wording.

## Working with Claude Code on this repo (everyone)
- Start every session with `git pull`. Tell Claude which task (T1…T8) you are on; it must only edit that task's folders.
- Commit small and push often; one task per commit message prefix, e.g. `T1: stream real audit events`.
- If `npm run typecheck` fails because of a contract type, the fix is in your code, not in `lib/types.ts`.
- When a stub is replaced, delete its `// STUB` comment and keep the response shape identical.

## Facts the task prompts assume (so nobody has to guess)
- **Model:** `claude-sonnet-5-5` is the default, read from `ANTHROPIC_MODEL` via `MODEL` in `lib/prompt.ts`. Import `MODEL` instead of hardcoding a model id.
- **Web tools:** the current server-side tool types are `web_search_20260318` and `web_fetch_20260318` (verified in `@anthropic-ai/sdk` 0.135 and docs.claude.com). Ready-made definitions are exported as `WEB_TOOLS` in `lib/tools.ts`.
- **`?cached=1` on `/api/audit`** always streams the fixture. This is the stage fallback; T1 must keep it and the UI's "Use demo data" link relies on it.
- **There is no chat page.** The starter only has the `/api/chat` route. `app/page.tsx` is already the design's search home.
- **Styling:** the design's own plain CSS files (`components/**/*.css`) are the only styling. Tailwind is installed from the scaffold but must NOT be used for product UI (see DESIGN rules).
- **Branches:** work on a branch named after the task (e.g. `t5-cards`), run `npm run typecheck && npm run build`, open a small PR, merge often. `main` must always build.

