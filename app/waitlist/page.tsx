import type { Metadata } from "next";
import WaitlistClient from "./WaitlistClient";

export const metadata: Metadata = {
  title: "Get early access to the scoring engine",
  description:
    "lucid:v2 is in closed iteration. Join the list and we'll let you in when the fMRI-trained scoring engine opens up. One email, no drip, no noise.",
  openGraph: {
    title: "Get early access · lucid:v2",
    description:
      "Join the list for first access to the neuro-scoring engine for Instagram reels.",
    images: [{ url: "/og?v=waitlist", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get early access · lucid:v2",
    description:
      "Join the list for first access to the neuro-scoring engine.",
    images: ["/og?v=waitlist"],
  },
};

export default function WaitlistPage() {
  return <WaitlistClient />;
}
