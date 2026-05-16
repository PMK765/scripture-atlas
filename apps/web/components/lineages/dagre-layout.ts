"use client";

import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import { eraRank } from "./era-color";
import { NODE_HEIGHT, NODE_WIDTH, type PersonNodeData } from "./person-node";
import type { LineageEdge, LineagePerson } from "@/lib/lineage-queries";

export interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

interface LayoutOptions {
  highlightIds?: Set<string>;
  dimIds?: Set<string>;
  rootId?: string;
  nodesep?: number;
  ranksep?: number;
}

const PARENT_COLOR = "rgb(148 163 184 / 0.85)";
const PARENT_MOTHER_COLOR = "rgb(244 114 182 / 0.55)";
const DEBATED_COLOR = "rgb(245 158 11 / 0.8)";
const INFERRED_COLOR = "rgb(148 163 184 / 0.4)";
const SPOUSE_COLOR = "rgb(244 114 182 / 0.7)";
const CONCUBINE_COLOR = "rgb(168 85 247 / 0.55)";

export function dagreLayout(
  people: LineagePerson[],
  rawEdges: LineageEdge[],
  opts: LayoutOptions = {},
): LayoutResult {
  const parentEdges = rawEdges.filter((e) => e.relationship === "parent-of");
  const spouseSeen = new Set<string>();
  const spouseEdges = rawEdges
    .filter((e) => e.relationship === "spouse-of")
    .filter((e) => {
      const key = [e.fromId, e.toId].sort().join("|");
      if (spouseSeen.has(key)) return false;
      spouseSeen.add(key);
      return true;
    });

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "TB",
    nodesep: opts.nodesep ?? 36,
    ranksep: opts.ranksep ?? 90,
    marginx: 32,
    marginy: 32,
    ranker: "tight-tree",
  });
  g.setDefaultEdgeLabel(() => ({}));

  const ids = new Set(people.map((p) => p.id));
  const peopleById = new Map(people.map((p) => [p.id, p]));
  for (const p of people) g.setNode(p.id, { width: NODE_WIDTH, height: NODE_HEIGHT });

  const parentsByChild = new Map<string, string[]>();
  for (const e of parentEdges) {
    if (!ids.has(e.fromId) || !ids.has(e.toId)) continue;
    const arr = parentsByChild.get(e.toId) ?? [];
    arr.push(e.fromId);
    parentsByChild.set(e.toId, arr);
    const fromRank = eraRank(peopleById.get(e.fromId)?.era ?? null);
    const toRank = eraRank(peopleById.get(e.toId)?.era ?? null);
    const minlen = Math.max(1, toRank - fromRank);
    g.setEdge(e.fromId, e.toId, { minlen });
  }

  /*
   * People who married into the family but whose own parents aren't curated
   * (Asenath, Timna, etc.) would otherwise land at rank 0 next to Adam & Eve
   * because dagre only uses parent edges for ranking. Inject phantom parent
   * edges from each such person's *spouse's parents* down to them, so dagre
   * places them at the same rank as their spouse. These phantom edges are
   * never rendered.
   */
  for (const p of people) {
    if ((parentsByChild.get(p.id)?.length ?? 0) > 0) continue;
    const spouseIds = spouseEdges
      .filter((e) => e.fromId === p.id || e.toId === p.id)
      .map((e) => (e.fromId === p.id ? e.toId : e.fromId))
      .filter((sid) => ids.has(sid) && (parentsByChild.get(sid)?.length ?? 0) > 0);
    if (spouseIds.length === 0) continue;
    const spouseParents = parentsByChild.get(spouseIds[0]!) ?? [];
    for (const sp of spouseParents) {
      const fromRank = eraRank(peopleById.get(sp)?.era ?? null);
      const toRank = eraRank(p.era ?? null);
      const minlen = Math.max(1, toRank - fromRank);
      g.setEdge(sp, p.id, { minlen, weight: 0.5 });
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
      data: {
        person: p,
        dim: opts.dimIds?.has(p.id) ?? false,
        highlight: opts.highlightIds?.has(p.id) ?? false,
        isRoot: opts.rootId === p.id,
      } satisfies PersonNodeData,
      draggable: false,
      selectable: true,
    };
  });

  const parentReact: Edge[] = parentEdges.map((e) => {
    const debated = e.confidenceLevel === "debated";
    const inferred = e.confidenceLevel === "inferred";
    const motherLine = e.viaParent === "mother";
    const stroke = debated
      ? DEBATED_COLOR
      : inferred
        ? INFERRED_COLOR
        : motherLine
          ? PARENT_MOTHER_COLOR
          : PARENT_COLOR;
    return {
      id: e.id,
      source: e.fromId,
      target: e.toId,
      type: "smoothstep",
      animated: false,
      style: {
        stroke,
        strokeWidth: debated || inferred ? 1.25 : 1.5,
        strokeDasharray: debated ? "5 4" : inferred ? "2 3" : undefined,
      },
    };
  });

  const spouseReact: Edge[] = spouseEdges.map((e) => {
    const concubine = e.relationKind === "concubine";
    return {
      id: `spouse-${e.id}`,
      source: e.fromId,
      target: e.toId,
      type: "straight",
      style: {
        stroke: concubine ? CONCUBINE_COLOR : SPOUSE_COLOR,
        strokeWidth: 1.25,
        strokeDasharray: concubine ? "1 4" : "3 4",
      },
    };
  });

  return { nodes, edges: [...parentReact, ...spouseReact] };
}
