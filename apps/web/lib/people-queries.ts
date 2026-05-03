import { ERAS } from "@bible-visualizer/config";
import { prisma } from "@bible-visualizer/db";

export interface PersonSummary {
  id: string;
  code: string;
  name: string;
  alternateNames: string[];
  gender: string | null;
  era: string | null;
  roles: string[];
  description: string | null;
  lifespanYears: number | null;
  confidenceLevel: string;
  traditionTags: string[];
  tribes: TribeBadge[];
}

export interface TribeBadge {
  code: string;
  name: string;
  type: string;
}

export interface PersonDetail extends PersonSummary {
  scriptureReferences: string[];
  birthYear: number | null;
  deathYear: number | null;
  ageAtDeathRef: string | null;
  isHistoricallyContested: boolean;
  notes: string | null;
}

export interface RelationshipEdge {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  relationship: string;
  viaParent: string | null;
  relationKind: string;
  scriptureReferences: string[];
  confidenceLevel: string;
  traditionTags: string[];
  notes: string | null;
}

const personSummarySelect = {
  id: true,
  code: true,
  name: true,
  alternateNames: true,
  gender: true,
  era: true,
  roles: true,
  description: true,
  lifespanYears: true,
  confidenceLevel: true,
  traditionTags: true,
  tribes: {
    select: {
      tribe: { select: { code: true, name: true, type: true } },
    },
  },
} as const;

type PersonSummaryRow = {
  id: string;
  code: string;
  name: string;
  alternateNames: string[];
  gender: string | null;
  era: string | null;
  roles: string[];
  description: string | null;
  lifespanYears: number | null;
  confidenceLevel: string;
  traditionTags: string[];
  tribes: Array<{ tribe: { code: string; name: string; type: string } }>;
};

function toSummary(row: PersonSummaryRow): PersonSummary {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    alternateNames: row.alternateNames,
    gender: row.gender,
    era: row.era,
    roles: row.roles,
    description: row.description,
    lifespanYears: row.lifespanYears,
    confidenceLevel: row.confidenceLevel,
    traditionTags: row.traditionTags,
    tribes: row.tribes.map((t) => t.tribe),
  };
}

export type PeopleSort = "name" | "chronological";

export async function getAllPeople(filters?: {
  era?: string;
  role?: string;
  tribe?: string;
  search?: string;
  sort?: PeopleSort;
}): Promise<PersonSummary[]> {
  const where: {
    era?: string;
    roles?: { has: string };
    tribes?: { some: { tribe: { code: string } } };
    OR?: Array<
      | { name: { contains: string; mode: "insensitive" } }
      | { alternateNames: { has: string } }
    >;
  } = {};
  if (filters?.era) where.era = filters.era;
  if (filters?.role) where.roles = { has: filters.role };
  if (filters?.tribe) where.tribes = { some: { tribe: { code: filters.tribe } } };
  if (filters?.search) {
    const q = filters.search.trim();
    if (q.length >= 1) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { alternateNames: { has: q } },
      ];
    }
  }
  const rows = await prisma.person.findMany({
    where,
    select: { ...personSummarySelect, birthYear: true },
    orderBy: [{ name: "asc" }],
  });

  if (filters?.sort === "chronological") {
    return chronologicalOrder(rows);
  }

  return rows.map(toSummary);
}

