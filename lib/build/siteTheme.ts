// Stylesheet for generated business sites. Tokens and classes are copied from the design handoff
// (components/audit/audit.css, components/DesignFonts.tsx) so built sites match Mise en Place.
// Keep in sync with audit.css if the designer changes tokens; do not add new colours here.

export const SITE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap';

export const SITE_CSS = `
:root{--red:#FF385C;--red-d:#E00B41;--red-ink:#C13515;--pink:#FFF0F3;--ink:#222;--mute:#717171;--line:#DDDDDD;--soft:#F7F7F7;--ok:#008A05;--ok-bg:#EAF6EA;--warn:#B4690E;--warn-bg:#FFF5E6;--ease:cubic-bezier(.2,.8,.2,1)}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:#fff;font-family:Inter,"Helvetica Neue",Helvetica,Arial,sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased}
a{color:var(--red)}a:hover{color:var(--red-d)}
h1,h2,h3,h4{font-weight:700}
.top{display:flex;align-items:center;gap:24px;padding:14px 20px;border-bottom:1px solid #EBEBEB;position:sticky;top:0;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);z-index:10}
.top nav{display:flex;gap:6px;margin-left:auto;overflow-x:auto}
.top nav a{white-space:nowrap;padding:6px 12px;border-radius:999px;font-size:13px;font-weight:600;color:var(--ink);text-decoration:none}
.top nav a:hover{background:var(--soft)}
.logo{white-space:nowrap;flex:none;font-family:Syne,Inter,sans-serif;font-weight:800;font-size:22px;letter-spacing:-.04em;color:var(--red);text-decoration:none;line-height:1}
main{max-width:1240px;margin:0 auto;padding:24px 20px 60px}
section{margin:0 0 48px;scroll-margin-top:80px}
.hero{padding:32px 0 8px}
.eyebrow{font-size:13px;font-weight:600;color:var(--mute);text-transform:uppercase;letter-spacing:.08em;margin:0 0 12px}
h1{font-size:40px;line-height:1.08;letter-spacing:-.03em;font-weight:800;margin:0 0 12px;text-wrap:balance}
h2{font-size:26px;letter-spacing:-.03em;margin:0 0 16px}
h3{font-size:18px;letter-spacing:-.02em;line-height:1.25;margin:0 0 8px}
p{font-size:15px;line-height:1.55;color:#484848;margin:0 0 12px;text-wrap:pretty}
.lede{font-size:17px;line-height:1.55;color:var(--mute);margin:0 0 28px;text-wrap:pretty;max-width:520px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px}
.card{border:1px solid var(--line);border-radius:24px;padding:24px;background:#fff}
.facts{display:grid;grid-template-columns:auto 1fr;gap:10px 16px;font-size:15px;margin:0}
.facts dt{color:var(--mute)}.facts dd{margin:0;font-weight:500}
.chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border-radius:999px;border:1px solid var(--line);font-size:13px;font-weight:500;background:#fff;white-space:nowrap}
.btns{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}
.btn{height:52px;padding:0 26px;border-radius:999px;border:none;font-size:16px;font-weight:600;display:inline-flex;align-items:center;gap:10px;text-decoration:none;transition:transform 140ms var(--ease),background 140ms}
.btn:active{transform:scale(.98)}
.btn.pri{background:var(--red);color:#fff}.btn.pri:hover{background:var(--red-d);color:#fff}
.btn.sec{background:#fff;color:var(--ink);border:1px solid var(--ink)}.btn.sec:hover{background:var(--soft)}
.btn.sm{height:40px;padding:0 18px;font-size:14px}
.st{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap}
.st.have{background:var(--ok-bg);color:var(--ok)}
.st.partial{background:var(--warn-bg);color:var(--warn)}
.legal{background:var(--soft);border-radius:24px;padding:24px}
.legal p,.legal dd{font-size:14px}
.note{font-size:13px;color:var(--mute)}
footer{border-top:1px solid #EBEBEB;padding:24px 20px;display:flex;flex-wrap:wrap;gap:16px;justify-content:center;font-size:14px;color:var(--mute)}
footer a{color:var(--ink);font-weight:600}
.ph{display:inline-block;padding:1px 8px;border:1px dashed var(--warn);border-radius:6px;background:var(--warn-bg);color:var(--warn);font-family:ui-monospace,Menlo,monospace;font-size:.85em;font-weight:500}
@media (min-width:900px){.top{padding:18px 40px}.logo{font-size:26px}main{padding:36px 40px 80px}h1{font-size:56px}}
`;
