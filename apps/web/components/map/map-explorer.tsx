"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { PlaceSummary } from "@/lib/place-queries";

const PlacesMap = dynamic(
  () => import("@/components/map/places-map").then((mod) => mod.PlacesMap),
  { ssr: false, loading: () => <div className="h-[600px] animate-pulse rounded-lg border bg-muted/30" /> },
);

const REGION_LABELS: Record<string, string> = {
  judah: "Judah",
  galilee: "Galilee",
  samaria: "Samaria",
  ephraim: "Ephraim",
  negev: "Negev",
  sinai: "Sinai",
  egypt: "Egypt",
  mesopotamia: "Mesopotamia",
  aram: "Aram (Syria)",
  phoenicia: "Phoenicia",
  philistia: "Philistia",
  edom: "Edom",
  moab: "Moab",
  ammon: "Ammon",
  greece: "Greece",
  italy: "Italy",
  "asia-minor": "Asia Minor",
  syria: "Syria",
};

interface MapExplorerProps {
  places: PlaceSummary[];
}

export function MapExplorer({ places }: MapExplorerProps) {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const regionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of places) {
      if (p.region) counts.set(p.region, (counts.get(p.region) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [places]);

  const visiblePlaces = useMemo(
    () => (activeRegion ? places.filter((p) => p.region === activeRegion) : places),
    [places, activeRegion],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Region
        </span>
        <button
          type="button"
          onClick={() => setActiveRegion(null)}
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs transition-colors",
            !activeRegion
              ? "border-primary bg-primary/15 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          All <span className="ml-1.5 text-[10px] text-muted-foreground">{places.length}</span>
        </button>
        {regionCounts.map(([region, count]) => (
          <button
            key={region}
            type="button"
            onClick={() => setActiveRegion(region === activeRegion ? null : region)}
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs transition-colors",
              activeRegion === region
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {REGION_LABELS[region] ?? region}
            <span className="ml-1.5 text-[10px] text-muted-foreground">{count}</span>
          </button>
        ))}
      </div>

      <PlacesMap places={places} activeRegion={activeRegion} />

      <div>
        <h2 className="mb-3 text-base font-semibold tracking-tight">
          {visiblePlaces.length} place{visiblePlaces.length === 1 ? "" : "s"}
          {activeRegion ? ` in ${REGION_LABELS[activeRegion] ?? activeRegion}` : ""}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePlaces.map((p) => (
            <li
              key={p.code}
              className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex items-baseline justify-between gap-2">
                <Link
                  href={`/places/${p.code}`}
                  className="text-sm font-semibold tracking-tight hover:text-primary"
                >
                  {p.name}
                </Link>
                {p.region ? (
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {REGION_LABELS[p.region] ?? p.region}
                  </span>
                ) : null}
              </div>
              {p.modernEquivalent ? (
                <p className="mt-1 text-xs text-muted-foreground">{p.modernEquivalent}</p>
              ) : null}
              {p.description ? (
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
