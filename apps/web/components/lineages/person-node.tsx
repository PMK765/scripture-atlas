"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ERA_LABELS, type Era } from "@bible-visualizer/config";
import { Portrait } from "@/components/people/portrait";
import { cn } from "@/lib/utils";
import { eraColor } from "./era-color";
import type { LineagePerson } from "@/lib/lineage-queries";

export const NODE_WIDTH = 248;
export const NODE_HEIGHT = 84;

export interface PersonNodeData extends Record<string, unknown> {
  person: LineagePerson;
  dim?: boolean;
  highlight?: boolean;
  isRoot?: boolean;
}

const PRIMARY_ROLES = new Set([
  "patriarch",
  "matriarch",
  "king",
  "queen",
  "queen-mother",
  "prophet",
  "prophetess",
  "high-priest",
  "judge",
  "apostle",
  "evangelist",
  "ancestor-of-christ",
]);

const ROLE_GLYPH: Record<string, string> = {
  patriarch: "Patriarch",
  matriarch: "Matriarch",
  king: "King",
  queen: "Queen",
  "queen-mother": "Queen mother",
  prophet: "Prophet",
  prophetess: "Prophetess",
  "high-priest": "High priest",
  judge: "Judge",
  apostle: "Apostle",
  evangelist: "Evangelist",
  "ancestor-of-christ": "In the line of Christ",
};

function pickPrimaryRole(roles: string[]): string | null {
  for (const r of roles) {
    if (PRIMARY_ROLES.has(r)) return ROLE_GLYPH[r] ?? r;
  }
  return null;
}

function genderGlyph(gender: string | null): string | null {
  if (gender === "male") return "♂";
  if (gender === "female") return "♀";
  return null;
}

export function PersonNode({ data }: NodeProps) {
  const { person, dim, highlight, isRoot } = data as PersonNodeData;
  const accent = eraColor(person.era);
  const primaryRole = pickPrimaryRole(person.roles ?? []);
  const eraLabel = person.era ? ERA_LABELS[person.era as Era] ?? person.era : null;
  const gender = genderGlyph(person.gender);

  return (
    <>
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <div
        className={cn(
          "group relative flex h-full items-center gap-2.5 rounded-lg border bg-card p-2 text-card-foreground shadow-sm transition-all",
          "hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md hover:ring-1 hover:ring-primary/30",
          dim && "opacity-15",
          highlight && "border-primary/70 ring-2 ring-primary/40",
          isRoot && "border-primary ring-2 ring-primary/60 shadow-primary/10",
        )}
        style={{
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          borderLeft: `4px solid ${accent}`,
        }}
      >
        <Portrait
          code={person.code}
          gender={person.gender}
          name={person.name}
          size={48}
          ringColor={`${accent}66`}
        />
        <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch py-0.5">
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex min-w-0 items-center gap-1">
              {gender ? (
                <span
                  className="shrink-0 text-[11px] leading-none text-muted-foreground"
                  aria-hidden
                >
                  {gender}
                </span>
              ) : null}
              <p className="truncate text-[13px] font-semibold leading-tight">
                {person.name}
              </p>
            </div>
            {person.lifespanYears ? (
              <span
                className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground"
                title={`Lifespan: ${person.lifespanYears} years`}
              >
                {person.lifespanYears}y
              </span>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-2">
            {eraLabel ? (
              <span
                className="truncate rounded-sm px-1.5 py-0.5 text-[10px] font-medium leading-none"
                style={{
                  backgroundColor: `${accent}22`,
                  color: accent,
                }}
              >
                {eraLabel}
              </span>
            ) : (
              <span />
            )}
            {primaryRole ? (
              <span className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">
                {primaryRole}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </>
  );
}

export const nodeTypes = { person: PersonNode };
