"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import dagre from "@dagrejs/dagre";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ERA_LABELS, type Era } from "@bible-visualizer/config";
import { cn } from "@/lib/utils";
import type { PersonSummary, RelationshipEdge } from "@/lib/people-queries";

interface FamilyTreeProps {
  focusId: string;
  nodes: PersonSummary[];
  edges: RelationshipEdge[];
}

interface PersonNodeData extends Record<string, unknown> {
  person: PersonSummary;
  isFocus: boolean;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 92;

function PersonNode({ data }: NodeProps) {
  const { person, isFocus } = data as PersonNodeData;
  const eraLabel = person.era ? ERA_LABELS[person.era as Era] ?? person.era : null;
  const lifespan = person.lifespanYears ? `${person.lifespanYears} yrs` : null;
  const isContested = person.confidenceLevel === "debated";

  return (
    <>
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <div
        className={cn(
          "rounded-lg border bg-card p-2.5 text-card-foreground shadow-sm transition-colors",
          isFocus && "border-primary bg-primary/10 ring-2 ring-primary/40",
          !isFocus && "hover:border-primary/50",
          isContested && !isFocus && "border-dashed border-amber-500/60",
        )}
        style={{ width: NODE_WIDTH }}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-1 text-sm font-semibold tracking-tight">{person.name}</p>
          {person.gender ? (
            <span
              className="mt-0.5 text-[10px] font-mono uppercase text-muted-foreground"
              aria-label={person.gender}
            >
              {person.gender === "male" ? "♂" : person.gender === "female" ? "♀" : ""}
            </span>
          ) : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
          {eraLabel ? (
            <span className="rounded-sm bg-muted px-1.5 py-0.5 text-muted-foreground">
              {eraLabel}
            </span>
          ) : null}
          {lifespan ? (
            <span className="font-mono text-muted-foreground">{lifespan}</span>
          ) : null}
          {isContested ? (
            <span className="rounded-sm bg-amber-500/15 px-1.5 py-0.5 text-amber-700 dark:text-amber-300">
              debated
            </span>
          ) : null}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </>
  );
}

const nodeTypes = { person: PersonNode };

function buildGraph(
  people: PersonSummary[],
  rawEdges: RelationshipEdge[],
  focusId: string,
): { nodes: Node[]; edges: Edge[] } {
  const parentEdges = rawEdges.filter((e) => e.relationship === "parent-of");

  const spouseSeen = new Set<string>();
  const spouseEdges = rawEdges
    .filter((e) => e.relationship === "spouse-of")
    .filter((e) => {
      const key = [e.fromPersonId, e.toPersonId].sort().join("|");
      if (spouseSeen.has(key)) return false;
      spouseSeen.add(key);
      return true;
    });

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 24, ranksep: 60, marginx: 12, marginy: 12 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const p of people) {
    g.setNode(p.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const e of parentEdges) {
    if (people.some((p) => p.id === e.fromPersonId) && people.some((p) => p.id === e.toPersonId)) {
      g.setEdge(e.fromPersonId, e.toPersonId);
    }
  }

  dagre.layout(g);

  const nodes: Node[] = people.map((p) => {
    const positioned = g.node(p.id);
    return {
      id: p.id,
      type: "person",
      position: {
        x: positioned ? positioned.x - NODE_WIDTH / 2 : 0,
        y: positioned ? positioned.y - NODE_HEIGHT / 2 : 0,
      },
      data: { person: p, isFocus: p.id === focusId } satisfies PersonNodeData,
      draggable: false,
      selectable: true,
    };
  });

  const parentReactEdges: Edge[] = parentEdges.map((e) => {
    const isContested = e.confidenceLevel === "debated";
    const isLxx = e.traditionTags.includes("septuagint") || e.traditionTags.includes("lukan-genealogy");
    const isMasoretic = e.traditionTags.includes("masoretic");
    let label: string | undefined;
    if (isLxx) label = "LXX / Lk";
    else if (isMasoretic) label = "MT";
    return {
      id: e.id,
      source: e.fromPersonId,
      target: e.toPersonId,
      type: "smoothstep",
      label,
      labelStyle: { fontSize: 10, fontFamily: "ui-monospace, monospace" },
      labelBgStyle: { fill: "var(--muted, #1f2937)" },
      labelBgPadding: [4, 4] as [number, number],
      labelBgBorderRadius: 4,
      style: {
        stroke: isContested
          ? "rgb(245 158 11 / 0.7)"
          : "rgb(148 163 184 / 0.6)",
        strokeWidth: 1.5,
        strokeDasharray: isContested ? "4 3" : undefined,
      },
    } satisfies Edge;
  });

  const spouseReactEdges: Edge[] = spouseEdges.map((e) => ({
    id: `spouse-${e.id}`,
    source: e.fromPersonId,
    target: e.toPersonId,
    type: "straight",
    style: {
      stroke: "rgb(244 114 182 / 0.7)",
      strokeWidth: 1.25,
      strokeDasharray: "2 3",
    },
  }));

  return { nodes, edges: [...parentReactEdges, ...spouseReactEdges] };
}

export function FamilyTree({ focusId, nodes: people, edges }: FamilyTreeProps) {
  const router = useRouter();
  const { nodes, edges: reactEdges } = useMemo(
    () => buildGraph(people, edges, focusId),
    [people, edges, focusId],
  );

  if (people.length <= 1) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
        No genealogical relationships have been recorded for this person yet.
      </div>
    );
  }

  return (
    <div className="h-[520px] w-full overflow-hidden rounded-lg border bg-card">
      <ReactFlow
        nodes={nodes}
        edges={reactEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1.2 }}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => {
          const data = node.data as PersonNodeData;
          if (!data.isFocus) router.push(`/people/${data.person.code}`);
        }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        zoomOnScroll={false}
        zoomOnPinch
        panOnScroll
      >
        <Background gap={24} size={1} className="opacity-30" />
        <Controls showInteractive={false} className="!border !bg-card" />
      </ReactFlow>
    </div>
  );
}
