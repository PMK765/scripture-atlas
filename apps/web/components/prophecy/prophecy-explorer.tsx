"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProphecySummary } from "@/lib/prophecy-queries";

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

const CATEGORY_ORDER = [
  "lineage",
  "birth",
  "ministry",
  "betrayal",
  "suffering",
  "death",
  "resurrection",
  "exaltation",
  "kingdom",
  "second-coming",
];

const STATUS_LABELS: Record<string, string> = {
  fulfilled: "Fulfilled",
  "partially-fulfilled": "Partially fulfilled",
  unfulfilled: "Awaiting fulfillment",
  debated: "Debated",
};

function formatYear(y: number | null): string | null {
  if (y === null) return null;
  if (y < 0) return `${Math.abs(y)} BC`;
  if (y === 0) return "1 BC";
  return `AD ${y}`;
}

function spanYears(prophecy: number | null, fulfillment: number | null): string | null {
  if (prophecy === null || fulfillment === null) return null;
  const diff = Math.abs(fulfillment - prophecy);
  if (diff === 0) return null;
  if (diff >= 1000) return `~${(diff / 1000).toFixed(1).replace(/\.0$/, "")}k years later`;
  if (diff >= 100) return `~${Math.round(diff / 10) * 10} years later`;
  return `${diff} years later`;
}

interface ProphecyExplorerProps {
  prophecies: ProphecySummary[];
}

export function ProphecyExplorer({ prophecies }: ProphecyExplorerProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of prophecies) {
      if (p.category) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    return counts;
  }, [prophecies]);

  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of prophecies) {
      counts.set(p.status, (counts.get(p.status) ?? 0) + 1);
    }
    return counts;
  }, [prophecies]);

  const filtered = useMemo(() => {
    return prophecies.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (activeStatus && p.status !== activeStatus) return false;
      return true;
    });
  }, [prophecies, activeCategory, activeStatus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Theme
        </span>
        <ChipButton
          label="All"
          count={prophecies.length}
          active={!activeCategory}
          onClick={() => setActiveCategory(null)}
        />
        {CATEGORY_ORDER.filter((c) => categoryCounts.get(c)).map((cat) => (
          <ChipButton
            key={cat}
            label={CATEGORY_LABELS[cat] ?? cat}
            count={categoryCounts.get(cat) ?? 0}
            colorDot={CATEGORY_COLORS[cat]}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Status
        </span>
        <ChipButton
          label="Any"
          count={prophecies.length}
          active={!activeStatus}
          onClick={() => setActiveStatus(null)}
        />
        {Array.from(statusCounts.entries()).map(([status, count]) => (
          <ChipButton
            key={status}
            label={STATUS_LABELS[status] ?? status}
            count={count}
            active={activeStatus === status}
            onClick={() => setActiveStatus(activeStatus === status ? null : status)}
          />
        ))}
      </div>

      <div className="text-xs text-muted-foreground">
        Showing {filtered.length} of {prophecies.length} prophecies.
      </div>

      <ol className="space-y-4">
        {filtered.map((p) => (
          <li
            key={p.code}
            className="rounded-lg border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {p.category ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          CATEGORY_COLORS[p.category] ?? "bg-muted",
                        )}
                        aria-hidden
                      />
                      {CATEGORY_LABELS[p.category] ?? p.category}
                    </span>
                  ) : null}
                  {p.status !== "fulfilled" ? (
                    <Badge variant="outline">{STATUS_LABELS[p.status] ?? p.status}</Badge>
                  ) : null}
                </div>
                <h3 className="font-serif text-xl font-medium tracking-tight text-ink">
                  {p.title}
                </h3>
              </div>
              {spanYears(p.prophecyYear, p.fulfillmentYear) ? (
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {spanYears(p.prophecyYear, p.fulfillmentYear)}
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Prophecy
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-foreground/80">
                    {p.prophecyRef}
                  </span>
                  {p.prophecyYear !== null ? (
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                      · {formatYear(p.prophecyYear)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {p.summary}
                </p>
              </div>

              <ArrowRight
                className="hidden h-4 w-4 self-center text-primary/60 sm:block"
                aria-hidden
              />

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Fulfillment
                  </span>
                  {p.fulfillmentRef ? (
                    <span className="font-mono text-[11px] tabular-nums text-foreground/80">
                      {p.fulfillmentRef}
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-muted-foreground italic">
                      pending
                    </span>
                  )}
                  {p.fulfillmentYear !== null ? (
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                      · {formatYear(p.fulfillmentYear)}
                    </span>
                  ) : null}
                </div>
                {p.fulfillmentSummary ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {p.fulfillmentSummary}
                  </p>
                ) : null}
              </div>
            </div>

            {p.notes ? (
              <p className="mt-3 text-xs italic text-muted-foreground/80">{p.notes}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ChipButton({
  label,
  count,
  colorDot,
  active,
  onClick,
}: {
  label: string;
  count: number;
  colorDot?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {colorDot ? (
        <span className={cn("h-2 w-2 rounded-full", colorDot)} aria-hidden />
      ) : null}
      {label}
      <span className="text-[10px] text-muted-foreground">{count}</span>
    </button>
  );
}
