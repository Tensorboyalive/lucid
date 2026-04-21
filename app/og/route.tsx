import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

// Runs at the edge so the first render of every share preview is instant.
export const runtime = "edge";

/**
 * Three OG variants for the three public surfaces. Each one is a single
 * 1200×630 card in the editorial cream / ink / viral-orange palette — tiny
 * mono eyebrow up top, giant serif headline with one orange HighlightChip
 * exactly like the in-product `HighlightChip` component.
 *
 * Fetched by the per-route `metadata.openGraph.images` declarations in
 * app/layout.tsx + app/(waitlist|proof)/page.tsx via `?v=default|waitlist|proof`.
 */
type Variant = {
  eyebrow: string;
  head: string[];
  highlight: string;
  highlightVariant: "orange" | "strike";
};

const VARIANTS: Record<string, Variant> = {
  default: {
    eyebrow: "lucid:v2 · fMRI-backed reel scorer",
    head: ["Going", "viral", "is a skill,", "not luck."],
    highlight: "viral",
    highlightVariant: "orange",
  },
  waitlist: {
    eyebrow: "early access · lucid:v2",
    head: ["Get first", "access", "to the scoring engine."],
    highlight: "access",
    highlightVariant: "orange",
  },
  proof: {
    eyebrow: "the receipts · lucid:v2",
    head: ["A paper came out.", "So I", "built it", "."],
    highlight: "built it",
    highlightVariant: "orange",
  },
};

const PALETTE = {
  cream: "#F2EBD9",
  paper: "#FAF6EB",
  ink: "#171514",
  muted: "#6B6358",
  viral: "#F04F25",
} as const;

// Instrument Serif lives on Google Fonts. We resolve the woff URL from the
// CSS API each render (cached edge-side). If the fetch fails we fall back to
// Satori's default sans-serif — the layout still renders, it just loses the
// editorial feel for one image. Preferable to a 500 on the OG endpoint.
async function loadSerif(): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap",
      {
        headers: {
          // Google serves different font formats depending on UA. Force woff2.
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      },
    );
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const urlMatch = css.match(/src:\s*url\((https:[^)]+\.woff2)\)/);
    if (!urlMatch) return null;
    const fontRes = await fetch(urlMatch[1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const variantKey = (searchParams.get("v") ?? "default").toLowerCase();
  const variant = VARIANTS[variantKey] ?? VARIANTS.default;

  const serifBytes = await loadSerif();
  const fonts = serifBytes
    ? [
        {
          name: "Instrument Serif",
          data: serifBytes,
          style: "normal" as const,
          weight: 400 as const,
        },
      ]
    : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: PALETTE.cream,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: serifBytes ? "Instrument Serif" : "sans-serif",
          color: PALETTE.ink,
          position: "relative",
        }}
      >
        {/* Top rail: eyebrow + rule */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontSize: 20,
            color: PALETTE.muted,
            fontFamily: "sans-serif",
          }}
        >
          <span
            style={{
              width: "56px",
              height: "1.5px",
              background: PALETTE.muted,
              opacity: 0.6,
            }}
          />
          <span>{variant.eyebrow}</span>
        </div>

        {/* Headline — flex wrap of words, highlight word gets the orange chip */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "16px 22px",
            fontSize: 120,
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            maxWidth: "1040px",
          }}
        >
          {variant.head.map((token, i) => {
            const isHighlight =
              token.trim().toLowerCase() === variant.highlight.toLowerCase();
            if (!isHighlight) {
              return (
                <span key={i} style={{ display: "flex" }}>
                  {token}
                </span>
              );
            }
            return (
              <span
                key={i}
                style={{
                  display: "flex",
                  background: PALETTE.viral,
                  color: PALETTE.ink,
                  padding: "6px 20px 10px",
                  borderRadius: "6px",
                  fontStyle: "italic",
                }}
              >
                {token}
              </span>
            );
          })}
        </div>

        {/* Bottom rail: wordmark + brand pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "sans-serif",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontSize: 22,
            color: PALETTE.ink,
          }}
        >
          <span>
            lucid
            <span style={{ color: PALETTE.viral }}>:</span>
            v2
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              background: PALETTE.ink,
              color: PALETTE.cream,
              padding: "14px 24px",
              borderRadius: "999px",
              fontSize: 18,
            }}
          >
            <span>lucid-v2.vercel.app</span>
            <span>→</span>
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    },
  );
}
