"use client";

/**
 * Thin PostHog initializer. Only activates when
 * `NEXT_PUBLIC_POSTHOG_KEY` is set — the repo can be cloned and run
 * locally without a PostHog project and the site never crashes.
 *
 * Page views are captured automatically by posthog-js. Custom events
 * (waitlist_signup, faq_expand, cta_click) are emitted by their own
 * call sites via `capture(name, props)`.
 */
import { useEffect } from "react";
import posthog from "posthog-js";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    if (posthog.__loaded) return;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug(false);
      },
    });
  }, []);
  return <>{children}</>;
}

/** Safe event wrapper — never throws when PostHog isn't initialized. */
export function capture(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return;
  posthog.capture(event, props);
}
