"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { FlowCanvas } from "./flow-canvas";
import { ancestorsBfs, buildAdjacency, descendantsBfs, subgraph } from "./graph-utils";
import type { LineageEdge, LineagePerson } from "@/lib/lineage-queries";

interface ExplorerViewProps {
  people: LineagePerson[];
  edges: LineageEdge[];
  rootCode: string;
  onRootChange: (code: string) => void;
  onPersonClick?: (person: LineagePerson) => void;
}

const ROOT_PRESETS: Array<{ code: string; label: string }> = [
  { code: "adam", label: "Adam" },
  { code: "noah", label: "Noah" },
  { code: "abraham", label: "Abraham" },
  { code: "isaac", label: "Isaac" },
  { code: "jacob", label: "Jacob" },
  { code: "judah", label: "Judah" },
  { code: "moses", label: "Moses" },
  { code: "aaron", label: "Aaron" },
  { code: "david", label: "David" },
  { code: "solomon", label: "Solomon" },
  { code: "jesus-of-nazareth", label: "Jesus" },
];

const ANCESTOR_MAX = 30;
const DESCENDANT_MAX = 12;

export function ExplorerView({
  people,
  edges,
  rootCode,
  onRootChange,
  onPersonClick,
}: ExplorerViewProps) {
  const adjacency = useMemo(() => buildAdjacency(edges), [edges]);
  const peopleByCode = useMemo(
    () => new Map(people.map((p) => [p.code, p])),
    [people],
  );

  const [ancestorDepth, setAncestorDepth] = useState<number>(ANCESTOR_MAX);
  const [descendantDepth, setDescendantDepth] = useState<number>(3);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const root = peopleByCode.get(rootCode);

  const data = useMemo(() => {
    if (!root) return { people: [], edges: [] };
    const ids = new Set<string>([root.id]);
    if (descendantDepth > 0) {
      for (const id of descendantsBfs(root.id, adjacency.childrenOf, descendantDepth)) {
        ids.add(id);
      }
    }
    if (ancestorDepth > 0) {
      for (const id of ancestorsBfs(root.id, adjacency.parentsOf, ancestorDepth)) {
        ids.add(id);
      }
    }
    for (const id of [...ids]) {
      for (const sp of adjacency.spousesOf.get(id) ?? []) ids.add(sp);
    }
    return subgraph(people, edges, ids);
  }, [root, ancestorDepth, descendantDepth, adjacency, people, edges]);

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return [];
    return people
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 12);
  }, [search, people]);

  const ancestorLabel = ancestorDepth >= ANCESTOR_MAX ? "All" : ancestorDepth.toString();
  const descendantLabel = descendantDepth >= DESCENDANT_MAX ? "All" : descendantDepth.toString();

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid gap-3 rounded-lg border bg-card p-3 text-xs lg:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Root person
          </label>
          <div className="flex items-center gap-2">
            <select
              value={ROOT_PRESETS.some((r) => r.code === rootCode) ? rootCode : ""}
              onChange={(e) => {
                if (e.target.value) {
                  onRootChange(e.target.value);
                  setSearch("");
                }
              }}
              className="h-9 shrink-0 rounded-md border bg-background px-2.5 text-xs outline-none focus:border-primary/60"
            >
              <option value="">Custom…</option>
              {ROOT_PRESETS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search any of 899 people…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                className="h-9 w-full rounded-md border bg-background pl-8 pr-8 text-xs outline-none focus:border-primary/60"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
              {searchFocused && matches.length > 0 ? (
                <ul className="absolute left-0 top-10 z-20 max-h-72 w-full overflow-auto rounded-md border bg-popover p-1 shadow-lg">
                  {matches.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          onRootChange(m.code);
                          setSearch("");
                        }}
                        className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs hover:bg-muted"
                      >
                        <span className="truncate">{m.name}</span>
                        {m.era ? (
                          <span className="ml-2 shrink-0 font-mono text-[10px] uppercase text-muted-foreground">
                            {m.era}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Ancestors: <span className="text-foreground">{ancestorLabel}</span>
          </label>
          <input
            type="range"
            min={0}
            max={ANCESTOR_MAX}
            value={ancestorDepth}
            onChange={(e) => setAncestorDepth(parseInt(e.target.value, 10))}
            className="h-9 w-44"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Descendants: <span className="text-foreground">{descendantLabel}</span>
          </label>
          <input
            type="range"
            min={0}
            max={DESCENDANT_MAX}
            value={descendantDepth}
            onChange={(e) => setDescendantDepth(parseInt(e.target.value, 10))}
            className="h-9 w-44"
          />
        </div>
      </div>

      {root ? (
        <p className="px-1 text-[11px] text-muted-foreground">
          Centered on <span className="font-medium text-foreground">{root.name}</span> ·{" "}
          <span className="text-foreground">{data.people.length}</span> people shown ·{" "}
          <span className="text-foreground">{data.edges.length}</span> relationships · Click
          any person for details.
        </p>
      ) : (
        <p className="px-1 text-[11px] text-destructive">Root person not found.</p>
      )}

      <div className="flex-1">
        <FlowCanvas
          people={data.people}
          edges={data.edges}
          rootId={root?.id}
          height="calc(100vh - 19rem)"
          emptyMessage="Pick a root person to start exploring."
          onPersonClick={onPersonClick}
        />
      </div>
    </div>
  );
}
