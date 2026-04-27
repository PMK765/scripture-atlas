import { people, genealogyEdges } from "@bible-visualizer/bible-data";

const peopleById = new Map(people.map((p) => [p.id, p]));
const childrenOf = new Map<string, string[]>();
const parentsOf = new Map<string, string[]>();
const spousesOf = new Map<string, string[]>();
for (const e of genealogyEdges) {
  if (e.relationship === "parent-of") {
    if (!childrenOf.has(e.from)) childrenOf.set(e.from, []);
    childrenOf.get(e.from)!.push(e.to);
    if (!parentsOf.has(e.to)) parentsOf.set(e.to, []);
    parentsOf.get(e.to)!.push(e.from);
  } else if (e.relationship === "spouse-of") {
    if (!spousesOf.has(e.from)) spousesOf.set(e.from, []);
    spousesOf.get(e.from)!.push(e.to);
    if (!spousesOf.has(e.to)) spousesOf.set(e.to, []);
    spousesOf.get(e.to)!.push(e.from);
  }
}

const namesByLowerHead = new Map<string, string[]>();
function headOf(s: string): string {
  return s
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .split(/\s+(?:son|daughter|of|the|wife|mother|father|brother|sister)\b/i)[0]
    .trim()
    .toLowerCase();
}
for (const p of people) {
  const head = headOf(p.name ?? "");
  if (head) {
    if (!namesByLowerHead.has(head)) namesByLowerHead.set(head, []);
    namesByLowerHead.get(head)!.push(p.id);
  }
  for (const alt of p.alternateNames ?? []) {
    const altHead = headOf(alt);
    if (altHead) {
      if (!namesByLowerHead.has(altHead)) namesByLowerHead.set(altHead, []);
      namesByLowerHead.get(altHead)!.push(p.id);
    }
  }
}

function lookupName(name: string): string[] {
  const key = name.trim().toLowerCase().replace(/[^a-z\-]/g, "");
  if (!key) return [];
  return [...new Set(namesByLowerHead.get(key) ?? [])];
}

interface Finding {
  personId: string;
  personName: string;
  relation: string;
  relativeName: string;
  source: "name" | "description";
  candidateMatches: string[];
  hasEdgeAlready: boolean;
}

const findings: Finding[] = [];

const NAME_REL = /\b(son|daughter)\s+of\s+([A-Z][A-Za-z'\-]+(?:\s+[A-Z][A-Za-z'\-]+)?)/g;
const DESC_REL =
  /\b(father|mother|son|daughter|husband|wife)\s+of\s+([A-Z][A-Za-z'\-]+(?:\s+[A-Z][A-Za-z'\-]+)?)/g;

const STOPWORDS = new Set([
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
  "north",
  "south",
  "house",
  "tekoa",
  "gibeah",
  "gilead",
  "geshur",
  "hamath",
  "zobah",
  "amalek",
  "midian",
  "tarshish",
  "the",
  "this",
]);

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
    if (STOPWORDS.has(relName.toLowerCase())) continue;
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
    });
  }

  for (const m of desc.matchAll(DESC_REL)) {
    const rel = m[1].toLowerCase();
    const relName = m[2];
    if (relName.length < 3) continue;
    if (STOPWORDS.has(relName.toLowerCase())) continue;
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
    });
  }
}

const presentNoEdge = findings.filter(
  (f) => f.candidateMatches.length > 0 && !f.hasEdgeAlready && f.source === "name",
);

const single = presentNoEdge.filter((f) => f.candidateMatches.length === 1);
const multi = presentNoEdge.filter((f) => f.candidateMatches.length > 1);

console.log(`TOTAL name-source no-edge findings: ${presentNoEdge.length}`);
console.log(`SINGLE-candidate: ${single.length}`);
console.log(`MULTI-candidate: ${multi.length}`);

const seen = new Set<string>();
const dedupedSingle: Finding[] = [];
for (const f of single) {
  let edgeKey: string;
  if (f.relation === "father-of" || f.relation === "mother-of") {
    edgeKey = `parent|${f.personId}|${f.candidateMatches[0]}`;
  } else if (f.relation === "son-of" || f.relation === "daughter-of") {
    edgeKey = `parent|${f.candidateMatches[0]}|${f.personId}`;
  } else {
    edgeKey = `spouse|${[f.personId, f.candidateMatches[0]].sort().join("|")}`;
  }
  if (seen.has(edgeKey)) continue;
  seen.add(edgeKey);
  dedupedSingle.push(f);
}

console.log(`SINGLE deduped: ${dedupedSingle.length}\n`);

console.log("=== SINGLE-CANDIDATE PROPOSED EDGES ===");
const byRel = new Map<string, Finding[]>();
for (const f of dedupedSingle) {
  if (!byRel.has(f.relation)) byRel.set(f.relation, []);
  byRel.get(f.relation)!.push(f);
}
for (const [rel, items] of byRel) {
  console.log(`\n--- ${rel} (${items.length}) ---`);
  for (const f of items) {
    const c = f.candidateMatches[0];
    console.log(`  ${f.personId} (${f.personName}) :: ${rel} ${f.relativeName} -> ${c}`);
  }
}

console.log("\n=== MULTI-CANDIDATE (need disambiguation, sample 30) ===");
for (const f of multi.slice(0, 30)) {
  console.log(
    `  ${f.personId} :: ${f.relation} ${f.relativeName} candidates=[${f.candidateMatches.slice(0, 6).join(",")}]`,
  );
}
