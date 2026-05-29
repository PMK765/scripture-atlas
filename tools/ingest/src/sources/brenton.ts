import { join } from "node:path";
import { downloadIfMissing, extractTextFromZip, getDataDir } from "../lib/download";
import { persistCollected } from "../lib/db";
import { parseVpl } from "../parsers/vpl";
import type { CollectedTranslation, IngestionResult } from "../lib/types";

const URL = "https://ebible.org/Scriptures/eng-Brenton_vpl.zip";
const ZIP_FILENAME = "eng-Brenton_vpl.zip";
const INNER_FILENAME = "eng-Brenton_vpl.txt";
const TRANSLATION_CODE = "BRENTON";

export async function collectBrenton(packageRoot: string): Promise<CollectedTranslation> {
  const dataDir = getDataDir(packageRoot);
  const zipPath = join(dataDir, ZIP_FILENAME);

  await downloadIfMissing(URL, zipPath);
  const text = await extractTextFromZip(zipPath, INNER_FILENAME);
  const parsed = parseVpl(text);

  return {
    translationCode: TRANSLATION_CODE,
    verses: parsed.verses,
    totalLines: parsed.totalLines,
    skippedBooks: parsed.skippedBooks,
    unknownBooks: parsed.unknownBooks,
  };
}

export async function ingestBrenton(packageRoot: string): Promise<IngestionResult> {
  const startedAt = Date.now();
  return persistCollected(await collectBrenton(packageRoot), startedAt);
}
