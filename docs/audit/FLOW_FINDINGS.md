# Flow audit — lucid:v2 · 2026-04-22

Live: https://lucid-v2.vercel.app · 9 screenshots captured in `./screenshots/`.

## Surface-by-surface

### / (home) — 1440 + 375
- Hero: "Going viral is a skill, not luck" — strong editorial opener, orange `viral` chip, strikethrough `luck`.
- 7.8 brain-score widget top right (desktop only visibility check needed).
- Orange ticker marquee below nav (~4 items).
- `Test. Research. Rewrite.` three-card system (mirror / inspiration / execution).
- Dark pullquote: "Brains follow patterns. Most creators ship content blind."
- Four-networks explainer with weighted %.
- "Ship the reel. Then ship a better one." dual-CTA.
- "$29 a month. One hit pays for a decade." 4-stat pricing.
- **Mobile**: stacks cleanly; text feels dense, could use more breathing between sections.

### /waitlist — 1440 + 375
- Hero: `Get first access to the scoring engine.`
- Email input + `Get on the list` button + caption.
- Dark footer band: `The first tool that grades a reel against the brain.` + 3-point Score/Research/Rewrite list.
- **Issue**: desktop has large empty right column — opportunity for a live engine visual (rotating brain, ticker of recent scores, etc.).
- **Mobile**: full-width disabled button is clean; button stays gray until valid email (good).

### /score — 1440
- Hero: `Hold a mirror to your reel.`
- 3 instant-demo pills with pre-scored labels (CREATOR REEL · 7.8, TALKING HEAD · 6.2, MONTAGE POV · 8.7).
- URL input + `Score it` button.
- **Issue**: zero preview of what "scoring" output looks like above fold. User clicks blind.

### /research — 1440
- Hero: `Reverse-engineer virality straight from a creator.`
- Handle input + 4 creator demo pills (mrbeast, zachking, brittany.broski, tensorboy).
- **Issue**: same above-fold emptiness — no preview of the pattern-extraction output.

### /rewrite — 1440
- Hero: `Rewrite it like a brain wants to watch it.`
- Two-column: draft textarea (pre-filled sample) + reference reel input + `Generate the shot plan` CTA.
- Best-structured input surface — shows actual product state.

### /proof — 1440
- Hero: `A paper came out. So I built it.`
- Black section: 2 real scores (4.6, 5.5) + brain activation renders.
- `Every second, a new cortex.` 2 large brain stills side-by-side.
- Three-systems explainer (Alpha / Beta / Gamma).
- ASCII brain at bottom — distinctive, on-brand.
- **This is the differentiating page** — it is the proof that lucid isn't vibes.

### /business — 1440
- Hero: `The first neuro tool creators actually pay for.`
- Market numbers ($94B, 50M, 2.4M, $180B).
- Pricing tiers (4 cards).
- `One hit pays for ten years of the tool.` ROI table.
- Open-weights moat (4 reasons).
- Creator-to-creator GTM.
- Pullquote + closing.
- Only page with a distinct `<title>` ("lucid · business").

## Cross-cutting findings

1. **Metadata**: every non-business route shares the same `<title>` ("lucid:v2 · Going viral is a skill, not luck"). Waitlist, score, research, rewrite, proof all need bespoke titles + descriptions.
2. **No OG image**: shared waitlist link on Twitter/WhatsApp will preview blank. Need static OG PNG at `public/og.png` and `public/og-waitlist.png`, wired via `metadata.openGraph` in each `page.tsx`.
3. **Twitter card = "summary"** not `summary_large_image`. Wrong card format for a visual-first product.
4. **Above-the-fold emptiness** on /score, /research, /waitlist. A right-column visual (brain activation loop, score ticker, recent signup count) would turn each into a richer brochure.
5. **Form confirmation flow**: /waitlist success state is solid ("You're in." + CTAs), but there is no email confirmation send and no Slack/Discord/webhook fan-out for Manav to see signups in real time.
6. **No analytics**: no PostHog / Plausible / Vercel Web Analytics wired. You're flying blind on visitor → signup conversion.
