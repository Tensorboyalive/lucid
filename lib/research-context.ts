import type { ResearchProfile } from "./mock-research";

const KEY = "lucid-research-context";

export function saveResearchContext(profile: ResearchProfile): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        savedAt: Date.now(),
        profile: {
          handle: profile.handle,
          name: profile.name,
          followers: profile.followers,
          avgScore: profile.avgScore,
          patterns: profile.patterns,
          topReelCaptions: profile.reels
            .slice(0, 8)
            .map((r) => ({
              id: r.id,
              caption: r.caption,
              views: r.views,
              hookType: r.hookType,
            })),
        },
      }),
    );
  } catch {
    // sessionStorage full or blocked, ignore.
  }
}

export interface ResearchContext {
  savedAt: number;
  profile: {
    handle: string;
    name: string;
    followers: string;
    avgScore: number;
    patterns: { title: string; body: string }[];
    topReelCaptions: {
      id: string;
      caption: string;
      views: string;
      hookType: string;
    }[];
  };
}

export function loadResearchContext(): ResearchContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ResearchContext;
    // Invalidate after 2 hours.
    if (Date.now() - parsed.savedAt > 2 * 60 * 60 * 1000) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearResearchContext(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
