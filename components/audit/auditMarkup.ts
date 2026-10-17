// Markup of the audit screens, taken 1:1 from the Claude Design handoff ("Mise en place - Audit.html").
export const AUDIT_MARKUP: string = `<header class="top">
  <a class="logo" href="/">mise en place</a>
  <a class="mini" href="/"><span id="miniName">Café Le Vent</span><i><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></i></a>
  <nav class="steps" id="steps"><b data-s="0">1 · Confirm</b><b data-s="1">2 · Analyse</b><b data-s="2">3 · Results</b></nav>
</header>

<main>
  <div class="split" id="splitView" data-screen-label="Confirm / Analyse">
    <div class="mapwrap">
      <div id="map"></div>
      <div class="maptag" id="mapTag">
        <div class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>
        <div><b id="tagTitle">Locating business</b><small id="tagSub">Searching name + city</small></div>
      </div>
    </div>

    <section id="s-confirm" data-screen-label="01 Confirm match">
      <p class="eyebrow">Step 1 of 3</p>
      <h1>Is this your business?</h1>
      <p class="lede">We found one match. Check the name and address before we look at what's online.</p>
      <div class="card match">
        <div class="hd"><div class="av" id="mAv">LV</div><div><h2 id="mName">Café Le Vent</h2><div class="sub" id="mCat">Coffee bar · Berlin-Mitte</div></div></div>
        <dl class="facts">
          <dt>Address</dt><dd id="mAddr">Köpenicker Str. 44, 10179 Berlin</dd>
          <dt>Found on</dt><dd><div class="srcs" id="mSrc"></div></dd>
        </dl>
      </div>
      <div class="btns">
        <button class="btn pri" id="goAudit">Yes, analyse my business<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
        <a class="btn sec" href="/" style="text-decoration:none">Not mine</a>
      </div>
      <p class="fallback">Barely online yet? <a href="#" id="noPresence">Answer three quick questions instead</a></p>
    </section>

    <section id="s-audit" class="hide" data-screen-label="02 Live audit">
      <p class="eyebrow">Step 2 of 3</p>
      <h1 id="aTitle">Checking what's out there</h1>
      <p class="lede">We search the web the way a customer would. Each check shows what we found.</p>
      <div class="prog"><div class="bar"><i id="barFill"></i></div><b id="barNum">0/12</b></div>
      <div class="tool" id="tool"><div class="spin"></div><span class="k" id="toolK">Web search</span><span class="v" id="toolV">“Café Le Vent Berlin”</span></div>
      <div id="auditList"></div>
      <div class="btns hide" id="toResults"><button class="btn pri" id="goResults">See your results<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>
    </section>
  </div>

  <section id="s-results" class="hide" data-screen-label="03 Results">
    <div class="sum fade">
      <div class="ringbox"><svg width="168" height="168" viewBox="0 0 168 168"><circle cx="84" cy="84" r="72" fill="none" stroke="#EBEBEB" stroke-width="14"/><circle id="ringArc" cx="84" cy="84" r="72" fill="none" stroke="#FF385C" stroke-width="14" stroke-linecap="round" stroke-dasharray="452.4" stroke-dashoffset="452.4" style="transition:stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)"/></svg><div class="n"><b id="scoreN">0</b><span id="scoreOf">of 8 checked</span></div></div>
      <div>
        <p class="eyebrow" id="rEyebrow">Café Le Vent · Results</p>
        <h1 id="rTitle">Customers find you, but not your website</h1>
        <div class="legend" id="legend"></div>
      </div>
      <div class="next" id="nextSteps"><h4>Your top three next steps</h4></div>
    </div>
    <div id="tiers"></div>
    <div class="comp-res fade" id="compRes"></div>
  </section>
</main>

<div id="loader" class="hide" data-screen-label="02 Live audit">
  <aside class="lp">
    <a class="logo" href="/">mise en place</a>
    <h2 id="lTitle">We're looking at Café Le Vent</h2>
    <ul class="ph-list" id="phList"></ul>
    <div class="tip"><p id="tipText"></p><div class="lbar"><i id="lFill"></i></div><div class="eta" id="eta">about 35 seconds left</div></div>
  </aside>
  <div class="stage" id="stage">
    <div class="scene" data-sc="gbp">
      <div class="panel" style="position:relative;overflow:hidden">
        <div class="scan-line"></div>
        <div class="gp-hd"><div class="av" id="gAv">LV</div><div><div style="font-size:20px;font-weight:700;letter-spacing:-.02em" id="gName">Café Le Vent</div><div style="display:flex;align-items:center;gap:8px;font-size:14px;color:var(--mute);margin-top:4px"><b style="color:var(--ink)">4,6</b><span class="stars" id="gStars"></span><span>212 reviews · Coffee bar</span></div></div></div>
        <div class="gp-photo">[ listing photos · 14 found ]</div>
        <div class="gp-rows">
          <div><span>Address</span><span id="gAddr">Köpenicker Str. 44</span><span class="st have flag">Have</span></div>
          <div><span>Phone</span><span>Listed</span><span class="st have flag">Have</span></div>
          <div><span>Hours</span><span>Mon–Fri only</span><span class="st partial flag">Partial</span></div>
          <div><span>Website</span><span style="color:var(--mute)">None linked</span><span class="st missing flag">Missing</span></div>
        </div>
      </div>
    </div>
    <div class="scene" data-sc="rev" style="padding:0 48px"><div class="rv-col"><div class="rv-track" id="rvTrack"></div></div></div>
    <div class="scene" data-sc="dir">
      <div class="panel">
        <h4>Where we found you</h4>
        <div class="dir-grid" id="dirFound"></div>
        <h4 style="margin-top:24px">Where you could also be</h4>
        <div class="dir-grid" id="dirMiss"></div>
      </div>
    </div>
    <div class="scene" data-sc="map" style="padding:0">
      <div id="map2"></div>
      <div class="msearch"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#717171" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span id="typed"></span><span class="caret"></span></div>
      <div class="comp-card" id="compCard"><h4 id="compTitle">Top results for “café near me”</h4><div id="compRows"></div></div>
    </div>
    <div class="scene" data-sc="web">
      <div class="browser"><div class="bh"><i></i><i></i><i></i><div class="url" id="bUrl">searching…</div></div>
        <div class="bb" id="bBody"><div class="spin" style="width:28px;height:28px;border-width:3px"></div><span>Looking for an official website</span></div></div>
    </div>
    <div class="scene" data-sc="mob">
      <div class="phone"><div class="scr"><div class="isl"></div><div class="mp"></div>
        <div class="pc"><b id="pName">Café Le Vent</b><div style="font-size:13px;color:var(--mute)">4,6 ★ · Coffee bar · Open now</div>
          <div class="acts"><span>Call</span><span>Route</span><span class="off">Website</span></div>
          <div style="font-size:13px;color:var(--mute);line-height:1.5">This is what most people see first: your Google listing on a phone.</div></div></div></div>
      <div class="meter" id="meter">
        <div class="m"><small>Website speed</small><b>Nothing to load</b><span class="st missing" style="align-self:flex-start">No site</span></div>
        <div class="m"><small>Mobile layout</small><b>Google listing only</b><span class="st partial" style="align-self:flex-start">Partial</span></div>
        <div class="m"><small>Tap to call</small><b>Works from Google</b><span class="st have" style="align-self:flex-start">Have</span></div>
      </div>
    </div>
    <div class="scene" data-sc="done"><div class="done-sc"><div class="big"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg></div><b>Your report is ready</b><span style="color:var(--mute)">Opening results…</span></div></div>
  </div>
</div>
`;
