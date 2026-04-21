import Link from "next/link";
import { HighlightChip } from "./HighlightChip";
import { PUBLIC_ONLY } from "@/lib/config";

export function Hero() {
  // On the public / pre-launch build the hero funnels everyone into the
  // waitlist. The secondary link points at /proof (still public) so a
  // skeptic can see the receipts without being asked for an email first.
  const primaryHref = PUBLIC_ONLY ? "/waitlist" : "/score";
  const primaryLabel = PUBLIC_ONLY ? "Get early access" : "Score my reel";
  const secondaryHref = PUBLIC_ONLY ? "/proof" : "/research";
  const secondaryLabel = PUBLIC_ONLY
    ? "or see the receipts"
    : "or research a creator";

  return (
    <div className="relative overflow-hidden rule-bottom">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-12 gap-6 px-6 pb-24 pt-10 md:px-10 md:pt-20 lg:px-14 lg:pb-40 lg:pt-24">
        <div
          className="col-span-12 lg:col-span-9 hero-rise"
        >
          <div className="mono mb-10 flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.3em] text-muted">
            <span className="inline-block h-[1px] w-10 bg-muted/60" />
            <span>fMRI-backed</span>
            <span className="opacity-40">/</span>
            <span>peer-reviewed weights</span>
          </div>
          <h1
            className="serif leading-[0.92] tracking-[-0.02em]"
            style={{ fontSize: "var(--text-display)" }}
          >
            Going{" "}
            <HighlightChip variant="orange" hero>viral</HighlightChip>
            {" "}
            is a{" "}
            <span className="serif-italic text-ink/95">skill,</span>
            <br />
            not{" "}
            <span className="serif-italic">
              <HighlightChip variant="strike" italic={false}>luck</HighlightChip>.
            </span>
          </h1>
          <p className="mt-10 max-w-[52ch] text-[clamp(1.05rem, calc(0.95rem + 0.4vw), 1.28rem)] leading-[1.55] text-ink/80">
            The first tool that grades a reel against the brain networks that
            decide what gets shared. <span className="serif-italic">lucid:v2</span>{" "}
            runs your Instagram reels through a foundation model trained on{" "}
            <span className="mono text-[0.95em]">1,000+ hours</span> of real
            fMRI brain scans. Reward, emotion, attention, memory. Each scored
            every second.
          </p>
          <p className="mono mt-5 max-w-[52ch] text-[0.68rem] uppercase tracking-[0.24em] text-muted">
            <a
              href="https://ai.meta.com/research/publications/a-foundation-model-of-vision-audition-and-language-for-in-silico-neuroscience/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-[5px] hover:text-viral"
            >
              Meta AI, 2024 · foundation model for in-silico neuroscience ↗
            </a>
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-cream transition hover:bg-viral"
            >
              <span className="mono text-[0.82rem] uppercase tracking-[0.22em]">
                {primaryLabel}
              </span>
              <span aria-hidden>→</span>
            </Link>
            <Link
              href={secondaryHref}
              className="mono inline-flex items-center gap-2 text-[0.82rem] uppercase tracking-[0.22em] text-ink/75 hover:text-viral"
            >
              <span className="underline underline-offset-[6px]">
                {secondaryLabel}
              </span>
            </Link>
          </div>
        </div>

        <aside
          className="col-span-12 lg:col-span-3 lg:self-end hero-rise hero-rise-delay"
        >
          <div className="rule-top pt-6">
            <div className="mono mb-3 text-[0.68rem] uppercase tracking-[0.28em] text-muted">
              Live neuro score
            </div>
            <div className="flex items-end gap-4">
              <div
                className="serif text-viral"
                style={{ fontSize: "clamp(4.5rem, calc(2rem + 5vw), 7rem)", lineHeight: 0.9 }}
              >
                7.8
              </div>
              <div className="pb-3">
                <div className="mono text-[0.7rem] uppercase tracking-[0.2em] text-ink/70">
                  high viral
                </div>
                <div className="mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                  potential
                </div>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1.5">
              {(
                [
                  ["Reward", "8.4", "text-brain-red"],
                  ["Emotion", "7.1", "text-brain-amber"],
                  ["Attention", "8.0", "text-brain-cyan"],
                  ["Memory", "6.9", "text-brain-violet"],
                ] as const
              ).map(([label, value, toneClass]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between border-b border-ink/10 pb-1"
                >
                  <dt className="mono text-[0.68rem] uppercase tracking-[0.2em] text-ink/60">
                    {label}
                  </dt>
                  <dd className={`mono text-[0.82rem] ${toneClass}`}>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mono mt-6 flex items-baseline justify-between text-[0.58rem] uppercase tracking-[0.22em]">
              <span className="text-ink/70">Activation signature</span>
              <span className="text-muted">Apr 11 · R1</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
