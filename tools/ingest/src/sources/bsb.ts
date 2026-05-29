import { promises as fs } from "node:fs";
import { join } from "node:path";
import { downloadIfMissing, getDataDir } from "../lib/download";
import { persistCollected } from "../lib/db";
import { parseBsb } from "../parsers/bsb";
import type { CollectedTranslation, IngestionResult } from "../lib/types";

const URL = "https://bereanbible.com/bsb.txt";
const FILENAME = "bsb.txt";
const TRANSLATION_CODE = "BSB";

export async function collectBsb(packageRoot: string): Promise<CollectedTranslation> {
  const dataDir = getDataDir(packageRoot);
  const filePath = join(dataDir, FILENAME);

  await downloadIfMissing(URL, filePath);
  const text = await fs.readFile(filePath, "utf8");
  const parsed = parseBsb(text);

  return {
    translationCode: TRANSLATION_CODE,
    verses: parsed.verses,
    totalLines: parsed.totalLines,
    skippedBooks: new Map(),
    unknownBooks: parsed.unknownBooks,
  };
}

export async function ingestBsb(packageRoot: string): Promise<IngestionResult> {
  const startedAt = Date.now();
  return persistCollected(await collectBsb(packageRoot), startedAt);
}
