import { NextResponse, type NextRequest } from "next/server";
import { PUBLIC_ONLY, isGatedRoute } from "@/lib/config";

/**
 * Lightweight per-IP in-memory rate limiter. Sized for hackathon demo traffic —
 * not a substitute for Upstash/Redis at real scale, but enough to stop a single
 * bad actor from torching the Anthropic or Gemini quotas in seconds.
 *
 * Replace `buckets` with an edge KV store (Upstash, Cloudflare KV) before
 * horizontal scaling; in-memory Map does not share state across lambdas.
 */
interface Bucket {
  count: number;
  resetAt: number;
}
const buckets = new Map<string, Bucket>();

interface Limit {
  max: number;
  windowMs: number;
}

// score-live is the heaviest endpoint (yt-dlp + 80MB download + Gemini upload);
// the other three Anthropic-backed routes carry their cost in token spend, so
// they get windows sized against typical demo usage, not production scale.
const LIMITS: Record<string, Limit> = {
  "/api/score-live": { max: 3, windowMs: 60_000 },
  "/api/score-synth": { max: 10, windowMs: 60_000 },
  "/api/rewrite": { max: 10, windowMs: 60_000 },
  "/api/chat": { max: 20, windowMs: 60_000 },
  "/api/scrape-creator": { max: 5, windowMs: 60_000 },
  // Waitlist: a real human signs up once. 3 per 10 min per IP is generous
  // for retries without giving a bot a firehose.
  "/api/waitlist": { max: 3, windowMs: 10 * 60_000 },
};

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

function normalizeRoute(pathname: string): string | null {
  for (const route of Object.keys(LIMITS)) {
    if (pathname === route || pathname.startsWith(route + "/")) return route;
  }
  return null;
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Public-only deploy: gated product routes redirect to the waitlist so the
  // share-safe build never reveals the app. The `?locked=` param lets
  // /waitlist render a soft banner naming which surface the visitor was
  // trying to reach.
  if (PUBLIC_ONLY && isGatedRoute(pathname)) {
    const url = req.nextUrl.clone();
    const rootSlug = pathname.slice(1).split("/")[0];
    url.pathname = "/waitlist";
    url.search = `?locked=${encodeURIComponent(rootSlug)}`;
    return NextResponse.redirect(url, 307);
  }

  // Public-only deploy: the product's LLM-backed API routes are unreachable.
  // A direct POST from a bot or a curious stranger should not burn Anthropic
  // or Gemini quota — return 410 Gone so the endpoint reads as retired, not
  // temporarily broken. /api/waitlist stays open because the form needs it.
  if (
    PUBLIC_ONLY &&
    pathname.startsWith("/api/") &&
    pathname !== "/api/waitlist" &&
    !pathname.startsWith("/api/waitlist/")
  ) {
    return NextResponse.json(
      { error: "gone", message: "This endpoint is not available on the public build." },
      { status: 410 },
    );
  }

  const route = normalizeRoute(pathname);
  if (!route) return NextResponse.next();

  const limit = LIMITS[route];
  const ip = clientIp(req);
  const key = `${ip}:${route}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + limit.windowMs });
    return NextResponse.next();
  }

  if (bucket.count >= limit.max) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "rate_limited", retryAfter },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(limit.max),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  bucket.count += 1;
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/score/:path*",
    "/research/:path*",
    "/rewrite/:path*",
    "/business/:path*",
  ],
};
