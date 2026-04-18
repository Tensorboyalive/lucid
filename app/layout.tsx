import type { Metadata } from "next";
import "./globals.css";
import { instrumentSerif, inter, jetbrainsMono } from "./fonts";

export const metadata: Metadata = {
  title: "lucid:v2 · Going viral is a skill, not luck",
  description:
    "Score your Instagram reels against fMRI-trained brain networks. Research creators. Rewrite scripts with AI.",
  openGraph: {
    title: "lucid:v2",
    description: "Hack virality at the neuro level.",
    type: "website",
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
      <body className="min-h-screen bg-cream text-ink grain">{children}</body>
    </html>
  );
}
