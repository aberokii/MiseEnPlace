// Audit flow from the Claude Design handoff: confirm match → animated audit → results.
// Statuses, reviews and competitors are demo data for Café Le Vent; Claude replaces them step by step.
// Call once after the markup is in the page. `L` is the Leaflet module.
// T5/T6 wiring: runAudit streams /api/audit and replaces the demo ITEMS with the real result;
// card buttons call /api/build and /api/guide and show the result in a side panel (panel.css).
import STATS from '@/data/stats.json';

// Design item ids <-> contract ItemIds (same order as lib/checklist.ts). Design status 'ask' == contract 'unknown'.
const ID_TO_CONTRACT = {gbp:'google_profile',web:'website',imp:'impressum',nap:'consistent_info',mob:'mobile_friendly',rev:'review_replies',book:'online_booking',soc:'social_channel',pay:'card_payment',list:'customer_list',ai:'ai_assistant',book2:'bookkeeping'};
const CONTRACT_TO_ID = Object.fromEntries(Object.entries(ID_TO_CONTRACT).map(([k,v])=>[v,k]));
const EFFORT_LABEL = {minutes:'Minutes',hours:'Hours',days:'Days'};
// Loader phases that map onto one real checklist item.
const PHASE_ITEM = {gbp:'gbp',rev:'rev',dir:'nap',map:'gbp',web:'web',mob:'mob'};
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = u => /^https?:\/\//i.test(String(u||'')) ? String(u) : '';

