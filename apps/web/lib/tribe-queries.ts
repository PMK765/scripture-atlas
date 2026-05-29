// Tribe data access, backed by static @bible-visualizer/bible-data — no database.
// Membership comes from `person.tribes` (tribe codes); founder/parent/subtribe
// links resolve by code across the static people and tribes lists.

import { tribes } from "@bible-visualizer/bible-data/tribes";
import { people } from "@bible-visualizer/bible-data/people";

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

export interface JacobsBlessingView {
  reference: string;
  type: "blessing" | "curse" | "mixed";
  text: string;
  translation: string;
}

export interface TribeDetail extends TribeSummary {
  scriptureReferences: string[];
  confidenceLevel: string;
  traditionTags: string[];
  notes: string | null;
  jacobsBlessing: JacobsBlessingView | null;
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

type Tribe = (typeof tribes)[number];
type Person = (typeof people)[number];

const tribeByCode = new Map(tribes.map((t) => [t.id, t]));
const personByCode = new Map(people.map((p) => [p.id, p]));

const membersByTribe = new Map<string, Person[]>();
for (const person of people) {
  for (const tribeCode of person.tribes ?? []) {
    const list = membersByTribe.get(tribeCode);
    if (list) list.push(person);
    else membersByTribe.set(tribeCode, [person]);
  }
}

const subtribesByParent = new Map<string, Tribe[]>();
for (const t of tribes) {
  if (!t.parentTribeId) continue;
  const list = subtribesByParent.get(t.parentTribeId);
  if (list) list.push(t);
  else subtribesByParent.set(t.parentTribeId, [t]);
}

function founderBadge(t: Tribe): { code: string; name: string } | null {
  if (!t.founderId) return null;
  const p = personByCode.get(t.founderId);
  return p ? { code: p.id, name: p.name } : null;
}

function parentBadge(t: Tribe): { code: string; name: string } | null {
  if (!t.parentTribeId) return null;
  const parent = tribeByCode.get(t.parentTribeId);
  return parent ? { code: parent.id, name: parent.name } : null;
}

function toTribeSummary(t: Tribe): TribeSummary {
  return {
    id: t.id,
    code: t.id,
    name: t.name,
    alternateNames: t.alternateNames ?? [],
    type: t.type,
    description: t.description ?? null,
    memberCount: membersByTribe.get(t.id)?.length ?? 0,
    founder: founderBadge(t),
    parent: parentBadge(t),
  };
}

export async function getAllTribes(): Promise<TribeSummary[]> {
  return [...tribes]
    .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
    .map(toTribeSummary);
}

function parseJacobsBlessing(value: unknown): JacobsBlessingView | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (
    typeof v.reference !== "string" ||
    typeof v.text !== "string" ||
    typeof v.translation !== "string" ||
    (v.type !== "blessing" && v.type !== "curse" && v.type !== "mixed")
  ) {
    return null;
  }
  return {
    reference: v.reference,
    text: v.text,
    translation: v.translation,
    type: v.type,
  };
}

export async function getTribeByCode(code: string): Promise<TribeDetail | null> {
  const t = tribeByCode.get(code);
  if (!t) return null;
  const subtribes = (subtribesByParent.get(t.id) ?? []).map((s) => ({
    code: s.id,
    name: s.name,
    type: s.type,
  }));
  return {
    ...toTribeSummary(t),
    scriptureReferences: t.scriptureReferences,
    confidenceLevel: t.confidenceLevel,
    traditionTags: t.traditionTags ?? [],
    notes: t.notes ?? null,
    jacobsBlessing: parseJacobsBlessing(t.jacobsBlessing),
    subtribes,
  };
}

export async function getTribeMembers(tribeId: string): Promise<TribeMember[]> {
  return (membersByTribe.get(tribeId) ?? [])
    .map((p) => ({
      id: p.id,
      code: p.id,
      name: p.name,
      era: p.era ?? null,
      gender: p.gender ?? null,
      roles: p.roles ?? [],
      lifespanYears: p.lifespanYears ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
