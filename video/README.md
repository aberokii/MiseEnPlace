# Demo video kit (2 minutes)

Everything for the submission video lives here. The motion graphics are plain HTML pages that import the
product stylesheet (`components/audit/audit.css`), so they use exactly the design's colours, fonts, radii
and easing. Nothing is restyled; see the DESIGN rules in `CLAUDE.md`.

## Folders

| Path | What |
|---|---|
| `cards/*.html` | One page per motion-graphic clip. All motion is CSS keyframes so it can be rendered frame by frame. |
| `cards/card.css` | Video-only layout (1920×1080 frame, sizes, motion primitives). Reuses the design tokens only. |
| `data/demo.json` | Le Vent facts (from `docs/le-vent-research.md`) plus realistic sample output for product parts not finished at recording time. |
| `render.mjs` | Renders every card to `out/` with headless Chrome + ffmpeg. |
| `script.md` | Beat sheet, narration script and the recording checklist. |
| `footage/` | Drop the café footage, screen recordings and narration here (git-ignored). |
| `out/` | Rendered clips (git-ignored). |

## Render the clips

```bash
cd video && npm install
node render.mjs            # all cards -> out/*.mp4 (white) and out/*.mov (transparent overlays)
node render.mjs problem    # one card
node render.mjs --still after 5500   # one PNG frame at 5.5 s, for checking a card
```

Needs Google Chrome installed and `ffmpeg` on the PATH (or `FFMPEG=/path/to/ffmpeg`).

## Clips

| Card | Length | Type | Beat |
|---|---|---|---|
| `problem` | 12 s | full frame | Kinetic text: owners know they should, not what, which order, or whether it's worth it |
| `badges` | 7 s | overlay (alpha) | Three red status badges over the café footage: no website, 1 reply to 321 reviews, 3 phone numbers |
| `lowerthird` | 6 s | overlay (alpha) | Café Le Vent · address · ★4.6 (321) |
| `website` | 11 s | full frame | Browser mock: skeleton, then the generated one-page site scrolls to its Impressum |
| `replies` | 12 s | full frame | Three unanswered September reviews (EN/DE/TR), a draft owner reply appears under each |
| `learn` | 8 s | full frame | "What the AI just did" and how to do it yourself next time |
| `after` | 9 s | full frame | Score ring 21 → 54, badges flip to green, next three steps |
| `endcard` | 8 s | full frame | Logo, one-line pitch, team, repo |

## Data honesty

`data/demo.json` separates verified facts (`business`, `statuses`, `hookBadges`) from `hypothetical` sample
output (website content, reply drafts, learn note, next steps). The `stats_demo` entries are marked
`verify: true` and must be replaced by the sourced entries from `data/stats.json` (task T8) before the
final render, or left out of the cut.
