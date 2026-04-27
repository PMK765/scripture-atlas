import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { EventSummary } from "@/lib/timeline-queries";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  primeval: "Primeval",
  patriarchal: "Patriarchs",
  exodus: "Exodus",
  conquest: "Conquest",
  judges: "Judges",
  monarchy: "Monarchy",
  exile: "Exile",
  return: "Return",
  intertestamental: "Intertestamental",
  christ: "Christ",
  "early-church": "Early Church",
};

const CATEGORY_COLORS: Record<string, string> = {
  primeval: "bg-stone-500",
  patriarchal: "bg-amber-600",
  exodus: "bg-red-600",
  conquest: "bg-orange-600",
  judges: "bg-yellow-600",
  monarchy: "bg-purple-600",
  exile: "bg-slate-600",
  return: "bg-teal-600",
  intertestamental: "bg-zinc-500",
  christ: "bg-blue-600",
  "early-church": "bg-cyan-600",
};

function formatYear(y: number): string {
  if (y < 0) return `${Math.abs(y)} BC`;
  if (y === 0) return "1 BC";
  return `AD ${y}`;
}

interface TimelinePreviewProps {
  events: EventSummary[];
}

const SPOTLIGHT_CODES = [
  "call-of-abraham",
  "exodus",
  "davidic-covenant",
  "fall-of-jerusalem-586",
  "birth-of-christ",
  "crucifixion",
  "pentecost",
  "fall-of-jerusalem-70",
];

export function TimelinePreview({ events }: TimelinePreviewProps) {
  const byCode = new Map(events.map((e) => [e.code, e]));
  const spotlight = SPOTLIGHT_CODES.map((c) => byCode.get(c)).filter(
    (e): e is EventSummary => e !== undefined,
  );

  return (
    <section id="timeline" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Chronology
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">Timeline</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Major events from the patriarchs to the apostolic age, dated where scripture or
            traditional chronology supplies a year. {events.length} events curated so far.
          </p>
        </div>
        <Link
          href="/timeline"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Open timeline <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {spotlight.map((e) => (
          <li
            key={e.code}
            className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/30"
          >
            <div className="flex items-center gap-1.5">
              {e.category ? (
                <>
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      CATEGORY_COLORS[e.category] ?? "bg-muted",
                    )}
                    aria-hidden
                  />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {CATEGORY_LABELS[e.category] ?? e.category}
                  </span>
                </>
              ) : null}
            </div>
            <h3 className="mt-1.5 text-sm font-semibold tracking-tight">{e.name}</h3>
            <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
              {e.startYear !== null ? formatYear(e.startYear) : "Undated"}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
