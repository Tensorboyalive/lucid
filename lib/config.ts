/**
 * Deployment mode configuration.
 *
 * The repo is built twice from one codebase:
 *
 *   • Private / full-product build — the complete app. All routes live.
 *   • Public / pre-launch build   — only /, /waitlist, /proof are reachable.
 *     /score, /research, /rewrite, /business redirect to /waitlist; nav hides
 *     them; hero + pricing CTAs point at the waitlist instead of the product.
 *
 * The flag is a build-time `NEXT_PUBLIC_` env var so every conditional branch
 * is statically evaluated into the bundle. The public Vercel project sets
 * `NEXT_PUBLIC_PUBLIC_ONLY=true`; the private one leaves it unset.
 */

export const PUBLIC_ONLY = process.env.NEXT_PUBLIC_PUBLIC_ONLY === "true";

/** Routes that render in both modes. */
export const PUBLIC_ROUTES = [
  "/",
  "/waitlist",
  "/proof",
  "/privacy",
  "/terms",
  "/contact",
] as const;

/**
 * Routes that only exist on the private deploy. On the public deploy they
 * middleware-redirect to `/waitlist?locked=<route>` so a visitor who types
 * the URL lands on the signup with a soft explanation.
 */
export const GATED_ROUTES = [
  "/score",
  "/research",
  "/rewrite",
  "/business",
] as const;

export function isGatedRoute(pathname: string): boolean {
  return GATED_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );
}

/** Friendly label for the `?locked=` query param used on /waitlist. */
export const LOCKED_LABELS: Record<string, string> = {
  score: "the mirror",
  research: "the creator research engine",
  rewrite: "the rewriter",
  business: "the business page",
};
