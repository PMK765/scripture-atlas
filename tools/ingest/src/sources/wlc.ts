import { join } from "node:path";
import { downloadIfMissing, extractMatchingEntries, getDataDir } from "../lib/download";
import {
  getTranslationIdByCode,
  loadBookCodeToIdMap,
  replaceVersesForTranslation,
} from "../lib/db";
import { parseOsisBook } from "../parsers/osis";
import type { IngestedVerse, IngestionResult } from "../lib/types";

const URL = "https://github.com/openscriptures/morphhb/archive/refs/heads/master.zip";
const ZIP_FILENAME = "morphhb-master.zip";
const TRANSLATION_CODE = "WLC";
const WLC_PATH_PATTERN = /\/wlc\/[A-Za-z0-9]+\.xml$/;

export async function ingestWlc(packageRoot: string): Promise<IngestionResult> {
  const startedAt = Date.now();
  const dataDir = getDataDir(packageRoot);
  const zipPath = join(dataDir, ZIP_FILENAME);

  await downloadIfMissing(URL, zipPath);
  const entries = await extractMatchingEntries(zipPath, (name) => WLC_PATH_PATTERN.test(name));

  const allVerses: IngestedVerse[] = [];
  const skippedBooks = new Map<string, number>();
  const unknownBooks = new Map<string, number>();

  for (const entry of entries) {
    const result = parseOsisBook(entry.content);
    allVerses.push(...result.verses);
    for (const [code, count] of result.skippedBooks) {
      skippedBooks.set(code, (skippedBooks.get(code) ?? 0) + count);
    }
    for (const [code, count] of result.unknownBooks) {
      unknownBooks.set(code, (unknownBooks.get(code) ?? 0) + count);
    }
  }

  const [translationId, bookMap] = await Promise.all([
    getTranslationIdByCode(TRANSLATION_CODE),
    loadBookCodeToIdMap(),
  ]);

  const inserted = await replaceVersesForTranslation(translationId, bookMap, allVerses);

  return {
    translationCode: TRANSLATION_CODE,
    totalLines: entries.length,
    parsedVerses: allVerses.length,
    insertedVerses: inserted,
    skippedBooks,
    unknownBooks,
    elapsedMs: Date.now() - startedAt,
  };
}
