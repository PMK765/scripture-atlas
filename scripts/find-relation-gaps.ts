import { people, genealogyEdges } from "@bible-visualizer/bible-data";

const peopleById = new Map(people.map((p) => [p.id, p]));
const childrenOf = new Map<string, string[]>();
const parentsOf = new Map<string, string[]>();
const spousesOf = new Map<string, string[]>();
for (const e of genealogyEdges) {
  if (e.relationship === "parent-of") {
    (childrenOf.get(e.from) ?? childrenOf.set(e.from, []).get(e.from)!).push(e.to);
    (parentsOf.get(e.to) ?? parentsOf.set(e.to, []).get(e.to)!).push(e.from);
  } else if (e.relationship === "spouse-of") {
    (spousesOf.get(e.from) ?? spousesOf.set(e.from, []).get(e.from)!).push(e.to);
    (spousesOf.get(e.to) ?? spousesOf.set(e.to, []).get(e.to)!).push(e.from);
  }
}

const namesByLower = new Map<string, string[]>();
for (const p of people) {
  const headName = (p.name ?? "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .split(/\s+(?:son|daughter|of|the|wife|mother|father|brother|sister)\b/i)[0]
    .trim()
    .toLowerCase();
  if (!headName) continue;
  const arr = namesByLower.get(headName) ?? [];
  arr.push(p.id);
  namesByLower.set(headName, arr);
  for (const alt of p.alternateNames ?? []) {
    const altKey = alt.toLowerCase().split(/\s+/)[0];
    const list = namesByLower.get(altKey) ?? [];
    list.push(p.id);
    namesByLower.set(altKey, list);
  }
}

function lookupName(name: string): string[] {
  const key = name.trim().toLowerCase().replace(/[^a-z\-]/g, "");
  if (!key) return [];
  return namesByLower.get(key) ?? [];
}

interface Finding {
  personId: string;
  personName: string;
  relation: string;
  relativeName: string;
  source: "name" | "description";
  candidateMatches: string[];
  hasEdgeAlready: boolean;
  raw: string;
}

const findings: Finding[] = [];

const NAME_REL = /\b(son|daughter)\s+of\s+([A-Z][A-Za-z'\-]+(?:\s+[A-Z][A-Za-z'\-]+)?)/g;
const DESC_REL =
  /\b(father|mother|son|daughter|husband|wife|brother|sister|grandfather|grandmother|grandson|granddaughter)\s+of\s+([A-Z][A-Za-z'\-]+(?:\s+[A-Z][A-Za-z'\-]+)?)/g;

function hasParentEdgeWithName(personId: string, candidateIds: string[]): boolean {
  const parents = parentsOf.get(personId) ?? [];
  return parents.some((pid) => candidateIds.includes(pid));
}
function hasChildEdgeWithName(personId: string, candidateIds: string[]): boolean {
  const kids = childrenOf.get(personId) ?? [];
  return kids.some((pid) => candidateIds.includes(pid));
}
function hasSpouseEdgeWithName(personId: string, candidateIds: string[]): boolean {
  const sp = spousesOf.get(personId) ?? [];
  return sp.some((pid) => candidateIds.includes(pid));
}

for (const p of people) {
  const name = p.name ?? "";
  const desc = p.description ?? "";

  for (const m of name.matchAll(NAME_REL)) {
    const rel = m[1].toLowerCase();
    const relName = m[2];
    const candidates = lookupName(relName);
    const hasEdge = hasParentEdgeWithName(p.id, candidates);
    findings.push({
      personId: p.id,
      personName: name,
      relation: rel + "-of",
      relativeName: relName,
      source: "name",
      candidateMatches: candidates,
      hasEdgeAlready: hasEdge,
      raw: m[0],
    });
  }

  for (const m of desc.matchAll(DESC_REL)) {
    const rel = m[1].toLowerCase();
    const relName = m[2];
    if (relName.length < 3) continue;
    if (
      [
        "the",
        "god",
        "lord",
        "yahweh",
        "israel",
        "judah",
        "jerusalem",
        "samaria",
        "babylon",
        "egypt",
        "moab",
        "ammon",
        "edom",
        "persia",
        "rome",
        "antioch",
        "ephesus",
        "corinth",
        "philippi",
        "athens",
        "thessalonica",
        "macedonia",
        "asia",
        "europe",
        "galilee",
        "nazareth",
        "bethlehem",
        "kiriath",
        "samaria",
        "north",
        "south",
        "house",
      ].includes(relName.toLowerCase())
    )
      continue;
    const candidates = lookupName(relName);
    let hasEdge = false;
    if (rel === "father" || rel === "mother") hasEdge = hasChildEdgeWithName(p.id, candidates);
    else if (rel === "son" || rel === "daughter") hasEdge = hasParentEdgeWithName(p.id, candidates);
    else if (rel === "husband" || rel === "wife") hasEdge = hasSpouseEdgeWithName(p.id, candidates);

    findings.push({
      personId: p.id,
      personName: name,
      relation: rel + "-of",
      relativeName: relName,
      source: "description",
      candidateMatches: candidates,
      hasEdgeAlready: hasEdge,
      raw: m[0],
    });
  }
}

const missingTotally = findings.filter((f) => f.candidateMatches.length === 0);
const presentNoEdge = findings.filter((f) => f.candidateMatches.length > 0 && !f.hasEdgeAlready);

console.log("=== TOTAL FINDINGS:", findings.length, "===");
console.log("=== MISSING PERSON ENTIRELY:", missingTotally.length, "===");
console.log("=== PRESENT BUT NO EDGE:", presentNoEdge.length, "===\n");

console.log("--- MISSING (top 100, name-source) ---");
const nameMissing = missingTotally.filter((f) => f.source === "name");
console.log("(" + nameMissing.length + " from names)");
for (const f of nameMissing.slice(0, 100)) {
  console.log(`  ${f.personId} (${f.personName}) :: ${f.relation} ${f.relativeName}`);
}

console.log("\n--- MISSING (top 80, description-source) ---");
const descMissing = missingTotally.filter((f) => f.source === "description");
console.log("(" + descMissing.length + " from descriptions)");
for (const f of descMissing.slice(0, 80)) {
  console.log(`  ${f.personId} :: ${f.relation} ${f.relativeName}  [${f.raw}]`);
}

console.log("\n--- NO EDGE BUT NAME-MATCH EXISTS (top 40) ---");
console.log("(" + presentNoEdge.length + " total)");
for (const f of presentNoEdge.slice(0, 40)) {
  console.log(
    `  ${f.personId} :: ${f.relation} ${f.relativeName}  candidates=[${f.candidateMatches.slice(0, 4).join(",")}]`,
  );
}
