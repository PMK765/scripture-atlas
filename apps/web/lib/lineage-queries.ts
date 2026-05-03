import { prisma } from "@bible-visualizer/db";

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
  const [peopleRows, edgeRows, totalPeople] = await Promise.all([
    prisma.person.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        era: true,
        gender: true,
        lifespanYears: true,
        birthYear: true,
        deathYear: true,
        roles: true,
        tribes: { select: { tribe: { select: { code: true } } } },
      },
    }),
    prisma.genealogyEdge.findMany({
      where: {
        OR: [{ relationship: "parent-of" }, { relationship: "spouse-of" }],
      },
      select: {
        id: true,
        fromPersonId: true,
        toPersonId: true,
        relationship: true,
        viaParent: true,
        relationKind: true,
        confidenceLevel: true,
        traditionTags: true,
      },
    }),
    prisma.person.count(),
  ]);

  const peopleById = new Map<string, LineagePerson>(
    peopleRows.map((p) => [
      p.id,
      {
        id: p.id,
        code: p.code,
        name: p.name,
        era: p.era,
        gender: p.gender,
        tribeCodes: p.tribes.map((t) => t.tribe.code),
        lifespanYears: p.lifespanYears,
        birthYear: p.birthYear,
        deathYear: p.deathYear,
        roles: p.roles,
      },
    ]),
  );

  const adjacency = new Map<string, Set<string>>();
  for (const id of peopleById.keys()) adjacency.set(id, new Set());
  for (const e of edgeRows) {
    if (!peopleById.has(e.fromPersonId) || !peopleById.has(e.toPersonId)) continue;
    adjacency.get(e.fromPersonId)!.add(e.toPersonId);
    adjacency.get(e.toPersonId)!.add(e.fromPersonId);
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
    .filter((e) => largest.has(e.fromPersonId) && largest.has(e.toPersonId))
    .map((e) => ({
      id: e.id,
      fromId: e.fromPersonId,
      toId: e.toPersonId,
      relationship: e.relationship as "parent-of" | "spouse-of",
      viaParent: e.viaParent,
      relationKind: e.relationKind,
      confidenceLevel: e.confidenceLevel,
      traditionTags: e.traditionTags,
    }));

  const adam = peopleInComponent.find((p) => p.code === "adam");
  const rootCode = adam?.code ?? peopleInComponent[0]?.code ?? null;

  return {
    people: peopleInComponent,
    edges,
    totalPeople,
    componentSize: largest.size,
    rootCode,
  };
}
