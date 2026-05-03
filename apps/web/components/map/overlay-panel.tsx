"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Info, Layers } from "lucide-react";
import Link from "next/link";
import {
  type MapOverlay,
  type OverlayKind,
  getDataSourceShortName,
} from "@bible-visualizer/bible-data";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<OverlayKind, string> = {
  empire: "Empires",
  region: "Regions",
  kingdom: "Kingdoms",
  tribe: "Tribes",
  province: "Roman provinces",
};

const KIND_ORDER: OverlayKind[] = ["empire", "region", "kingdom", "province", "tribe"];

interface OverlayPanelProps {
  overlays: ReadonlyArray<MapOverlay>;
  activeIds: ReadonlySet<string>;
  onChange: (next: Set<string>) => void;
}

export function OverlayPanel({ overlays, activeIds, onChange }: OverlayPanelProps) {
  const [open, setOpen] = useState(true);

  const grouped = useMemo(() => {
    const buckets: Record<OverlayKind, MapOverlay[]> = {
      empire: [],
      region: [],
      kingdom: [],
      tribe: [],
      province: [],
    };
    for (const o of overlays) {
      if (!o.geometry) continue;
      buckets[o.kind].push(o);
    }
    return buckets;
  }, [overlays]);

  const sources = useMemo(() => {
    const ids = new Set<string>();
    for (const o of overlays) ids.add(o.source);
    return [...ids];
  }, [overlays]);

  const allIds = useMemo(() => overlays.filter((o) => o.geometry).map((o) => o.id), [overlays]);
  const activeCount = activeIds.size;

  function toggleOne(id: string) {
    const next = new Set(activeIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  function setKind(kind: OverlayKind, on: boolean) {
    const next = new Set(activeIds);
    for (const o of grouped[kind]) {
      if (on) next.add(o.id);
      else next.delete(o.id);
    }
    onChange(next);
  }

  function setAll(on: boolean) {
    onChange(on ? new Set(allIds) : new Set());
  }

  return (
    <div className="rounded-lg border bg-card/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Layers className="h-3.5 w-3.5" aria-hidden />
          Boundaries
          <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] normal-case tracking-normal text-foreground">
            {activeCount}/{allIds.length}
          </span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAll(activeCount === allIds.length ? false : true);
            }}
            className="text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {activeCount === allIds.length ? "Hide all" : "Show all"}
          </button>
          <ChevronDown
            className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </div>
      </button>
      {open ? (
        <div className="space-y-4 border-t px-4 py-3">
          {KIND_ORDER.map((kind) => {
            const list = grouped[kind];
            if (list.length === 0) return null;
            const allOn = list.every((o) => activeIds.has(o.id));
            const someOn = list.some((o) => activeIds.has(o.id));
            return (
              <div key={kind}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {KIND_LABEL[kind]}{" "}
                    <span className="ml-1 font-normal opacity-60">
                      {list.filter((o) => activeIds.has(o.id)).length}/{list.length}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setKind(kind, !allOn)}
                    className="text-[10px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    {allOn ? "hide all" : someOn ? "show all" : "show all"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((o) => {
                    const active = activeIds.has(o.id);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => toggleOne(o.id)}
                        title={o.description}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                          active
                            ? "border-foreground/40 bg-card text-foreground"
                            : "border-border/50 bg-background/40 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-2 w-2 shrink-0 rounded-full ring-1 ring-white/30 transition-opacity",
                            active ? "opacity-100" : "opacity-30",
                          )}
                          style={{ background: o.color }}
                          aria-hidden
                        />
                        <span>{o.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
            <span>
              Boundary polygons from{" "}
              {sources.map((s) => getDataSourceShortName(s) ?? s).join(", ")}. Approximate
              representative boundaries — different atlases reconstruct ancient territories
              differently. See{" "}
              <Link href="/sources" className="font-medium underline-offset-2 hover:underline">
                Sources
              </Link>
              .
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