export function startAudit(L) {
const IC = {
  have:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>',
  partial:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M6 12h12"/></svg>',
  missing:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  ask:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/></svg>',
  ev:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  clock:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  spark:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>',
  guide:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h10M4 18h7"/></svg>'
};
const LABEL = {have:'Have',partial:'Partial',missing:'Missing',ask:'Ask you'};
const TIERS = [['must','Must have','The basics customers expect'],['good','Good to have','Win more of the people who find you'],['nice','Nice to have','Save time once the basics are done']];

// Demo audit for Café Le Vent. Evidence lines are mock audit output; impact numbers are placeholders for data/stats.json.
const ITEMS = [
  {id:'gbp',tier:'must',t:'Google Business Profile',st:'partial',tool:['Web search','“Café Le Vent Köpenicker Str. 44”'],ev:'Listing found. Opening hours shown for weekdays only, no weekend hours.',why:'Most people look you up on Google Maps first. A complete profile tells them you are open and how to reach you.',eff:'15 minutes',act:'guide',stat:'gbp_complete'},
  {id:'web',tier:'must',t:'Website or one-page site',st:'missing',tool:['Web search','“Le Vent Berlin” official site'],ev:'No official site in search results. Only directory listings (Yelp, Tripadvisor, Uber Eats).',why:'Without your own page, directories decide what customers see about you. A simple site puts you in control.',eff:'10 minutes with AI',act:'build',stat:'website_trust'},
  {id:'imp',tier:'must',t:'Impressum + privacy notice',st:'missing',tool:['Web fetch','looking for /impressum'],ev:'No website to check. Required by German law for any business site.',why:'A business website in Germany must name who runs it. Missing it can lead to formal warnings (Abmahnung).',eff:'Included with website',act:'build',stat:null},
  {id:'nap',tier:'must',t:'Contact details and hours match everywhere',st:'partial',tool:['Compare','Google · Yelp · Tripadvisor'],ev:'Address matches on 4 sources. Opening hours differ between Google and Yelp.',why:'If two sites show different hours, customers trust neither and may not come.',eff:'20 minutes',act:'guide',stat:'nap_consistency'},
  {id:'mob',tier:'must',t:'Mobile-friendly site',st:'missing',tool:['Web fetch','checking viewport'],ev:'Depends on the website. Will be covered by the built site.',why:'Most local searches happen on a phone, often on the way.',eff:'Included with website',act:'guide',stat:'mobile_search'},
  {id:'rev',tier:'good',t:'Replies to reviews',st:'missing',tool:['Read reviews','latest 20 on Google'],ev:'0 of the last 20 reviews have an owner reply.',why:'A short, friendly reply shows new customers that someone cares. It also helps your ranking on Maps.',eff:'5 minutes with AI',act:'build',stat:'review_replies'},
  {id:'book',tier:'good',t:'Online ordering',st:'have',tool:['Web search','booking / ordering providers'],ev:'Uber Eats store found and active.',why:'Customers can order without calling. Keep the menu and hours on it up to date.',eff:'Done',act:'guide',stat:null},
  {id:'soc',tier:'good',t:'One active social channel',st:'partial',tool:['Web search','Instagram · Facebook'],ev:'Instagram account found. Last post 9 weeks ago.',why:'An account that looks abandoned can make people think the café is closed. One post a week is enough.',eff:'1 hour a week',act:'guide',stat:'social_activity'},
  {id:'pay',tier:'good',t:'Card and contactless payment',st:'ask',tool:['Ask owner','not visible online'],ev:'We could not see this online.',why:'Many customers carry no cash. Say it on your Google profile so they know before they come.',eff:'1 day to set up',act:'guide',stat:'cashless'},
  {id:'list',tier:'nice',t:'Email or WhatsApp customer list',st:'ask',tool:['Ask owner','not visible online'],ev:'We could not see this online.',why:'A list lets you tell regulars about new cakes or opening hours without paying for ads.',eff:'2 hours',act:'guide',stat:null},
  {id:'ai',tier:'nice',t:'AI assistant for FAQs and messages',st:'ask',tool:['Ask owner','not visible online'],ev:'We could not see this online.',why:'Answers questions like “do you have oat milk?” while you are behind the counter.',eff:'Half a day',act:'guide',stat:null},
  {id:'book2',tier:'nice',t:'Simple bookkeeping tool',st:'ask',tool:['Ask owner','not visible online'],ev:'We could not see this online.',why:'Invoices and receipts in one place save hours at tax time.',eff:'Half a day',act:'guide',stat:null}
];

const CITIES = {Berlin:[52.52,13.405],Köln:[50.9375,6.9603],Düsseldorf:[51.2277,6.7735],Augsburg:[48.3705,10.8978],Bielefeld:[52.0302,8.5325],Leipzig:[51.3397,12.3731],Hannover:[52.3759,9.732],Dresden:[51.0504,13.7373],Stuttgart:[48.7758,9.1829],Münster:[51.9607,7.6261],Mainz:[49.9929,8.2473],Nürnberg:[49.4521,11.0767],'Frankfurt am Main':[50.1109,8.6821],Bremen:[53.0793,8.8017],Kassel:[51.3127,9.4797],Freiburg:[47.999,7.8421],Hamburg:[53.5511,9.9937],München:[48.1351,11.582],Essen:[51.4556,7.0116]};
const qs = new URLSearchParams(location.search);
const B = qs.get('name') && qs.get('name') !== 'Café Le Vent'
  ? {name:qs.get('name'),cat:(qs.get('trade')||'Local business')+' · '+(qs.get('city')||''),addr:qs.get('city')||'',ll:CITIES[qs.get('city')]||CITIES.Berlin,src:['Google','Handelsregister'],exact:false}
  : {name:'Café Le Vent',cat:'Coffee bar · Berlin-Mitte',addr:'Köpenicker Str. 44, 10179 Berlin',ll:[52.50895,13.42285],src:['Google Maps','Yelp','Tripadvisor','Uber Eats'],exact:true};
const INPUT = {name:B.name, city:qs.get('city')||'Berlin', category:qs.get('trade')||'Café'};
const CACHED = qs.get('cached')==='1';
let AUDIT = null, auditP = null;
const initials = B.exact ? 'LV' : B.name.split(/\s+/).filter(w=>/^[A-ZÄÖÜ]/.test(w)).slice(0,2).map(w=>w[0]).join('');
const $ = id => document.getElementById(id);
$('miniName').textContent=B.name;$('mName').textContent=B.name;$('mCat').textContent=B.cat;$('mAddr').textContent=B.addr;$('mAv').textContent=initials;
$('mSrc').innerHTML=B.src.map(s=>`<span class="chip">${s}</span>`).join('');
$('rEyebrow').textContent=B.name+' · Results';
ITEMS.forEach(it=>{ if(it.tool[1].includes('Le Vent')) it.tool[1]=it.tool[1].replace(/Café Le Vent|Le Vent/,B.name); });

// map
const map = L.map('map',{zoomControl:false,attributionControl:true,scrollWheelZoom:false}).setView([51.2,10.4],6);
L.control.zoom({position:'topright'}).addTo(map);
const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
let tileErr=0; tiles.on('tileerror',()=>{ if(++tileErr>3){ map.removeLayer(tiles); document.getElementById('map').classList.add('nomap'); } });
const pinIcon = L.divIcon({className:'',html:'<div class="pin" id="pin"><span class="ring"></span><span class="ring"></span><span class="ring"></span><span class="dot"></span></div>',iconSize:[56,56],iconAnchor:[28,28]});
let marker;
setTimeout(()=>{
  map.flyTo(B.ll,B.exact?17:12,{duration:2.2});
  map.once('moveend',()=>{
    marker=L.marker(B.ll,{icon:pinIcon}).addTo(map);
    $('tagTitle').textContent=B.name;$('tagSub').textContent=B.addr+' · match found';
  });
},500);

// steps
function setStep(n){
  document.querySelectorAll('#steps b').forEach(b=>{const s=+b.dataset.s;b.className=s===n?'on':s<n?'done':'';});
  $('s-confirm').classList.toggle('hide',n!==0);
  $('s-audit').classList.toggle('hide',n!==1);
  $('splitView').classList.toggle('hide',n===2);
  $('s-results').classList.toggle('hide',n!==2);
  window.scrollTo({top:0});
  if(n<2) setTimeout(()=>map.invalidateSize(),50);
}
setStep(0);

// audit
function rowHTML(it,state){
  const s = state==='wait'?'wait':it.st;
  return `<div class="row ${state==='wait'?'wait':''} ${state==='now'?'now':''}" id="r-${it.id}">
    <div class="ico ${state==='now'?'':s}">${state==='now'?'<div class="spin"></div>':state==='wait'?'':IC[s]}</div>
    <div><div class="t">${it.t}</div><div class="e">${state==='done'?esc(it.ev):state==='now'?'Checking…':''}</div></div>
    <div>${state==='done'?`<span class="st ${s} fade">${LABEL[s]}</span>`:''}</div></div>`;
}
function renderAudit(cur){
  $('auditList').innerHTML=TIERS.map(([k,name])=>{
    const its=ITEMS.filter(i=>i.tier===k);
    return `<div class="tier"><h3><span>${name}</span><span>${its.filter(i=>ITEMS.indexOf(i)<cur).length}/${its.length}</span></h3><div class="rows">${its.map(it=>{const i=ITEMS.indexOf(it);return rowHTML(it,i<cur?'done':i===cur?'now':'wait')}).join('')}</div></div>`;
  }).join('');
}
let running=false, NP=false;
// Sample competitors (mock data for the demo)
const COMP = [
  {n:'Röstwerk Mitte',r:4.7,c:540,web:true,rep:62,d:[0.0042,-0.0061]},
  {n:'Kaffeebar Spreeufer',r:4.4,c:188,web:true,rep:15,d:[-0.0035,0.0048]},
  {n:B.name,r:4.6,c:212,web:false,rep:0,d:[0,0],me:true},
  {n:'Café Morgenrot',r:4.5,c:96,web:false,rep:0,d:[0.0029,0.0057]},
  {n:'Bäckerei & Café Lindner',r:4.2,c:301,web:true,rep:40,d:[-0.0052,-0.0034]}
];
const PH = [
  {k:'gbp',t:'Google Business Profile',ms:4500,res:'partial',tip:'<b>Did you know?</b> Your Google profile is often the first thing people see, before any website.'},
  {k:'rev',t:'Reviews',ms:5000,res:'missing',tip:'<b>Did you know?</b> Every reply you write to a review is public. New customers read your replies too.'},
  {k:'dir',t:'Directories',ms:4500,res:'partial',tip:'<b>Did you know?</b> Directories copy each other. One wrong opening time can spread to many sites.'},
  {k:'map',t:'Local visibility',ms:4500,res:'partial',tip:'<b>Did you know?</b> Google ranks nearby businesses partly by how complete and active their profiles are.'},
  {k:'comp',t:'Competitors nearby',ms:6000,res:'info',tip:'<b>Did you know?</b> We compare you with the businesses that show up for the same search, not a national average.'},
  {k:'web',t:'Website',ms:4500,res:'missing',tip:'<b>Did you know?</b> In Germany every business website needs an Impressum. We can build both for you.'},
  {k:'mob',t:'Mobile and speed',ms:4500,res:'partial',tip:'<b>Did you know?</b> Most local searches happen on a phone, often on the way.'}
];
const TOTAL = PH.reduce((a,p)=>a+p.ms,0);
const RESL = {have:['Have','have'],partial:['Partial','partial'],missing:['Missing','missing'],info:['3 ahead','ask']};
const REVIEWS = [
  [5,'2 weeks ago','M','Best flat white in the area and the croissants are always fresh. Small place, but very cosy.'],
  [4,'1 month ago','J','Friendly staff and good coffee. It gets busy at lunch, so come early.'],
  [5,'1 month ago','A','My regular spot for working in the morning. Quiet music, good wifi.'],
  [3,'2 months ago','S','Coffee is great but Google said open on Sunday and it was closed.'],
  [5,'3 months ago','L','Lovely owner, homemade cakes. Would come back any time.'],
  [4,'4 months ago','T','Nice view of the street, good espresso. Card payment worked fine.']
];
function starSVG(n){let s='';for(let i=0;i<5;i++)s+='<svg width="16" height="16" viewBox="0 0 24 24" fill="'+(i<n?'currentColor':'none')+'" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>';return s;}
function renderPhases(cur){
  $('phList').innerHTML=PH.map((p,i)=>{
    const st=i<cur?'done':i===cur?'now':'';
    const realIt = AUDIT && PHASE_ITEM[p.k] ? ITEMS.find(x=>x.id===PHASE_ITEM[p.k]) : null;
    const r=i<cur?(realIt?[LABEL[realIt.st],realIt.st]:RESL[NP&&p.res!=='info'?'missing':p.res]):null;
    return '<li class="'+st+'"><span class="pi">'+(i<cur?IC.have:'')+'</span>'+p.t+(r?'<span class="res st '+r[1]+'">'+r[0]+'</span>':'')+'</li>';
  }).join('');
}
function showScene(k){document.querySelectorAll('#stage .scene').forEach(s=>s.classList.toggle('on',s.dataset.sc===k));}
let map2, typeT;
function initMap2(){
  if(map2) return;
  map2=L.map('map2',{zoomControl:false,attributionControl:true,dragging:false,scrollWheelZoom:false,doubleClickZoom:false}).setView(B.ll,16);
  const t=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map2);
  let e=0;t.on('tileerror',()=>{if(++e>3){map2.removeLayer(t);$('map2').classList.add('nomap');}});
}
function addPin(c,rank){
  const html='<div class="cpin'+(c.me?' me':'')+'"><span class="lab"><span class="rk">'+rank+'</span>'+c.n+'</span><span class="d"></span></div>';
  return L.marker([B.ll[0]+c.d[0],B.ll[1]+c.d[1]],{icon:L.divIcon({className:'',html,iconSize:[0,0],iconAnchor:[0,0]})}).addTo(map2);
}
function typeText(txt,cb){clearInterval(typeT);let i=0;$('typed').textContent='';typeT=setInterval(()=>{$('typed').textContent=txt.slice(0,++i);if(i>=txt.length){clearInterval(typeT);cb&&cb();}},55);}
const SCENE = {
  gbp(){ $('gStars').innerHTML=starSVG(5); if(NP){document.querySelector('[data-sc="gbp"] .panel').innerHTML='<div class="browser" style="box-shadow:none;border:none"><div class="bb"><div class="big">'+IC.missing+'</div><b>No Google profile found</b><span>We searched Google Maps for “'+B.name+'”. Claiming a free profile is the first step.</span></div></div>';} },
  rev(){
    const card=r=>'<div class="rv"><div class="rh"><span class="stars">'+starSVG(r[0])+'</span><span>'+r[1]+'</span></div><p>'+r[3]+'</p><div class="rf"><span class="ra">'+r[2]+'</span>Google user<span class="st missing nr">No reply</span></div></div>';
    $('rvTrack').innerHTML=NP?'':REVIEWS.concat(REVIEWS).map(card).join('');
    if(NP) $('rvTrack').parentNode.innerHTML='<div class="panel" style="margin:auto;text-align:center"><b>No reviews found yet</b><p style="color:var(--mute);margin:8px 0 0">Once you have a profile, ask happy regulars to leave one.</p></div>';
  },
  dir(){
    const f=NP?[]:['Google Maps','Yelp','Tripadvisor','Uber Eats'], m=['Gelbe Seiten','Das Örtliche','11880','Instagram','Facebook','OpenTable','Apple Maps','Bing Places'];
    const chip=(n,cls)=>'<span class="dir '+cls+'"><span class="dl">'+(cls==='found'?IC.have:n.slice(0,2))+'</span>'+n+'</span>';
    $('dirFound').innerHTML=f.length?f.map(n=>chip(n,'found')).join(''):'<span style="color:var(--mute);font-size:15px">Not listed anywhere yet</span>';
    $('dirMiss').innerHTML=m.map(n=>chip(n,'miss')).join('');
    document.querySelectorAll('#stage .dir').forEach((d,i)=>setTimeout(()=>d.classList.add('in'),150+i*160));
  },
  map(){
    initMap2(); setTimeout(()=>map2.invalidateSize(),30);
    map2.setView(B.ll,17); $('compCard').classList.remove('in');
    typeText('café near '+(B.exact?'Köpenicker Str.':B.addr),()=>{ addPin(COMP[2],'·'); map2.flyTo(B.ll,16.5,{duration:1}); });
  },
  comp(){
    showScene('map');
    const ranked=[...COMP].sort((a,b)=>(b.r*Math.log(b.c)+(b.web?2:0))-(a.r*Math.log(a.c)+(a.web?2:0)));
    map2.eachLayer(l=>{if(l instanceof L.Marker)map2.removeLayer(l);});
    $('compTitle').textContent='Top results for “café near me”';
    $('compRows').innerHTML=ranked.map((c,i)=>'<div class="crow'+(c.me?' me':'')+'"><span class="rk" style="width:22px;height:22px;border-radius:999px;background:'+(c.me?'var(--red)':'var(--ink)')+';color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center">'+(i+1)+'</span><span class="n">'+c.n+(c.me?' (you)':'')+'</span><span class="rt">'+c.r.toString().replace('.',',')+' ★ · '+c.c+'</span><span class="st '+(c.web?'have':'missing')+'">'+(c.web?'Site':'No site')+'</span></div>').join('');
    const short=$('stage').clientHeight<700;
    $('compCard').classList.toggle('short',short);
    const wide=map2.getSize().x>760;
    const bounds=L.latLngBounds(COMP.map(c=>[B.ll[0]+c.d[0],B.ll[1]+c.d[1]]));
    const card=$('compCard'), cw=card.offsetWidth+24+40, ch=card.offsetHeight+24+40;
    map2.flyToBounds(bounds,{paddingTopLeft:[60,150],paddingBottomRight:[wide?cw:60, wide?60:ch],duration:1.4,maxZoom:16});
    ranked.forEach((c,i)=>setTimeout(()=>addPin(c,i+1),500+i*450));
    setTimeout(()=>$('compCard').classList.add('in'),2400);
    window.__ranked=ranked;
  },
  web(){
    $('bUrl').textContent='searching “'+B.name+' Berlin”…';
    $('bBody').innerHTML='<div class="spin" style="width:28px;height:28px;border-width:3px"></div><span>Looking for an official website</span>';
    setTimeout(()=>{$('bUrl').textContent='no official site found';$('bBody').innerHTML='<div class="big"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/><path d="M4 4l16 16"/></svg></div><b>No website yet</b><span>Customers who search for you land on Yelp or Tripadvisor instead. We can build you a one-page site with an Impressum in minutes.</span>';},2200);
  },
  mob(){ document.querySelectorAll('#meter .m').forEach((m,i)=>{m.classList.remove('in');setTimeout(()=>m.classList.add('in'),400+i*500);}); }
};
// ---------- /api/audit ----------
async function fetchAudit(){
  const res = await fetch('/api/audit'+(CACHED?'?cached=1':''),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(INPUT)});
  if(!res.ok||!res.body) throw new Error('The check could not start ('+res.status+').');
  const reader=res.body.getReader(), dec=new TextDecoder();
  let buf='', result=null;
  for(;;){
    const {done,value}=await reader.read();
    if(value) buf+=dec.decode(value,{stream:!done});
    const lines=buf.split('\n'); buf=done?'':lines.pop();
    for(const line of lines){
      if(!line.trim()) continue;
      const ev=JSON.parse(line);
      if(ev.type==='tool') console.log('[audit]',ev.name,ev.detail||'');
      else if(ev.type==='error') throw new Error(ev.message||'The check failed.');
      else if(ev.type==='result') result=ev.result;
    }
    if(done) break;
  }
  if(!result) throw new Error('The check ended without a result.');
  return result;
}
function applyAudit(result){
  AUDIT=result;
  result.items.forEach(a=>{
    const it=ITEMS.find(x=>x.id===CONTRACT_TO_ID[a.item_id]); if(!it) return;
    it.st=a.status==='unknown'?'ask':a.status; it.ev=a.evidence; it.why=a.why||it.why;
    it.eff=EFFORT_LABEL[a.effort]||it.eff; it.effort=a.effort; it.stat=a.impact_stat_id;
  });
}
// The current ITEMS as a contract AuditResult, for /api/build and /api/guide (also covers "no presence").
function toAudit(){
  const business = AUDIT ? AUDIT.business : {name:B.name,category:INPUT.category,address:B.addr};
  const items = ITEMS.map(it=>({item_id:ID_TO_CONTRACT[it.id],status:it.st==='ask'?'unknown':it.st,evidence:it.ev,why:it.why,impact_stat_id:STATS.some(s=>s.id===it.stat)?it.stat:null,effort:it.effort||'hours'}));
  return {business,items,score:AUDIT?AUDIT.score:0,generatedAt:AUDIT?AUDIT.generatedAt:new Date().toISOString()};
}
function auditFailed(err){
  console.error('[audit]',err);
  const demo=new URLSearchParams(location.search); demo.set('cached','1');
  $('eta').innerHTML=esc(err.message||'The check failed.')+' <a href="?'+esc(demo.toString())+'">Use demo data</a> · <a href="">Try again</a>';
}

