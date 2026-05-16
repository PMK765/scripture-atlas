"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
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

interface Era {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
  /** Anchor color used for the visual band stripe and the chip dot. */
  color: string;
}

const ERAS: Era[] = [
  { id: "primeval", label: "Primeval", startYear: -4100, endYear: -2200, color: "bg-stone-500" },
  { id: "patriarchal", label: "Patriarchs", startYear: -2100, endYear: -1700, color: "bg-amber-600" },
  { id: "exodus", label: "Exodus & Wilderness", startYear: -1446, endYear: -1406, color: "bg-red-600" },
  { id: "conquest", label: "Conquest", startYear: -1406, endYear: -1380, color: "bg-orange-600" },
  { id: "judges", label: "Judges", startYear: -1380, endYear: -1050, color: "bg-yellow-600" },
  { id: "monarchy", label: "United & Divided Monarchy", startYear: -1050, endYear: -586, color: "bg-purple-600" },
  { id: "exile", label: "Exile", startYear: -605, endYear: -538, color: "bg-slate-600" },
  { id: "return", label: "Return", startYear: -538, endYear: -432, color: "bg-teal-600" },
  { id: "intertestamental", label: "Intertestamental", startYear: -432, endYear: -5, color: "bg-zinc-500" },
  { id: "christ", label: "Christ", startYear: -5, endYear: 30, color: "bg-blue-600" },
  { id: "early-church", label: "Early Church", startYear: 30, endYear: 100, color: "bg-cyan-600" },
];

const FULL_MIN = -4100;
const FULL_MAX = 100;

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

function eventInEra(e: EventSummary, era: Era): boolean {
  const s = e.startYear ?? e.endYear;
  const en = e.endYear ?? e.startYear;
  if (s === null || en === null) return false;
  return en >= era.startYear && s <= era.endYear;
}

interface TimelineExplorerProps {
  events: EventSummary[];
}

