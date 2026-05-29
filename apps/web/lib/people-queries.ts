// People data access. Backed entirely by the static @bible-visualizer/bible-data
// package (people + genealogy edges + tribe memberships) — no database. Public
// surface is unchanged from the previous Prisma-backed version.
//
// Convention: entity `id` === entity `code`. People reference each other by
// code in genealogy edges and tribe memberships, so the in-memory graph keys on
// code throughout.

import { ERAS } from "@bible-visualizer/config";
import { people } from "@bible-visualizer/bible-data/people";
import { genealogyEdges } from "@bible-visualizer/bible-data/genealogy-edges";
import { tribes } from "@bible-visualizer/bible-data/tribes";

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

type Person = (typeof people)[number];

// --- Indexes (built once per process) ---------------------------------------

const peopleByCode = new Map(people.map((p) => [p.id, p]));
const tribeByCode = new Map(tribes.map((t) => [t.id, t]));

/** Genealogy edges whose endpoints both resolve to known people (mirrors seed). */
const validEdges = genealogyEdges.filter(
  (e) => peopleByCode.has(e.from) && peopleByCode.has(e.to),
);

/** Stable, deterministic edge id (matches the previous DB @@unique tuple). */
function edgeId(e: (typeof genealogyEdges)[number]): string {
  return `${e.from}|${e.relationship}|${e.to}|${e.viaParent ?? ""}`;
}

function tribeBadge(code: string): TribeBadge | null {
  const t = tribeByCode.get(code);
  return t ? { code: t.id, name: t.name, type: t.type } : null;
}

function tribeBadgesFor(person: Person): TribeBadge[] {
  return (person.tribes ?? [])
    .map(tribeBadge)
    .filter((b): b is TribeBadge => b !== null);
}

function toSummary(p: Person): PersonSummary {
  return {
    id: p.id,
    code: p.id,
    name: p.name,
    alternateNames: p.alternateNames ?? [],
    gender: p.gender ?? null,
    era: p.era ?? null,
    roles: p.roles ?? [],
    description: p.description ?? null,
    lifespanYears: p.lifespanYears ?? null,
    confidenceLevel: p.confidenceLevel,
    traditionTags: p.traditionTags ?? [],
    tribes: tribeBadgesFor(p),
  };
}

function toEdge(e: (typeof genealogyEdges)[number]): RelationshipEdge {
  const from = peopleByCode.get(e.from)!;
  const to = peopleByCode.get(e.to)!;
  return {
    id: edgeId(e),
    fromPersonId: e.from,
    toPersonId: e.to,
    fromCode: e.from,
    fromName: from.name,
    toCode: e.to,
    toName: to.name,
    relationship: e.relationship,
    viaParent: e.viaParent ?? null,
    relationKind: e.relationKind ?? "biological",
    scriptureReferences: e.scriptureReferences,
    confidenceLevel: e.confidenceLevel,
    traditionTags: e.traditionTags ?? [],
    notes: e.notes ?? null,
  };
}

// --- Queries ----------------------------------------------------------------

export type PeopleSort = "name" | "chronological";

export async function getAllPeople(filters?: {
  era?: string;
  role?: string;
  tribe?: string;
  search?: string;
  sort?: PeopleSort;
}): Promise<PersonSummary[]> {
  const search = filters?.search?.trim();
  const needle = search && search.length >= 1 ? search.toLowerCase() : null;

  let matched = people.filter((p) => {
    if (filters?.era && p.era !== filters.era) return false;
    if (filters?.role && !(p.roles ?? []).some((r) => r === filters.role)) return false;
    if (filters?.tribe && !(p.tribes ?? []).includes(filters.tribe)) return false;
    if (needle) {
      const inName = p.name.toLowerCase().includes(needle);
      const inAlt = (p.alternateNames ?? []).some((a) => a.toLowerCase() === needle);
      if (!inName && !inAlt) return false;
    }
    return true;
  });

  matched = [...matched].sort((a, b) => a.name.localeCompare(b.name));

  if (filters?.sort === "chronological") {
    return chronologicalOrder(matched).map(toSummary);
  }
  return matched.map(toSummary);
}

/**
 * Order people within era buckets by genealogical depth (parents before
 * children), propagating depth across spouses and keeping spouses adjacent.
 * Ported verbatim from the previous Prisma implementation; only the data
 * source changed (in-memory static edges instead of DB rows).
 */
