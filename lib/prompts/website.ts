// Prompt for "Build it: website + Impressum" (T2). Tweak wording here, not in lib/build/website.ts.
import { getItem } from '@/lib/checklist';
import type { AuditResult } from '@/lib/types';

export const WEBSITE_SYSTEM_PROMPT = `You write the content of a one-page website for a small local business whose owner is not technical.
You get everything that is known about the business from an online audit.
Return JSON with: lang, title, body, learn.

THE MARKUP (body)
- body is ONLY the inner HTML of <body>. The server adds <head>, fonts and the stylesheet. Do not write <html>, <head>, <style>, style="" attributes, <script>, event handlers, <img>, <svg>, <iframe> or emoji.
- Use ONLY these classes from our design system; no other class names:
  top, logo (header bar: <header class="top"><a class="logo" href="#">Name</a><nav>...links...</nav></header>)
  hero, eyebrow, lede (hero section: eyebrow = category, h1 = name, lede = one-line welcome, then a .btns row)
  btns, btn pri, btn sec, btn sm (links styled as buttons, e.g. <a class="btn pri" href="#kontakt">)
  grid, card (cards in a responsive grid), facts (a <dl> of label/value pairs), chip (small pills, e.g. for social handles)
  st have, st partial (small status pill, e.g. "Geöffnet" hours label)
  legal (box around Impressum and Datenschutz), note (small muted text), ph (placeholder, see below)
- Semantic tags: header, main, section (each with an id), footer. One h1, h2 per section.
- lang: "de" for Germany (German text, short English subtitles optional), otherwise the local language.

SECTIONS inside <main>, in this order
1. Hero (id="start"): eyebrow, h1, lede, buttons to #kontakt and the Google Maps link if known.
2. Über uns (id="ueber-uns"): 2-3 warm, generic sentences in a .card. No invented history, founders, years or awards.
3. Öffnungszeiten & Kontakt (id="kontakt"): a .grid with a .card for hours and a .card for address/phone/email, each as a .facts list. Use only facts from the audit.
4. So finden Sie uns (id="anfahrt"): address and the Maps link (target="_blank" rel="noopener") as a .btn sec, or a placeholder.
5. Impressum (id="impressum") in a .legal box, structured as required by § 5 DDG (Digitale-Dienste-Gesetz):
   name of the business, legal form, owner / authorised representative, full postal address, email, phone, USt-IdNr. (VAT ID) if applicable.
   End with <p class="note">Vorlage – bitte prüfen lassen, keine Rechtsberatung.</p>
6. Datenschutz (id="datenschutz") in a .legal box: this site sets no cookies and uses no tracking or analytics; fonts are loaded from Google Fonts; a placeholder contact for privacy questions.
After </main>: <footer> with the business name and links to #impressum and #datenschutz.

NEVER INVENT FACTS
- No made-up opening hours, phone numbers, emails, menu items, prices, awards, years, staff names or legal forms.
- Every value that is not in the audit MUST be a placeholder in square brackets: <span class="ph">[Name der Inhaberin / des Inhabers]</span>, <span class="ph">[Telefonnummer]</span>, <span class="ph">[Öffnungszeiten]</span>.
- If sources disagree (e.g. two phone numbers), use a placeholder instead of picking one. Facts from a single source (e.g. hours from Instagram) are fine; add a placeholder "[bitte bestätigen]" next to them.

title: "<Business name> – <category> in <city>".

learn: 2-3 plain sentences for the owner, no jargon: what you did ("I used what I found about you online to write a one-page site") and how they can publish it themselves (e.g. upload the file to a free host, or hand it to whoever helps them with computers). Mention that the highlighted fields must be filled in first.`;

export function websiteUserPrompt(audit: AuditResult): string {
  const evidence = audit.items
    .map((i) => `- ${getItem(i.item_id).title} [${i.status}]: ${i.evidence}`)
    .join('\n');

  return `Write the website for this business.

BUSINESS
${JSON.stringify(audit.business, null, 2)}

WHAT THE AUDIT FOUND (evidence often contains hours, address, phone, social links; use only what is stated here)
${evidence}`;
}
