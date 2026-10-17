import type { Metadata } from "next";
import AuditClient from "@/components/audit/AuditClient";
import DesignFonts from "@/components/DesignFonts";

export const metadata: Metadata = { title: "mise en place · audit" };

export default function AuditPage() {
  return (
    <>
      <DesignFonts />
      <AuditClient />
    </>
  );
}
