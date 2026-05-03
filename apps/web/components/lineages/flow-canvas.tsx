"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { dagreLayout } from "./dagre-layout";
import { eraColor } from "./era-color";
import { nodeTypes, type PersonNodeData } from "./person-node";
import type { LineageEdge, LineagePerson } from "@/lib/lineage-queries";
import type { Era } from "@bible-visualizer/config";

interface FlowCanvasProps {
  people: LineagePerson[];
  edges: LineageEdge[];
  rootId?: string;
  highlightIds?: Set<string>;
  dimIds?: Set<string>;
  nodesep?: number;
  ranksep?: number;
  height?: string;
  emptyMessage?: string;
  onPersonClick?: (person: LineagePerson) => void;
}

export function FlowCanvas({
  people,
  edges,
  rootId,
  highlightIds,
  dimIds,
  nodesep,
  ranksep,
  height = "calc(100vh - 17rem)",
  emptyMessage,
  onPersonClick,
}: FlowCanvasProps) {
  const { nodes, edges: reactEdges } = useMemo(
    () => dagreLayout(people, edges, { highlightIds, dimIds, rootId, nodesep, ranksep }),
    [people, edges, highlightIds, dimIds, rootId, nodesep, ranksep],
  );

  if (people.length === 0) {
    return (
      <div
        className="grid place-items-center rounded-lg border bg-card text-sm text-muted-foreground"
        style={{ height }}
      >
        {emptyMessage ?? "No people to display."}
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden rounded-lg border bg-card"
      style={{ height }}
    >
      <ReactFlow
        nodes={nodes}
        edges={reactEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1, minZoom: 0.4 }}
        minZoom={0.15}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => {
          const data = node.data as PersonNodeData;
          if (data?.person) onPersonClick?.(data.person);
        }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        panOnScroll={false}
      >
        <Background gap={32} size={1} className="opacity-20" />
        <Controls showInteractive={false} className="!border !bg-card" />
        <MiniMap
          pannable
          zoomable
          className="!border !bg-card"
          nodeColor={(n) => {
            const data = n.data as PersonNodeData | undefined;
            return eraColor((data?.person.era as Era | null) ?? null);
          }}
          nodeStrokeWidth={0}
        />
      </ReactFlow>
    </div>
  );
}
