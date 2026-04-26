import { prisma } from "@bible-visualizer/db";

export interface TribeSummary {
  id: string;
  code: string;
  name: string;
  alternateNames: string[];
  type: string;
  description: string | null;
  memberCount: number;
  founder: { code: string; name: string } | null;
  parent: { code: string; name: string } | null;
}

export interface TribeDetail extends TribeSummary {
  scriptureReferences: string[];
  confidenceLevel: string;
  traditionTags: string[];
  notes: string | null;
  subtribes: Array<{ code: string; name: string; type: string }>;
}

export interface TribeMember {
  id: string;
  code: string;
  name: string;
  era: string | null;
  gender: string | null;
  roles: string[];
  lifespanYears: number | null;
}

const tribeBaseSelect = {
  id: true,
  code: true,
  name: true,
  alternateNames: true,
  type: true,
  description: true,
  founder: { select: { code: true, name: true } },
  parent: { select: { code: true, name: true } },
  _count: { select: { members: true } },
} as const;

export async function getAllTribes(): Promise<TribeSummary[]> {
  const rows = await prisma.tribe.findMany({
    select: tribeBaseSelect,
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    alternateNames: r.alternateNames,
    type: r.type,
    description: r.description,
    memberCount: r._count.members,
    founder: r.founder,
    parent: r.parent,
  }));
}

export async function getTribeByCode(code: string): Promise<TribeDetail | null> {
  const row = await prisma.tribe.findUnique({
    where: { code },
    select: {
      ...tribeBaseSelect,
      scriptureReferences: true,
      confidenceLevel: true,
      traditionTags: true,
      notes: true,
      subtribes: { select: { code: true, name: true, type: true } },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    alternateNames: row.alternateNames,
    type: row.type,
    description: row.description,
    memberCount: row._count.members,
    founder: row.founder,
    parent: row.parent,
    scriptureReferences: row.scriptureReferences,
    confidenceLevel: row.confidenceLevel,
    traditionTags: row.traditionTags,
    notes: row.notes,
    subtribes: row.subtribes,
  };
}

export async function getTribeMembers(tribeId: string): Promise<TribeMember[]> {
  const rows = await prisma.personTribe.findMany({
    where: { tribeId },
    select: {
      person: {
        select: {
          id: true,
          code: true,
          name: true,
          era: true,
          gender: true,
          roles: true,
          lifespanYears: true,
        },
      },
    },
  });
  return rows
    .map((r) => r.person)
    .sort((a, b) => a.name.localeCompare(b.name));
}
