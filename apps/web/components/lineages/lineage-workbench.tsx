"use client";

import { useState } from "react";
import { ERAS, ERA_LABELS, type Era } from "@bible-visualizer/config";
import { ExplorerView } from "./explorer-view";
import { PersonDrawer } from "./person-drawer";
import { ERA_COLOR } from "./era-color";
import type { LineageEdge, LineagePerson } from "@/lib/lineage-queries";

interface LineageWorkbenchProps {
  people: LineagePerson[];
  edges: LineageEdge[];
}

export function LineageWorkbench({ people, edges }: LineageWorkbenchProps) {
  const [drawerCode, setDrawerCode] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rootCode, setRootCode] = useState<string>("abraham");

  const openDrawer = (person: LineagePerson) => {
    setDrawerCode(person.code);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-3">
      <ExplorerView
        people={people}
        edges={edges}
        rootCode={rootCode}
        onRootChange={setRootCode}
        onPersonClick={openDrawer}
      />

      <details className="rounded-lg border bg-card/40 px-3 py-2 text-[11px] text-muted-foreground">
        <summary className="cursor-pointer select-none font-medium tracking-wide text-foreground/80">
          Legend
        </summary>
        <div className="mt-2 space-y-2">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/70">
              Edges
            </p>
            <ul className="grid gap-1 sm:grid-cols-2">
              <li>
                <span className="mr-1.5 inline-block h-px w-6 align-middle bg-slate-400" />
                Father · stated parent
              </li>
              <li>
                <span className="mr-1.5 inline-block h-px w-6 align-middle bg-pink-400/60" />
                Mother · maternal line
              </li>
              <li>
                <span
                  className="mr-1.5 inline-block h-px w-6 align-middle"
                  style={{
                    borderTop: "1.5px dashed rgb(244 114 182)",
                  }}
                />
                Spouse
              </li>
              <li>
                <span
                  className="mr-1.5 inline-block h-px w-6 align-middle"
                  style={{
                    borderTop: "1.5px dotted rgb(168 85 247)",
                  }}
                />
                Concubine
              </li>
              <li>
                <span
                  className="mr-1.5 inline-block h-px w-6 align-middle"
                  style={{
                    borderTop: "1.5px dashed rgb(245 158 11)",
                  }}
                />
                Debated parentage
              </li>
              <li>
                <span
                  className="mr-1.5 inline-block h-px w-6 align-middle"
                  style={{
                    borderTop: "1.5px dotted rgb(148 163 184 / 0.6)",
                  }}
                />
                Inferred
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/70">
              Eras
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {ERAS.map((era) => (
                <span key={era} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-sm"
                    style={{ background: ERA_COLOR[era as Era] }}
                  />
                  {ERA_LABELS[era as Era]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </details>

      <PersonDrawer
        open={drawerOpen}
        code={drawerCode}
        onOpenChange={setDrawerOpen}
        onSetRoot={(code) => setRootCode(code)}
      />
    </div>
  );
}
