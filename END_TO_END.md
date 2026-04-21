# lucid:v2 → end-to-end product thesis
**Date:** 2026-04-22 · **Live:** https://lucid-v2.vercel.app · **Repo:** https://github.com/Tensorboyalive/lucid

> This document is the holy grail for converting the lucid hackathon demo into a shippable product. It is written to be read top-to-bottom once, then used as a task board. Every item is specific enough to act on today.

---

## 0. Positioning

**One-line:** lucid is the first neuro-scoring tool for short-form video — an fMRI-trained foundation model that grades any reel against the four brain networks that decide what gets shared (reward, emotion, attention, memory) and tells creators which second killed it.

**Target user (confirmed):** serious weekly reel creators with 10K–500K followers and small agencies managing a roster. The editorial voice, the $29 pricing, and the @tensorboy reference-self all point here.

**Why now:** open-weights foundation models made frame-level inference feasible on consumer GPUs. The TRIBE v2 fMRI model was released 6 months ago and nobody has wrapped it as a creator tool yet. This is a measurable edge that evaporates in ~12 months once OpenAI/Google ship a GPT‑4V that does scene-level prediction natively.

**Why it wins:** three moats, in order of durability
1. **Trust through proof.** The /proof page with real brain renders and open-weight citations is a moat competitors can't fake without the infra.
2. **Editorial distinctiveness.** The Instrument Serif + orange `viral` chip visual language is 2–3 years ahead of what every AI-wrapper SaaS will look like. A 2-second glance tells a creator this isn't a ChatGPT wrapper.
3. **Creator-to-creator GTM.** Manav is the first customer; every rewritten reel doubles as a case study. No other neuro-tool has a creator at the top of the funnel.

**Why it breaks (honestly):** the tech is real but the current site is a demo pretending to be a product. Everything below is the honest list of what blocks that conversion.

---

## 1. Current state snapshot · 2026-04-22

### What is shipped
- Seven routes live: `/`, `/score`, `/research`, `/rewrite`, `/proof`, `/business`, `/waitlist`
- Supabase schema with RLS (anon-insert-only) for waitlist, creators, scores, rewrites, rewrite_turns
- Anthropic (Gamma), Gemini (Beta), Apify, yt-dlp integrated with authored fallbacks
- Zod validation on every API route; in-memory rate limiter on `/middleware.ts`
- Per-IP daily-salt hashing on waitlist signups (opaque to us)
- Vercel deploy pipeline (just restored — four failed deploys in the interim were purged)
- Editorial design system documented in `/design.md` (1553 lines, ready to port)

### What works well today
- `/proof` is the single strongest conversion asset — it is the product's defensibility, rendered visually
- `/rewrite` is the best-structured input surface — draft + reference + shot-plan output
- Waitlist form end-to-end: input → API → Supabase → success state. Tested live, HTTP 200.
- Mobile navigation collapse is clean; hamburger + disabled-button states are honest

### What is a lie the site is telling
- Every non-business route shares the same `<title>`. When someone shares `/waitlist` on Twitter it reads "Going viral is a skill, not luck" — wrong context for the link.
- No OG image exists at all. Sharing *any* URL renders a blank Twitter/WhatsApp/Discord preview.
- The homepage 7.8 brain-score widget is static. It claims "live neuro score"; it is a frozen hero prop.
- The `/score` demo path returns authored mock data on any failure without telling the user. A creator thinks they got a real score, they didn't.
- The in-memory rate limiter on `middleware.ts` is a no-op under Vercel's multi-instance model (each cold start gets a fresh Map).
- The waitlist API has a literal `TODO (Manav)` at `app/api/waitlist/route.ts:59` for duplicate-email handling. Defaulted to silent-success, fine for now, but the function stub is dead code.

---

## 2. Findings synthesis

Three reviewers ran in parallel: a TypeScript/backend code review, a security audit, and a combined design + product + SEO + hardening critique. The flow audit of all 9 screenshots is in `docs/audit/FLOW_FINDINGS.md`. The consolidated findings, deduped and ranked:

### 2.1 Blockers (ship this week, or don't share the URL)

