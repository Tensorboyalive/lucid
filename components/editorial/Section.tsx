import { cn } from "@/lib/cn";

type Tone = "cream" | "ink" | "paper";

interface Props {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
  container?: boolean;
}

const toneClass: Record<Tone, string> = {
  cream: "bg-cream text-ink",
  paper: "bg-paper text-ink",
  ink: "bg-ink text-cream",
};

export function Section({
  children,
  tone = "cream",
  className,
  id,
  container = true,
}: Props) {
  return (
    <section
      id={id}
      className={cn(
        "relative w-full",
        toneClass[tone],
        tone === "ink" ? "grain" : "",
        className,
      )}
    >
      {container ? (
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10 lg:px-14">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
