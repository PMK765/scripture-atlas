/**
 * Imports the OpenBible.info bible-geocoding dataset and produces a
 * generated TS file at packages/bible-data/src/places-imported.ts.
 *
 * Strategy:
 *   1. Download data/ancient.jsonl from a pinned commit on the OBI repo
 *      (cached locally; gitignored).
 *   2. For each ancient place, take the top identification's first
 *      resolution (best-scoring proposed modern location).
 *   3. Skip entries whose url_slug or normalized name collides with a
 *      curated place — we trust our hand-curated coords/refs over OBI
 *      for those.
 *   4. Skip entries with no resolved coordinates (~33 of 1,341).
 *   5. Map OBI's vote-average score to our confidence levels:
 *        ≥500 → traditional, ≥250 → inferred, otherwise → debated.
 *      We never elevate an external identification to "stated" — only
 *      scripture itself yields that confidence level.
 *   6. Pull the top N scripture references from `verses[].osis` and
 *      expand OSIS book codes to our human-readable convention.
 *   7. Write a `places-imported.ts` file that exports an array of `Place`
 *      objects, each marked `source: "open-bible-info"` and `isStub: true`.
 *
 * Reproducibility: the OBI commit sha is pinned. Re-run after bumping
 * the sha to refresh the dataset.
 */

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { curatedPlaces } from "@bible-visualizer/bible-data";
import type { Place } from "@bible-visualizer/bible-data";

const OBI_COMMIT_SHA = "7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f";
const OBI_DATA_URL = `https://raw.githubusercontent.com/openbibleinfo/Bible-Geocoding-Data/${OBI_COMMIT_SHA}/data/ancient.jsonl`;
const SOURCE_ID = "open-bible-info";
const MAX_SCRIPTURE_REFS = 8;

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..", "..");
const CACHE_DIR = resolve(REPO_ROOT, "tools", "ingest", ".cache");
const CACHE_FILE = resolve(CACHE_DIR, `obi-ancient-${OBI_COMMIT_SHA.slice(0, 12)}.jsonl`);
const OUTPUT_FILE = resolve(
  REPO_ROOT,
  "packages",
  "bible-data",
  "src",
  "places-imported.ts",
);

interface ObiResolution {
  lonlat?: string;
  lonlat_type?: string;
  description?: string;
  type?: string;
  land_or_water?: string;
  modern_basis_id?: string;
}

interface ObiIdentification {
  class?: string;
  description?: string;
  resolutions?: ObiResolution[];
  score?: { vote_average?: number };
  types?: string[];
}

interface ObiVerse {
  osis?: string;
  readable?: string;
  instance_types?: Record<string, number>;
}

interface ObiAncient {
  id: string;
  url_slug: string;
  friendly_id: string;
  identifications?: ObiIdentification[];
  verses?: ObiVerse[];
  types?: string[];
}

const OSIS_BOOK_NAMES: Record<string, string> = {
  Gen: "Genesis", Exod: "Exodus", Lev: "Leviticus", Num: "Numbers", Deut: "Deuteronomy",
  Josh: "Joshua", Judg: "Judges", Ruth: "Ruth", "1Sam": "1 Samuel", "2Sam": "2 Samuel",
  "1Kgs": "1 Kings", "2Kgs": "2 Kings", "1Chr": "1 Chronicles", "2Chr": "2 Chronicles",
  Ezra: "Ezra", Neh: "Nehemiah", Esth: "Esther", Job: "Job", Ps: "Psalm",
  Prov: "Proverbs", Eccl: "Ecclesiastes", Song: "Song of Solomon",
  Isa: "Isaiah", Jer: "Jeremiah", Lam: "Lamentations", Ezek: "Ezekiel", Dan: "Daniel",
  Hos: "Hosea", Joel: "Joel", Amos: "Amos", Obad: "Obadiah", Jonah: "Jonah",
  Mic: "Micah", Nah: "Nahum", Hab: "Habakkuk", Zeph: "Zephaniah",
  Hag: "Haggai", Zech: "Zechariah", Mal: "Malachi",
  Matt: "Matthew", Mark: "Mark", Luke: "Luke", John: "John", Acts: "Acts",
  Rom: "Romans", "1Cor": "1 Corinthians", "2Cor": "2 Corinthians",
  Gal: "Galatians", Eph: "Ephesians", Phil: "Philippians", Col: "Colossians",
  "1Thess": "1 Thessalonians", "2Thess": "2 Thessalonians",
  "1Tim": "1 Timothy", "2Tim": "2 Timothy", Titus: "Titus", Phlm: "Philemon",
  Heb: "Hebrews", Jas: "James", "1Pet": "1 Peter", "2Pet": "2 Peter",
  "1John": "1 John", "2John": "2 John", "3John": "3 John", Jude: "Jude", Rev: "Revelation",
  Tob: "Tobit", Jdt: "Judith", Wis: "Wisdom", Sir: "Sirach", Bar: "Baruch",
  "1Macc": "1 Maccabees", "2Macc": "2 Maccabees",
};

