import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProphecySummary } from "@/lib/prophecy-queries";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  lineage: "Lineage",
  birth: "Birth",
  ministry: "Ministry",
  betrayal: "Betrayal",
  suffering: "Suffering",
  death: "Death",
  resurrection: "Resurrection",
  exaltation: "Exaltation",
  kingdom: "Kingdom",
  "second-coming": "Second coming",
};

const CATEGORY_COLORS: Record<string, string> = {
  lineage: "bg-amber-600",
  birth: "bg-yellow-500",
  ministry: "bg-cyan-600",
  betrayal: "bg-orange-600",
  suffering: "bg-rose-600",
  death: "bg-red-700",
  resurrection: "bg-emerald-600",
  exaltation: "bg-blue-600",
  kingdom: "bg-purple-600",
  "second-coming": "bg-indigo-600",
};

const SPOTLIGHT_CODES = [
  "born-of-a-virgin",
  "born-in-bethlehem",
  "triumphal-entry-on-donkey",
  "thirty-pieces-of-silver",
  "hands-and-feet-pierced",
  "no-bones-broken",
  "buried-with-the-rich",
  "resurrection",
];

interface ProphecyPreviewProps {
  prophecies: ProphecySummary[];
}

export function ProphecyPreview({ prophecies }: ProphecyPreviewProps) {
  const byCode = new Map(prophecies.map((p) => [p.code, p]));
  const spotlight = SPOTLIGHT_CODES.map((c) => byCode.get(c)).filter(
    (p): p is ProphecySummary => p !== undefined,
  );

  if (spotlight.length === 0) return null;

  return (
    <section id="prophecies" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="verse-marker">Promise & fulfillment</span>
          <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Every prophecy, <span className="italic text-gradient-primary">cited</span>.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Old Testament prophecies and the New Testament passages that record their
            fulfillment. {prophecies.length} curated so far — starting with the messianic
            prophecies fulfilled in Christ.
          </p>
        </div>
        <Link
          href="/prophecies"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Open prophecies <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {spotlight.map((p) => (
          <li key={p.code}>
            <Link
              href={`/prophecies#${p.code}`}
              className="block h-full rounded-lg border bg-card p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center gap-1.5">
                {p.category ? (
                  <>
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        CATEGORY_COLORS[p.category] ?? "bg-muted",
                      )}
                      aria-hidden
                    />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {CATEGORY_LABELS[p.category] ?? p.category}
                    </span>
                  </>
                ) : null}
              </div>
              <h3 className="mt-1.5 font-serif text-base font-medium tracking-tight text-ink">
                {p.title}
              </h3>
              <p className="mt-2 font-mono text-[10px] tabular-nums leading-relaxed text-muted-foreground">
                {p.prophecyRef}
                {p.fulfillmentRef ? (
                  <>
                    <span className="mx-1.5 text-primary/70">→</span>
                    {p.fulfillmentRef.split(";")[0]}
                  </>
                ) : null}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
