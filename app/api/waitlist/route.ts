import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { waitlistBodySchema } from "@/lib/validation";
import {
  addToWaitlist,
  type WaitlistWriteResult,
} from "@/lib/supabase/repository";

export const runtime = "nodejs";
export const maxDuration = 10;

/** User-agent is stored truncated — abuse forensics only, never surfaced. */
const MAX_UA_LEN = 256;

/**
 * Opaque per-day client hash so we can see repeat-offender patterns without
 * retaining raw IPs. The salt rotates daily (UTC midnight), which is a weak
 * but deliberate anti-profiling move — two signups from the same IP on the
 * same day share a hash, but the hash is useless tomorrow.
 */
function hashClient(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${ip}:${day}`).digest("hex").slice(0, 32);
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

  return Response.json({ ok: true, status: handleWaitlistConflict(result) });
}
