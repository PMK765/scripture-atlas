import { prisma } from "@bible-visualizer/db";
import type { CollectedTranslation, IngestedVerse, IngestionResult } from "./types";

const INSERT_CHUNK_SIZE = 2000;

export async function loadBookCodeToIdMap(): Promise<Map<string, string>> {
  const rows = await prisma.book.findMany({ select: { id: true, code: true } });
  const map = new Map<string, string>();
  for (const row of rows) map.set(row.code, row.id);
  return map;
}

export async function getTranslationIdByCode(code: string): Promise<string> {
  const translation = await prisma.translation.findUnique({
    where: { code },
    select: { id: true },
  });
  if (!translation) {
    throw new Error(
      `Translation "${code}" not found in DB. Run \`pnpm db:seed\` first to populate translation metadata.`,
    );
  }
  return translation.id;
}

export async function replaceVersesForTranslation(
  translationId: string,
  bookCodeToId: Map<string, string>,
  ingestedVerses: IngestedVerse[],
): Promise<number> {
  await prisma.verse.deleteMany({ where: { translationId } });

  const rows = ingestedVerses.flatMap((v) => {
    const bookId = bookCodeToId.get(v.bookCode);
    if (!bookId) return [];
    return [
      {
        translationId,
        bookId,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
      },
    ];
  });

  let inserted = 0;
  for (let i = 0; i < rows.length; i += INSERT_CHUNK_SIZE) {
    const chunk = rows.slice(i, i + INSERT_CHUNK_SIZE);
    const result = await prisma.verse.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    inserted += result.count;
  }
  return inserted;
}

/**
 * Persist a collected translation to the database and shape the run report.
 * Shared by every source adapter's `ingest*` wrapper.
 */
export async function persistCollected(
  collected: CollectedTranslation,
  startedAt: number,
): Promise<IngestionResult> {
  const [translationId, bookMap] = await Promise.all([
    getTranslationIdByCode(collected.translationCode),
    loadBookCodeToIdMap(),
  ]);
  const inserted = await replaceVersesForTranslation(translationId, bookMap, collected.verses);
  return {
    translationCode: collected.translationCode,
    totalLines: collected.totalLines,
    parsedVerses: collected.verses.length,
    insertedVerses: inserted,
    skippedBooks: collected.skippedBooks,
    unknownBooks: collected.unknownBooks,
    elapsedMs: Date.now() - startedAt,
  };
}