function runAudit(){
  if(running) return; running=true;
  if(!NP && !auditP) auditP=fetchAudit().then(applyAudit);
  $('lTitle').textContent="We're looking at "+B.name;
  $('gName').textContent=B.name;$('pName').textContent=B.name;$('gAv').textContent=initials;$('gAddr').textContent=B.addr.split(',')[0];
  $('loader').classList.remove('hide'); document.body.style.overflow='hidden';
  let i=0, elapsed=0;
  const tick=setInterval(()=>{elapsed+=500;const left=Math.max(0,Math.ceil((TOTAL-elapsed)/1000));$('eta').textContent=left>1?'about '+left+' seconds left':'almost done';$('lFill').style.width=Math.min(100,elapsed/TOTAL*100)+'%';},500);
  const next=()=>{
    if(i>=PH.length){
      clearInterval(tick); $('eta').textContent='almost done'; $('lFill').style.width='100%';
      (auditP||Promise.resolve()).then(()=>{
        renderPhases(PH.length); showScene('done'); $('eta').textContent='done';
        setTimeout(()=>{ $('loader').classList.add('hide'); document.body.style.overflow=''; setStep(2); renderResults(); running=false; },1400);
      },auditFailed);
      return;
    }
    const p=PH[i]; renderPhases(i); $('tipText').innerHTML=p.tip;
    if(p.k!=='comp') showScene(p.k);
    SCENE[p.k]();
    setTimeout(()=>{i++;next();},p.ms);
  };
  next();
}
$('goAudit').onclick=runAudit;
$('goResults').onclick=()=>{
  if(NP||AUDIT){setStep(2);renderResults();return;}
  runAudit();
};
$('noPresence').onclick=e=>{e.preventDefault();NP=true;ITEMS.forEach(it=>{if(it.st!=='ask')it.st='missing';});runAudit();};

