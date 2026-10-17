"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { COMPANIES, initials } from "./companies";
import "./search.css";

type Company = (typeof COMPANIES)[number];

const MAX_RESULTS = 6;

function matches(q: string): Company[] {
  q = q.trim().toLowerCase();
  if (!q) return [];
  return COMPANIES.filter((c) => (c.name + " " + c.city + " " + c.reg).toLowerCase().includes(q)).slice(0, MAX_RESULTS);
}

function Highlight({ text, q }: { text: string; q: string }) {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (!q || i < 0) return text;
  return <>{text.slice(0, i)}<b>{text.slice(i, i + q.length)}</b>{text.slice(i + q.length)}</>;
}

function goToAudit(params: Record<string, string>) {
  window.location.href = "/audit?" + new URLSearchParams(params);
}

// Company search from the Claude Design handoff ("Mise en place.dc.html"). Picking a result opens /audit.
export default function SearchHome() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(true);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);

  const q = query.trim();
  const list = matches(q);
  const pick = (c: Company) => goToAudit({ name: c.name, city: c.city, trade: c.trade });

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const n = list.length;
    if (e.key === "ArrowDown" && n) { e.preventDefault(); setActive((a) => (a + 1) % n); }
    else if (e.key === "ArrowUp" && n) { e.preventDefault(); setActive((a) => (a - 1 + n) % n); }
    else if (e.key === "Enter" && n) { e.preventDefault(); pick(list[Math.min(active, n - 1)]); }
    else if (e.key === "Escape") setQuery("");
  };

  return (
    <div className="home">
      <div className="logo">mise en place</div>
      <div className="wrap">
        <div className={"pill" + (focused ? " focus" : "")}>
          <input
            ref={input} value={query} autoComplete="off"
            placeholder="Search a company by name, city or register number"
            onChange={(e) => { setQuery(e.target.value); setActive(0); setFocused(true); }}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onKeyDown={onKey}
          />
          {query.length > 0 && (
            <button className="clear" aria-label="Clear" onMouseDown={(e) => { e.preventDefault(); setQuery(""); setActive(0); input.current?.focus(); }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          )}
          <div className="go">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </div>
        </div>

        {focused && q.length > 0 && (
          <div className="drop">
            {list.map((c, i) => (
              <div key={c.name} className={"res" + (i === active ? " on" : "")} onMouseEnter={() => setActive(i)} onMouseDown={(e) => { e.preventDefault(); pick(c); }}>
                <div className="av">{initials(c.name)}</div>
                <div className="body">
                  <div className="nm"><Highlight text={c.name} q={q} /></div>
                  <div className="meta">{[c.form, c.city, c.reg !== "—" ? c.reg : null].filter(Boolean).join(" · ")}</div>
                  {c.website ? (
                    <div className="web">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#717171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></svg>
                      {c.website}
                    </div>
                  ) : (
                    <div className="off">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2l20 20M8.5 16.4a5 5 0 0 1 7 0M2 8.8a15 15 0 0 1 4.2-2.7M10.7 5.1A15 15 0 0 1 22 8.8M5 12.9a10 10 0 0 1 5.2-2.8M16.9 10.8a10 10 0 0 1 2.1 2.1M12 20h.01" /></svg>
                      No online presence
                    </div>
                  )}
                </div>
                <div className="trade">{c.trade}</div>
              </div>
            ))}
            {list.length === 0 && (
              <div className="none">
                <div className="h">No match for “{query}”</div>
                <div className="s">Not every business is online. Add it with the details you have.</div>
                <button className="add" onMouseDown={(e) => { e.preventDefault(); goToAudit({ name: q }); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  Add “{query}” manually
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
