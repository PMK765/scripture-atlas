/**
 * Imports polygon geometries from the OpenBible.info repo for the regions and
 * empires listed in OVERLAY_MANIFEST. Generates packages/bible-data/src/
 * overlays-imported.ts as a typed map of { externalGeometryId -> Polygon }.
 *
 * For "rough_boundary" and "polygon" types, the file is downloaded as-is.
 * For "isobands" types (a MultiPolygon of nested confidence layers), we pick
 * one representative polygon from the middle of the stack — biased slightly
 * toward higher confidence — to give a single visually clean boundary.
 */

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { OVERLAY_MANIFEST } from "@bible-visualizer/bible-data";

const OBI_COMMIT_SHA = "7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f";
const OBI_GEOMETRY_INDEX_URL = `https://raw.githubusercontent.com/openbibleinfo/Bible-Geocoding-Data/${OBI_COMMIT_SHA}/data/geometry.jsonl`;
const OBI_GEOMETRY_FILE_BASE = `https://raw.githubusercontent.com/openbibleinfo/Bible-Geocoding-Data/${OBI_COMMIT_SHA}/geometry`;

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..", "..");
const CACHE_DIR = resolve(REPO_ROOT, "tools", "ingest", ".cache");
const INDEX_CACHE = resolve(CACHE_DIR, `obi-geometry-${OBI_COMMIT_SHA.slice(0, 12)}.jsonl`);
const OUTPUT_FILE = resolve(
  REPO_ROOT,
  "packages",
  "bible-data",
  "src",
  "overlays-imported.ts",
);

interface ObiGeometryIndexEntry {
  id: string;
  name?: string;
  geometry?: string;
  geojson_file?: string;
  isobands_geojson_file?: string;
}

interface GeoJsonFeature {
  type: "Feature";
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  properties?: Record<string, unknown> | null;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function ensureIndex(): Promise<ObiGeometryIndexEntry[]> {
  await mkdir(CACHE_DIR, { recursive: true });
  if (!(await fileExists(INDEX_CACHE))) {
    console.log(`-> downloading geometry index @ ${OBI_COMMIT_SHA.slice(0, 8)}…`);
    const res = await fetch(OBI_GEOMETRY_INDEX_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching geometry index`);
    await writeFile(INDEX_CACHE, await res.text(), "utf8");
  }
  const raw = await readFile(INDEX_CACHE, "utf8");
  return raw
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as ObiGeometryIndexEntry);
}

async function ensureGeoFile(filename: string): Promise<GeoJsonFeature> {
  const cachePath = resolve(CACHE_DIR, `obi-geo-${filename}`);
  if (!(await fileExists(cachePath))) {
    const url = `${OBI_GEOMETRY_FILE_BASE}/${filename}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    await writeFile(cachePath, await res.text(), "utf8");
  }
  const raw = await readFile(cachePath, "utf8");
  return JSON.parse(raw) as GeoJsonFeature;
}

/**
 * Pick a representative single Polygon from an isobands MultiPolygon.
 *
 * OBI's isobands are nested polygons ordered low→high confidence. The
 * smallest (highest-confidence) polygon understates extent; the largest
 * overstates it. We pick a polygon biased slightly toward higher confidence
 * — index = floor(n * 0.6) — to give a sensible "consensus" boundary.
 */
function pickRepresentativePolygon(
  multi: GeoJSON.MultiPolygon,
): GeoJSON.Polygon | null {
  if (!multi.coordinates || multi.coordinates.length === 0) return null;
  const n = multi.coordinates.length;
  const idx = Math.min(n - 1, Math.floor(n * 0.6));
  const ringSet = multi.coordinates[idx];
  if (!ringSet) return null;
  return { type: "Polygon", coordinates: ringSet };
}

function normalizeGeometry(
  feature: GeoJsonFeature,
): GeoJSON.Polygon | null {
  const geom = feature.geometry;
  if (geom.type === "Polygon") return geom;
  if (geom.type === "MultiPolygon") return pickRepresentativePolygon(geom);
  return null;
}

function tsLiteral(value: unknown): string {
  return JSON.stringify(value);
}

function emitGeometry(geom: GeoJSON.Polygon, indent: string): string {
  const coords = JSON.stringify(geom.coordinates);
  return `${indent}{ type: "Polygon", coordinates: ${coords} }`;
}

async function main(): Promise<void> {
  const index = await ensureIndex();
  const indexById = new Map<string, ObiGeometryIndexEntry>();
  for (const entry of index) indexById.set(entry.id, entry);

  console.log(`-> resolving ${OVERLAY_MANIFEST.length} overlay geometries…`);

  const stats = { resolved: 0, missing: 0, errored: 0 };
  const geometries: Record<string, GeoJSON.Polygon> = {};

  for (const overlay of OVERLAY_MANIFEST) {
    const indexEntry = indexById.get(overlay.externalGeometryId);
    if (!indexEntry) {
      console.warn(
        `   MISSING in index: ${overlay.id} (looking for ${overlay.externalGeometryId})`,
      );
      stats.missing += 1;
      continue;
    }

    const filename =
      indexEntry.geometry === "isobands"
        ? indexEntry.isobands_geojson_file
        : indexEntry.geojson_file;
    if (!filename) {
      console.warn(`   no geojson file referenced for ${overlay.id}`);
      stats.missing += 1;
      continue;
    }

    try {
      const feature = await ensureGeoFile(filename);
      const polygon = normalizeGeometry(feature);
      if (!polygon) {
        console.warn(`   could not normalize geometry for ${overlay.id}`);
        stats.errored += 1;
        continue;
      }
      geometries[overlay.externalGeometryId] = polygon;
      stats.resolved += 1;
      const numPoints = polygon.coordinates[0]?.length ?? 0;
      console.log(
        `   ✓ ${overlay.id.padEnd(28)} ${numPoints} points (${indexEntry.geometry})`,
      );
    } catch (err) {
      console.warn(`   error resolving ${overlay.id}:`, err);
      stats.errored += 1;
    }
  }

  const lines: string[] = [];
  lines.push("/* eslint-disable */");
  lines.push("// AUTOGENERATED — do not edit by hand.");
  lines.push("// Generated by tools/ingest/src/import-obi-overlays.ts.");
  lines.push(`// OBI commit: ${OBI_COMMIT_SHA}`);
  lines.push(`// Generated at: ${new Date().toISOString()}`);
  lines.push(`// Overlays resolved: ${stats.resolved}/${OVERLAY_MANIFEST.length}`);
  lines.push("// Run: pnpm --filter @bible-visualizer/ingest import:obi-overlays");
  lines.push("");
  lines.push("export const importedOverlayGeometry: Record<string, GeoJSON.Polygon> = {");
  const ids = Object.keys(geometries).sort();
  for (const id of ids) {
    const geom = geometries[id];
    if (!geom) continue;
    lines.push(`  ${tsLiteral(id)}: ${emitGeometry(geom, "")},`);
  }
  lines.push("};");
  lines.push("");

  await writeFile(OUTPUT_FILE, lines.join("\n"), "utf8");

  console.log(`-> wrote ${OUTPUT_FILE}`);
  console.log(
    `   resolved=${stats.resolved}  missing=${stats.missing}  errored=${stats.errored}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