// results
function renderResults(){
  const known=ITEMS.filter(i=>i.st!=='ask');
  const score=known.reduce((a,i)=>a+(i.st==='have'?1:i.st==='partial'?.5:0),0);
  $('scoreN').textContent=(Math.round(score*2)/2).toString().replace('.',',');
  $('scoreOf').textContent='of '+known.length+' basics online';
  requestAnimationFrame(()=>{$('ringArc').style.strokeDashoffset=452.4*(1-score/known.length);});
  const c=s=>ITEMS.filter(i=>i.st===s).length;
  $('legend').innerHTML=['have','partial','missing','ask'].filter(s=>c(s)).map(s=>`<span class="st ${s}">${c(s)} ${LABEL[s]}</span>`).join('');
  const open=ITEMS.filter(i=>i.st==='missing'||i.st==='partial');
  const top=[...open.filter(i=>i.act==='build'),...open.filter(i=>i.act!=='build')].slice(0,3);
  $('nextSteps').innerHTML='<h4>Your top three next steps</h4>'+top.map((it,n)=>`<div class="nx"><span class="num">${n+1}</span>${it.t.replace(' or one-page site','')}<span class="ef">${it.eff}</span></div>`).join('');
  $('tiers').innerHTML=TIERS.map(([k,name,sub])=>`<div class="tierhd fade"><h2>${name}</h2><span>${sub}</span></div><div class="grid">${ITEMS.filter(i=>i.tier===k).map(cardHTML).join('')}</div>`).join('');
  renderComp();
  document.querySelectorAll('.ask-q button').forEach(b=>b.onclick=()=>{b.parentNode.querySelectorAll('button').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');});
}
function renderComp(){
  const ranked=window.__ranked||COMP;
  const me=ranked.findIndex(c=>c.me)+1;
  const ahead=ranked.slice(0,me-1);
  $('compRes').innerHTML='<div class="tierhd"><h2>Competitors nearby</h2><span>Who shows up for “café near me” around you</span></div>'+
  '<div class="ctable"><div class="tr"><span>Business</span><span>Rating</span><span>Reviews</span><span>Website</span><span>Replies to reviews</span></div>'+
  ranked.map((c,i)=>'<div class="tr'+(c.me?' me':'')+'"><span class="nm"><span class="rk">'+(i+1)+'</span><span>'+c.n+(c.me?' (you)':'')+'</span></span><span>'+c.r.toString().replace('.',',')+' ★</span><span>'+c.c+'</span><span class="'+(c.web?'yes':'no')+'">'+(c.web?'Yes':'No')+'</span><span class="'+(c.rep>30?'yes':c.rep>0?'':'no')+'">'+c.rep+'%</span></div>').join('')+'</div>'+
  '<div class="insights">'+
  '<div class="ins"><b>You rank #'+me+' of '+ranked.length+'</b>Your rating is on par with the places ahead of you. They pull ahead with a website and more reviews.</div>'+
  '<div class="ins"><b>'+ahead.filter(c=>c.web).length+' of '+ahead.length+' ahead of you have a website</b>Building your site closes the biggest gap.</div>'+
  '<div class="ins"><b>'+ahead.filter(c=>c.rep>30).length+' of '+ahead.length+' reply to most reviews</b>You have replied to none. Drafting replies takes about five minutes.</div>'+
  '</div><p style="font-size:13px;color:var(--mute);margin:14px 0 0">Sample competitor data for the demo.</p>';
}
function cardHTML(it){
  const stat = STATS.find(s=>s.id===it.stat);
  const statUrl = stat && safeUrl(stat.url);
  const impact = stat
    ? `<div class="impact"><b>Impact</b> · ${esc(stat.value)} ${esc(stat.claim)}<span class="s">${statUrl?`<a href="${esc(statUrl)}" target="_blank" rel="noopener">Source: ${esc(stat.source)}, ${esc(stat.year)}</a>`:`Source: ${esc(stat.source)}, ${esc(stat.year)}`}</span></div>`
    : `<div class="impact"><b>Impact</b> · ${it.id==='imp'?'Legal requirement in Germany (§ 5 DDG).':'No sourced figure. Reason given in words above.'}</div>`;
  const action = it.st==='have' ? `<span class="effort">${IC.have} Nothing to do</span>`
    : it.st==='ask' ? `<div class="ask-q"><button>Yes</button><button>No</button></div>`
    : it.act==='build' ? `<button class="btn pri sm" data-act="build" data-id="${it.id}">${IC.spark}Build it</button>` : `<button class="btn sec sm" data-act="guide" data-id="${it.id}">${IC.guide}Guide me</button>`;
  return `<article class="ic-card fade">
    <div class="top2"><span class="st ${it.st}">${LABEL[it.st]}</span><span class="effort">${IC.clock}${it.eff}</span></div>
    <h3>${it.st==='ask'?it.t+'?':it.t}</h3>
    <p>${esc(it.why)}</p>
    <div class="ev">${IC.ev}<span>${esc(it.ev)}</span></div>
    ${it.st==='have'?'':impact}
    <div class="foot">${action}</div>
  </article>`;
}

// ---------- Build / guide panel (T6) ----------
const panel=document.createElement('div');
panel.className='mp-back hide';
panel.innerHTML='<div class="mp" role="dialog" aria-modal="true" aria-labelledby="mpTitle" tabindex="-1"><div class="mp-hd"><div><p class="eyebrow" id="mpEyebrow"></p><h2 id="mpTitle"></h2></div><button class="btn sec sm" id="mpClose">Close</button></div><div id="mpBody" aria-live="polite"></div></div>';
document.body.appendChild(panel);
let opener=null, panelReq=0;
function closePanel(){ panelReq++; panel.classList.add('hide'); document.body.style.overflow=''; if(opener) opener.focus(); opener=null; }
panel.addEventListener('click',e=>{ if(e.target===panel) closePanel(); });
$('mpClose').onclick=closePanel;
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!panel.classList.contains('hide')) closePanel(); });
$('tiers').addEventListener('click',e=>{
  const b=e.target.closest('button[data-act]'); if(!b) return;
  opener=b; openPanel(b.dataset.act,ITEMS.find(i=>i.id===b.dataset.id));
});
const slug=n=>n.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'website';
const learnBox=t=>`<div class="impact"><b>What the AI just did</b><span class="s">${esc(t)}</span></div>`;

