import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { waitlistBodySchema } from "@/lib/validation";
import {
  addToWaitlist,
  type WaitlistWriteResult,
} from "@/lib/supabase/repository";
import { sendWaitlistWelcome } from "@/lib/email/resend";

export const runtime = "nodejs";
export const maxDuration = 10;

/** User-agent is stored truncated — abuse forensics only, never surfaced. */
const MAX_UA_LEN = 256;

/**
 * Fire-and-forget Slack notification. Lets Manav see the list grow in real
 * time from a channel without running a dashboard. Fails silently — the
 * signup itself is what matters, not the ping.
 */
async function notifySlack(body: {
  email: string;
  source?: string;
  duplicate: boolean;
}): Promise<void> {
  const webhook = process.env.SLACK_WAITLIST_WEBHOOK;
  if (!webhook) return;
  const masked = body.email.replace(/^(.).+(@.+)$/, "$1***$2");
  const text = body.duplicate
    ? `waitlist repeat · ${masked}${body.source ? ` · ${body.source}` : ""}`
    : `waitlist signup · ${masked}${body.source ? ` · ${body.source}` : ""}`;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(3_000),
    });
  } catch {
    // intentional — Slack being down never fails a signup
  }
}

/**
 * Opaque per-day client hash so we can see repeat-offender patterns without
 * retaining raw IPs. The salt rotates daily (UTC midnight), which is a weak
 * but deliberate anti-profiling move — two signups from the same IP on the
 * same day share a hash, but the hash is useless tomorrow.
 */
/**
 * Opaque per-day client hash so we can see repeat-offender patterns without
 * retaining raw IPs. The salt rotates daily (UTC midnight). A static
 * `WAITLIST_HASH_PEPPER` env var is mixed in when set so the daily hash is
 * not enumerable by anyone who knows the date alone.
 *
 * IP source prefers Vercel's platform-set `x-real-ip` (un-spoofable) over
 * `x-forwarded-for[0]` (client-controlled).
 */
function hashClient(req: NextRequest): string {
  const real = req.headers.get("x-real-ip");
  const vercel = req.headers.get("x-vercel-forwarded-for");
  const fwd = req.headers.get("x-forwarded-for");
  const fwdLast = fwd
    ? fwd.split(",").map((s) => s.trim()).filter(Boolean).slice(-1)[0]
    : undefined;
  const ip = real ?? vercel?.split(",")[0]?.trim() ?? fwdLast ?? "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const pepper = process.env.WAITLIST_HASH_PEPPER ?? "";
  return createHash("sha256")
    .update(`${pepper}:${ip}:${day}`)
    .digest("hex")
    .slice(0, 32);
}

/* ─── DUPLICATE-EMAIL STRATEGY ────────────────────────────────────────────
 *
 * This is a product/UX call with no "right" answer. Three clean options:
 *
 *   A) "silent_success"
 *      Return the same {ok:true, status:"joined"} for fresh signups AND
 *      duplicates. The browser always shows "You're in." No info leaks
 *      about whether an email is on the list. Most privacy-preserving;
 *      a little flat on UX.
 *
 *   B) "friendly_ack"
 *      Return distinct statuses: "joined" for fresh, "already_on_list"
 *      for duplicates. The browser can say "Welcome back — you're already
 *      on the list." Better UX; leaks list-membership info to anyone
 *      who types an email into the form.
 *
 *   C) "treat_as_fresh_interest"
 *      Treat a duplicate as renewed intent. Return "joined" to the browser
 *      and (optionally) log a metadata row so you can count how many
 *      people re-sign-up as a signal of demand. Feels most alive for a
 *      creator-facing product; slightly dishonest.
 *
 * Your call drives the copy the user sees on /waitlist after they submit.
 * Implement handleWaitlistConflict() below to match your pick.
 * ────────────────────────────────────────────────────────────────────── */

type PublicStatus = "joined" | "already_on_list";

/**
 * TODO (Manav): pick a strategy and implement. Receives the write result,
 * returns the status the frontend will render.
 *
 * - Option A: always return "joined"
 * - Option B: return result.duplicate ? "already_on_list" : "joined"
 * - Option C: always return "joined", but when result.duplicate === true
 *   also call something like `logRepeatSignupSignal(email)` first.
 *
 * Default (safe for first-ship): Option A — silent success.
 */
function handleWaitlistConflict(
  result: Extract<WaitlistWriteResult, { ok: true }>,
): PublicStatus {
  // ⬇️ REPLACE THIS LINE WITH YOUR CHOICE ⬇️
  return "joined";
  // ⬆️ REPLACE THIS LINE WITH YOUR CHOICE ⬆️
}

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null);
  const parsed = waitlistBodySchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      { error: "invalid_email" },
      { status: 400 },
    );
  }
  const body = parsed.data;

  const userAgent = (req.headers.get("user-agent") ?? "").slice(0, MAX_UA_LEN);
  const ipHash = hashClient(req);

  const result = await addToWaitlist({
    email: body.email,
    source: body.source,
    referrer: body.referrer,
    userAgent,
    ipHash,
  });

  if (!result.ok) {
    if (result.reason === "no_supabase") {
      // Demo mode: no DB configured. Return optimistic success so the form
      // never looks broken on a fresh clone. The signup isn't persisted.
      return Response.json({ ok: true, status: "joined", demo: true });
    }
    return Response.json(
      { ok: false, error: "waitlist_unavailable" },
      { status: 503 },
    );
  }

  // Side-effect: ping Slack without blocking the response. The client
  // already received success in the render path above; this is pure
  // operator observability.
  void notifySlack({
    email: body.email,
    source: body.source,
    duplicate: result.duplicate === true,
  });

  // Fire-and-forget transactional welcome. Only sent on a fresh signup —
  // a duplicate would just re-mail someone who already opted in once, which
  // crosses the "one email when it's your turn" promise on /waitlist.
  if (!result.duplicate) {
    void sendWaitlistWelcome(body.email);
  }

  return Response.json({ ok: true, status: handleWaitlistConflict(result) });
}
