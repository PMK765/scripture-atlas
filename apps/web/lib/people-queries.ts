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

export async function getAllPeople(filters?: {
  era?: string;
  role?: string;
  tribe?: string;
  search?: string;
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
    select: personSummarySelect,
    orderBy: [{ name: "asc" }],
  });
  return rows.map(toSummary);
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