async function chronologicalOrder(
  rows: Array<PersonSummaryRow & { birthYear: number | null }>,
): Promise<PersonSummary[]> {
  const eraRank = new Map<string, number>(ERAS.map((e, i) => [e, i]));
  const idsInScope = new Set(rows.map((r) => r.id));

  const edges = await prisma.genealogyEdge.findMany({
    where: {
      OR: [{ relationship: "parent-of" }, { relationship: "spouse-of" }],
      fromPersonId: { in: [...idsInScope] },
      toPersonId: { in: [...idsInScope] },
    },
    select: {
      fromPersonId: true,
      toPersonId: true,
      relationship: true,
    },
  });

  const byId = new Map(rows.map((r) => [r.id, r]));
  const buckets = new Map<string, Array<typeof rows[number]>>();
  for (const r of rows) {
    const era = r.era ?? "__unknown__";
    const list = buckets.get(era);
    if (list) list.push(r);
    else buckets.set(era, [r]);
  }

  const ordered: typeof rows = [];

  const sortedEras = [...buckets.keys()].sort((a, b) => {
    const ar = eraRank.get(a) ?? ERAS.length;
    const br = eraRank.get(b) ?? ERAS.length;
    return ar - br;
  });

  for (const era of sortedEras) {
    const bucket = buckets.get(era)!;
    const bucketIds = new Set(bucket.map((p) => p.id));

    const parentsInBucket = new Map<string, string[]>();
    const spousesInBucket = new Map<string, string[]>();
    for (const e of edges) {
      if (!bucketIds.has(e.fromPersonId) || !bucketIds.has(e.toPersonId)) continue;
      if (e.relationship === "parent-of") {
        const list = parentsInBucket.get(e.toPersonId);
        if (list) list.push(e.fromPersonId);
        else parentsInBucket.set(e.toPersonId, [e.fromPersonId]);
      } else if (e.relationship === "spouse-of") {
        const list = spousesInBucket.get(e.fromPersonId);
        if (list) list.push(e.toPersonId);
        else spousesInBucket.set(e.fromPersonId, [e.toPersonId]);
      }
    }

    const depth = new Map<string, number>();
    const computeDepth = (id: string, seen: Set<string>): number => {
      const cached = depth.get(id);
      if (cached !== undefined) return cached;
      if (seen.has(id)) return 0;
      seen.add(id);
      const parents = parentsInBucket.get(id);
      if (!parents || parents.length === 0) {
        depth.set(id, 0);
        return 0;
      }
      let max = 0;
      for (const p of parents) {
        max = Math.max(max, computeDepth(p, seen) + 1);
      }
      depth.set(id, max);
      seen.delete(id);
      return max;
    };
    for (const p of bucket) computeDepth(p.id, new Set());

    for (let iter = 0; iter < 16; iter += 1) {
      let changed = false;
      for (const p of bucket) {
        const cur = depth.get(p.id) ?? 0;
        const spouses = spousesInBucket.get(p.id) ?? [];
        let maxSpouse = cur;
        for (const sid of spouses) {
          const sd = depth.get(sid) ?? 0;
          if (sd > maxSpouse) maxSpouse = sd;
        }
        if (maxSpouse > cur) {
          depth.set(p.id, maxSpouse);
          changed = true;
        }
      }
      if (!changed) break;
    }

    bucket.sort((a, b) => {
      const ad = depth.get(a.id) ?? 0;
      const bd = depth.get(b.id) ?? 0;
      if (ad !== bd) return ad - bd;
      const ay = a.birthYear;
      const by = b.birthYear;
      if (ay !== null && by !== null) return ay - by;
      if (ay !== null) return -1;
      if (by !== null) return 1;
      return a.name.localeCompare(b.name);
    });

    const placed = new Set<string>();
    const result: typeof rows = [];
    for (const person of bucket) {
      if (placed.has(person.id)) continue;
      result.push(person);
      placed.add(person.id);
      const spouses = spousesInBucket.get(person.id) ?? [];
      for (const sid of spouses) {
        if (placed.has(sid)) continue;
        const spouse = byId.get(sid);
        if (!spouse) continue;
        if (spouse.era !== person.era) continue;
        const spouseHasParents = (parentsInBucket.get(sid) ?? []).length > 0;
        const spouseHasYear = spouse.birthYear !== null;
        if (spouseHasParents || spouseHasYear) continue;
        result.push(spouse);
        placed.add(sid);
      }
    }

    ordered.push(...result);
  }

  return ordered.map(toSummary);
}