async function openPanel(kind,it){
  const req=++panelReq;
  const isReplies=kind==='build'&&it.id==='rev';
  $('mpEyebrow').textContent=kind==='build'?'Build it':'Guide me';
  $('mpTitle').textContent=it.t;
  $('mpBody').innerHTML=`<div class="tool"><div class="spin"></div><span class="k">${kind==='build'?`Claude is building your ${isReplies?'review replies':'website'}…`:'Claude is writing your steps…'}</span></div>`;
  panel.classList.remove('hide'); document.body.style.overflow='hidden'; panel.querySelector('.mp').focus();
  try{
    const url=kind==='build'?'/api/build':'/api/guide';
    const body=kind==='build'?{item_id:isReplies?'review_replies':'website',audit:toAudit()}:{item_id:ID_TO_CONTRACT[it.id],audit:toAudit()};
    const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error||'Something went wrong. Please try again.');
    if(req!==panelReq) return;
    if(kind==='guide') renderGuide(data); else if(data.kind==='html') renderSite(data); else renderReplies(data);
  }catch(err){
    if(req!==panelReq) return;
    console.error('[panel]',err);
    $('mpBody').innerHTML=`<p class="lede">${esc(err.message)}</p><button class="btn pri sm" id="mpRetry">Try again</button>`;
    $('mpRetry').onclick=()=>openPanel(kind,it);
  }
}
function renderSite({html,learn}){
  $('mpBody').innerHTML=`<div class="btns"><button class="btn pri sm" id="mpDl">Download .html</button><button class="btn sec sm" id="mpOpen">Open in new tab</button></div><iframe sandbox="" title="Website preview"></iframe>${learnBox(learn)}`;
  $('mpBody').querySelector('iframe').srcdoc=html;
  const blobUrl=()=>URL.createObjectURL(new Blob([html],{type:'text/html'}));
  $('mpDl').onclick=()=>{const a=document.createElement('a');a.href=blobUrl();a.download=slug(toAudit().business.name)+'.html';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
  $('mpOpen').onclick=()=>window.open(blobUrl(),'_blank','noopener');
}
function renderReplies({replies,learn}){
  const list=replies.length?replies.map((r,i)=>`<div class="rv"><div class="rh"><span class="stars">${r.review.rating?starSVG(r.review.rating):''}</span><span>${esc(r.review.author||'Google user')}</span></div><p>“${esc(r.review.text)}”</p><div class="impact">${esc(r.reply)}</div><div class="rf"><button class="btn sec sm" data-copy="${i}">Copy reply</button></div></div>`).join(''):'';
  $('mpBody').innerHTML=`<div class="next">${list}</div>${learnBox(learn)}`;
  $('mpBody').querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{
    try{ await navigator.clipboard.writeText(replies[+b.dataset.copy].reply); b.textContent='Copied'; }
    catch{ b.textContent='Select and copy the text above'; }
  });
}
function renderGuide({steps,learn}){
  $('mpBody').innerHTML=`<div class="next">${steps.map((st,n)=>{const l=safeUrl(st.link);return `<div class="nx"><span class="num">${n+1}</span><div><b>${esc(st.title)}</b><span class="s">${esc(st.detail)}${l?` <a href="${esc(l)}" target="_blank" rel="noopener">Open ↗</a>`:''}</span></div></div>`;}).join('')}</div>${learnBox(learn)}`;
}
}