| # | Area | Finding | File / evidence |
|---|------|---------|-----------------|
| B1 | Share-readiness | No OG image, no per-route `<title>` / description. Waitlist link previews blank. | `app/layout.tsx:5`, no `public/og*.png` |
| B2 | Security | `X-Forwarded-For` is spoofable — breaks both the rate limit and the waitlist IP hash. | `middleware.ts:37`, `app/api/waitlist/route.ts:22` |
| B3 | Security | In-memory rate limiter does not share state across serverless instances. Quotas are unprotected. | `middleware.ts:15` |
| B4 | Security | Prompt injection via Instagram caption → `researchContext` → Claude system prompt on `/api/rewrite`. `formatResearchContext` does not call `sanitizeForPrompt`. | `app/api/rewrite/route.ts:36,44` |
| B5 | Correctness | No timeout on any external fetch (Apify, Gemini upload, video download). 300s maxDuration drains per request. | `app/api/score-live/route.ts:240,271`; `app/api/scrape-creator/route.ts:106` |
| B6 | Observability | Zero analytics wired. No PostHog, no Plausible, no `@vercel/analytics`. Flying blind on conversion. | grep confirms absence |
| B7 | Legal | No `/privacy`, `/terms`, `/contact`, no cookie notice. Not safe to share publicly in the EU. | absent |
| B8 | Incident posture | Leaked `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `APIFY_TOKEN` from the Replit era not yet rotated. Vercel + GitHub tokens leaked into this session's chat transcript — also rotate. | memory `security_leaked_keys.md` |

### 2.2 High-priority (ship in sprint 1)

| # | Area | Finding | File / evidence |
|---|------|---------|-----------------|
| H1 | Security | Missing `Content-Security-Policy` header. Nonce-based CSP required per your own web-security rules. | `next.config.ts:3-9` |
| H2 | Security | `SUPABASE_SERVICE_ROLE_KEY` declared in env example but never used — latent footgun. Annotate + audit Vercel env vars to confirm it is not in a `NEXT_PUBLIC_` slot. | `.env.example:16`, `lib/supabase/client.ts` |
| H3 | Correctness | `scoreSynthBodySchema` uses `.passthrough()` on scenes; extra fields travel straight into the Claude prompt as JSON. Prompt-injection vector. | `lib/validation.ts:114` |
| H4 | Correctness | `JSON.parse` on Claude responses without try/catch in two production paths — silent mock fallback, no signal to caller that data is authored. | `app/api/score-synth/route.ts:59`, `app/api/rewrite/route.ts:152` |
| H5 | Correctness | Supabase repository swallows errors — `upsertCreator`, `logScore`, `logRewrite` silently return null on failure. Writes break invisibly in prod. | `lib/supabase/repository.ts:79,116,148` |
| H6 | Product funnel | Home → waitlist has no direct CTA. Hero pushes `/score` (demo), not the list. A visitor who bounces leaves no email. | `components/editorial/Hero.tsx:50-68` |
| H7 | Product funnel | Score/research done-states do not end with a "want this on your real reels? → waitlist" CTA. Demo completion is dead-end. | `app/score/page.tsx:392-400` |
| H8 | Design | Above-the-fold emptiness on `/score`, `/research`, `/waitlist` — giant blank right column. The promise is "see your brain on a reel"; the hero shows no brain. | screenshots 02/03/04 |
| H9 | Design | Mobile section padding is desktop-sized (`py-24 md:py-36`). On a 375px viewport every section is 11 scrolls of sameness. | `app/page.tsx` sections, `screenshots/08-home-375.png` |
| H10 | SEO | No sitemap, no robots, no `metadataBase`, no structured data. | `app/` missing `sitemap.ts`, `robots.ts` |
| H11 | Product | No FAQ, no social proof, no pricing above the fold, no testimonial beyond founder self-quote. Conversion blockers. | homepage section order |

### 2.3 Medium / polish (sprint 2–3)

- `next.config.ts:13` — `bodySizeLimit: "50mb"` on Server Actions is cargo-culted; reduce to `1mb`.
- `supabase/migrations/20260419_waitlist.sql:44` — add DB-level `CHECK (length(source) <= 60)` defense-in-depth against API bypass.
- `app/api/waitlist/route.ts:26` — daily-salt IP hash has no secret pepper; enumerable. Add `WAITLIST_HASH_PEPPER` env var.
- `lib/validation.ts:86` — `previousPlan: z.unknown()` then `JSON.stringify` into prompt. Apply shallow schema.
- `lib/providers/anthropic.ts:6-13` — singleton caches first null result if env set later. Edge-case only.
- `app/page.tsx:73-92` — three "mirror / inspiration / execution" cards are visually identical; vary treatment for editorial rhythm.
- `components/editorial/Hero.tsx:71-119` — static 7.8 score widget should pulse on one bar to sell "live neuro score."
- Brain-red / amber / cyan / violet network colors appear on `/score` but nowhere else — either commit to them on marquee + bullets or retire.
- `/research` and `/rewrite` empty states are prefilled with sample data; add a `DEMO` badge so first-time users can tell real from preset.
- Replace scattered `console.error` / `console.warn` with a structured logger so Vercel log search actually filters by route.
- `/api/score-live` duplicates URL validation (Zod `.url()` then `isInstagramUrl`). Consolidate via `.refine(isInstagramUrl)`.

### 2.4 Low / notes
- `HSTS` header missing `preload`.
- `UploadSurface.tsx` has a dead `file?: File` prop; no file upload actually exists. Remove or wire.
- Anthropic / Gemini SDKs — migrate `deleteUploadedFile` to SDK method (`/app/api/score-live/route.ts:330`).
- `rewrite/route.ts:135,152` — inner `const raw`/`parsed` shadow outer names; readability trap.

---

## 3. What a real product needs that this doesn't have yet

Below the line of technical fixes there is a product layer the demo never needed. Honest list:

1. **Authentication.** Currently anyone with the URL hits the API. Fine for a waitlist; broken for a paid product. Supabase Auth (magic link) is the cheapest lift; Clerk if you want organization support day-one.
2. **Payments.** No Stripe wiring. `/business` has four pricing tiers as visual copy only. Add Stripe Checkout for the $29 tier, Stripe-hosted customer portal, webhook → `subscriptions` table.
3. **Quota enforcement.** Once authed, each tier needs a scoring-credits ledger. Free = 3 scores, $29 = unlimited-with-fair-use, Pro = team seats.
4. **Real-time score persistence.** Right now scores are ephemeral. A creator wants to go back to a reel they scored last Tuesday. Persist to `scores` table keyed by `user_id`, show a /dashboard listing.
5. **Dashboard.** `/app` or `/dashboard` — list of scored reels, average score trendline, "fire this week" best hook, rewriter history. This is the retention surface.
6. **Email.** No transactional email set up. Waitlist signup should email "you're in, here's what's next." Resend or Loops.so, 10 minutes of wiring.
7. **Webhooks out.** Slack/Discord webhook on every waitlist signup so Manav sees the name pop in a channel in real time. This is how you sell the list is growing — to yourself and to investors.
8. **Referral.** One-line addition to the waitlist flow: "share to jump the queue" with a unique code. This is 2x the growth per dollar of any paid channel at this stage.
9. **API timeouts + retries.** See B5 above.
10. **Observability.** PostHog for product analytics, Sentry for errors, Vercel Web Analytics for performance. All free-tier.
11. **Legal.** `/privacy`, `/terms`, `/contact`. Cookie-consent notice scoped to EU IPs. Data-deletion endpoint for GDPR compliance (`DELETE /api/account` that wipes the user's scores/rewrites/signup).
12. **Support.** `hello@lucid.ai` mailto in footer, or a Tally form. When someone wants to pay, they need to be able to ask a question.
13. **Error boundaries.** A crash in `AsciiBrain` or `ScoreCard` currently whites the whole route. Add a React error boundary per top-level route.
14. **Demo mode honesty.** Every route that can fall back to mock data should render a `DEMO` badge when it does. Currently a user can't tell.

---

## 4. Sprint plan — hackathon → shippable product

The work below is sequenced by what unblocks the next thing. Each sprint ends with a publicly shareable state. Estimated effort assumes one focused engineer (Manav) at ~6 hours/day.

### Sprint 0 — Share-ready (24–36 hours)
**Goal:** `lucid-v2.vercel.app/waitlist` is safe to post on Twitter and converts.

- **B1a** Write 7 per-route `metadata` exports (title, description, OG). Split client components that currently block metadata export into `page.tsx` (server) + `PageClient.tsx` (client).
- **B1b** Generate `public/og-default.png`, `public/og-waitlist.png`, `public/og-proof.png` at 1200×630. Cream background, orange chip, H1 text. Can hand-build in Figma or render via `@vercel/og`.
- **B1c** Set `twitter.card = "summary_large_image"` and `metadataBase` in `app/layout.tsx`.
- **B6** Install `@vercel/analytics` and `posthog-js`. Wire PostHog to capture `waitlist_signup`, `score_started`, `score_completed`, `rewrite_started`. 20-minute job, outsized ROI.
- **B8** Rotate `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `APIFY_TOKEN`, the Vercel provisioning token, and the GitHub PAT that were exposed this session. Update Vercel env vars. Leave the Supabase publishable key as-is (public by design).
- **H6** Replace the home hero secondary CTA ("research a creator") with a primary → `/waitlist` CTA. Keep "score a reel" as the exploratory path.
- **H7** Append a "→ waitlist" CTA to every demo done-state (`/score`, `/research`, `/rewrite`).
- **H11a** Add a minimal FAQ section on `/waitlist` answering: (1) what data do you store? (2) is my reel private? (3) when does the engine open? (4) how much? (5) do you sell my email?
- Add `/api/waitlist` Slack webhook side-effect so Manav sees signups in #lucid-signups in real time. Environment variable `SLACK_WAITLIST_WEBHOOK`.

