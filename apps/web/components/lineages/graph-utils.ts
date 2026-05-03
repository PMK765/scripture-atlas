import type { LineageEdge, LineagePerson } from "@/lib/lineage-queries";

export interface AdjacencyMaps {
  childrenOf: Map<string, string[]>;
  parentsOf: Map<string, string[]>;
  spousesOf: Map<string, string[]>;
}

export function buildAdjacency(edges: LineageEdge[]): AdjacencyMaps {
  const childrenOf = new Map<string, string[]>();
  const parentsOf = new Map<string, string[]>();
  const spousesOf = new Map<string, string[]>();
  const push = (m: Map<string, string[]>, k: string, v: string) => {
    const list = m.get(k);
    if (list) list.push(v);
    else m.set(k, [v]);
  };
  for (const e of edges) {
    if (e.relationship === "parent-of") {
      push(childrenOf, e.fromId, e.toId);
      push(parentsOf, e.toId, e.fromId);
    } else if (e.relationship === "spouse-of") {
      push(spousesOf, e.fromId, e.toId);
      push(spousesOf, e.toId, e.fromId);
    }
  }
  return { childrenOf, parentsOf, spousesOf };
}

export function descendantsBfs(
  rootId: string,
  childrenOf: Map<string, string[]>,
  maxDepth: number,
): Set<string> {
  const visited = new Set<string>([rootId]);
  let frontier: string[] = [rootId];
  for (let d = 0; d < maxDepth; d += 1) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const c of childrenOf.get(id) ?? []) {
        if (!visited.has(c)) {
          visited.add(c);
          next.push(c);
        }
      }
    }
    if (next.length === 0) break;
    frontier = next;
  }
  return visited;
}

export function ancestorsBfs(
  rootId: string,
  parentsOf: Map<string, string[]>,
  maxDepth: number,
): Set<string> {
  const visited = new Set<string>([rootId]);
  let frontier: string[] = [rootId];
  for (let d = 0; d < maxDepth; d += 1) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const p of parentsOf.get(id) ?? []) {
        if (!visited.has(p)) {
          visited.add(p);
          next.push(p);
        }
      }
    }
    if (next.length === 0) break;
    frontier = next;
  }
  return visited;
}

export function subgraph(
  people: LineagePerson[],
  edges: LineageEdge[],
  ids: Set<string>,
): { people: LineagePerson[]; edges: LineageEdge[] } {
  return {
    people: people.filter((p) => ids.has(p.id)),
    edges: edges.filter((e) => ids.has(e.fromId) && ids.has(e.toId)),
  };
}