function osisToReadable(osis: string): string | null {
  const match = osis.match(/^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  const book = match[1];
  const chapter = match[2];
  const verse = match[3];
  if (!book || !chapter || !verse) return null;
  const expanded = OSIS_BOOK_NAMES[book];
  if (!expanded) return null;
  return `${expanded} ${chapter}:${verse}`;
}

function stripHtml(value: string | undefined | null): string | null {
  if (!value) return null;
  const cleaned = value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return cleaned.length > 0 ? cleaned : null;
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+\d+$/, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function scoreToConfidence(score: number | undefined): "traditional" | "inferred" | "debated" {
  const s = score ?? 0;
  if (s >= 500) return "traditional";
  if (s >= 250) return "inferred";
  return "debated";
}

function computeMentionCount(verses: ObiVerse[]): number {
  let count = 0;
  for (const v of verses) {
    const named = (v.instance_types ?? {}).name ?? 0;
    if (named > 0) count += 1;
  }
  return count;
}

function computeProminence(
  score: number | undefined,
  mentionCount: number,
): "major" | "notable" | "minor" {
  const s = score ?? 0;
  if (s >= 500 && mentionCount >= 10) return "major";
  if (s >= 500 && mentionCount >= 3) return "notable";
  return "minor";
}

function placeTypeFromIdentification(id: ObiIdentification): string | null {
  const types = id.types ?? [];
  return types[0] ?? null;
}

function buildDescription(
  id: ObiIdentification,
  modernEquivalent: string | null,
): string | null {
  const placeType = placeTypeFromIdentification(id);
  if (!placeType) return null;
  const article = /^[aeiou]/i.test(placeType) ? "An" : "A";
  if (modernEquivalent) {
    return `${article} ${placeType} commonly identified with ${modernEquivalent}.`;
  }
  return `${article} ${placeType} mentioned in scripture.`;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function ensureDataset(): Promise<string> {
  await mkdir(CACHE_DIR, { recursive: true });
  if (await fileExists(CACHE_FILE)) {
    return CACHE_FILE;
  }
  console.log(`-> downloading OBI ancient.jsonl @ ${OBI_COMMIT_SHA.slice(0, 8)}…`);
  const res = await fetch(OBI_DATA_URL);
  if (!res.ok) {
    throw new Error(`Failed to download OBI dataset: HTTP ${res.status}`);
  }
  const text = await res.text();
  await writeFile(CACHE_FILE, text, "utf8");
  console.log(`   cached at ${CACHE_FILE} (${(text.length / 1024 / 1024).toFixed(1)} MB)`);
  return CACHE_FILE;
}

function buildCuratedDedupSet(): { ids: Set<string>; names: Set<string> } {
  const ids = new Set<string>();
  const names = new Set<string>();
  for (const place of curatedPlaces) {
    ids.add(place.id);
    names.add(normalizeName(place.name));
    for (const alt of place.alternateNames ?? []) {
      const n = normalizeName(alt);
      if (n) names.add(n);
    }
  }
  return { ids, names };
}

function tsLiteral(value: unknown): string {
  return JSON.stringify(value);
}

function emitPlace(place: Place, indent: string): string {
  const lines: string[] = [];
  lines.push(`${indent}{`);
  lines.push(`${indent}  id: ${tsLiteral(place.id)},`);
  lines.push(`${indent}  name: ${tsLiteral(place.name)},`);
  if (place.alternateNames && place.alternateNames.length > 0) {
    lines.push(`${indent}  alternateNames: ${tsLiteral(place.alternateNames)},`);
  }
  if (place.region) lines.push(`${indent}  region: ${tsLiteral(place.region)},`);
  if (place.latitude !== undefined) lines.push(`${indent}  latitude: ${place.latitude},`);
  if (place.longitude !== undefined) lines.push(`${indent}  longitude: ${place.longitude},`);
  if (place.modernEquivalent) {
    lines.push(`${indent}  modernEquivalent: ${tsLiteral(place.modernEquivalent)},`);
  }
  if (place.description) {
    lines.push(`${indent}  description: ${tsLiteral(place.description)},`);
  }
  lines.push(`${indent}  scriptureReferences: ${tsLiteral(place.scriptureReferences)},`);
  lines.push(`${indent}  confidenceLevel: ${tsLiteral(place.confidenceLevel)},`);
  if (place.notes) lines.push(`${indent}  notes: ${tsLiteral(place.notes)},`);
  if (place.source) lines.push(`${indent}  source: ${tsLiteral(place.source)},`);
  if (place.sourceUrl) lines.push(`${indent}  sourceUrl: ${tsLiteral(place.sourceUrl)},`);
  if (place.isStub) lines.push(`${indent}  isStub: true,`);
  if (place.prominence) lines.push(`${indent}  prominence: ${tsLiteral(place.prominence)},`);
  if (place.mentionCount !== undefined) lines.push(`${indent}  mentionCount: ${place.mentionCount},`);
  lines.push(`${indent}},`);
  return lines.join("\n");
}

async function main(): Promise<void> {
  const datasetPath = await ensureDataset();
  const raw = await readFile(datasetPath, "utf8");
  const records: ObiAncient[] = raw
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));

  console.log(`-> read ${records.length} OBI ancient records`);

  const { ids: curatedIds, names: curatedNames } = buildCuratedDedupSet();
  console.log(
    `-> dedup baseline: ${curatedIds.size} curated ids, ${curatedNames.size} normalized names`,
  );

  const stats = {
    total: records.length,
    kept: 0,
    skippedNoCoords: 0,
    skippedDuplicate: 0,
    byProminence: { major: 0, notable: 0, minor: 0 } as Record<string, number>,
  };
  const places: Place[] = [];

  for (const rec of records) {
    const top = rec.identifications?.[0];
    const resolution = top?.resolutions?.[0];
    if (!top || !resolution || !resolution.lonlat) {
      stats.skippedNoCoords += 1;
      continue;
    }

    const slugId = `obi-${rec.url_slug}`;
    const normName = normalizeName(rec.friendly_id);
    if (curatedIds.has(rec.url_slug) || curatedNames.has(normName)) {
      stats.skippedDuplicate += 1;
      continue;
    }

    const [lonStr, latStr] = resolution.lonlat.split(",");
    if (!lonStr || !latStr) {
      stats.skippedNoCoords += 1;
      continue;
    }
    const longitude = Number.parseFloat(lonStr);
    const latitude = Number.parseFloat(latStr);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      stats.skippedNoCoords += 1;
      continue;
    }

    const scriptureReferences: string[] = [];
    const seenRefs = new Set<string>();
    for (const v of rec.verses ?? []) {
      const readable = v.osis ? osisToReadable(v.osis) : v.readable ?? null;
      if (readable && !seenRefs.has(readable)) {
        scriptureReferences.push(readable);
        seenRefs.add(readable);
        if (scriptureReferences.length >= MAX_SCRIPTURE_REFS) break;
      }
    }

    const rawModern = stripHtml(top.description);
    const modernEquivalent =
      rawModern && rawModern.toLowerCase() !== rec.friendly_id.toLowerCase()
        ? rawModern
        : null;
    const description = buildDescription(top, modernEquivalent);
    const confidence = scoreToConfidence(top.score?.vote_average);
    const mentionCount = computeMentionCount(rec.verses ?? []);
    const prominence = computeProminence(top.score?.vote_average, mentionCount);
    stats.byProminence[prominence] = (stats.byProminence[prominence] ?? 0) + 1;

    places.push({
      id: slugId,
      name: rec.friendly_id,
      latitude: Number.parseFloat(latitude.toFixed(5)),
      longitude: Number.parseFloat(longitude.toFixed(5)),
      modernEquivalent: modernEquivalent ?? undefined,
      description: description ?? undefined,
      scriptureReferences,
      confidenceLevel: confidence,
      source: SOURCE_ID,
      sourceUrl: `https://www.openbible.info/geo/ancient/${rec.id}/${rec.url_slug}`,
      isStub: true,
      prominence,
      mentionCount,
    });
    stats.kept += 1;
  }

  places.sort((a, b) => a.name.localeCompare(b.name));

  const header = [
    "/* eslint-disable */",
    "// AUTOGENERATED — do not edit by hand.",
    "// Generated by tools/ingest/src/import-obi-places.ts.",
    `// OBI commit: ${OBI_COMMIT_SHA}`,
    `// Generated at: ${new Date().toISOString()}`,
    `// Total records imported: ${places.length}`,
    `// Run: pnpm --filter @bible-visualizer/ingest import:obi-places`,
    "",
    'import type { Place } from "./types";',
    "",
    "export const importedPlaces: Place[] = [",
  ].join("\n");

  const body = places.map((p) => emitPlace(p, "  ")).join("\n");
  const footer = "\n];\n";

  await writeFile(OUTPUT_FILE, header + "\n" + body + footer, "utf8");

  console.log(`-> wrote ${OUTPUT_FILE}`);
  console.log(
    `   total=${stats.total}  imported=${stats.kept}  skippedDuplicate=${stats.skippedDuplicate}  skippedNoCoords=${stats.skippedNoCoords}`,
  );
  console.log(
    `   prominence: major=${stats.byProminence.major}  notable=${stats.byProminence.notable}  minor=${stats.byProminence.minor}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
