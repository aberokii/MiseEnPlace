"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "./audit.css";
import { AUDIT_MARKUP } from "./auditMarkup";
import { startAudit } from "./auditDemo";

// Confirm → animated audit → results, as designed. Still runs on the design's demo data, not on /api/audit yet.
export default function AuditClient() {
  const started = useRef(false);

  useEffect(() => {
    // Leaflet needs `window`, so load it in the browser only. The ref stops a second start in dev (Strict Mode).
    if (started.current) return;
    started.current = true;
    import("leaflet").then((mod) => startAudit(mod.default));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: AUDIT_MARKUP }} />;
}
