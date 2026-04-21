import type { NextConfig } from "next";

/**
 * Assert at build time that no secret-tier key was ever leaked into a
 * `NEXT_PUBLIC_` slot. `NEXT_PUBLIC_*` vars are baked into the browser
 * bundle, which means a service-role key or provider API key named with
 * that prefix ships to every visitor. This fails the build fast when it
 * sees any `NEXT_PUBLIC_` env whose name suggests a secret.
 */
const FORBIDDEN_PUBLIC_PATTERNS = [
  /SERVICE_ROLE/i,
  /SECRET/i,
  /^NEXT_PUBLIC_ANTHROPIC_API_KEY$/i,
  /^NEXT_PUBLIC_GEMINI_API_KEY$/i,
  /^NEXT_PUBLIC_APIFY_TOKEN$/i,
];
for (const name of Object.keys(process.env)) {
  if (!name.startsWith("NEXT_PUBLIC_")) continue;
  if (FORBIDDEN_PUBLIC_PATTERNS.some((rx) => rx.test(name))) {
    throw new Error(
      `[security] env var "${name}" must not be NEXT_PUBLIC — that would expose a secret to the browser bundle. Rename without the prefix.`,
    );
  }
}

/**
 * Content-Security-Policy.
 *
 * Static (not nonce-based) because App Router + Tailwind both rely on
 * inline script/style chunks that would otherwise need per-request nonce
 * plumbing through middleware. Every external origin here corresponds to
 * an actually-used dependency — Supabase for waitlist writes, Anthropic
 * and Gemini for the LLM routes, Apify for the creator scrape, Vercel
 * for analytics + speed insights, PostHog for product analytics. Anyone
 * adding a new origin should do it here, not by loosening the directive.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://*.posthog.com https://us-assets.i.posthog.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://generativelanguage.googleapis.com https://*.apify.com https://vitals.vercel-insights.com https://*.posthog.com https://us-assets.i.posthog.com https://us.i.posthog.com",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  experimental: {
    // 50MB was cargo-culted from an earlier upload experiment that never
    // shipped. Tighten to the minimum any real server action needs — the
    // default 1MB is plenty for waitlist + future contact forms.
    serverActions: { bodySizeLimit: "1mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "**.apify.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
