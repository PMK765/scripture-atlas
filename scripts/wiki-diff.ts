import { people } from "@bible-visualizer/bible-data";
import { readFileSync } from "node:fs";

const WIKI_AK = "/Users/pmk765/.cursor/projects/Users-pmk765-Projects-bible-visualizer/agent-tools/8dbc4cb5-5dac-44b0-b937-6d963b8b5d07.txt";
const WIKI_LZ = "/Users/pmk765/.cursor/projects/Users-pmk765-Projects-bible-visualizer/agent-tools/ccb06ff0-5e59-441b-a975-476e9d5db451.txt";

function extractWikiNames(path: string): string[] {
  const text = readFileSync(path, "utf-8");
  const names: string[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^### ([A-Z][A-Za-z'\- ]+)\s*$/);
    if (m) names.push(m[1].trim());
  }
  return names;
}

const wikiNames = [...extractWikiNames(WIKI_AK), ...extractWikiNames(WIKI_LZ)];
console.log(`Wikipedia minor-figure name entries: ${wikiNames.length}`);

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

const ourNames = new Set<string>();
for (const p of people) {
  ourNames.add(normalize(p.name ?? ""));
  for (const alt of p.alternateNames ?? []) ourNames.add(normalize(alt));
  const headOnly = (p.name ?? "").split(/[ ()]/, 2)[0];
  if (headOnly) ourNames.add(normalize(headOnly));
}

const ourFirstWords = new Set<string>();
for (const p of people) {
  const head = (p.name ?? "").split(/\s+/, 1)[0];
  ourFirstWords.add(normalize(head));
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + c);
    }
  }
  return dp[m][n];
}

const ourNamesArr = [...ourNames].filter((n) => n.length >= 3);

function fuzzyMatch(name: string): string | null {
  const n = normalize(name);
  if (n.length < 4) return null;
  for (const ours of ourNamesArr) {
    if (Math.abs(ours.length - n.length) > 2) continue;
    const dist = levenshtein(n, ours);
    if (dist <= 1) return ours;
    if (dist === 2 && Math.min(n.length, ours.length) >= 6) return ours;
  }
  return null;
}

interface Diff {
  wikiName: string;
  matchedExact: boolean;
  matchedHead: boolean;
  fuzzyTo: string | null;
}
const diffs: Diff[] = [];
for (const w of wikiNames) {
  const norm = normalize(w);
  const matchedExact = ourNames.has(norm);
  const matchedHead = ourFirstWords.has(norm);
  const fuzzyTo = matchedExact || matchedHead ? null : fuzzyMatch(w);
  diffs.push({ wikiName: w, matchedExact, matchedHead, fuzzyTo });
}

const trulyMissing = diffs.filter((d) => !d.matchedExact && !d.matchedHead && !d.fuzzyTo);
const fuzzy = diffs.filter((d) => !d.matchedExact && !d.matchedHead && d.fuzzyTo);

console.log(`\nMatched exact/head: ${diffs.length - trulyMissing.length - fuzzy.length}`);
console.log(`Matched fuzzy (likely spelling variants): ${fuzzy.length}`);
console.log(`TRULY MISSING (no match): ${trulyMissing.length}\n`);

console.log(`=== TRULY MISSING WIKIPEDIA NAMES (${trulyMissing.length}) ===`);
for (const m of trulyMissing) console.log("  " + m.wikiName);

console.log(`\n=== FUZZY-MATCHED (${fuzzy.length}) ===`);
for (const f of fuzzy) console.log(`  ${f.wikiName} -> ${f.fuzzyTo}`);
