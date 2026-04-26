import { promises as fs } from "node:fs";
import { join } from "node:path";
import { downloadIfMissing, getDataDir } from "../lib/download";
import {
  getTranslationIdByCode,
  loadBookCodeToIdMap,
  replaceVersesForTranslation,
} from "../lib/db";
import { parseBsb } from "../parsers/bsb";
import type { IngestionResult } from "../lib/types";

const URL = "https://bereanbible.com/bsb.txt";
const FILENAME = "bsb.txt";
const TRANSLATION_CODE = "BSB";

export async function ingestBsb(packageRoot: string): Promise<IngestionResult> {
  const startedAt = Date.now();
  const dataDir = getDataDir(packageRoot);
  const filePath = join(dataDir, FILENAME);

  await downloadIfMissing(URL, filePath);
  const text = await fs.readFile(filePath, "utf8");
  const parsed = parseBsb(text);

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
    skippedBooks: new Map(),
    unknownBooks: parsed.unknownBooks,
    elapsedMs: Date.now() - startedAt,
  };
}
