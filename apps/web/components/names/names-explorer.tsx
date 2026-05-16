"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { HebrewName, HebrewNameCategory } from "@bible-visualizer/bible-data";
import { cn } from "@/lib/utils";
import { NameCard } from "@/components/names/name-card";

const CATEGORY_LABELS: Record<HebrewNameCategory, string> = {
  patriarch: "Patriarchs",
  matriarch: "Matriarchs",
  "tribe-head": "Tribes",
  judge: "Judges",
  king: "Kings",
  prophet: "Prophets",
  priest: "Priests",
  leader: "Leaders",
  apostle: "Apostles",
  disciple: "Disciples",
  messianic: "Messianic",
  place: "Places",
  other: "Other",
};

const CATEGORY_ORDER: HebrewNameCategory[] = [
  "patriarch",
  "matriarch",
  "tribe-head",
  "leader",
  "priest",
  "judge",
  "king",
  "prophet",
  "messianic",
  "apostle",
  "disciple",
  "place",
  "other",
];

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

interface NamesExplorerProps {
  names: HebrewName[];
}

export function NamesExplorer({ names }: NamesExplorerProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<HebrewNameCategory | null>(null);

  const categoryCounts = useMemo(() => {
    const counts = new Map<HebrewNameCategory, number>();
    for (const n of names) {
      counts.set(n.category, (counts.get(n.category) ?? 0) + 1);
    }
    return counts;
  }, [names]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return names.filter((n) => {
      if (activeCategory && n.category !== activeCategory) return false;
      if (!q) return true;
      // Search the easy/Latin-script fields (transliteration, English, gloss).
      // Hebrew chars are also included so a copy/paste of yod-heh-vav-heh finds YHWH-compounds.
      const haystack = [
        n.englishName,
        n.transliteration,
        n.meaning,
        n.hebrew,
        ...(n.alternateEnglish ?? []),
        ...n.segments.map((s) => `${s.transliteration} ${s.gloss}`),
      ]
        .filter(Boolean)
        .join(" ");
      return normalize(haystack).includes(q);
    });
  }, [names, query, activeCategory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative w-full max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, meaning, or morpheme…"
            className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Search Hebrew names"
          />
        </label>
        <div className="text-xs text-muted-foreground font-mono tabular-nums">
          {filtered.length} of {names.length}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Filter
        </span>
        <CategoryChip
          label="All"
          count={names.length}
          active={!activeCategory}
          onClick={() => setActiveCategory(null)}
        />
        {CATEGORY_ORDER.filter((c) => categoryCounts.get(c)).map((cat) => (
          <CategoryChip
            key={cat}
            label={CATEGORY_LABELS[cat]}
            count={categoryCounts.get(cat) ?? 0}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          No names match this search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => (
            <NameCard
              key={n.id}
              hebrew={n.hebrew}
              transliteration={n.transliteration}
              meaning={n.meaning}
              segments={n.segments}
              title={n.englishName}
              subtitle={
                n.alternateEnglish && n.alternateEnglish.length
                  ? n.alternateEnglish.join(" · ")
                  : undefined
              }
              rightLabel={CATEGORY_LABELS[n.category]}
              scriptureRef={n.firstOccurrence}
              notes={n.notes}
              personHref={n.personId ? `/people/${n.personId}` : undefined}
              shareId={n.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
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
      {label}
      <span className="text-[10px] text-muted-foreground">{count}</span>
    </button>
  );
}
