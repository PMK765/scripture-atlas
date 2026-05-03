"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EventSummary } from "@/lib/timeline-queries";

const CATEGORY_LABELS: Record<string, string> = {
  primeval: "Primeval",
  patriarchal: "Patriarchs",
  exodus: "Exodus",
  conquest: "Conquest",
  judges: "Judges",
  monarchy: "Monarchy",
  prophets: "Prophets",
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
  prophets: "bg-fuchsia-600",
  exile: "bg-slate-600",
  return: "bg-teal-600",
  intertestamental: "bg-zinc-500",
  christ: "bg-blue-600",
  "early-church": "bg-cyan-600",
};

interface EraBand {
  category: string;
  label: string;
  startYear: number;
  endYear: number;
}

const ERA_BANDS: EraBand[] = [
  { category: "patriarchal", label: "Patriarchs", startYear: -2100, endYear: -1700 },
  { category: "exodus", label: "Exodus & Wilderness", startYear: -1446, endYear: -1406 },
  { category: "conquest", label: "Conquest", startYear: -1406, endYear: -1399 },
  { category: "judges", label: "Judges", startYear: -1380, endYear: -1050 },
  { category: "monarchy", label: "United & Divided Monarchy", startYear: -1050, endYear: -586 },
  { category: "exile", label: "Exile", startYear: -605, endYear: -538 },
  { category: "return", label: "Return", startYear: -538, endYear: -432 },
  { category: "intertestamental", label: "Intertestamental", startYear: -432, endYear: -5 },
  { category: "christ", label: "Christ", startYear: -5, endYear: 30 },
  { category: "early-church", label: "Early Church", startYear: 30, endYear: 100 },
];

function formatYear(y: number): string {
  if (y < 0) return `${Math.abs(y)} BC`;
  if (y === 0) return "1 BC";
  return `AD ${y}`;
}

function formatRange(start: number | null, end: number | null): string | null {
  if (start === null && end === null) return null;
  if (start !== null && end !== null && start !== end) {
    return `${formatYear(start)} – ${formatYear(end)}`;
  }
  return formatYear((start ?? end) as number);
}

interface TimelineExplorerProps {
  events: EventSummary[];
}