export function TimelineExplorer({ events }: TimelineExplorerProps) {
  const [activeEraId, setActiveEraId] = useState<string | null>(null);
  const [focusedEventCode, setFocusedEventCode] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const activeEra = activeEraId ? ERAS.find((e) => e.id === activeEraId) ?? null : null;

  const viewMin = activeEra
    ? activeEra.startYear - Math.max(20, Math.round((activeEra.endYear - activeEra.startYear) * 0.05))
    : FULL_MIN;
  const viewMax = activeEra
    ? activeEra.endYear + Math.max(20, Math.round((activeEra.endYear - activeEra.startYear) * 0.05))
    : FULL_MAX;

  const eraCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const era of ERAS) {
      counts.set(era.id, events.filter((e) => eventInEra(e, era)).length);
    }
    return counts;
  }, [events]);

  const filtered = useMemo(() => {
    if (!activeEra) return events;
    return events.filter((e) => eventInEra(e, activeEra));
  }, [events, activeEra]);

  const datedEvents = useMemo(
    () => events.filter((e): e is EventSummary => e.startYear !== null || e.endYear !== null),
    [events],
  );

  const focusedEvent = focusedEventCode
    ? events.find((e) => e.code === focusedEventCode) ?? null
    : null;

  useEffect(() => {
    if (!focusedEventCode) return;
    function onClickAway(ev: MouseEvent) {
      const target = ev.target as Node | null;
      if (popoverRef.current && target && !popoverRef.current.contains(target)) {
        if (target instanceof Element && target.closest("[data-timeline-dot]")) return;
        setFocusedEventCode(null);
      }
    }
    function onEsc(ev: KeyboardEvent) {
      if (ev.key === "Escape") setFocusedEventCode(null);
    }
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onEsc);
    };
  }, [focusedEventCode]);

  const yearToPercent = (y: number): number => {
    return ((y - viewMin) / (viewMax - viewMin)) * 100;
  };

  const visibleDots = datedEvents.filter((e) => {
    const y = e.startYear ?? e.endYear;
    if (y === null) return false;
    return y >= viewMin && y <= viewMax;
  });

  const focusedPct =
    focusedEvent && (focusedEvent.startYear !== null || focusedEvent.endYear !== null)
      ? yearToPercent((focusedEvent.startYear ?? focusedEvent.endYear) as number)
      : null;

  const tickYears = useMemo(() => buildTicks(viewMin, viewMax), [viewMin, viewMax]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <div className="space-y-0.5">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {activeEra ? activeEra.label : "All time"}
            </p>
            <p className="font-serif text-xl font-medium tracking-tight text-ink">
              {formatYear(viewMin)} <span className="text-muted-foreground">→</span>{" "}
              {formatYear(viewMax)}
            </p>
          </div>
          {activeEra ? (
            <button
              type="button"
              onClick={() => {
                setActiveEraId(null);
                setFocusedEventCode(null);
              }}
              className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Show all eras
            </button>
          ) : null}
        </div>

        <div className="relative h-24 w-full">
          <div className="absolute inset-x-0 top-0 h-7 overflow-hidden rounded-sm">
            {ERAS.map((era) => {
              const left = yearToPercent(Math.max(era.startYear, viewMin));
              const right = yearToPercent(Math.min(era.endYear, viewMax));
              if (right < 0 || left > 100) return null;
              const width = Math.max(0.4, right - left);
              const isActive = activeEraId === era.id;
              const dim = activeEraId && !isActive;
              return (
                <button
                  key={era.id}
                  type="button"
                  onClick={() => {
                    setActiveEraId(isActive ? null : era.id);
                    setFocusedEventCode(null);
                  }}
                  className={cn(
                    "absolute top-0 h-full cursor-pointer transition-all",
                    era.color,
                    isActive ? "opacity-90" : dim ? "opacity-20" : "opacity-50 hover:opacity-80",
                  )}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${era.label}: ${formatYear(era.startYear)} – ${formatYear(era.endYear)}`}
                  aria-label={`Zoom to ${era.label}`}
                />
              );
            })}
          </div>

          <div className="absolute inset-x-0 top-12 h-px bg-border" />

          <div className="absolute inset-x-0 top-9 h-7">
            {visibleDots.map((e) => {
              const y = e.startYear ?? e.endYear;
              if (y === null) return null;
              const pct = yearToPercent(y);
              const isFocused = focusedEventCode === e.code;
              return (
                <button
                  key={e.code}
                  type="button"
                  data-timeline-dot
                  onClick={() => setFocusedEventCode(isFocused ? null : e.code)}
                  className="absolute -translate-x-1/2 cursor-pointer"
                  style={{ left: `${pct}%`, top: "0" }}
                  aria-label={`${e.name} (${formatRange(e.startYear, e.endYear) ?? "undated"})`}
                  title={`${e.name} · ${formatRange(e.startYear, e.endYear)}`}
                >
                  <span
                    className={cn(
                      "block rounded-full border-2 border-background transition-all",
                      isFocused
                        ? "h-4 w-4 shadow-md ring-2 ring-primary"
                        : "h-3 w-3 ring-1 ring-foreground/30 hover:scale-150",
                      e.category ? CATEGORY_COLORS[e.category] ?? "bg-muted-foreground" : "bg-muted-foreground",
                    )}
                  />
                </button>
              );
            })}
          </div>

          <div className="absolute inset-x-0 bottom-0 flex h-3 items-end">
            {tickYears.map((t, i) => {
              const pct = yearToPercent(t);
              if (pct < 0 || pct > 100) return null;
              return (
                <span
                  key={`${t}-${i}`}
                  className="absolute -translate-x-1/2 font-mono text-[10px] tabular-nums text-muted-foreground"
                  style={{ left: `${pct}%` }}
                >
                  {formatYear(t)}
                </span>
              );
            })}
          </div>
        </div>

        {focusedEvent && focusedPct !== null ? (
          <div
            ref={popoverRef}
            className="relative z-10 mt-4 max-w-md rounded-lg border border-primary/30 bg-card p-4 shadow-md"
            style={{
              marginLeft: `clamp(0%, calc(${focusedPct}% - 12rem), calc(100% - 24rem))`,
            }}
          >
            <button
              type="button"
              onClick={() => setFocusedEventCode(null)}
              className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-2 pr-7">
              {focusedEvent.category ? (
                <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      CATEGORY_COLORS[focusedEvent.category] ?? "bg-muted",
                    )}
                    aria-hidden
                  />
                  {CATEGORY_LABELS[focusedEvent.category] ?? focusedEvent.category}
                </span>
              ) : null}
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {formatRange(focusedEvent.startYear, focusedEvent.endYear) ?? "Undated"}
              </span>
            </div>
            <h3 className="mt-1 font-serif text-lg font-medium tracking-tight text-ink">
              {focusedEvent.name}
            </h3>
            {focusedEvent.description ? (
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {focusedEvent.description}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]">
              {focusedEvent.scriptureReferences.length > 0 ? (
                <span className="text-muted-foreground">
                  <span className="font-medium uppercase tracking-wider text-muted-foreground/70">
                    Refs:
                  </span>{" "}
                  <span className="text-foreground/80">
                    {focusedEvent.scriptureReferences.slice(0, 2).join("; ")}
                    {focusedEvent.scriptureReferences.length > 2 ? "…" : ""}
                  </span>
                </span>
              ) : null}
              <a
                href={`#event-${focusedEvent.code}`}
                onClick={() => setFocusedEventCode(null)}
                className="ml-auto inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
              >
                Read more ↓
              </a>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Era
        </span>
        <button
          type="button"
          onClick={() => {
            setActiveEraId(null);
            setFocusedEventCode(null);
          }}
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs transition-colors",
            !activeEraId
              ? "border-primary bg-primary/15 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          All time{" "}
          <span className="ml-1.5 text-[10px] text-muted-foreground">{events.length}</span>
        </button>
        {ERAS.map((era) => {
          const count = eraCounts.get(era.id) ?? 0;
          if (count === 0) return null;
          const isActive = activeEraId === era.id;
          return (
            <button
              key={era.id}
              type="button"
              onClick={() => {
                setActiveEraId(isActive ? null : era.id);
                setFocusedEventCode(null);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                isActive
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", era.color)} aria-hidden />
              {era.label}
              <span className="text-[10px] text-muted-foreground">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="text-xs text-muted-foreground">
        Showing {filtered.length} of {events.length} events
        {activeEra ? ` from the ${activeEra.label} era` : ""}.
      </div>

      <ol className="space-y-3">
        {filtered.map((e) => (
          <li
            key={e.code}
            id={`event-${e.code}`}
            className={cn(
              "rounded-lg border bg-card p-5 transition-colors",
              focusedEventCode === e.code
                ? "border-primary/50 ring-1 ring-primary/20"
                : "hover:border-primary/30",
            )}
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
                <h3 className="font-serif text-lg font-medium tracking-tight text-ink">
                  {e.name}
                </h3>
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

/**
 * Build a small set of evenly-distributed year tick labels for the visible
 * range. Picks a step size that yields ~5–7 ticks regardless of range width.
 */
function buildTicks(min: number, max: number): number[] {
  const span = max - min;
  const targetCount = 6;
  const rough = span / targetCount;
  const candidates = [10, 25, 50, 100, 250, 500, 1000];
  const step = candidates.find((c) => c >= rough) ?? 1000;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let y = start; y <= max; y += step) {
    ticks.push(y);
  }
  return ticks;
}
