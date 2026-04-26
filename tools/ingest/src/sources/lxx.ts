import { join } from "node:path";
import { downloadIfMissing, extractMatchingEntries, getDataDir } from "../lib/download";
import {
  getTranslationIdByCode,
  loadBookCodeToIdMap,
  replaceVersesForTranslation,
} from "../lib/db";
import { parseSwete } from "../parsers/swete";
import type { IngestionResult } from "../lib/types";

const URL = "https://github.com/eliranwong/LXX-Swete-1930/archive/refs/heads/master.zip";
const ZIP_FILENAME = "lxx-swete-1930-master.zip";
const TRANSLATION_CODE = "LXX";
const VERSIFICATION_SUFFIX = "/00-Swete_versification.csv";
const WORDS_SUFFIX = "/01-Swete_word_with_punctuations.csv";

export async function ingestLxx(packageRoot: string): Promise<IngestionResult> {
  const startedAt = Date.now();
  const dataDir = getDataDir(packageRoot);
  const zipPath = join(dataDir, ZIP_FILENAME);

  await downloadIfMissing(URL, zipPath);
  const entries = await extractMatchingEntries(
    zipPath,
    (name) => name.endsWith(VERSIFICATION_SUFFIX) || name.endsWith(WORDS_SUFFIX),
  );

  const versification = entries.find((e) => e.fileName.endsWith(VERSIFICATION_SUFFIX));
  const words = entries.find((e) => e.fileName.endsWith(WORDS_SUFFIX));
  if (!versification || !words) {
    throw new Error(
      `LXX-Swete archive missing required files (versification: ${!!versification}, words: ${!!words}).`,
    );
  }

  const parsed = parseSwete(versification.content, words.content);

  const [translationId, bookMap] = await Promise.all([
    getTranslationIdByCode(TRANSLATION_CODE),
    loadBookCodeToIdMap(),
  ]);

  const inserted = await replaceVersesForTranslation(translationId, bookMap, parsed.verses);

  return {
    translationCode: TRANSLATION_CODE,
    totalLines: parsed.totalVerses,
    parsedVerses: parsed.verses.length,
    insertedVerses: inserted,
    skippedBooks: parsed.skippedBooks,
    unknownBooks: parsed.unknownBooks,
    elapsedMs: Date.now() - startedAt,
  };
}
