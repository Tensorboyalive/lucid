# Lucid Design System · Holy Grail

A self-contained reference for the **editorial magazine** aesthetic you're looking
at on `lucid-v2.vercel.app`. Read this end-to-end once, then cherry-pick whatever
sections you need when porting the look to a new project.

Everything in here is opinionated. That is the point. Safe-average UI is usually
worse than a strong, coherent aesthetic with a few bold choices, and this
document documents the bold choices so they survive being copied.

---

## Table of Contents

1. [Philosophy — the mental model](#1-philosophy--the-mental-model)
2. [Tech baseline — what's under the system](#2-tech-baseline)
3. [Design tokens — the three-layer architecture](#3-design-tokens)
4. [Typography — three families, one voice](#4-typography)
5. [Spacing, grid, and rhythm](#5-spacing-grid-and-rhythm)
6. [Color — when to use which token](#6-color)
7. [Components — each with anatomy, props, and state tables](#7-components)
8. [Motion and interaction rules](#8-motion-and-interaction-rules)
9. [Content voice — the copy is part of the design](#9-content-voice)
10. [Accessibility — contrast, focus, motion, labels](#10-accessibility)
11. [Performance rules](#11-performance-rules)
12. [Security and backend conventions](#12-security-and-backend-conventions)
13. [File and folder organization](#13-file-and-folder-organization)
14. [Anti-patterns — what not to do](#14-anti-patterns)
15. [Portability recipe — cloning this design onto a new project](#15-portability-recipe)

---

## 1. Philosophy — the mental model

### One sentence

> **Magazine pages that happen to be a product.**

Pick "editorial" as the direction and commit to it everywhere. Typography carries
the design. Color is disciplined. Motion is sparse. Empty space is load-bearing.

### Seven principles (non-negotiable)

1. **Restraint over decoration.** If a visual flourish appears on every surface,
   it is no longer a flourish. Reserve the rotated chip, the pullquote, the
   dark-section thesis moment for one moment per page.
2. **Typography is the interface.** The hierarchy comes from scale contrast
   (display serif vs mono label), not from borders, shadows, or boxes.
3. **Single point of emphasis per page.** Every page has exactly one thing a
   reader will remember. Design the page around that one thing.
4. **Editorial wayfinding.** Each primary page has a mono eyebrow ("01 · Score",
   "Proof · the receipts"). That's the magazine-issue pattern and it's what
   makes multi-page sites feel like chapters.
5. **Asymmetry on purpose.** 9/3, 7/5, 4/8 column splits beat 6/6 whenever the
   content has a primary and a secondary. Center alignment is reserved for
   pullquotes.
6. **Copy is design.** Declarative sentences. No em-dashes. Lowercase microcopy.
   "Break it down" beats "Research creator" (see [Section 9](#9-content-voice)).
7. **Accessibility is part of the aesthetic, not a retrofit.** WCAG AA contrast
   and keyboard focus states were designed into the tokens, not bolted on later.

### The four visual moves that define the look

| Move | Example on site | Purpose |
|---|---|---|
| **Orange HighlightChip** | "Going *viral* is a skill" | Single saturated accent against an otherwise muted field. |
| **Editorial eyebrow** | "01 · Score", "Proof · the receipts" | Mono label above every page's H1; magazine-issue feel. |
| **Dark thesis section** | "Brains follow patterns. Most creators ship content *blind*." | One black section per page with grain overlay; the "this is the argument" moment. |
| **Underline form inputs** | `/score` URL field, `/waitlist` email | No input boxes. Just a thin 1px bottom rule that animates to orange on focus. |

---

## 2. Tech baseline

This design system was built on:

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** App Router | Server Components + `next/font` are load-bearing. |
| Runtime | **React 19** | `useActionState`, server actions work natively. |
| CSS | **Tailwind 4** via `@tailwindcss/postcss` | `@theme inline` lets us declare design tokens as CSS variables AND expose them as Tailwind utilities in one block. |
| TypeScript | **5.7+, `strict: true`** | Zero `any`, zero `@ts-ignore` in this codebase. |
| Fonts | **`next/font/google`** | Self-hosted, subset, `display: swap`, zero layout shift. |
| Class composition | **`clsx`** (via `lib/cn.ts`) | Minimal; swap for `tailwind-merge` later if conflict-resolution matters. |
| Icons | **inline SVG** | No icon library dependency. Only a handful of icons used. |
| Animation | **CSS keyframes + `framer-motion` sparingly** | CSS is the default. `framer-motion` is reserved for parallax and `AnimatePresence`. |

### What's intentionally missing

- **No UI kit** (no shadcn/ui, no Radix, no MUI). Components are hand-rolled.
  Adopting a UI kit here would fight the editorial aesthetic.
- **No CSS-in-JS.** `styled-components`, `emotion`, etc. are not used.
- **No icon library.** Lucide/Heroicons not installed.
- **No design-tokens JSON pipeline.** Tokens live directly in `globals.css` —
  simpler to copy between projects than a JSON + build step.

---

## 3. Design tokens

### Three-layer architecture (from [`app/globals.css`](#))

```
┌─────────────────────┐
│  Primitive (raw)    │  --cream: #F3EEE2
├─────────────────────┤
│  Semantic (purpose) │  --color-cream: var(--cream)  (via @theme inline)
├─────────────────────┤
│  Component (Tailwind utility)  │  class="bg-cream"
└─────────────────────┘
```

### Primitive tokens — the raw palette

```css
/* app/globals.css */
:root {
  /* surfaces */
  --cream:       #F3EEE2;   /* default body background */
  --paper:       #FAF7F0;   /* cards, form sections, lighter than cream */
  --ink:         #0A0A0A;   /* body text, dark sections */
  --ink-soft:    #1E1E1E;   /* rare — used for subtly-less-dark text */
  --text-muted:  #6B6660;   /* eyebrows, captions, de-emphasized body */
  --rule:        rgba(10, 10, 10, 0.14);  /* hairlines */

  /* accent */
  --viral-orange:      #E85D1C;  /* THE accent. Used everywhere emphasis lands. */
  --viral-orange-soft: #F4B183;  /* optional tinted variant (rare) */

  /* data-visualization only */
  --brain-red:     #C53030;  /* reward network */
  --brain-amber:   #D97706;  /* emotion network */
  --brain-cyan:    #0E7C86;  /* attention network */
  --brain-violet:  #6D28D9;  /* memory network */
}
```

**Rules of thumb:**
- Cream + Paper + Ink + Muted cover 95% of the surface area.
- Orange is the only saturated color — use it exactly when emphasis is the
  intent. Never as a "decorative" fill.
- The `brain-*` colors are **data-only**. They never appear as UI chrome. If a
  chart/render surface isn't present, those tokens aren't used.

### Semantic tokens — Tailwind-exposed aliases

The Tailwind 4 `@theme inline` block re-exports primitives so `bg-cream`,
`text-viral`, `border-ink`, etc. all work as class names:

```css
@theme inline {
  --color-cream:        var(--cream);
  --color-paper:        var(--paper);
  --color-ink:          var(--ink);
  --color-ink-soft:     var(--ink-soft);
  --color-muted:        var(--text-muted);
  --color-rule:         var(--rule);
  --color-viral:        var(--viral-orange);
  --color-viral-soft:   var(--viral-orange-soft);
  --color-brain-red:    var(--brain-red);
  --color-brain-amber:  var(--brain-amber);
  --color-brain-cyan:   var(--brain-cyan);
  --color-brain-violet: var(--brain-violet);

  --font-serif: var(--font-instrument-serif);
  --font-sans:  var(--font-inter);
  --font-mono:  var(--font-jetbrains-mono);

  --text-display: clamp(3.5rem, 1rem + 8vw, 9rem);   /* landing H1 */
  --text-hero:    clamp(2.5rem, 1rem + 5vw, 5rem);   /* section H2 */
  --text-lede:    clamp(1.125rem, 0.95rem + 0.5vw, 1.375rem);
}
```

### Why no OKLCH?

This codebase uses plain hex for primitives. OKLCH is the right long-term move
for perceptual uniformity, but hex was chosen for **copy-paste portability** —
you can drop the primitive block into any project without tooling. If you want
perceptual-space tokens later, do a one-time find-and-replace to OKLCH.

---

## 4. Typography

### The three families

| Family | Role | Weight | Where |
|---|---|---|---|
| **Instrument Serif** | Display + italic accents | 400 | H1, H2, pullquotes, HighlightChip body, italicized phrases. |
| **Inter** | Body text | regular + medium via variable | Paragraphs, longer prose, form labels where sans fits better than mono. |
| **JetBrains Mono** | Micro-labels + metadata | regular | Eyebrows, captions, data rows, nav links, button labels, timestamps, stream status. |

Setup in [`app/fonts.ts`](#):

```ts
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"], weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const inter         = Inter({         subsets: ["latin"], variable: "--font-inter",           display: "swap" });
export const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });
```

Then in `app/layout.tsx`:

```tsx
<html
  lang="en"
  className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}
>
  <body className="min-h-screen bg-cream text-ink grain">{children}</body>
</html>
```

### Utility classes for family switching

```css
.serif        { font-family: var(--font-serif); letter-spacing: -0.015em; }
.serif-italic { font-family: var(--font-serif); font-style: italic; letter-spacing: -0.02em; }
.mono         { font-family: var(--font-mono); letter-spacing: -0.01em; }
```

Apply with `className="serif"`, `className="serif-italic"`, `className="mono"`.
Body defaults to Inter via the `html` style; no class is needed for sans.

### Type scale — what goes where

| Token / Class | Purpose | Font | Example |
|---|---|---|---|
| `--text-display` | Landing-page H1 only | `.serif` | "Going viral is a skill, not luck." |
| `--text-hero` | Section H2 throughout site | `.serif` | "Four networks. One number." |
| `clamp(3rem, calc(1rem+4vw), 5.3rem)` | Sub-page H1 | `.serif` | "Hold a mirror to your reel." |
| `clamp(2rem, calc(1rem+2.5vw), 3.6rem)` | Dark-section H3 / success heading | `.serif`/`.serif-italic` | "Hold tight. We'll reach out…" |
| `clamp(1.5rem, calc(1rem+1.5vw), 2.3rem)` | Inline subheading | `.serif-italic` | "The first tool that grades a reel…" |
| `clamp(1.05rem, calc(0.95rem+0.4vw), 1.28rem)` | Lede paragraph (under H1) | Inter | First paragraph of every page. |
| `text-[1.05rem] leading-[1.55]` | Body paragraph | Inter | All prose. |
| `text-[0.98rem] leading-[1.55]` | Card / list body | Inter | Card bodies, list item text. |
| `text-[0.82rem] uppercase tracking-[0.22em]` | Primary button label | `.mono` | "SCORE IT →" |
| `text-[0.78rem] uppercase tracking-[0.24em]` | Secondary button label | `.mono` | "BREAK IT DOWN →" |
| `text-[0.72rem] uppercase tracking-[0.28em]` | Page eyebrow | `.mono` | "01 · SCORE", "EARLY ACCESS · LUCID:V2" |
| `text-[0.68rem] uppercase tracking-[0.26em]` | Section eyebrow (smaller) | `.mono` | "TRY INSTANTLY", "OR PASTE A LIVE REEL" |
| `text-[0.62rem] uppercase tracking-[0.22em]` | Meta line | `.mono` | Tier tags, timestamps, fine-print. |

### Pairing rules

1. **Serif + Mono is the only pairing allowed.** Inter is body filler; if you
   notice Inter, it's because serif and mono weren't appropriate.
2. **Italics are a feature, not an accident.** `.serif-italic` is used as an
   emphasis mechanism (reserved phrases: "skill", "wins", "blind"). Don't italicize
   randomly; the italic phrase is usually the page's one memorable line.
3. **Never use default sans-serif for a heading.** Every H1/H2/H3 on this site
   is `.serif`. That rule is what makes it read as editorial, not SaaS.
4. **Tracking is tight on display, loose on mono.** `.serif` has
   `letter-spacing: -0.015em` (tight, as display serifs want). Mono has
   `tracking-[0.22em]` to `tracking-[0.28em]` on labels — wide enough that
   spaces feel structural, not accidental.

---

## 5. Spacing, grid, and rhythm

### Outer container

Every `<Section>` wraps content in:

```tsx
<div className="mx-auto w-full max-w-[1400px] px-6 md:px-10 lg:px-14">
  {children}
</div>
```

- Max content width: **1400px** (comfortably readable on 27" displays, not
  stretched on 32" ultra-wides).
- Responsive gutters: **24px → 40px → 56px** (mobile / tablet / desktop).

### Grid

- **12 columns** via Tailwind's `grid-cols-12` on layout rows.
- **Gap 24px → 40px** (`gap-6 md:gap-10`).
- Common splits:
  - **9/3** — Hero headline + aside stat card (`/`)
  - **7/5** — Research page header + sparse right column (`/research`)
  - **4/8** — Section heading + list content (`/`, "Four networks")
  - **6/6** — Two equal cards (sparingly; reserved for testimonial + quote pairings)

### Vertical rhythm

Sections use **two cadence tempos**, deliberately mixed to avoid metronome:

| Tempo | Values | When |
|---|---|---|
| **Airy** | `py-24 md:py-36` | Default marketing sections. |
| **Medium** | `py-16 md:py-24` | Section-inside-a-flow, between-states. |
| **Tight** | `py-10 md:py-14` | Form sections directly after a hero. |
| **Compressed** | `py-4` | Marquee / single-line bands. |

**Rule:** never use the same vertical padding on four consecutive sections. Break
the cadence at least once per page with a compressed section (marquee) or a
tighter one.

### Ruled dividers

Horizontal hairlines are **not borders on cards** — they are section-boundary
separators applied via utility classes:

```css
.rule-top    { border-top: 1px solid var(--rule); }
.rule-bottom { border-bottom: 1px solid var(--rule); }
```

Apply to a `<Section>` directly (`className="rule-top"`), not to inner content.

### The "issue number" inline rule

On every page eyebrow, there's a little `1px × 40px` bar then the mono label:

```tsx
<div className="mono flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-muted">
  <span className="inline-block h-[1px] w-10 bg-muted/60" />
  <span>01 · Score</span>
</div>
```

This is load-bearing. It's the "you are reading issue 01" signal that makes
every page feel like part of a magazine.

---

## 6. Color

### Per-surface tonality (section backgrounds)

| Section `tone` | Background | Text | When |
|---|---|---|---|
| `cream` (default) | `--cream` `#F3EEE2` | `--ink` `#0A0A0A` | Hero, primary content sections. |
| `paper` | `--paper` `#FAF7F0` | `--ink` | Form sections, slightly lifted cards. |
| `ink` | `--ink` `#0A0A0A` | `--cream` | Pullquote sections, thesis moments, editorial asides. Gets the `.grain` overlay. |

### When to use accent orange

- **HighlightChip** around 1–2 words in a heading.
- Primary button hover state (`bg-ink hover:bg-viral`).
- The marquee band (`bg-viral text-white`, used once per page max).
- Active-state indicators (pulse dot, stream-status bar).
- Selection highlight (`::selection`).

### When NOT to use orange

- **As a card border or fill.** That's decoration, not emphasis.
- **Multiple chips in the same heading.** One chip per H1 is the ceiling.
- **Two orange surfaces next to each other.** Separate them with a cream/ink section.

### Opacity tiers for muted text

```tsx
text-ink          /* full strength, primary */
text-ink/95       /* very slight mute, used for italicized phrases beside H1 */
text-ink/80       /* lede paragraph under H1 */
text-ink/75       /* body copy on cards */
text-ink/70       /* inline secondary label on forms */
text-ink/65       /* helper text under forms */
text-ink/60       /* dd labels in data lists */
text-ink/50       /* very de-emphasized microcopy ("no URL needed") */
text-ink/30       /* placeholder text */

/* Or use the semantic muted token: */
text-muted        /* -> #6B6660, the editorial warm-gray */
```

**Gotcha:** `text-ink/80` (opacity) produces muddy gray on cream. For body
paragraphs, prefer `text-muted` (the warm gray) to
avoid the desaturation-on-cream effect. Use alpha only when you need the color
to tint properly (e.g., over a dark section).

### The grain overlay

The body element has `className="grain"`. This applies a subtle SVG-noise
texture as a `::before` pseudo-element:

```css
.grain { position: relative; }
.grain::before {
  content: "";
  position: absolute; inset: 0;
  pointer-events: none;
  opacity: 0.06;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg ...turbulence filter...>");
}
```

The grain is the single most important cheat code for making a flat digital
surface feel printed. Do not skip it when porting. Do not crank the opacity
past 0.08.

Dark sections also get `.grain` applied via the `<Section>` component (see
[Section 7](#7-components)).

---

## 7. Components

Each component below has: **anatomy** (what it's made of), **props**, **state
table**, and a **copy-paste skeleton**.

### 7.1 `<Section>` — the page-row primitive

**File:** `components/editorial/Section.tsx`

**Anatomy:** full-bleed background band + centered max-1400 container + optional grain.

**Props:**
```ts
interface Props {
  children: React.ReactNode;
  tone?: "cream" | "paper" | "ink";  // default "cream"
  className?: string;                 // apply vertical padding here
  id?: string;                        // for anchor links
  container?: boolean;                // default true; set false to render full-bleed content
}
```

**Usage:**
```tsx
<Section tone="cream" className="py-24 md:py-36">
  <h2>Four networks. One number.</h2>
</Section>
```

**States:** None (purely structural).

---

### 7.2 `<Nav>` — editorial top bar

**File:** `components/editorial/Nav.tsx`

**Anatomy:**
- Left: wordmark `lucid:v2` with viral-orange colon.
- Center (desktop): mono link list.
- Right: primary CTA pill + mobile hamburger (hidden md+).
- Mobile overlay: absolute-positioned link list.

**Props:**
```ts
interface Props {
  tone?: "cream" | "ink";  // matches the first section of the page
}
```

**State table:**

| State | Treatment |
|---|---|
| Default | `text-ink` or `text-cream`, mono `0.75rem` / `tracking-0.28em` |
| Hover (link) | `hover:text-viral` |
| Focus-visible | Global orange ring (2px + 3px offset) |
| CTA default | `bg-ink text-cream` (on cream) or `bg-cream text-ink` (on ink) |
| CTA hover | `hover:bg-viral hover:text-ink` |
| Mobile menu open | Full-width overlay, `bg-cream` or `bg-ink`, border-top hairline |

**Accessibility rules baked in:**
- `aria-label="Main navigation"` on desktop `<nav>`, `"Mobile navigation"` on mobile.
- Hamburger button has `aria-expanded` that flips and `aria-controls="mobile-nav"`.
- Mobile CTA has `min-h-[44px]` (touch-target minimum).

---

### 7.3 `<Hero>` — the page-opener

**File:** `components/editorial/Hero.tsx`

**Anatomy:**
- 12-col grid inside a max-1400 container.
- Left (`col-span-9` on lg): eyebrow + H1 + lede paragraph + CTA cluster.
- Right (`col-span-3` on lg, `self-end`): optional stat-card aside with ruled-top.
- CSS-only entrance animation via `.hero-rise` class.

**Key decisions:**
- **Not a `"use client"` component.** It's a Server Component with a CSS
  `@keyframes` entrance so the landing bundle never imports `framer-motion`
  just for the hero fade.
- The H1 mixes three typography moves in one line: **plain serif** ("Going"),
  **HighlightChip with hero rotation** ("viral"), and **strike-through**
  ("luck"). This is the single best ad for the design system and is why hero
  copy is a product decision, not a copy task.

**Entrance animation:**
```css
@keyframes heroRise {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-rise       { animation: heroRise 900ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.hero-rise-delay { animation-delay: 250ms; animation-duration: 1000ms; }
```

Aside gets `.hero-rise-delay` so the data card fades in 250ms after the headline,
which feels like the eye moving from big-type to proof-number.

---

### 7.4 `<HighlightChip>` — the orange chip

**File:** `components/editorial/HighlightChip.tsx`

**Anatomy:** inline-block span with padded background, optional rotation.

**Props:**
```ts
type Variant = "orange" | "cream" | "ink" | "strike";
interface Props {
  children: React.ReactNode;
  variant?: Variant;      // default "orange"
  italic?: boolean;       // default true
  hero?: boolean;         // default false — opt-in rotation
  className?: string;
}
```

**Variant state table:**

| Variant | Background | Text | Border | Rotation (when `hero`) | Use case |
|---|---|---|---|---|---|
| `orange` | `viral-orange` | `ink` | none | `-0.3deg` | The default highlight. Appears in every page H1. |
| `cream` | `cream` | `ink` | 1px ink | `-0.3deg` | Secondary highlight, used on darker-background eyebrows. |
| `ink` | `ink` | `cream` | none | `-0.3deg` | Rare; used when the surface is already cream and you want inverse emphasis. |
| `strike` | transparent | inherit | diagonal orange line | n/a | The strikethrough effect on ("luck" in the hero). |

**Contrast note (crucial):** the orange chip's text was `#FFF` in v1 — that
failed WCAG AA at 3.49:1. v2 switched to `var(--ink)` giving 5.7:1. **Never
revert this.**

**Rotation discipline:** set `hero` only on the single H1 chip per page. If two
chips rotate on one page, the rotation becomes wallpaper and loses its effect.

**CSS backing class:**
```css
.highlight,
.highlight-cream,
.highlight-ink {
  padding: 0.02em 0.28em 0.08em;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  display: inline-block;
  white-space: nowrap;
}
.highlight-hero { transform: rotate(-0.3deg); }
.highlight       { background: var(--viral-orange); color: var(--ink); }
.highlight-cream { background: var(--cream); color: var(--ink); border: 1px solid var(--ink); }
.highlight-ink   { background: var(--ink); color: var(--cream); }

.strike { position: relative; display: inline-block; white-space: nowrap; }
.strike::after {
  content: ""; position: absolute; left: -4%; right: -4%; top: 52%;
  height: 0.14em; background: var(--viral-orange);
  transform: rotate(-2deg); transform-origin: center;
}
```

---

### 7.5 `<Pullquote>` — the thesis moment

**File:** `components/editorial/Pullquote.tsx`

**Anatomy:** centered `<figure>` with a massive-opaque-20 decorative curly
quote, an H-size blockquote, and an optional mono attribution.

**Props:**
```ts
interface Props {
  children: React.ReactNode;
  attribution?: string;
  tone?: "cream" | "ink";   // pairs with surrounding Section tone
  size?: "default" | "lg";  // lg goes bigger, reserved for thesis moment
  className?: string;
}
```

**Usage:**
```tsx
<Section tone="ink" className="py-24 md:py-36">
  <Pullquote attribution="the thesis" tone="ink" size="lg">
    Brains follow patterns. Most creators ship content{" "}
    <HighlightChip variant="orange">blind</HighlightChip>. You won't.
  </Pullquote>
</Section>
```

**Rule:** one Pullquote per page. Max two if the page is long (landing + proof).
Never adjacent to another pullquote.

---

### 7.6 `<Marquee>` — the single-line band

**File:** `components/editorial/Marquee.tsx`

**Anatomy:** horizontal-overflow container with a doubled `items[]` array that
animates `translateX(0)` → `translateX(-50%)` on a 40s linear infinite loop.
Respects `prefers-reduced-motion`.

**Props:**
```ts
interface Props {
  items: string[];
  tone?: "cream" | "ink" | "orange";  // default "orange"
  className?: string;
}
```

**Rule:** maximum **one marquee per page**, always in the `orange` tone on the
landing page, always immediately after the hero. Breaks the vertical padding
cadence intentionally (sits at `py-4`, the "compressed" tempo).

---

### 7.7 `<Button>` (when to use it vs inline link styles)

**File:** `components/ui/Button.tsx`

**Variants:**

| Variant | Look | Common use |
|---|---|---|
| `ink` | `bg-ink text-cream hover:bg-viral` | Primary CTAs. "Score my reel", "Get on the list". |
| `cream` | `bg-cream text-ink border-ink hover:bg-ink hover:text-cream` | Secondary CTAs. "Read the research". |
| `orange` | `bg-viral text-white hover:bg-ink` | "Now" actions. "Score it", "Back to score". Rare on marketing pages. |
| `ghost` | `text-ink hover:text-viral` | Inline text links that need underline restraint. |

**Sizes:**

| Size | Padding | Label text |
|---|---|---|
| `sm` | `px-4 py-2` | `text-[0.7rem] tracking-[0.22em]` |
| `md` (default) | `px-6 py-3.5` | `text-[0.78rem] tracking-[0.24em]` |
| `lg` | `px-8 py-5` | `text-[0.85rem] tracking-[0.24em]` |

**Note:** not every rounded-pill in the codebase uses `<Button>`. The Hero,
Nav, UploadSurface each inline their button styles because they need tight
control over label text and layout. The `<Button>` component is used when a
generic pill is enough.

**The canonical pill styling (whether inline or via Button):**
```tsx
className="mono inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-cream
           transition hover:bg-viral
           disabled:pointer-events-none disabled:opacity-40"
```

---

### 7.8 Form input — the "underline" pattern

**Anatomy:** no border box. Transparent background. 1px bottom rule that flips
to orange on focus. `serif-italic` placeholder (matches italic-as-emphasis motif).

**Skeleton:**
```tsx
<label htmlFor="score-url" className="sr-only">
  Instagram reel URL
</label>
<input
  id="score-url"
  type="url"
  placeholder="https://www.instagram.com/reel/..."
  value={url}
  onChange={(e) => setUrl(e.target.value)}
  className="serif-italic flex-1 border-b border-ink/30 bg-transparent pb-3
             text-[clamp(1.1rem,calc(1rem+0.5vw),1.5rem)]
             outline-none placeholder:text-ink/30
             focus:border-viral"
/>
```

**State table:**

| State | Background | Border-b | Text | Placeholder |
|---|---|---|---|---|
| Default | transparent | `ink/30` | `ink` | `ink/30` |
| Focus | transparent | `viral` | `ink` | `ink/30` |
| Focus-visible (keyboard) | transparent | `viral` | `ink` | — (plus global outline ring) |
| Disabled | transparent | `ink/30` | `ink/60` | `ink/30` |
| Invalid | transparent | `brain-red` | `ink` | — (plus aria-describedby error) |

**Labels:** always wired with `htmlFor` + `id`. Use `sr-only` class when the
label is visually redundant (e.g., paired with a labeled section above). Never
leave an input without a programmatic label.

---

### 7.9 `<StreamStatus>` — the progress bar

**File:** `components/surfaces/StreamStatus.tsx`

**Anatomy:** mono label + percentage readout on top, 2px-tall `bg-ink/10` track
below, orange fill that transitions `width` on update.

**Key UX move:** when `pct >= 0.9 && pct < 1`, the fill gets a `.stream-waiting`
class that breathes opacity 0.6 ↔ 1 every 1.4s. This solves the **stuck at 92%**
problem: the bar keeps visual liveness while waiting on an upstream API
response, without dishonestly inching the percentage higher.

```css
@keyframes streamWait {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 1; }
}
.stream-waiting { animation: streamWait 1.4s ease-in-out infinite; }
```

ARIA: the track has `role="progressbar"`, `aria-valuenow`, `aria-valuemin=0`,
`aria-valuemax=100`, and `aria-label={label}`.

---

### 7.10 Card treatment — the anti-template rule

This codebase intentionally does NOT have a generic `<Card>` component. Cards
are inlined because the aesthetic rule is:

> **Every card family gets one distinctive move. Uniform card grids with same
> border + radius + shadow are the anti-pattern.**

Current card treatments across the site:

| Surface | Card treatment |
|---|---|
| Landing surfaces grid (`/`) | `rounded-sm border-ink/15 bg-paper` with hover `border-viral bg-cream` |
| Testimonial figure (`/`) | `rounded-sm border-ink/15 bg-cream p-8` — one-off quote card |
| Pricing tiers (`/business`) | 4 tiles, the featured one uses `bg-viral text-white` instead of a lift animation |
| Reel grid (`/research`) | Overlapping thumbnails with gradient fallback — not card-shaped |
| Shot cards (`/rewrite`) | Ruled-edge horizontal cards with heavy numbering — not card-shaped |
| Proof receipts (`/proof`) | Dark section blocks with inline data tables — not card-shaped at all |

When you need a new "card family", design its distinctive move first (edge
treatment, photo corner, hard color bleed, numbered gutter) rather than
defaulting to `rounded-md border p-6`.

---

## 8. Motion and interaction rules

### The motion budget

One page gets **at most three** sources of motion:

1. **Entrance** — hero elements rise on first paint (CSS-only).
2. **Reveal** — stream progress bar fills (CSS `transition-[width]`).
3. **Ambient** — marquee loop (CSS `@keyframes`).

That's it. No scroll-triggered parallax on product pages (only `/proof` uses
it, guarded by `useReducedMotion`). No micro-bounces on hover. No
"reveal on scroll" everywhere.

### The focus-visible ring — global

```css
:where(a, button, input, textarea, select, [role="button"], [tabindex]):focus-visible {
  outline: 2px solid var(--viral-orange);
  outline-offset: 3px;
  border-radius: 2px;
}
```

This runs across every interactive element without needing per-component focus
styles. Use `:focus-visible` (not `:focus`) so mouse clicks don't ring but
keyboard nav does.

### `prefers-reduced-motion` — global

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .marquee-track   { animation: none; }
  .stream-waiting  { animation: none; opacity: 1; }
}
```

Every animation-respecting decision in this design flows through that block.
When porting, **copy this verbatim**.

### When `framer-motion` is allowed

Only three cases justify importing framer-motion:
1. **`AnimatePresence`** for entering/exiting elements (chat drawer, phase
   transitions on `/score`).
2. **Parallax** (`useScroll` + `useTransform`) — only `/proof` uses it.
3. **Layout-shift-free reveal of streamed content** (`motion.div` with
   `initial/animate` on score cards that materialize).

Everything else — entrance fades, width animations, opacity pulses — uses CSS.
Adding framer-motion to Hero.tsx cost ~38KB First Load JS; removing it and
using the CSS `@keyframes` was a single commit that dropped landing from 145KB
to 107KB.

### Duration + easing standards

| Purpose | Duration | Easing |
|---|---|---|
| Hover transition (color, opacity) | 150–200ms | CSS default |
| Entrance (fade + translate) | 900–1000ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Stream bar width update | 350ms | `ease-out` |
| Stream waiting pulse | 1400ms | `ease-in-out` infinite |
| Marquee loop | 40s linear | linear infinite |

---

## 9. Content voice

Copy is part of the design system. The same `STYLE_RULES` block that governs
the AI engines also governs on-page UI copy:

### Non-negotiable style rules

1. **Never use em-dashes** (`—`). Use a period, comma, colon, or middot (`·`).
2. **Never use en-dashes** (`–`) in prose. Use "to" or a hyphen (`-`).
3. **Use plain punctuation only.** Periods, commas, colons, semicolons,
   parentheses, quotes, middot. No typographic flourishes.
4. **Short declarative sentences over long compound ones.** If a sentence has
   two "and"s or a "however", split it.
5. **Lowercase microcopy** (helper text, form errors). Capitalize page titles,
   section titles, and sentences only.
6. **Never say "as an AI" or meta-commentary.** Never refer to vendor model
   names (Claude, GPT, Gemini). Refer to internal engines only (Alpha, Beta,
   Gamma). This shields the brand from dating itself.
7. **Creator-verb over academic.** "Fires when you promise a payoff in two
   seconds" beats "Dopamine arousal in the orbitofrontal cortex." Keep the
   science reference but lead with the human action.

### Button label verbs

| Surface | Verb used | Why |
|---|---|---|
| Hero primary | "Score my reel" | First-person, possessive, specific action. |
| Hero secondary | "or research a creator" | Lowercase, feels like a side path. |
| `/research` submit | "Break it down" | Not "Research creator" — verb-first, punchier. |
| `/rewrite` submit | "Generate the shot plan" | Describes the artifact, not the engine. |
| `/waitlist` submit | "Get on the list" | Direct, no corporate "Subscribe". |

### Editorial eyebrows (page-top mono labels)

Every primary page opens with one of these patterns:

- **Issue number**: `01 · Score`, `02 · Research`, `03 · Rewrite`
- **Context label**: `Proof · the receipts`, `Early access · lucid:v2`
- **Thesis label**: `the thesis`, `what you're signing up for`

They are always `.mono`, `tracking-[0.28em]`, `text-[0.72rem]`, and preceded by
the 1px × 40px accent bar.

### Error copy tone

Never "An error occurred. Please try again." Always specific, lowercase,
slightly resigned:

- "too many signups from this network. try again in a few minutes."
- "that doesn't look like a valid email."
- "the list is down for a second. try again?"
- "couldn't reach the Gamma engine. check the key and try again."

### Success copy tone

Never "Success!" Always a signal of completion + what's next:

- "You're in." (mono, orange, pulse dot)
- "Hold tight. We'll reach out when the engine opens up."
- "Scoring complete."

---

## 10. Accessibility

### Contrast ratios (measured)

| Pair | Ratio | Pass |
|---|---|---|
| `ink` `#0A0A0A` on `cream` `#F3EEE2` | 17.9:1 | AAA |
| `ink` on `viral-orange` `#E85D1C` | 5.7:1 | AA (body) |
| `cream` on `ink` | 17.9:1 | AAA |
| `muted` `#6B6660` on `cream` | 4.6:1 | AA (body) |
| `ink/80` alpha on `cream` | ~10:1 | AA+ |

**Historical gotcha:** v1 had white text on `viral-orange` at 3.49:1 which
failed AA. v2 switched all orange chips + orange-bg buttons to `ink` text. If
you copy a single rule from this doc, let it be this one.

### Focus management

- Global `:focus-visible` ring (see [Section 8](#8-motion-and-interaction-rules)).
- Every input has an associated `<label>` via `htmlFor` + `id`, or an
  `aria-label` when the label is visually redundant. `sr-only` is used for
  hidden labels.
- Mobile nav hamburger has `aria-expanded`, `aria-controls`, and
  `aria-label` that flips between "Open navigation" / "Close navigation".

### Motion

- `prefers-reduced-motion: reduce` media query neutralizes every animation in
  `globals.css` and any `useReducedMotion()` framer-motion hooks.

### Touch targets

- Minimum `44px` tap area on every button (`min-h-[44px]` on mobile CTA).
- Mobile nav links have adequate inter-link gaps (`gap-4` = 16px vertical).

### Form semantics

- `type="email"` + `autoComplete="email"` + `inputMode="email"` on email inputs.
- `required` attribute when the form can't submit without it.
- `aria-invalid` flips to `"true"` on validation failure.
- `aria-describedby` points to the error paragraph when present.
- Error paragraph has `role="alert"`.

### Progress indicators

- `<StreamStatus>` has `role="progressbar"`, `aria-valuenow/min/max`,
  `aria-label`. No decorative-only progress bars.

---

## 11. Performance rules

### Bundle budgets

| Page type | First Load JS | Reality |
|---|---|---|
| Landing | **≤ 150 KB** | 107 KB ✓ |
| Editorial pages (`/business`, `/waitlist`) | ≤ 150 KB | 107–109 KB ✓ |
| Interactive product pages (`/score`, `/research`, `/rewrite`, `/proof`) | ≤ 250 KB | 151–155 KB ✓ |

Hit the budget by: Server Components for page shells, CSS-over-framer-motion
for simple transitions, no UI kit dependency.

### Image rules

1. **Explicit `width` and `height` on every `<img>`**. Prevents CLS.
2. **`loading="lazy" decoding="async"`** on below-the-fold images.
3. **`preload="metadata"` on video tags** so a 2.7MB `.mp4` doesn't eagerly
   stream on first paint.
4. **GIFs are OK as temporary data-viz** but ship animated WebP for production.
5. **Remote image hosts are allowlisted** in `next.config.ts#images.remotePatterns`.

### Font rules

- Three families max (this codebase: Instrument Serif, Inter, JetBrains Mono).
- All via `next/font/google` with `display: "swap"` and `subsets: ["latin"]`.
- CSS variable binding (`--font-instrument-serif` etc.) so Tailwind can reference.
- Do not import weights/styles you don't use (Instrument Serif only loads `400`
  normal + italic).

### Framer-motion discipline

- Prefer CSS `@keyframes` for entrance animations.
- Use framer-motion only for:
  - `AnimatePresence` (entering/exiting elements)
  - Scroll-linked transforms (`useScroll` + `useTransform`, always behind a
    `useReducedMotion` guard)
- **Do not** mark a whole page `"use client"` if its only client need is
  animation. Extract an inner client shell and keep the page a Server Component.

### Cache-friendly responses

- API routes return `Cache-Control: no-cache` for streaming responses.
- Security headers are set once globally in `next.config.ts`, not per-route.

---

## 12. Security and backend conventions

These are here because the design document is meant to be portable, and the
frontend aesthetic assumes a backend that can support it without falling apart
under load. The rules:

### Input validation — Zod on every API route

```ts
// lib/validation.ts
import { z } from "zod";

export const waitlistBodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  source: z.string().max(60).optional(),
  referrer: z.string().max(500).optional(),
});
```

In the route:
```ts
const raw = await req.json().catch(() => null);
const parsed = waitlistBodySchema.safeParse(raw);
if (!parsed.success) {
  return Response.json({ error: "invalid_body" }, { status: 400 });
}
const body = parsed.data;
```

**Always** `.safeParse()` → 400 on fail. Never cast `(await req.json()) as T`.

### Rate limiting — in-memory middleware

```ts
// middleware.ts (abbreviated)
const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/waitlist": { max: 3, windowMs: 10 * 60_000 },
};
```

Per-IP buckets keyed on forwarded IP. Returns `429` with `Retry-After` header.
Fine for hackathon scale; swap for Upstash before scaling horizontally.

### Security headers (Next.js `headers()`)

Set five headers site-wide in `next.config.ts`:

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

### Error response discipline

- Return **opaque error codes** to the browser: `"invalid_body"`,
  `"scrape_error"`, `"rate_limited"`. Never leak SDK errors, stack traces,
  filesystem paths.
- Log the real error server-side with `console.error` (or better, structured
  logger).

### Token placement

- API tokens always go in `Authorization: Bearer <token>` or vendor-specific
  header (e.g. `x-goog-api-key`). **Never** in URL query strings (leaks into
  proxy logs).

### Supabase RLS

- Every table has `enable row level security`.
- For email capture (waitlist), anon has **INSERT only** — no SELECT policy
  means anon can't scrape the list. Listing emails is a service-role operation.
- Case-insensitive email uniqueness via `create unique index on lower(email)`
  (avoids needing the `citext` extension).

### IP-hash forensics (privacy-first)

Instead of storing raw IPs, hash them with a daily-rotating salt:

```ts
const day = new Date().toISOString().slice(0, 10);
const ipHash = createHash("sha256").update(`${ip}:${day}`).digest("hex").slice(0, 32);
```

Lets you detect repeat-offender patterns within a day, useless tomorrow.
Respects user privacy without giving up abuse forensics.

---

## 13. File and folder organization

```
app/
├── layout.tsx               # html + body, font variable wiring, grain on body
├── globals.css              # ← all design tokens + utility classes + keyframes live here
├── fonts.ts                 # next/font/google declarations
├── page.tsx                 # landing
├── [surface]/page.tsx       # score, research, rewrite, proof, business, waitlist
└── api/[route]/route.ts     # server endpoints

components/
├── editorial/               # typography + structural primitives
│   ├── Nav.tsx
│   ├── Hero.tsx
│   ├── Section.tsx
│   ├── HighlightChip.tsx
│   ├── Pullquote.tsx
│   └── Marquee.tsx
├── surfaces/                # interactive / data-display components
│   ├── StreamStatus.tsx
│   ├── UploadSurface.tsx
│   ├── ChatPanel.tsx
│   ├── ChatDrawer.tsx
│   ├── ScoreCard.tsx
│   ├── ReelGrid.tsx
│   └── ...
└── ui/                      # lowest-level primitives
    └── Button.tsx

lib/
├── cn.ts                    # clsx wrapper
├── validation.ts            # all Zod schemas for API routes
└── [domain]/                # repositories, providers, mocks

middleware.ts                # rate-limiter, runs before every /api/* request
next.config.ts               # images.remotePatterns, security headers
tsconfig.json                # strict: true, paths: { "@/*": ["./*"] }
```

**Mental model:**
- `editorial/` = components you use to BUILD a page (magazine spread pieces).
- `surfaces/` = components that HOLD state and INTERACT with backend.
- `ui/` = generic primitives shared across domains.

When adding a new component, ask: does this carry brand voice (editorial),
display dynamic data (surface), or is it a generic primitive (ui)? That's
where it goes.

---

## 14. Anti-patterns

An honest list of things that will degrade this aesthetic if you add them.

### Visual anti-patterns

| Anti-pattern | Why it's wrong | Do this instead |
|---|---|---|
| Using rotated HighlightChip on every H1, H2, and pricing card | Rotation is a flourish; scattering it makes it wallpaper | Only on the page's single H1 (`hero` prop) |
| Defaulting to symmetric 6/6 column split | Editorial design relies on asymmetry for hierarchy | 9/3 or 7/5 unless content is genuinely paired |
| `rounded-md border p-6` cards everywhere | Reads as generic SaaS template | Give each card family one distinctive move |
| Adding a shadow-lift on the "featured" pricing tier | Classic SaaS pattern; kills the editorial feel | Use a tag ("most chosen") or color inversion |
| Using multiple saturated colors | Destroys the single-accent discipline | Cream + ink + orange is the entire palette |
| White text on orange | 3.49:1 contrast fails WCAG AA | `ink` text on orange = 5.7:1 |
| `text-gray-500` or similar utility-defaults | Breaks the semantic token system | `text-muted` (the warm gray) |
| Purple-gradient on white | Default AI-generated aesthetic | Commit to the cream + ink + orange system |
| Three or more pullquotes per page | Dilutes the thesis moment | Exactly one (max two on a long page) |
| Filling empty right columns with decoration | Empty is load-bearing | Leave it empty, use the 9/3 split intentionally |

### Technical anti-patterns

| Anti-pattern | Why it's wrong | Do this instead |
|---|---|---|
| Marking a page `"use client"` to get a framer-motion entrance | Imports the whole motion runtime for one fade | CSS `@keyframes` on a Server Component |
| `<img>` without `width`/`height` | Causes CLS on hero images | Explicit dimensions every time |
| Animating `width` with framer-motion for a 2px progress bar | 42KB for `transition: width 350ms ease-out` | CSS `transition-[width]` |
| Casting `await req.json() as T` | Trusts arbitrary user input | `schema.safeParse(raw)` via Zod |
| Returning raw SDK error messages | Leaks internals | Opaque error codes, log the detail server-side |
| Tokens in URL query strings (`?token=xxx`) | Appears in proxy logs | `Authorization` header |
| No `prefers-reduced-motion` handler | WCAG 2.3.3 fails silently | Global media query in `globals.css` |
| Skipping `:focus-visible` styling | Keyboard users get default browser outline | Global `:where(a, button, …):focus-visible` rule |
| Using `className="text-ink opacity-80"` | Loses alpha-over-bg intent, unstructured | `text-ink/80` (semantic alpha) |
| Dropping `alt=""` on decorative images | Screen readers announce filename | Explicit empty alt for decoration |

### Content anti-patterns

| Don't write | Do write |
|---|---|
| "Leverage our cutting-edge AI to unlock insights" | "Paste a reel. The engine scores brain activation frame by frame." |
| "Register for early access" | "Get on the list" |
| "Research Creator" (noun button) | "Break it down" (verb button) |
| "An error occurred. Please try again." | "too many signups from this network. try again in a few minutes." |
| "Dopamine arousal in the orbitofrontal cortex" | "Fires when you promise a payoff in the first two seconds" |
| Em-dashes (—) | Periods, commas, or middot (·) |
| "As an AI system, I…" | (never applicable; speak as the product) |

---

## 15. Portability recipe

A step-by-step checklist to clone this aesthetic onto a fresh Next.js project.

### Step 1 — scaffold

```bash
npx create-next-app@latest my-app --typescript --tailwind --app --no-src-dir
cd my-app
```

Ensure:
- Next.js 15+ (App Router)
- TypeScript `strict: true` in `tsconfig.json`
- Tailwind 4+ (`@tailwindcss/postcss`)

### Step 2 — fonts

Create `app/fonts.ts`:

```ts
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"], weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});
export const inter         = Inter({         subsets: ["latin"], variable: "--font-inter",           display: "swap" });
export const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });
```

Wire in `app/layout.tsx`:

```tsx
import { instrumentSerif, inter, jetbrainsMono } from "./fonts";

<html
  lang="en"
  className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}
>
  <body className="min-h-screen bg-cream text-ink grain">{children}</body>
</html>
```

### Step 3 — paste `globals.css`

Copy the entire `globals.css` from this codebase verbatim. It's ~155 lines.
That gets you:

- All primitive + semantic color tokens
- Font utility classes
- HighlightChip styles + strike
- Grain overlay
- Marquee keyframes
- Global `:focus-visible` ring
- `prefers-reduced-motion` guard
- Selection color
- Hero entrance animation
- Stream waiting animation

### Step 4 — install `clsx` and create `lib/cn.ts`

```bash
npm install clsx
```

```ts
// lib/cn.ts
import clsx, { type ClassValue } from "clsx";
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
```

### Step 5 — copy the six editorial primitives

From `components/editorial/`, copy:

1. `Section.tsx`
2. `Nav.tsx` (rename links + wordmark)
3. `HighlightChip.tsx`
4. `Hero.tsx` (rewrite copy + stat aside for your product)
5. `Pullquote.tsx`
6. `Marquee.tsx`

Update the Nav's `LINKS` array to your pages. Update the Hero's copy, chip
word, and CTA links. Keep the structure.

### Step 6 — build your first page

Every page follows this skeleton:

```tsx
import { Nav } from "@/components/editorial/Nav";
import { Section } from "@/components/editorial/Section";
import { HighlightChip } from "@/components/editorial/HighlightChip";

export default function SomePage() {
  return (
    <main>
      <Nav />

      {/* Hero section: eyebrow + H1 + lede + CTAs */}
      <Section tone="cream" className="pb-8 pt-6 md:pb-12 md:pt-10">
        <div className="mono flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-muted">
          <span className="inline-block h-[1px] w-10 bg-muted/60" />
          <span>01 · Your Surface</span>
        </div>
        <h1
          className="serif mt-8 leading-[0.9] tracking-[-0.02em]"
          style={{ fontSize: "clamp(3rem, calc(1rem + 4vw), 5.3rem)" }}
        >
          Your{" "}
          <HighlightChip variant="orange" hero>memorable</HighlightChip>
          <br />
          page headline.
        </h1>
        <p className="mt-8 max-w-[58ch] text-[clamp(1.02rem, calc(0.92rem + 0.35vw), 1.22rem)] leading-[1.5] text-ink/80">
          One-paragraph lede that tells the reader what this page is and what
          they'll find on it. Two short sentences. Never three.
        </p>
      </Section>

      {/* Content section(s) */}
      <Section tone="paper" className="py-10 md:py-14">
        {/* your content */}
      </Section>

      {/* One dark thesis section per page */}
      <Section tone="ink" className="py-24 md:py-36">
        {/* pullquote or thesis content */}
      </Section>
    </main>
  );
}
```

### Step 7 — apply the accessibility + motion rules

Already done if you copied `globals.css`. Verify:

- [ ] A keyboard tab through every page shows the orange focus ring.
- [ ] `prefers-reduced-motion: reduce` in DevTools silences the marquee.
- [ ] Every form input has a `<label htmlFor="id">` or `aria-label`.
- [ ] Orange chips use ink text, not white.

### Step 8 — apply backend conventions (if you have a backend)

If your app has API routes:

- [ ] `lib/validation.ts` with Zod schemas for every request body.
- [ ] `middleware.ts` with per-IP rate limit buckets.
- [ ] `next.config.ts` with the five security headers.
- [ ] Opaque error codes in API responses.

### Step 9 — brand-swap

The only things that need renaming when porting:

| In lucid | Rename to |
|---|---|
| `lucid:v2` wordmark in Nav | Your brand name |
| `viral-orange` `#E85D1C` | Keep it, or swap to your brand accent (but keep the role: single saturated hue) |
| "fMRI-backed / peer-reviewed weights" eyebrow | Your product's equivalent credibility cue |
| Engine names (Alpha/Beta/Gamma) | Your internal system names |
| Domain copy about brain networks | Your product's explanatory copy |

Everything else — the cream/ink/paper palette, the serif/mono/sans trio, the
grain overlay, the editorial eyebrow pattern, the rotation discipline — stays
identical. That's the portable aesthetic.

### Step 10 — test the ported version

Before declaring it done, check:

- [ ] Landing page First Load JS ≤ 150 KB.
- [ ] WCAG AA contrast on every text/bg pair (use a contrast checker; orange
      chip on any surface should be ≥ 4.5:1 with ink text).
- [ ] Mobile hamburger reveals all nav links.
- [ ] `focus-visible` orange ring appears on tab through every interactive.
- [ ] No em-dashes in any visible UI copy (run `grep -r "—" app/ components/`).
- [ ] Reduced-motion disables the marquee.
- [ ] Build produces no TypeScript errors (`npx tsc --noEmit`).

If all ten check, you have a port.

---

## Appendix A — Full token block (copy-paste ready)

```css
/* app/globals.css */
@import "tailwindcss";

:root {
  /* surfaces */
  --cream:       #F3EEE2;
  --paper:       #FAF7F0;
  --ink:         #0A0A0A;
  --ink-soft:    #1E1E1E;
  --text-muted:  #6B6660;
  --rule:        rgba(10, 10, 10, 0.14);

  /* accent */
  --viral-orange:      #E85D1C;
  --viral-orange-soft: #F4B183;

  /* data-viz only */
  --brain-red:    #C53030;
  --brain-amber:  #D97706;
  --brain-cyan:   #0E7C86;
  --brain-violet: #6D28D9;
}

@theme inline {
  --color-cream:        var(--cream);
  --color-paper:        var(--paper);
  --color-ink:          var(--ink);
  --color-ink-soft:     var(--ink-soft);
  --color-muted:        var(--text-muted);
  --color-rule:         var(--rule);
  --color-viral:        var(--viral-orange);
  --color-viral-soft:   var(--viral-orange-soft);
  --color-brain-red:    var(--brain-red);
  --color-brain-amber:  var(--brain-amber);
  --color-brain-cyan:   var(--brain-cyan);
  --color-brain-violet: var(--brain-violet);

  --font-serif: var(--font-instrument-serif);
  --font-sans:  var(--font-inter);
  --font-mono:  var(--font-jetbrains-mono);

  --text-display: clamp(3.5rem, 1rem + 8vw, 9rem);
  --text-hero:    clamp(2.5rem, 1rem + 5vw, 5rem);
  --text-lede:    clamp(1.125rem, 0.95rem + 0.5vw, 1.375rem);
}

* { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

html, body {
  background: var(--cream);
  color: var(--ink);
  font-family: var(--font-sans);
  font-feature-settings: "ss01", "cv11";
}

.serif        { font-family: var(--font-serif); letter-spacing: -0.015em; }
.serif-italic { font-family: var(--font-serif); font-style: italic; letter-spacing: -0.02em; }
.mono         { font-family: var(--font-mono); letter-spacing: -0.01em; }

.highlight,
.highlight-cream,
.highlight-ink {
  padding: 0.02em 0.28em 0.08em;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  display: inline-block;
  white-space: nowrap;
}
.highlight-hero  { transform: rotate(-0.3deg); }
.highlight       { background: var(--viral-orange); color: var(--ink); }
.highlight-cream { background: var(--cream); color: var(--ink); border: 1px solid var(--ink); }
.highlight-ink   { background: var(--ink); color: var(--cream); }

.strike { position: relative; display: inline-block; white-space: nowrap; }
.strike::after {
  content: ""; position: absolute;
  left: -4%; right: -4%; top: 52%;
  height: 0.14em;
  background: var(--viral-orange);
  transform: rotate(-2deg);
  transform-origin: center;
}

.rule-top    { border-top: 1px solid var(--rule); }
.rule-bottom { border-bottom: 1px solid var(--rule); }

.grain { position: relative; }
.grain::before {
  content: "";
  position: absolute; inset: 0;
  pointer-events: none;
  opacity: 0.06;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>");
}

@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.marquee-track {
  display: inline-flex;
  gap: 3rem;
  animation: marquee 40s linear infinite;
  will-change: transform;
}

:where(a, button, input, textarea, select, [role="button"], [tabindex]):focus-visible {
  outline: 2px solid var(--viral-orange);
  outline-offset: 3px;
  border-radius: 2px;
}

@keyframes streamWait {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 1; }
}
.stream-waiting { animation: streamWait 1.4s ease-in-out infinite; }

@keyframes heroRise {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-rise {
  animation: heroRise 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
  will-change: opacity, transform;
}
.hero-rise-delay {
  animation-delay: 250ms;
  animation-duration: 1000ms;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .marquee-track  { animation: none; }
  .stream-waiting { animation: none; opacity: 1; }
}

::selection { background: var(--viral-orange); color: var(--ink); }
```

---

## Appendix B — Quick-reference cheatsheet

**The 10-second port.** The minimum viable editorial-lucid clone:

1. `npm install clsx next@latest react@latest`
2. Paste `app/globals.css` (Appendix A).
3. Paste `app/fonts.ts` (Section 4) + wire in `layout.tsx`.
4. Copy `components/editorial/` — Section, Nav, HighlightChip, Hero, Pullquote, Marquee.
5. Write your first page with the skeleton from Step 6.
6. Grep-and-kill em-dashes (Section 9).
7. Done.

---

## Appendix C — Honest limitations

Things this design system does NOT handle well. If your product needs these,
plan for an extension:

- **Dense data tables.** The editorial aesthetic prefers lists over tables.
  If you need a 100-row sortable grid, you'll need to introduce a table
  component family that doesn't exist here today.
- **Forms with > 10 fields.** The underline-input pattern was designed for
  1–3 field forms. A full signup form with 15 fields will feel underdesigned.
- **Dark mode with the exact same character.** The dark `.ink` sections feel
  intentional because the light surface contrasts them. A full dark theme
  would need different proportions of cream/ink/orange; it's an unsolved
  design problem in this system as of 2026-04-19.
- **Photography-heavy layouts.** The cream background and serif-heavy type
  work best with type-first pages. If your product is image-gallery-first,
  you'll need a different hero pattern.
- **Internationalization with non-Latin scripts.** Instrument Serif is Latin-only.
  Multilingual sites need a font-family fallback strategy that isn't designed yet.

Every one of these is a legitimate future extension. None of them are reasons
to abandon the aesthetic for the products it does fit.

---

_Last updated: 2026-04-19._
_Source: `lucid-v2` codebase at `github.com/Tensorboyalive/lucid`._
_Live example: `lucid-v2.vercel.app`._
