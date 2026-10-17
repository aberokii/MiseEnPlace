# Demo video (2 minutes)

The video is made only from screen recordings of the product's own screens, the design handoff running on
the Le Vent demo data: search home → confirm match (map) → live audit (all scenes) → results. No separate
graphics. Café footage from the team opens the video; narration and subtitles go on top.

## Record the product screens

```bash
npm run dev -- -p 3111        # from the repo root, in one terminal
cd video && npm install
node record.mjs http://localhost:3111
```

Produces `out/rec-search.webm` (type "Le Vent", pick the result) and `out/rec-audit.webm` (confirm → audit →
results, with a slow scroll through the results). Uses Google Chrome headless at 1920×1080, 30 fps.

## Assemble

`out/` and `footage/` are git-ignored. The cut lives in `out/draft_cut_*.mp4`. Narration and the beat sheet
are in `script.md` once the team has approved the wording.