export function TimelineExplorer({ events }: TimelineExplorerProps) {
  const minYear = -2200;
  const maxYear = 100;
  const [rangeStart, setRangeStart] = useState(minYear);
  const [rangeEnd, setRangeEnd] = useState(maxYear);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of events) {
      if (e.category) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
    }
    return counts;
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (activeCategory && e.category !== activeCategory) return false;
      const s = e.startYear ?? e.endYear;
      const ee = e.endYear ?? e.startYear;
      if (s === null || ee === null) {
        return rangeStart === minYear && rangeEnd === maxYear && !activeCategory;
      }
      return ee >= rangeStart && s <= rangeEnd;
    });
  }, [events, rangeStart, rangeEnd, activeCategory]);

  const datedEvents = events.filter(
    (e): e is EventSummary & { startYear: number } =>
      e.startYear !== null || e.endYear !== null,
  );

  const yearToPercent = (y: number): number => {
    return ((y - minYear) / (maxYear - minYear)) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-5">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Year range
            </p>
            <p className="text-base font-semibold tracking-tight">
              {formatYear(rangeStart)} <span className="text-muted-foreground">→</span>{" "}
              {formatYear(rangeEnd)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setRangeStart(minYear);
              setRangeEnd(maxYear);
              setActiveCategory(null);
            }}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Reset
          </button>
        </div>

        <div className="relative h-24 w-full">
          <div className="absolute inset-x-0 top-0 h-8">
            {ERA_BANDS.map((band) => {
              const left = yearToPercent(Math.max(band.startYear, minYear));
              const right = yearToPercent(Math.min(band.endYear, maxYear));
              const width = Math.max(0.5, right - left);
              return (
                <div
                  key={band.category + band.startYear}
                  className={cn(
                    "absolute top-0 h-full opacity-40 transition-opacity hover:opacity-70",
                    CATEGORY_COLORS[band.category] ?? "bg-muted",
                  )}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${band.label}: ${formatYear(band.startYear)} – ${formatYear(band.endYear)}`}
                />
              );
            })}
          </div>

          <div className="absolute inset-x-0 top-12 h-0.5 bg-border" />

          <div className="absolute inset-x-0 top-10 h-6">
            {datedEvents.map((e) => {
              const y = e.startYear ?? e.endYear;
              if (y === null) return null;
              const pct = yearToPercent(y);
              const inRange = y >= rangeStart && y <= rangeEnd;
              const inCategory = !activeCategory || e.category === activeCategory;
              const visible = inRange && inCategory;
              return (
                <a
                  key={e.code}
                  href={`#event-${e.code}`}
                  className={cn(
                    "absolute -translate-x-1/2 cursor-pointer transition-all",
                    visible ? "opacity-100" : "opacity-20",
                  )}
                  style={{ left: `${pct}%`, top: "0" }}
                  title={`${e.name} · ${formatRange(e.startYear, e.endYear)}`}
                >
                  <span
                    className={cn(
                      "block h-3 w-3 rounded-full border-2 border-background ring-1 ring-foreground/30 transition-transform hover:scale-150",
                      e.category ? CATEGORY_COLORS[e.category] ?? "bg-muted-foreground" : "bg-muted-foreground",
                    )}
                  />
                </a>
              );
            })}
          </div>

          <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] text-muted-foreground">
            <span>{formatYear(minYear)}</span>
            <span>{formatYear(-1500)}</span>
            <span>{formatYear(-1000)}</span>
            <span>{formatYear(-500)}</span>
            <span>1 BC / AD 1</span>
            <span>{formatYear(maxYear)}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="range-start">
              From: {formatYear(rangeStart)}
            </label>
            <input
              id="range-start"
              type="range"
              min={minYear}
              max={maxYear}
              step={10}
              value={rangeStart}
              onChange={(e) => setRangeStart(Math.min(Number(e.target.value), rangeEnd - 10))}
              className="mt-1 w-full accent-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="range-end">
              To: {formatYear(rangeEnd)}
            </label>
            <input
              id="range-end"
              type="range"
              min={minYear}
              max={maxYear}
              step={10}
              value={rangeEnd}
              onChange={(e) => setRangeEnd(Math.max(Number(e.target.value), rangeStart + 10))}
              className="mt-1 w-full accent-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Category
        </span>
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs transition-colors",
            !activeCategory
              ? "border-primary bg-primary/15 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          All <span className="ml-1.5 text-[10px] text-muted-foreground">{events.length}</span>
        </button>
        {Array.from(categoryCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([cat, count]) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                activeCategory === cat
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <span
                className={cn("h-2 w-2 rounded-full", CATEGORY_COLORS[cat] ?? "bg-muted")}
                aria-hidden
              />
              {CATEGORY_LABELS[cat] ?? cat}
              <span className="text-[10px] text-muted-foreground">{count}</span>
            </button>
          ))}
      </div>

      <div className="text-xs text-muted-foreground">
        Showing {filtered.length} of {events.length} events.
      </div>

      <ol className="space-y-3">
        {filtered.map((e) => (
          <li
            key={e.code}
            id={`event-${e.code}`}
            className="rounded-lg border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {e.category ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          CATEGORY_COLORS[e.category] ?? "bg-muted",
                        )}
                        aria-hidden
                      />
                      {CATEGORY_LABELS[e.category] ?? e.category}
                    </span>
                  ) : null}
                  {e.traditionTags?.length ? (
                    <Badge variant="outline">{e.traditionTags.join(", ")}</Badge>
                  ) : null}
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{e.name}</h3>
              </div>
              <span className="font-mono text-sm tabular-nums text-muted-foreground">
                {formatRange(e.startYear, e.endYear) ?? "Undated"}
              </span>
            </div>

            {e.description ? (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.description}</p>
            ) : null}

            {e.notes ? (
              <p className="mt-2 text-xs italic text-muted-foreground/80">{e.notes}</p>
            ) : null}

            {e.scriptureReferences.length > 0 || e.places.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                {e.scriptureReferences.length > 0 ? (
                  <div>
                    <span className="font-medium uppercase tracking-wider text-muted-foreground/70">
                      References
                    </span>
                    <span className="ml-2 text-foreground/80">
                      {e.scriptureReferences.join("; ")}
                    </span>
                  </div>
                ) : null}
                {e.places.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-medium uppercase tracking-wider text-muted-foreground/70">
                      Places
                    </span>
                    {e.places.map((p) => (
                      <Link
                        key={p.code}
                        href={`/places/${p.code}`}
                        className="inline-flex items-center rounded-full border px-2 py-0.5 hover:border-primary/40 hover:text-foreground"
                      >
                        {p.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
