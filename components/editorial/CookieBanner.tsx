"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Lightweight cookie notice. Shown until the visitor dismisses it; the choice
 * is persisted to localStorage so the banner never appears twice for the same
 * browser. Editorial voice, no legal-ese, single action. Not a consent gate —
 * the only analytics we run (Vercel anonymous + PostHog pageviews) are
 * low-risk behavior signals disclosed in /privacy. Dismissing the banner
 * acknowledges that, which is what GDPR transparency asks for.
 *
 * If we later add high-risk tracking (third-party ad pixels, session replay,
 * anything cross-site), this component should be upgraded to an opt-in gate
 * that withholds those scripts until consent.
 */
const STORAGE_KEY = "lucid_cookie_ack_v1";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "ack") return;
    } catch {
      // Private browsing or quota errors — still show the banner once.
    }
    setVisible(true);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "ack");
    } catch {
      // Can't persist — fine, we'll show again next visit.
    }
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/15 bg-paper/95 px-6 py-4 backdrop-blur md:px-10"
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
        <p className="mono max-w-[62ch] text-[0.68rem] uppercase tracking-[0.22em] text-ink/75">
          we keep a few crumbs · anonymous analytics · no cross-site tracking ·
          details in{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-[4px] hover:text-viral"
          >
            privacy
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mono inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[0.7rem] uppercase tracking-[0.24em] text-cream transition hover:bg-viral hover:text-ink focus:outline-none focus-visible:outline-none"
        >
          <span>got it</span>
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
