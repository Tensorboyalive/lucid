import { NextRequest } from "next/server";
import { buildPlaceholderProfile } from "@/lib/mock-research";
import { upsertCreator } from "@/lib/supabase/repository";
import { scrapeCreatorBodySchema } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 180;

interface ApifyPost {
  id?: string;
  shortCode?: string;
  caption?: string;
  url?: string;
  displayUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
  videoUrlBackup?: string;
  videoPlayUrl?: string;
  likesCount?: number;
  commentsCount?: number;
  videoPlayCount?: number;
  videoViewCount?: number;
  videoDuration?: number;
  timestamp?: string;
  ownerUsername?: string;
  ownerFullName?: string;
  ownerFollowersCount?: number;
  type?: string;
}

function pickThumbnail(p: ApifyPost): string | null {
  return (
    p.displayUrl ??
    p.thumbnailUrl ??
    p.imageUrl ??
    (p.images && p.images[0]) ??
    null
  );
}

// easyapi/instagram-profile-scraper. Sync call, returns all items in one response.
const USERNAME_ACTOR = "xMc5Ga1oCONPmWJIa";

function pickHookType(caption: string, duration: number): string {
  const c = caption.toLowerCase();
  if (/\$\d|\b\d{1,3},\d{3}\b|million|thousand/i.test(caption)) {
    return "stakes reveal";
  }
  if (/\bvs\b|versus|difference|compared/i.test(c)) return "contrast pair";
  if (/never|always|every|nobody|everyone/i.test(c)) return "superlative";
  if (duration < 15) return "flash hook";
  if (duration > 50) return "long form";
  return "narrative";
}

function scoreFromMetrics(
  views: number | undefined,
  likes: number | undefined,
  comments: number | undefined,
): number {
  const v = (views ?? 0) > 0 ? (views ?? 0) : (likes ?? 0) * 18;
  const engagement = v > 0 ? ((likes ?? 0) + (comments ?? 0) * 3) / v : 0;
  const base = Math.log10(Math.max(1, v)) * 1.1;
  const eng = Math.min(4, engagement * 400);
  const raw = Math.min(9.6, base + eng);
  return Math.round(Math.max(5.5, raw) * 10) / 10;
}

function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function formatViews(n: number | undefined): string {
  if (!n || n <= 0) return "·";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return String(n);
}

function gradientFor(i: number): string {
  const pairs = [
    ["#C53030", "#6D28D9"],
    ["#E85D1C", "#C53030"],
    ["#0E7C86", "#6D28D9"],
    ["#D97706", "#E85D1C"],
    ["#6D28D9", "#0E7C86"],
    ["#C53030", "#D97706"],
    ["#E85D1C", "#6D28D9"],
    ["#0E7C86", "#D97706"],
  ];
  const p = pairs[i % pairs.length];
  return `linear-gradient(135deg,${p[0]},${p[1]})`;
}

