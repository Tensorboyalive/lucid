/**
 * Transactional email via Resend. Currently only wired for the waitlist
 * welcome, but the `send` helper is generic enough to back every future
 * transactional (invite, receipt, password reset).
 *
 * Guarded by `RESEND_API_KEY`. When unset, every call is a no-op so the
 * repo still works end-to-end for contributors without a Resend account.
 */

import { Resend } from "resend";

const FROM_ADDRESS =
  process.env.RESEND_FROM ?? "lucid <hello@lucid.ai>";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

interface SendInput {
  to: string;
  subject: string;
  /** Plain-text body — rendered as text/plain, not HTML. Keep it short. */
  text: string;
  replyTo?: string;
}

/**
 * Send one transactional email. Returns the Resend id on success, null on
 * no-op (key missing), and throws on any other error so the caller can
 * decide whether to log, retry, or swallow.
 */
export async function sendEmail(input: SendInput): Promise<string | null> {
  const client = getResend();
  if (!client) return null;
  const { data, error } = await client.emails.send({
    from: FROM_ADDRESS,
    to: input.to,
    subject: input.subject,
    text: input.text,
    replyTo: input.replyTo,
  });
  if (error) throw new Error(`[resend] ${error.name}: ${error.message}`);
  return data?.id ?? null;
}

/** Waitlist welcome. Sent fire-and-forget right after a successful signup. */
export async function sendWaitlistWelcome(email: string): Promise<void> {
  try {
    await sendEmail({
      to: email,
      subject: "You're on the list · lucid:v2",
      text: [
        "Thanks for getting on the list.",
        "",
        "We're opening access in small waves — the first hundred seats go out very soon. You'll get one more email the day yours opens. No drip, no newsletter, nothing in between.",
        "",
        "If you want a feel for what you're signing up for, the receipts are at https://lucid-early.vercel.app/proof — real brain activation renders from the engine.",
        "",
        "Questions, feedback, reel emergencies: reply to this email. A human reads them.",
        "",
        "— Manav",
        "   founder, lucid:v2",
      ].join("\n"),
      replyTo: "hello@lucid.ai",
    });
  } catch (err) {
    console.error("[email/waitlist-welcome] failed:", err);
  }
}

export function hasResend(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}
