import type { MetadataRoute } from "next";
import { PUBLIC_ONLY } from "@/lib/config";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lucid-v2.vercel.app";

/**
 * On the public build we explicitly disallow the gated product routes so
 * crawlers do not waste budget crawling 307 redirects. API is always off-
 * limits regardless of deploy.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PUBLIC_ONLY
          ? ["/api/", "/score", "/research", "/rewrite", "/business"]
          : ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
