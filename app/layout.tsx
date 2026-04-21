import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { instrumentSerif, inter, jetbrainsMono } from "./fonts";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";

/**
 * Canonical URL for `metadataBase`. Overridden per deploy via
 * `NEXT_PUBLIC_SITE_URL` so the public pre-launch project (e.g.
 * https://lucid-early.vercel.app) resolves its own absolute OG image URLs
 * rather than pointing every crawler back at the private deploy.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lucid-v2.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "lucid:v2 · Going viral is a skill, not luck",
    template: "%s · lucid:v2",
  },
  description:
    "Score your Instagram reels against fMRI-trained brain networks. Research creators. Rewrite scripts with AI.",
  applicationName: "lucid:v2",
  authors: [{ name: "Manav Gupta", url: "https://x.com/tensorboy" }],
  keywords: [
    "viral reel scorer",
    "fMRI content analysis",
    "neuro marketing",
    "instagram reels AI",
    "script rewriter",
    "brain-based engagement prediction",
  ],
  openGraph: {
    type: "website",
    siteName: "lucid:v2",
    title: "lucid:v2 · Going viral is a skill, not luck",
    description:
      "The first tool that grades a reel against the four brain networks that decide what gets shared.",
    images: [
      {
        url: "/og?v=default",
        width: 1200,
        height: 630,
        alt: "lucid:v2 — going viral is a skill, not luck",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "lucid:v2 · Going viral is a skill, not luck",
    description:
      "fMRI-trained reel scorer · research creators · rewrite scripts.",
    creator: "@tensorboy",
    images: ["/og?v=default"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-cream text-ink grain">
        <PostHogProvider>{children}</PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
