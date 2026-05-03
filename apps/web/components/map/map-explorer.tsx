"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Info, Search, X } from "lucide-react";
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

const REGION_COLORS: Record<string, string> = {
  judah: "#a78bfa",
  galilee: "#34d399",
  samaria: "#fbbf24",
  ephraim: "#fbbf24",
  negev: "#f87171",
  sinai: "#fb923c",
  egypt: "#facc15",
  mesopotamia: "#60a5fa",
  aram: "#22d3ee",
  phoenicia: "#06b6d4",
  philistia: "#f472b6",
  edom: "#f87171",
  moab: "#fb7185",
  ammon: "#fda4af",
  greece: "#a3e635",
  italy: "#84cc16",
  "asia-minor": "#10b981",
  syria: "#22d3ee",
};

const ERA_ORDER: ReadonlyArray<{ key: string; label: string; hint: string }> = [
  { key: "primeval", label: "Primeval", hint: "Genesis 1–11" },
  { key: "patriarchal", label: "Patriarchs", hint: "Abraham → Joseph" },
  { key: "exodus", label: "Exodus", hint: "Egypt + wilderness" },
  { key: "conquest", label: "Conquest", hint: "Joshua" },
  { key: "judges", label: "Judges", hint: "Pre-monarchy" },
  { key: "monarchy", label: "Monarchy", hint: "Saul → exile" },
  { key: "prophets", label: "Prophets", hint: "Writing prophets" },
  { key: "exile", label: "Exile", hint: "Babylon" },
  { key: "return", label: "Return", hint: "Persian period" },
  { key: "intertestamental", label: "Intertestamental", hint: "400-year silence" },
  { key: "christ", label: "Christ", hint: "Gospels" },
  { key: "early-church", label: "Early church", hint: "Acts + epistles" },
];

const LIST_PAGE_SIZE = 60;

type Tier = "curated" | "major" | "all";

interface TierMeta {
  key: Tier;
  label: string;
  description: string;
}

const TIERS: ReadonlyArray<TierMeta> = [
  {
    key: "curated",
    label: "Curated only",
    description: "Hand-picked, hand-described places.",
  },
  {
    key: "major",
    label: "Curated + major",
    description: "Adds well-known imported places (consensus identification + named in many verses).",
  },
  {
    key: "all",
    label: "All",
    description: "Includes every imported place — minor sites, debated identifications, single mentions.",
  },
];

function placeMatchesTier(p: PlaceSummary, tier: Tier): boolean {
  if (tier === "all") return true;
  if (!p.isStub) return true;
  if (tier === "major") return p.prominence === "major";
  return false;
}

function placeMatchesSearch(p: PlaceSummary, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (p.name.toLowerCase().includes(q)) return true;
  if (p.modernEquivalent?.toLowerCase().includes(q)) return true;
  if (p.region?.toLowerCase().includes(q)) return true;
  if (p.description?.toLowerCase().includes(q)) return true;
  for (const alt of p.alternateNames) {
    if (alt.toLowerCase().includes(q)) return true;
  }
  return false;
}

interface MapExplorerProps {
  places: PlaceSummary[];
}

