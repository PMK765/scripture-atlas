// Lineage-graph data access, backed by static @bible-visualizer/bible-data — no
// database. Builds the largest connected component of the parent/spouse graph.
// Person ids === codes; edges reference people by code.

import { people } from "@bible-visualizer/bible-data/people";
import { genealogyEdges } from "@bible-visualizer/bible-data/genealogy-edges";

export interface LineagePerson {
  id: string;
  code: string;
  name: string;
  era: string | null;
  gender: string | null;
  tribeCodes: string[];
  lifespanYears: number | null;
  birthYear: number | null;
  deathYear: number | null;
  roles: string[];
}

export interface LineageEdge {
  id: string;
  fromId: string;
  toId: string;
  relationship: "parent-of" | "spouse-of";
  viaParent: string | null;
  relationKind: string;
  confidenceLevel: string;
  traditionTags: string[];
}

export interface LineageGraph {
  people: LineagePerson[];
  edges: LineageEdge[];
  totalPeople: number;
  componentSize: number;
  rootCode: string | null;
}

export async function getLineageGraph(): Promise<LineageGraph> {
  const peopleById = new Map<string, LineagePerson>(
    people.map((p) => [
      p.id,
      {
        id: p.id,
        code: p.id,
        name: p.name,
        era: p.era ?? null,
        gender: p.gender ?? null,
        tribeCodes: p.tribes ?? [],
        lifespanYears: p.lifespanYears ?? null,
        birthYear: p.birthYear ?? null,
        deathYear: p.deathYear ?? null,
        roles: p.roles ?? [],
      },
    ]),
  );

  const edgeRows = genealogyEdges.filter(
    (e) => e.relationship === "parent-of" || e.relationship === "spouse-of",
  );

  const adjacency = new Map<string, Set<string>>();
  for (const id of peopleById.keys()) adjacency.set(id, new Set());
  for (const e of edgeRows) {
    if (!peopleById.has(e.from) || !peopleById.has(e.to)) continue;
    adjacency.get(e.from)!.add(e.to);
    adjacency.get(e.to)!.add(e.from);
  }

  const visited = new Set<string>();
  let largest = new Set<string>();
  for (const startId of peopleById.keys()) {
    if (visited.has(startId)) continue;
    const component = new Set<string>();
    const stack = [startId];
    while (stack.length) {
      const id = stack.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);
      component.add(id);
      const neighbors = adjacency.get(id);
      if (!neighbors) continue;
      for (const n of neighbors) if (!visited.has(n)) stack.push(n);
    }
    if (component.size > largest.size) largest = component;
  }

  const peopleInComponent = [...largest]
    .map((id) => peopleById.get(id)!)
    .sort((a, b) => a.name.localeCompare(b.name));

  const edges: LineageEdge[] = edgeRows
    .filter((e) => largest.has(e.from) && largest.has(e.to))
    .map((e) => ({
      id: `${e.from}|${e.relationship}|${e.to}|${e.viaParent ?? ""}`,
      fromId: e.from,
      toId: e.to,
      relationship: e.relationship as "parent-of" | "spouse-of",
      viaParent: e.viaParent ?? null,
      relationKind: e.relationKind ?? "biological",
      confidenceLevel: e.confidenceLevel,
      traditionTags: e.traditionTags ?? [],
    }));

  const adam = peopleInComponent.find((p) => p.code === "adam");
  const rootCode = adam?.code ?? peopleInComponent[0]?.code ?? null;

  return {
    people: peopleInComponent,
    edges,
    totalPeople: people.length,
    componentSize: largest.size,
    rootCode,
  };
}