async function runActorSync(
  token: string,
  actorId: string,
  input: Record<string, unknown>,
): Promise<ApifyPost[]> {
  // Pass the token via Authorization header instead of ?token= in the URL —
  // stops the secret showing up in proxy/access logs.
  const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items`;
  // run-sync blocks on the actor's cold start, which can run 45s+ at the
  // p95. 60s is the hard ceiling; the enclosing POST uses 90s maxDuration,
  // so the fetch times out before the function does.
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) {
    throw new Error(`apify ${res.status} ${res.statusText}`);
  }
  const items = (await res.json()) as ApifyPost[];
  return items;
}

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null);
  const parsed = scrapeCreatorBodySchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }
  const handle = parsed.data.handle.trim().replace(/^@/, "").slice(0, 100);
  if (!handle) {
    return Response.json({ error: "handle_required" }, { status: 400 });
  }

  const token = process.env.APIFY_TOKEN;
  if (!token) {
    return Response.json({
      profile: buildPlaceholderProfile(handle),
      fallback: true,
      reason: "no-apify-token",
    });
  }

  try {
    const posts = await runActorSync(token, USERNAME_ACTOR, {
      username: [handle],
      resultsLimit: 20,
      skipPinnedPosts: false,
      includeSharesCount: false,
      includeTranscript: false,
      includeDownloadedVideo: false,
    });

    if (!Array.isArray(posts) || posts.length === 0) {
      return Response.json({
        profile: buildPlaceholderProfile(handle),
        fallback: true,
        reason: "no-posts-found",
      });
    }

    // Filter out stub items returned by Apify when a handle is private, empty,
    // or when the actor returned profile metadata instead of posts. A real
    // reel/post has at least one of: caption, thumbnail, video URL, or likes.
    const realPosts = posts.filter((p) => {
      const hasCaption = typeof p.caption === "string" && p.caption.trim().length > 0;
      const hasMedia =
        Boolean(pickThumbnail(p)) ||
        Boolean(p.videoUrl) ||
        Boolean(p.videoPlayUrl) ||
        Boolean(p.videoUrlBackup);
      const hasEngagement = (p.likesCount ?? 0) > 0 || (p.commentsCount ?? 0) > 0;
      return hasCaption || hasMedia || hasEngagement;
    });

    if (realPosts.length < 3) {
      return Response.json({
        profile: buildPlaceholderProfile(handle),
        fallback: true,
        reason: realPosts.length === 0 ? "no-reels-found" : "too-few-reels",
        meta: { attempted: posts.length, realPosts: realPosts.length },
      });
    }

    const capped = realPosts.slice(0, 12);

    const reels = capped.map((p, i) => {
      const duration = Math.max(
        6,
        Math.min(90, Math.round(p.videoDuration ?? 28)),
      );
      const score = scoreFromMetrics(
        p.videoPlayCount ?? p.videoViewCount ?? 0,
        p.likesCount ?? 0,
        p.commentsCount ?? 0,
      );
      const thumb = pickThumbnail(p);
      return {
        id: `r${i + 1}`,
        thumbnail: thumb ?? gradientFor(i),
        thumbnailKind: (thumb ? "image" : "gradient") as "image" | "gradient",
        postUrl: p.url ?? (p.shortCode ? `https://www.instagram.com/reel/${p.shortCode}/` : null),
        caption: truncate(p.caption ?? "(no caption)", 160),
        views: formatViews(
          p.videoPlayCount ?? p.videoViewCount ?? p.likesCount ?? 0,
        ),
        engagement: score.toFixed(1),
        hookType: pickHookType(p.caption ?? "", duration),
        durationSec: duration,
        scoreEstimate: score,
      };
    });

    const avgScore =
      reels.reduce((a, r) => a + r.scoreEstimate, 0) / reels.length;

    const placeholderPatterns = buildPlaceholderProfile(handle).patterns;
    const patterns = [
      {
        title: "Live pattern from the scraped feed",
        body: `Pulled ${reels.length} posts from @${handle} through the ingest pipeline. Hook density, pacing, and emotional cadence are now inputs to the Gamma engine chat below.`,
      },
      ...placeholderPatterns.slice(1),
    ];

    const followerCount = capped[0]?.ownerFollowersCount;
    const followers =
      typeof followerCount === "number" && followerCount > 0
        ? formatViews(followerCount)
        : "live · scraped";

    const profile = {
      handle: "@" + handle,
      name: capped[0]?.ownerFullName ?? capped[0]?.ownerUsername ?? handle,
      followers,
      avgScore: Math.round(avgScore * 10) / 10,
      reels,
      patterns,
    };

    // Cache the creator so future /research loads on the same handle are
    // instant. Fire and forget to keep the request path snappy.
    void upsertCreator({
      handle: profile.handle,
      displayName: profile.name,
      followers: profile.followers,
      avgScore: profile.avgScore,
    }).catch(() => undefined);

    return Response.json({
      profile,
      fallback: false,
      source: "apify",
    });
  } catch (err) {
    // Log the real error server-side only; return an opaque code to the
    // client so Apify SDK internals (endpoint URLs, auth details) don't leak.
    console.error("[api/scrape-creator] failed:", err);
    return Response.json({
      profile: buildPlaceholderProfile(handle),
      fallback: true,
      reason: "scrape_error",
    });
  }
}