export function MapExplorer({ places }: MapExplorerProps) {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeEra, setActiveEra] = useState<string | null>(null);
  const [tier, setTier] = useState<Tier>("major");
  const [search, setSearch] = useState("");
  const [listLimit, setListLimit] = useState(LIST_PAGE_SIZE);

  const tierCounts = useMemo(() => {
    let curated = 0;
    let majorImported = 0;
    let notableImported = 0;
    let minorImported = 0;
    for (const p of places) {
      if (!p.isStub) {
        curated += 1;
      } else if (p.prominence === "major") {
        majorImported += 1;
      } else if (p.prominence === "notable") {
        notableImported += 1;
      } else {
        minorImported += 1;
      }
    }
    return {
      curated,
      majorImported,
      notableImported,
      minorImported,
      curatedTotal: curated,
      majorTotal: curated + majorImported,
      allTotal: curated + majorImported + notableImported + minorImported,
    };
  }, [places]);

  const visiblePlaces = useMemo(
    () => places.filter((p) => placeMatchesTier(p, tier)),
    [places, tier],
  );

  const regionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of visiblePlaces) {
      if (p.region) counts.set(p.region, (counts.get(p.region) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [visiblePlaces]);

  const eraCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of visiblePlaces) {
      for (const c of p.eventCategories) {
        counts.set(c, (counts.get(c) ?? 0) + 1);
      }
    }
    return counts;
  }, [visiblePlaces]);

  const placesUntagged = useMemo(
    () => visiblePlaces.filter((p) => p.eventCategories.length === 0).length,
    [visiblePlaces],
  );

  const trimmedSearch = search.trim();

  const filteredPlaces = useMemo(() => {
    return visiblePlaces.filter((p) => {
      if (activeRegion && p.region !== activeRegion) return false;
      if (activeEra && !p.eventCategories.includes(activeEra)) return false;
      if (trimmedSearch && !placeMatchesSearch(p, trimmedSearch)) return false;
      return true;
    });
  }, [visiblePlaces, activeRegion, activeEra, trimmedSearch]);

  const visibleListPlaces = useMemo(
    () => filteredPlaces.slice(0, listLimit),
    [filteredPlaces, listLimit],
  );

  const tierTotal: Record<Tier, number> = {
    curated: tierCounts.curatedTotal,
    major: tierCounts.majorTotal,
    all: tierCounts.allTotal,
  };

  const activeTierMeta = TIERS.find((t) => t.key === tier) ?? TIERS[0];

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-lg border bg-card/40 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Show
          </span>
          <div className="inline-flex overflow-hidden rounded-md border bg-background">
            {TIERS.map((t) => {
              const active = tier === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setTier(t.key);
                    setListLimit(LIST_PAGE_SIZE);
                  }}
                  title={t.description}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {t.label}
                  <span
                    className={cn(
                      "ml-1.5 rounded-sm px-1 text-[10px] font-mono",
                      active ? "bg-white/15" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tierTotal[t.key].toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="ml-auto flex min-w-[200px] flex-1 items-center gap-2 rounded-md border bg-background px-2 py-1.5 sm:max-w-xs">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setListLimit(LIST_PAGE_SIZE);
              }}
              placeholder="Search by name, modern equivalent, region…"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
              aria-label="Search places"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        </div>
        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
          <span>
            <span className="text-foreground">{activeTierMeta?.label}:</span>{" "}
            {activeTierMeta?.description}{" "}
            {tier !== "curated" ? (
              <>
                Imported places come from{" "}
                <Link
                  href="/sources"
                  className="font-medium underline-offset-2 hover:underline"
                >
                  Open Bible Info
                </Link>{" "}
                — best-effort scholarly identifications, not scripture-anchored.
              </>
            ) : null}
          </span>
        </p>
        <p className="text-[10px] text-muted-foreground/80">
          Of {tierCounts.allTotal.toLocaleString()} total: {tierCounts.curated} curated +{" "}
          {tierCounts.majorImported} major + {tierCounts.notableImported} notable +{" "}
          {tierCounts.minorImported.toLocaleString()} minor imports.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Era
          </span>
          <button
            type="button"
            onClick={() => setActiveEra(null)}
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs transition-colors",
              !activeEra
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            All time
          </button>
          {ERA_ORDER.map((era) => {
            const count = eraCounts.get(era.key) ?? 0;
            if (count === 0) return null;
            const active = activeEra === era.key;
            return (
              <button
                key={era.key}
                type="button"
                title={era.hint}
                onClick={() => setActiveEra(active ? null : era.key)}
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs transition-colors",
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {era.label}
                <span className="ml-1.5 text-[10px] text-muted-foreground">{count}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Filters places to those connected to recorded events of that era. {placesUntagged} of{" "}
          {places.length} places have no event linkage yet — they only appear under{" "}
          <span className="text-foreground">All time</span>.
        </p>
      </div>

      <div className="space-y-2">
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
            All <span className="ml-1.5 text-[10px] text-muted-foreground">{visiblePlaces.length}</span>
          </button>
          {regionCounts.map(([region, count]) => {
            const color = REGION_COLORS[region] ?? "#94a3b8";
            const active = activeRegion === region;
            return (
              <button
                key={region}
                type="button"
                onClick={() => setActiveRegion(region === activeRegion ? null : region)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/30"
                  style={{ background: color }}
                  aria-hidden
                />
                {REGION_LABELS[region] ?? region}
                <span className="text-[10px] text-muted-foreground">{count}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Marker color shows the region the place sits in.
        </p>
      </div>

      {(activeRegion || activeEra) && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Active:</span>
          {activeEra ? (
            <button
              type="button"
              onClick={() => setActiveEra(null)}
              className="inline-flex items-center gap-1 rounded-full border bg-card px-2 py-0.5 hover:border-destructive/50"
            >
              {ERA_ORDER.find((e) => e.key === activeEra)?.label ?? activeEra} ×
            </button>
          ) : null}
          {activeRegion ? (
            <button
              type="button"
              onClick={() => setActiveRegion(null)}
              className="inline-flex items-center gap-1 rounded-full border bg-card px-2 py-0.5 hover:border-destructive/50"
            >
              {REGION_LABELS[activeRegion] ?? activeRegion} ×
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setActiveRegion(null);
              setActiveEra(null);
            }}
            className="ml-1 underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      <PlacesMap
        places={filteredPlaces}
        activeRegion={activeRegion}
        fitKey={`${activeEra ?? "any-era"}|${activeRegion ?? "any-region"}`}
      />

      <div>
        <h2 className="mb-3 text-base font-semibold tracking-tight">
          {filteredPlaces.length} place{filteredPlaces.length === 1 ? "" : "s"}
          {activeRegion ? ` in ${REGION_LABELS[activeRegion] ?? activeRegion}` : ""}
          {activeEra
            ? ` during the ${ERA_ORDER.find((e) => e.key === activeEra)?.label ?? activeEra} era`
            : ""}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleListPlaces.map((p) => (
            <li
              key={p.code}
              className={cn(
                "rounded-lg border bg-card p-4 transition-colors hover:border-primary/30",
                p.isStub && "border-dashed bg-card/50",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <Link
                  href={`/places/${p.code}`}
                  className="text-sm font-semibold tracking-tight hover:text-primary"
                >
                  {p.name}
                </Link>
                <div className="flex shrink-0 items-center gap-1.5">
                  {p.isStub ? (
                    <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                      stub
                    </span>
                  ) : null}
                  {p.region ? (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {REGION_LABELS[p.region] ?? p.region}
                    </span>
                  ) : null}
                </div>
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
        {filteredPlaces.length > listLimit ? (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setListLimit((n) => n + LIST_PAGE_SIZE)}
              className="rounded-md border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Show {Math.min(LIST_PAGE_SIZE, filteredPlaces.length - listLimit)} more · {filteredPlaces.length - listLimit} remaining
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
