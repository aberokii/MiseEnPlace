// Renders each card in cards/ to a video clip in out/ by stepping the animations frame by frame.
// Usage: node render.mjs [card ...]        (no args = all)   |   node render.mjs --still card t_ms
import puppeteer from 'puppeteer-core';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG = process.env.FFMPEG || path.join(process.env.HOME, '.local/bin/ffmpeg');
const FPS = 30;
// duration in seconds; alpha = transparent overlay (ProRes 4444 .mov), else white-background .mp4
const T = (q, dur) => ({ dur, alpha: true, file: 'text', query: '?' + q });
const CARDS = {
  badges:     { dur: 7,  alpha: true },
  lowerthird: { dur: 6,  alpha: true },
  endcard:    { dur: 8,  alpha: false },
  // kinetic text overlays (transparent), go on top of the product recordings
  t_hook:     T('lines=Great coffee.|Four point six stars.|Online, it barely exists.&accent=barely,exists&pos=bottom&style=pop', 6),
  t_gaps:     T('lines=No website.|1 reply to 321 reviews.|3 different phone numbers.&accent=no,1,3&pos=bottom&style=pop&pill=1&gap=500', 7),
  t_name:     T('lines=Start with the one thing|every owner knows.|~Your business name.&accent=name&pos=bottom&style=rise&pill=1', 5),
  t_audit:    T('lines=Claude checks what|a customer would find.&accent=customer&pos=stage&style=pop', 5),
  t_learn:    T('lines=Every check is shown.|Every check is explained.&accent=shown,explained&pos=stage&style=pop', 5),
  t_result:   T('lines=What is missing.|Why it matters.|How long it takes.&accent=missing,matters,takes&pos=bottom&style=pop&pill=1&gap=450', 6),
  t_build:    T('lines=Two of these|the AI builds on the spot.&accent=builds&pos=bottom&style=pop&pill=1', 5),
  t_pitch:    T('lines=Type your business name.|Two minutes later|the first fix is built.&accent=built&pos=center&style=pop&gap=450', 7),
};

const args = process.argv.slice(2);
const still = args[0] === '--still';
const wanted = still ? [args[1]] : (args.length ? args : Object.keys(CARDS));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars', '--force-device-scale-factor=1', '--allow-file-access-from-files', '--disable-threaded-animation', '--disable-gpu'] });
try {
  for (const name of wanted) {
    const cfg = CARDS[name];
    if (!cfg) { console.error('unknown card', name); continue; }
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await page.goto('file://' + path.join(here, 'cards', (cfg.file || name) + '.html') + (cfg.query || ''), { waitUntil: 'networkidle0' });
    await page.evaluate(() => window.cardReady);
    await new Promise(r => setTimeout(r, 300));
    if (still) {
      const t = Number(args[2] || 0);
      await page.evaluate(ms => window.seek(ms), t);
      mkdirSync(path.join(here, 'out'), { recursive: true });
      const f = path.join(here, 'out', `${name}_${t}ms.png`);
      await page.screenshot({ path: f, omitBackground: cfg.alpha });
      console.log(f);
      await page.close();
      continue;
    }
    const frames = path.join(here, 'out', 'frames_' + name);
    rmSync(frames, { recursive: true, force: true });
    mkdirSync(frames, { recursive: true });
    const n = cfg.dur * FPS;
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      await page.evaluate(ms => window.seek(ms), (i * 1000) / FPS);
      await page.screenshot({ path: path.join(frames, String(i).padStart(5, '0') + '.png'), omitBackground: cfg.alpha });
    }
    await page.close();
    const out = path.join(here, 'out', name + (cfg.alpha ? '.mov' : '.mp4'));
    const enc = cfg.alpha
      ? ['-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le']
      : ['-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, '%05d.png'), ...enc, '-r', String(FPS), out]);
    rmSync(frames, { recursive: true, force: true });
    console.log(`${name}: ${n} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${path.relative(here, out)}`);
  }
} finally {
  await browser.close();
}
