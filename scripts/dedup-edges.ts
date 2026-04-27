import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const EDGES_PATH = resolve(__dirname, "../packages/bible-data/src/genealogy-edges.ts");

const src = readFileSync(EDGES_PATH, "utf8");

interface Hit {
  start: number;
  end: number;
  signature: string;
}

const hits: Hit[] = [];

let i = 0;
while (i < src.length) {
  const callIdx = src.indexOf("explicit(", i);
  if (callIdx === -1) break;
  const before = src[callIdx - 1];
  if (before && /[\w.]/.test(before)) {
    i = callIdx + 9;
    continue;
  }
  const open = callIdx + "explicit(".length - 1;
  let depth = 0;
  let close = -1;
  for (let j = open; j < src.length; j += 1) {
    const ch = src[j];
    if (ch === "(") depth += 1;
    else if (ch === ")") {
      depth -= 1;
      if (depth === 0) {
        close = j;
        break;
      }
    } else if (ch === '"') {
      while (j + 1 < src.length && src[j + 1] !== '"') j += 1;
      j += 1;
    }
  }
  if (close === -1) break;

  let end = close + 1;
  if (src[end] === ",") end += 1;
  if (src[end] === "\n") end += 1;

  const inner = src.slice(callIdx, close + 1);
  const argMatch = inner.match(/explicit\(\s*"([^"]+)"\s*,\s*"([^"]+)"/);
  if (!argMatch) {
    i = end;
    continue;
  }
  const from = argMatch[1];
  const to = argMatch[2];
  const viaParentMatch = inner.match(/viaParent:\s*"([^"]+)"/);
  const viaParent = viaParentMatch ? viaParentMatch[1] : "father";
  const relMatch = inner.match(/relationship:\s*"([^"]+)"/);
  const relationship = relMatch ? relMatch[1] : "parent-of";
  const signature = `${from}|${to}|${relationship}|${viaParent}`;
  hits.push({ start: callIdx, end, signature });
  i = end;
}

const motherHits: Hit[] = [];
let mi = 0;
while (mi < src.length) {
  const callIdx = src.indexOf("motherOf(", mi);
  if (callIdx === -1) break;
  const before = src[callIdx - 1];
  if (before && /[\w.]/.test(before)) {
    mi = callIdx + 9;
    continue;
  }
  const open = callIdx + "motherOf(".length - 1;
  let depth = 0;
  let close = -1;
  for (let j = open; j < src.length; j += 1) {
    const ch = src[j];
    if (ch === "(") depth += 1;
    else if (ch === ")") {
      depth -= 1;
      if (depth === 0) {
        close = j;
        break;
      }
    } else if (ch === '"') {
      while (j + 1 < src.length && src[j + 1] !== '"') j += 1;
      j += 1;
    }
  }
  if (close === -1) break;
  let end = close + 1;
  if (src[end] === ",") end += 1;
  if (src[end] === "\n") end += 1;

  const inner = src.slice(callIdx, close + 1);
  const argMatch = inner.match(/motherOf\(\s*"([^"]+)"\s*,\s*"([^"]+)"/);
  if (argMatch) {
    motherHits.push({
      start: callIdx,
      end,
      signature: `${argMatch[1]}|${argMatch[2]}|parent-of|mother`,
    });
  }
  mi = end;
}

const allHits = [...hits, ...motherHits].sort((a, b) => a.start - b.start);

const seenSig = new Set<string>();
const toRemove: Hit[] = [];
for (const hit of allHits) {
  if (seenSig.has(hit.signature)) {
    toRemove.push(hit);
  } else {
    seenSig.add(hit.signature);
  }
}

if (toRemove.length === 0) {
  console.log("No duplicates to remove from explicit/motherOf calls.");
}

let next = src;
for (const hit of toRemove.sort((a, b) => b.start - a.start)) {
  next = next.slice(0, hit.start) + next.slice(hit.end);
}

writeFileSync(EDGES_PATH, next);

console.log(`Total explicit calls: ${hits.length}`);
console.log(`Total motherOf calls: ${motherHits.length}`);
console.log(`Removed duplicate calls: ${toRemove.length}`);
toRemove.forEach((h) => console.log("  removed:", h.signature));
