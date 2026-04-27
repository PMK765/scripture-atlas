import { people, genealogyEdges } from "@bible-visualizer/bible-data";
import type { Person } from "@bible-visualizer/bible-data";

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/\bson of\b.*$/i, "")
    .replace(/\bdaughter of\b.*$/i, "")
    .replace(/\bof\b.*$/i, "")
    .replace(/\bthe\s+\w+ite\b/i, "")
    .replace(/\bthe\s+\w+/i, "")
    .replace(/[^\w\s]/g, "")
    .trim()
    .split(/\s+/)[0];
}

function refOverlap(a: string[], b: string[]): { common: number; jaccard: number } {
  const sa = new Set(a);
  const sb = new Set(b);
  let common = 0;
  for (const r of sa) if (sb.has(r)) common += 1;
  const union = new Set([...a, ...b]).size;
  return { common, jaccard: union ? common / union : 0 };
}

function refsShareBookChapter(a: string[], b: string[]): boolean {
  const trim = (r: string) => r.split(":")[0].trim();
  const sa = new Set(a.map(trim));
  for (const r of b) if (sa.has(trim(r))) return true;
  return false;
}

const groups = new Map<string, Person[]>();
for (const p of people) {
  const key = normalizeName(p.name) + "|" + (p.era ?? "?") + "|" + (p.gender ?? "?");
  const arr = groups.get(key) ?? [];
  arr.push(p);
  groups.set(key, arr);
}

const high: Array<{ key: string; ids: string[]; reason: string }> = [];
const medium: Array<{ key: string; ids: string[]; reason: string }> = [];

for (const [key, arr] of groups) {
  if (arr.length < 2) continue;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      const a = arr[i];
      const b = arr[j];
      const { common, jaccard } = refOverlap(a.scriptureReferences, b.scriptureReferences);
      const sameTribes =
        (a.tribes ?? []).slice().sort().join(",") ===
        (b.tribes ?? []).slice().sort().join(",");
      const ratioA = common / Math.max(1, a.scriptureReferences.length);
      const ratioB = common / Math.max(1, b.scriptureReferences.length);

      if (common >= 1 && (ratioA >= 0.5 || ratioB >= 0.5) && sameTribes) {
        high.push({
          key,
          ids: [a.id, b.id],
          reason: `${common} shared refs, j=${jaccard.toFixed(2)}, sameTribes`,
        });
      } else if (refsShareBookChapter(a.scriptureReferences, b.scriptureReferences) && sameTribes) {
        medium.push({
          key,
          ids: [a.id, b.id],
          reason: `share book/chapter, sameTribes, common=${common}`,
        });
      }
    }
  }
}

console.log("=== HIGH CONFIDENCE DUPLICATES (" + high.length + ") ===");
for (const g of high) {
  const [aId, bId] = g.ids;
  const a = people.find((p) => p.id === aId)!;
  const b = people.find((p) => p.id === bId)!;
  console.log("• " + aId + " <=> " + bId);
  console.log("    A.name: " + a.name + " | refs: " + a.scriptureReferences.join("; "));
  console.log("    B.name: " + b.name + " | refs: " + b.scriptureReferences.join("; "));
  console.log("    A.desc: " + (a.description ?? "").slice(0, 120));
  console.log("    B.desc: " + (b.description ?? "").slice(0, 120));
  console.log("    " + g.reason);
}

console.log();
console.log("=== MEDIUM CONFIDENCE (same chapter; needs human eye) (" + medium.length + ") ===");
for (const g of medium) {
  const [aId, bId] = g.ids;
  const a = people.find((p) => p.id === aId)!;
  const b = people.find((p) => p.id === bId)!;
  console.log("· " + aId + " ?? " + bId + " | " + a.name + " / " + b.name);
  console.log("    A: " + a.scriptureReferences.join("; "));
  console.log("    B: " + b.scriptureReferences.join("; "));
}

console.log();
console.log("Summary: " + high.length + " HIGH, " + medium.length + " MEDIUM candidates.");
console.log("Total people: " + people.length + " | edges: " + genealogyEdges.length);