function chronologicalOrder(rows: Person[]): Person[] {
  const eraRank = new Map<string, number>(ERAS.map((e, i) => [e, i]));
  const idsInScope = new Set(rows.map((r) => r.id));

  const edges = validEdges.filter(
    (e) =>
      (e.relationship === "parent-of" || e.relationship === "spouse-of") &&
      idsInScope.has(e.from) &&
      idsInScope.has(e.to),
  );

  const byId = new Map(rows.map((r) => [r.id, r]));
  const buckets = new Map<string, Person[]>();
  for (const r of rows) {
    const era = r.era ?? "__unknown__";
    const list = buckets.get(era);
    if (list) list.push(r);
    else buckets.set(era, [r]);
  }

  const ordered: Person[] = [];

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
      if (!bucketIds.has(e.from) || !bucketIds.has(e.to)) continue;
      if (e.relationship === "parent-of") {
        const list = parentsInBucket.get(e.to);
        if (list) list.push(e.from);
        else parentsInBucket.set(e.to, [e.from]);
      } else if (e.relationship === "spouse-of") {
        const list = spousesInBucket.get(e.from);
        if (list) list.push(e.to);
        else spousesInBucket.set(e.from, [e.to]);
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
      const ay = a.birthYear ?? null;
      const by = b.birthYear ?? null;
      if (ay !== null && by !== null) return ay - by;
      if (ay !== null) return -1;
      if (by !== null) return 1;
      return a.name.localeCompare(b.name);
    });

    const placed = new Set<string>();
    const result: Person[] = [];
    for (const person of bucket) {
      if (placed.has(person.id)) continue;
      result.push(person);
      placed.add(person.id);
      const spouses = spousesInBucket.get(person.id) ?? [];
      for (const sid of spouses) {
        if (placed.has(sid)) continue;
        const spouse = byId.get(sid);
        if (!spouse) continue;
        if ((spouse.era ?? null) !== (person.era ?? null)) continue;
        const spouseHasParents = (parentsInBucket.get(sid) ?? []).length > 0;
        const spouseHasYear = (spouse.birthYear ?? null) !== null;
        if (spouseHasParents || spouseHasYear) continue;
        result.push(spouse);
        placed.add(sid);
      }
    }

    ordered.push(...result);
  }

  return ordered;
}

export async function getPersonByCode(code: string): Promise<PersonDetail | null> {
  const p = peopleByCode.get(code);
  if (!p) return null;
  return {
    ...toSummary(p),
    scriptureReferences: p.scriptureReferences,
    birthYear: p.birthYear ?? null,
    deathYear: p.deathYear ?? null,
    ageAtDeathRef: p.ageAtDeathRef ?? null,
    isHistoricallyContested: p.isHistoricallyContested ?? false,
    notes: p.notes ?? null,
  };
}

function fetchEdges(personCodes: string[]): RelationshipEdge[] {
  if (personCodes.length === 0) return [];
  const scope = new Set(personCodes);
  return validEdges
    .filter((e) => scope.has(e.from) || scope.has(e.to))
    .map(toEdge);
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
  const focus = peopleByCode.get(personId);
  if (!focus) return null;

  const visited = new Set<string>([personId]);
  const frontier = new Set<string>([personId]);
  const allEdges: RelationshipEdge[] = [];
  const seenEdgeIds = new Set<string>();

  for (let i = 0; i < depth; i += 1) {
    if (frontier.size === 0) break;
    const edges = fetchEdges([...frontier]);
    const nextFrontier = new Set<string>();
    for (const edge of edges) {
      if (!seenEdgeIds.has(edge.id)) {
        seenEdgeIds.add(edge.id);
        allEdges.push(edge);
      }
      if (!visited.has(edge.fromPersonId)) nextFrontier.add(edge.fromPersonId);
      if (!visited.has(edge.toPersonId)) nextFrontier.add(edge.toPersonId);
    }
    for (const id of nextFrontier) visited.add(id);
    frontier.clear();
    for (const id of nextFrontier) frontier.add(id);
  }

  const nodes = [...visited]
    .map((code) => peopleByCode.get(code))
    .filter((p): p is Person => Boolean(p))
    .map(toSummary);

  return { focus: toSummary(focus), nodes, edges: allEdges };
}

export async function countPeople(): Promise<number> {
  return people.length;
}

export async function getEraCounts(): Promise<Array<{ era: string; count: number }>> {
  const counts = new Map<string, number>();
  for (const p of people) {
    if (!p.era) continue;
    counts.set(p.era, (counts.get(p.era) ?? 0) + 1);
  }
  return [...counts.entries()].map(([era, count]) => ({ era, count }));
}

export interface PeopleFacets {
  eras: Array<{ era: string; count: number }>;
  roles: Array<{ role: string; count: number }>;
  tribes: Array<{ code: string; name: string; count: number }>;
  total: number;
}

/** Aggregate facets for the /people filter bar. */
export async function getPeopleFacets(): Promise<PeopleFacets> {
  const eraCounts = new Map<string, number>();
  const roleCounts = new Map<string, number>();
  const tribeMemberCounts = new Map<string, number>();

  for (const p of people) {
    if (p.era) eraCounts.set(p.era, (eraCounts.get(p.era) ?? 0) + 1);
    for (const r of p.roles ?? []) roleCounts.set(r, (roleCounts.get(r) ?? 0) + 1);
    for (const t of p.tribes ?? []) {
      tribeMemberCounts.set(t, (tribeMemberCounts.get(t) ?? 0) + 1);
    }
  }

  const eras = [...eraCounts.entries()]
    .map(([era, count]) => ({ era, count }))
    .sort((a, b) => b.count - a.count);

  const roles = [...roleCounts.entries()]
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count);

  const tribesFacet = [...tribeMemberCounts.entries()]
    .map(([code, count]) => {
      const t = tribeByCode.get(code);
      return { code, name: t?.name ?? code, count };
    })
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  return { eras, roles, tribes: tribesFacet, total: people.length };
}
