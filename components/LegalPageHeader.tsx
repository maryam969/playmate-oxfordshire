"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";

/**
 * Shared header for standalone pages outside the main app shell
 * (Privacy, Terms, Accessibility, Support). These pages don't have
 * the app's usual back-arrow navigation, so a signed-in user who
 * lands here (e.g. from a footer link) needs a way back into their
 * actual app content — not the public marketing landing page, which
 * would otherwise leave them stranded looking logged out.
 */
export default function LegalPageHeader() {
  const [backHref, setBackHref] = useState("/");
  const [backLabel, setBackLabel] = useState("Back to home");

  useEffect(() => {
    const supabase = createSupabaseClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setBackHref("/dashboard");
        setBackLabel("Back to app");
      }
    });
  }, []);

  return (
    <header
      className="sticky top-0 z-30 border-b border-[#F0F0F0] bg-white"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-black">OxSporties</Link>
        <Link href={backHref} className="text-sm font-semibold text-[#1D9E75] hover:underline">
          {backLabel}
        </Link>
      </div>
    </header>
  );
}
