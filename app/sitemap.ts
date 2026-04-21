import type { MetadataRoute } from "next";
import { PUBLIC_ONLY, GATED_ROUTES, PUBLIC_ROUTES } from "@/lib/config";

/**
 * Per-build sitemap. The public pre-launch deploy advertises only /, /proof,
 * /waitlist — there is no point letting Google index routes that 307 to the
 * waitlist, and indexed-but-redirecting pages dilute the canonical ranking.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lucid-v2.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = PUBLIC_ONLY
    ? PUBLIC_ROUTES
    : [...PUBLIC_ROUTES, ...GATED_ROUTES];

  const now = new Date();
  return routes.map((route) => ({
    url: `${SITE_URL}${route === "/" ? "" : route}`,
    lastModified: now,
    changeFrequency: route === "/" || route === "/waitlist" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/waitlist" ? 0.9 : 0.7,
  }));
}
