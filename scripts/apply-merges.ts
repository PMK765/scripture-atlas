import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { merges } from "./merge-plan.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const PEOPLE_PATH = resolve(ROOT, "packages/bible-data/src/people.ts");
const EDGES_PATH = resolve(ROOT, "packages/bible-data/src/genealogy-edges.ts");

interface MergeReport {
  drop: string;
  keep: string;
  removedPersonBlocks: number;
  edgeRefRewrites: number;
}

function removePersonBlock(source: string, dropId: string): { next: string; removed: number } {
  const idLine = `id: "${dropId}",`;
  let next = source;
  let removed = 0;

  while (true) {
    const idIdx = next.indexOf(idLine);
    if (idIdx === -1) break;

    let openIdx = idIdx;
    while (openIdx > 0 && next[openIdx] !== "{") openIdx -= 1;
    if (next[openIdx] !== "{") {
      throw new Error(`Could not find opening brace for ${dropId}`);
    }
    while (openIdx > 0 && /[ \t]/.test(next[openIdx - 1])) openIdx -= 1;
    if (next[openIdx - 1] === "\n") {
      openIdx -= 1;
    }

    let depth = 0;
    let closeIdx = -1;
    for (let i = openIdx; i < next.length; i += 1) {
      const ch = next[i];
      if (ch === "{") depth += 1;
      else if (ch === "}") {
        depth -= 1;
        if (depth === 0) {
          closeIdx = i;
          break;
        }
      }
    }
    if (closeIdx === -1) throw new Error(`Could not find closing brace for ${dropId}`);

    let after = closeIdx + 1;
    while (after < next.length && (next[after] === "," || next[after] === " " || next[after] === "\t")) {
      after += 1;
    }

    next = next.slice(0, openIdx) + next.slice(after);
    removed += 1;
  }

  return { next, removed };
}

function rewriteEdges(source: string, drop: string, keep: string): { next: string; count: number } {
  const pattern = new RegExp(`"${drop.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}"`, "g");
  let count = 0;
  const next = source.replace(pattern, () => {
    count += 1;
    return `"${keep}"`;
  });
  return { next, count };
}

function main(): void {
  let peopleSrc = readFileSync(PEOPLE_PATH, "utf8");
  let edgesSrc = readFileSync(EDGES_PATH, "utf8");
  const reports: MergeReport[] = [];

  for (const [keep, drop] of merges) {
    const { next: nextPeople, removed } = removePersonBlock(peopleSrc, drop);
    peopleSrc = nextPeople;
    const { next: nextEdges, count } = rewriteEdges(edgesSrc, drop, keep);
    edgesSrc = nextEdges;
    reports.push({ drop, keep, removedPersonBlocks: removed, edgeRefRewrites: count });
  }

  writeFileSync(PEOPLE_PATH, peopleSrc);
  writeFileSync(EDGES_PATH, edgesSrc);

  let totalRemoved = 0;
  let totalRewrites = 0;
  let zeroRemovals = 0;
  for (const r of reports) {
    totalRemoved += r.removedPersonBlocks;
    totalRewrites += r.edgeRefRewrites;
    if (r.removedPersonBlocks === 0) {
      zeroRemovals += 1;
      console.log(`WARN: ${r.drop} not found in people.ts`);
    }
  }

  console.log();
  console.log(`Plan size: ${merges.length} merges`);
  console.log(`Person blocks removed: ${totalRemoved}`);
  console.log(`Edge string rewrites: ${totalRewrites}`);
  console.log(`Drops not found: ${zeroRemovals}`);
}

main();
