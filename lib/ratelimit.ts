/**
 * Distributed rate limiter backed by Upstash Redis.
 *
 * The `middleware.ts` in-memory Map is a hackathon-grade speed bump — it
 * does not share state across Vercel's Fluid Compute instances, so a
 * determined actor rotates cold starts and the nominal per-IP limit stops
 * enforcing. This module swaps in a real, cross-instance ratelimit once
 * `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set.
 *
 * When the env vars are unset the `getRatelimiter` helper returns `null`
 * and the caller is expected to fall back to the in-memory path. Nothing
 * blows up locally or in CI before Upstash is provisioned.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateKind =
  | "api:score-live"
  | "api:score-synth"
  | "api:rewrite"
  | "api:chat"
  | "api:scrape-creator"
  | "api:waitlist";

interface LimitSpec {
  requests: number;
  windowSec: number;
}

const LIMITS: Record<RateKind, LimitSpec> = {
  "api:score-live": { requests: 3, windowSec: 60 },
  "api:score-synth": { requests: 10, windowSec: 60 },
  "api:rewrite": { requests: 10, windowSec: 60 },
  "api:chat": { requests: 20, windowSec: 60 },
  "api:scrape-creator": { requests: 5, windowSec: 60 },
  "api:waitlist": { requests: 3, windowSec: 600 },
};

let _redis: Redis | null = null;
const _limiters = new Map<RateKind, Ratelimit>();

function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

/**
 * Get a cached per-kind ratelimiter. Returns null when Upstash is not
 * configured — callers should fall back to the local middleware bucket.
 */
export function getRatelimiter(kind: RateKind): Ratelimit | null {
  const existing = _limiters.get(kind);
  if (existing) return existing;
  const redis = getRedis();
  if (!redis) return null;
  const spec = LIMITS[kind];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(spec.requests, `${spec.windowSec} s`),
    prefix: `lucid:rl:${kind}`,
    analytics: false,
  });
  _limiters.set(kind, limiter);
  return limiter;
}

export function hasUpstash(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}
