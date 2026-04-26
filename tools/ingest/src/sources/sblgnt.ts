import { join } from "node:path";
import { downloadIfMissing, extractTextFromZip, getDataDir } from "../lib/download";
import {
  getTranslationIdByCode,
  loadBookCodeToIdMap,
  replaceVersesForTranslation,
} from "../lib/db";
import { parseVpl } from "../parsers/vpl";
import type { IngestionResult } from "../lib/types";

const URL = "https://ebible.org/Scriptures/grcsbl_vpl.zip";
const ZIP_FILENAME = "grcsbl_vpl.zip";
const INNER_FILENAME = "grcsbl_vpl.txt";
const TRANSLATION_CODE = "SBLGNT";

export async function ingestSblgnt(packageRoot: string): Promise<IngestionResult> {
  const startedAt = Date.now();
  const dataDir = getDataDir(packageRoot);
  const zipPath = join(dataDir, ZIP_FILENAME);

  await downloadIfMissing(URL, zipPath);
  const text = await extractTextFromZip(zipPath, INNER_FILENAME);
  const parsed = parseVpl(text);

  const [translationId, bookMap] = await Promise.all([
    getTranslationIdByCode(TRANSLATION_CODE),
    loadBookCodeToIdMap(),
  ]);

  const inserted = await replaceVersesForTranslation(translationId, bookMap, parsed.verses);

  return {
    translationCode: TRANSLATION_CODE,
    totalLines: parsed.totalLines,
    parsedVerses: parsed.verses.length,
    insertedVerses: inserted,
    skippedBooks: parsed.skippedBooks,
    unknownBooks: parsed.unknownBooks,
    elapsedMs: Date.now() - startedAt,
  };
}
