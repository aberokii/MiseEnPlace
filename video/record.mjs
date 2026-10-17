// Screen-records the real product UI (design handoff screens, demo data) from the local dev server.
// Usage: node record.mjs [baseUrl]   -> out/rec-search.webm, out/rec-audit.webm
import puppeteer from 'puppeteer-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
const here = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://localhost:3111';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
process.env.PATH = `${process.env.HOME}/.local/bin:${process.env.PATH}`;
mkdirSync(path.join(here, 'out'), { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1920,1080'] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

// 1. Search home: type the name, pick the result
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await sleep(500);
let rec = await page.screencast({ path: path.join(here, 'out', 'rec-search.webm'), fps: 30 });
await sleep(1200);
await page.click('.home .pill input');
await page.type('.home .pill input', 'Le Vent', { delay: 140 });
await sleep(1600);
const res = await page.$('.home .res');
if (res) { await res.hover(); await sleep(600); }
await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}), res ? res.click() : page.keyboard.press('Enter')]);
await sleep(1500);
await rec.stop();

// 2. Audit: confirm (map fly-in), start audit, loader scenes, results, slow scroll
await page.goto(BASE + '/audit', { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
rec = await page.screencast({ path: path.join(here, 'out', 'rec-audit.webm'), fps: 30 });
await sleep(4500);                       // map flies to the pin, match found
await page.hover('#goAudit'); await sleep(500);
await page.click('#goAudit');
await page.waitForSelector('#loader.hide', { timeout: 120000 });   // loader runs its scripted phases
await sleep(2500);
// slow scroll through the results
const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
for (let y = 0; y <= total; y += 12) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(33); }
await sleep(2000);
await rec.stop();
await browser.close();
console.log('done');
