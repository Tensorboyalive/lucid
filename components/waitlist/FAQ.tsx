/**
 * Editorial FAQ for /waitlist. Five questions every visitor asks before
 * handing over an email, answered in the voice of the rest of the site.
 *
 * Implementation uses native `<details>`/`<summary>` so the whole block
 * progressively enhances — open/close works with JS off, it prints
 * sensibly, screen readers announce state, and we get keyboard support
 * for free. Styling is custom so it still reads editorial, not OS-default.
 */
const FAQ_ITEMS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "What does lucid actually do?",
    a: "We run your Instagram reel through a foundation model trained on 1,000+ hours of real fMRI brain scans. You get a 0–10 score across four networks — reward, emotion, attention, memory — frame by frame, plus the exact moment where the brain went dark and why.",
  },
  {
    q: "Is my reel private?",
    a: "Yes. Videos are processed and discarded. We persist the numerical scores and the rewritten scripts you ask for — never the video bytes. Your content is never used to train anyone's model, ours included.",
  },
  {
    q: "When does access open?",
    a: "In waves. The first 100 seats open in small cohorts so we can watch feedback and fix the rough edges before you ever hit one. You'll get a single email when your wave opens. No drip sequence. No newsletter.",
  },
  {
    q: "What's it going to cost?",
    a: "$29/month for the creator who ships weekly. $99/month for an agency running a roster. Everyone on this list gets locked-in launch pricing for the first year — even if we raise the price publicly.",
  },
  {
    q: "Do you sell my email?",
    a: "No. The list stays with us. One email when it's your turn, one more when the product goes live, that's it. Unsubscribe takes one click.",
  },
];

export function FAQ() {
  return (
    <div className="flex flex-col gap-2">
      <div className="mono flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.28em] text-muted">
        <span className="inline-block h-[1px] w-8 bg-muted/60" />
        <span>the honest answers</span>
      </div>
      <h2
        className="serif mt-4 leading-[0.95]"
        style={{ fontSize: "clamp(2rem, calc(1rem + 2vw), 3.2rem)" }}
      >
        Questions you were going to ask.
      </h2>
      <ul className="mt-10 flex flex-col gap-2">
        {FAQ_ITEMS.map(({ q, a }) => (
          <li key={q}>
            <details className="group border-b border-ink/15 py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 text-left">
                <span
                  className="serif leading-[1.15] text-ink"
                  style={{
                    fontSize: "clamp(1.15rem, calc(0.9rem + 0.6vw), 1.55rem)",
                  }}
                >
                  {q}
                </span>
                <span
                  aria-hidden
                  className="mono shrink-0 text-[0.78rem] uppercase tracking-[0.24em] text-muted transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-[62ch] text-[1rem] leading-[1.6] text-ink/75">
                {a}
              </p>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