export async function getPersonByCode(code: string): Promise<PersonDetail | null> {
  const row = await prisma.person.findUnique({
    where: { code },
    select: {
      ...personSummarySelect,
      scriptureReferences: true,
      birthYear: true,
      deathYear: true,
      ageAtDeathRef: true,
      isHistoricallyContested: true,
      notes: true,
    },
  });
  if (!row) return null;
  const summary = toSummary(row);
  return {
    ...summary,
    scriptureReferences: row.scriptureReferences,
    birthYear: row.birthYear,
    deathYear: row.deathYear,
    ageAtDeathRef: row.ageAtDeathRef,
    isHistoricallyContested: row.isHistoricallyContested,
    notes: row.notes,
  };
}

async function fetchEdges(
  personIds: string[],
): Promise<RelationshipEdge[]> {
  if (personIds.length === 0) return [];
  const rows = await prisma.genealogyEdge.findMany({
    where: {
      OR: [
        { fromPersonId: { in: personIds } },
        { toPersonId: { in: personIds } },
      ],
    },
    select: {
      id: true,
      fromPersonId: true,
      toPersonId: true,
      relationship: true,
      viaParent: true,
      relationKind: true,
      scriptureReferences: true,
      confidenceLevel: true,
      traditionTags: true,
      notes: true,
      fromPerson: { select: { code: true, name: true } },
      toPerson: { select: { code: true, name: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    fromPersonId: r.fromPersonId,
    toPersonId: r.toPersonId,
    fromCode: r.fromPerson.code,
    fromName: r.fromPerson.name,
    toCode: r.toPerson.code,
    toName: r.toPerson.name,
    relationship: r.relationship,
    viaParent: r.viaParent,
    relationKind: r.relationKind,
    scriptureReferences: r.scriptureReferences,
    confidenceLevel: r.confidenceLevel,
    traditionTags: r.traditionTags,
    notes: r.notes,
  }));
}

export interface PersonNeighborhood {
  focus: PersonSummary;
  nodes: PersonSummary[];
  edges: RelationshipEdge[];
}

export async function getPersonNeighborhood(
  personId: string,
  depth = 2,
): Promise<PersonNeighborhood | null> {
  const focus = await prisma.person.findUnique({
    where: { id: personId },
    select: personSummarySelect,
  });
  if (!focus) return null;

  const visited = new Set<string>([personId]);
  const frontier = new Set<string>([personId]);
  const allEdges: RelationshipEdge[] = [];

  for (let i = 0; i < depth; i += 1) {
    if (frontier.size === 0) break;
    const edges = await fetchEdges([...frontier]);
    const nextFrontier = new Set<string>();
    for (const edge of edges) {
      if (!allEdges.find((existing) => existing.id === edge.id)) {
        allEdges.push(edge);
      }
      if (!visited.has(edge.fromPersonId)) {
        nextFrontier.add(edge.fromPersonId);
      }
      if (!visited.has(edge.toPersonId)) {
        nextFrontier.add(edge.toPersonId);
      }
    }
    for (const id of nextFrontier) visited.add(id);
    frontier.clear();
    for (const id of nextFrontier) frontier.add(id);
  }

  const nodeRows = await prisma.person.findMany({
    where: { id: { in: [...visited] } },
    select: personSummarySelect,
  });
  const nodes = nodeRows.map(toSummary);

  return { focus: toSummary(focus), nodes, edges: allEdges };
}

export async function countPeople(): Promise<number> {
  return prisma.person.count();
}

export async function getEraCounts(): Promise<Array<{ era: string; count: number }>> {
  const rows = await prisma.person.groupBy({
    by: ["era"],
    _count: { _all: true },
    where: { era: { not: null } },
  });
  return rows
    .filter((r): r is { era: string; _count: { _all: number } } => r.era !== null)
    .map((r) => ({ era: r.era, count: r._count._all }));
}
