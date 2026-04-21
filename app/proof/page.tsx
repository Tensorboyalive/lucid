import type { Metadata } from "next";
import ProofClient from "./ProofClient";

export const metadata: Metadata = {
  title: "The receipts · brain scans, renders, engines",
  description:
    "A foundation model for in-silico neuroscience met a 2400-reel creator. Here are the brain activation renders, the scores, and the three engines I wrapped it in.",
  openGraph: {
    title: "The receipts · lucid:v2",
    description:
      "Real brain renders. Real scores. The three engines behind lucid:v2.",
    images: [{ url: "/og?v=proof", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The receipts · lucid:v2",
    description:
      "Real brain renders. Real scores. Real engines.",
    images: ["/og?v=proof"],
  },
};

export default function ProofPage() {
  return <ProofClient />;
}