**Exit criteria:** post `lucid-v2.vercel.app/waitlist` in a group chat; rich preview renders with og-waitlist.png and specific title; first signup lands in Slack; PostHog shows the event.

### Sprint 1 — Launch-ready (4–6 days)
**Goal:** withstand 100 concurrent users without burning Anthropic/Gemini quotas or leaking.

- **B2** Use `x-vercel-forwarded-for` (or last-hop of XFF) everywhere IP is trusted. One-line fix per call site.
- **B3** Replace in-memory rate limiter with Upstash Redis (free tier) using `@upstash/ratelimit`. Keep the same per-route limits.
- **B4** Sanitize every caller-influenced string in `formatResearchContext` via `sanitizeForPrompt`.
- **B5** Add `AbortSignal.timeout(30_000)` to every Apify fetch, `90_000` to video downloads, `45_000` to Gemini uploads.
- **B7** Write `/privacy`, `/terms`, `/contact`. Three pages of editorial copy matching the site voice. `/contact` is a Tally form.
- **B7b** Scope a cookie-consent banner by IP geolocation → EU only (Vercel's `request.geo.country`). Use `@opencookie/banner` or hand-roll.
- **H1** Configure nonce-based CSP in `next.config.ts`. Script-src self + nonce, connect-src self + Supabase + Anthropic + Gemini.
- **H2** Audit Vercel env vars for any `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` or similar footgun.
- **H3** Remove `.passthrough()` from scene schema; enumerate every field.
- **H4** Wrap `JSON.parse` calls in try/catch, surface `fallback: true` in the response so the UI can render a `DEMO` badge.
- **H5** Log Supabase errors before returning null. One-liner per method.
- **H8** Add a rotating live-ticker aside to `/waitlist` desktop — "last signup · 4 min ago · @handle." Pulls from Supabase service-role read; caps to last 20.
- **H9** Cut mobile section padding to `py-14` (from `py-24`) across `app/page.tsx`.
- **H10** Add `app/sitemap.ts`, `app/robots.ts`, `metadataBase`. Publish structured data for `SoftwareApplication` on home and `Article` on /proof.
- Install Sentry for error tracking. Free tier handles this volume.

**Exit criteria:** run a synthetic load test of 100 concurrent `/api/score-live` requests from a single IP; only 3 should succeed in a minute (Upstash holds the line). CSP reports clean in Chrome devtools. `/privacy` and `/terms` link from every page footer.

### Sprint 2 — Revenue-ready (7–10 days)
**Goal:** someone can pay $29 and get value.

- Supabase Auth (magic-link only — lowest friction for creators). Store `profiles` keyed by `auth.uid`.
- Migrate `scores`, `rewrites`, `rewrite_turns` to include `user_id` foreign key; add RLS `user_id = auth.uid()`.
- Stripe: one product, three prices (monthly $29, annual $290, lifetime $499 launch pricing). Stripe-hosted checkout + customer portal. Webhook → `subscriptions` table.
- Quota ledger: `credits` table with a daily reset for free tier (3 scores), unlimited on paid.
- `/dashboard` page — table of user's past scores, rewrites, research sessions. Simple chronological list with score badges.
- Email pipeline: Resend + React Email. Transactional templates for (1) waitlist welcome, (2) early-access invite, (3) first-score recap, (4) subscription confirmation.
- Error boundaries per route.
- Demo-mode badges everywhere mock data is served.

**Exit criteria:** Manav pays himself $29 via Stripe, scores a reel, sees it in `/dashboard`, receives a confirmation email. Full loop.

### Sprint 3 — Scale-ready (10–14 days)
**Goal:** launch publicly. Ship to ProductHunt / HN / Twitter simultaneously.

- Referral codes on waitlist ("share to jump the queue") with a PostgreSQL leaderboard.
- Team seats for agencies — Supabase `organizations` + `memberships` tables, Stripe per-seat pricing.
- `/api` docs page — if anyone asks for programmatic access, point them here.
- Incident page at `status.lucid.ai` (Instatus or hand-rolled static).
- Background job queue for long-running scores (Inngest or Vercel Queues) so `/api/score-live` can return a job id and the UI polls.
- GPU engine handoff: document how to spin up the Alpha engine on Runpod/Modal; wire a `NEURO_ENGINE_PATH` env var to route real inference requests to the GPU box when available.
- Launch post: "I built the first fMRI-trained reel scorer. Here's what I learned from 2,000 reels." Cross-post to HN, Twitter, Reddit /r/NeuroMarketing.

**Exit criteria:** public launch day traffic (10K pageviews, 500 signups) survives without any code push.

---

## 5. Concrete first-24-hour task list

These are Sprint-0 tasks ordered for execution. Copy-paste into a linear issue or paste into a next session as "let's do Sprint 0."

1. Rotate leaked keys (Anthropic, Gemini, Apify, Vercel, GitHub). Update Vercel env vars.
2. Write per-route metadata exports. Split client pages with `Client.tsx` pattern where needed.
3. Generate 3 OG images via `@vercel/og` or hand-draw in Figma.
4. Install `@vercel/analytics` + `posthog-js`. Wire 4 events.
5. Add Slack webhook side-effect to `/api/waitlist`. `SLACK_WAITLIST_WEBHOOK` env var.
6. Swap home hero secondary CTA to `/waitlist`.
7. Append "→ waitlist" CTA to 3 demo done-states.
8. Write 5-question FAQ section on `/waitlist`.
9. Deploy. Test waitlist end-to-end. Post to Twitter with screenshot of rich preview.

**Stop criterion for Sprint 0:** first real email in Supabase `waitlist_signups` from someone who is not Manav.

---

## 6. Open decisions for Manav

These are product calls no reviewer can make. Resolve before Sprint 1 begins.

1. **Duplicate-email strategy** (`app/api/waitlist/route.ts:56-74`) — silent-success (A), friendly-ack (B), or treat-as-fresh-interest (C)? Default to A; can revisit once the list is >500.
2. **Waitlist target size before opening access** — 500, 2000, or 10000? Drives the urgency copy on the hero.
3. **Pricing commitment** — is $29/month the real price or a launch anchor? Lifetime $499 as an option?
4. **Engine deployment** — stay on cached-inference-only for the web product (today's state) or commit to a GPU box (Modal / Runpod) that runs Alpha live? The latter is ~$400/month but is the biggest defensibility signal to investors.
5. **Auth provider** — Supabase Auth (lowest lift, matches existing stack), Clerk (best DX, $25/mo after free tier), or defer until Sprint 2?
6. **Legal jurisdiction** — where is the company incorporated? Drives Terms of Service boilerplate and whether you need a DPA.
7. **Brand direction on `/` hero copy** — current copy reads investor-pitch ("trained on 1,000+ hours of fMRI"). Move to creator-outcome ("know which second killed your reel") or keep?

---

## 7. What the reviewers said in one sentence each

- **Backend (typescript-reviewer):** "No timeouts anywhere, rate limiter is a no-op, and silent Supabase error swallows mean writes fail invisibly."
- **Security (security-reviewer):** "Fix XFF spoofing and Upstash the rate limiter before any public demo; prompt-injection via Instagram captions is live today on `/api/rewrite`."
- **Design + Product + SEO (general-purpose running critique + product-lens + seo + harden):** "The editorial voice is the moat; everything above the fold needs a visual payoff; sharing the URL today without OG images is a waste of the one shot to go viral."

---

## 8. Appendix · file index

- `/docs/audit/FLOW_FINDINGS.md` — surface-by-surface audit with screenshots
- `/docs/audit/screenshots/` — 9 full-page screenshots (home, waitlist, score, research, rewrite, proof, business @1440; home, waitlist @375)
- `/design.md` — 1553-line design system reference (voice, type, spacing, components)
- `/docs/ARCHITECTURE.md`, `/docs/DATABASE.md` — existing architecture docs
- `/supabase/migrations/20260419_waitlist.sql` — waitlist schema + RLS
- `/README.md` — repo orientation

This document is the ground truth for converting the demo into a product. When a reviewer asks "what's the plan for X?" point here. When a future Claude session asks "what's the current state?" read this doc and `docs/audit/FLOW_FINDINGS.md` first.
