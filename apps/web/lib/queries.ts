import { prisma } from "@bible-visualizer/db";

export type VerseCountsByTranslation = Record<string, number>;

export async function getVerseCountsByTranslation(): Promise<VerseCountsByTranslation> {
  try {
    const rows = await prisma.verse.groupBy({
      by: ["translationId"],
      _count: { _all: true },
    });
    const translations = await prisma.translation.findMany({
      select: { id: true, code: true },
    });
    const idToCode = new Map(translations.map((t) => [t.id, t.code]));
    const counts: VerseCountsByTranslation = {};
    for (const row of rows) {
      const code = idToCode.get(row.translationId);
      if (code) counts[code] = row._count._all;
    }
    return counts;
  } catch {
    return {};
  }
}

export interface BookRecord {
  id: string;
  code: string;
  name: string;
  abbreviation: string;
  testament: string;
  order: number;
  chapters: number;
  genre: string | null;
  authorTraditional: string | null;
  canons: string[];
  originalLanguage: string;
}

export async function getBookByCode(code: string): Promise<BookRecord | null> {
  return prisma.book.findUnique({
    where: { code },
    select: {
      id: true,
      code: true,
      name: true,
      abbreviation: true,
      testament: true,
      order: true,
      chapters: true,
      genre: true,
      authorTraditional: true,
      canons: true,
      originalLanguage: true,
    },
  });
}

export interface TranslationRecord {
  id: string;
  code: string;
  name: string;
  language: string;
}

export async function getAvailableTranslationsForBook(
  bookId: string,
): Promise<TranslationRecord[]> {
  const grouped = await prisma.verse.groupBy({
    by: ["translationId"],
    where: { bookId },
    _count: { _all: true },
  });
  const ids = grouped.map((g) => g.translationId);
  if (ids.length === 0) return [];
  const translations = await prisma.translation.findMany({
    where: { id: { in: ids } },
    select: { id: true, code: true, name: true, language: true },
    orderBy: [{ language: "asc" }, { code: "asc" }],
  });
  return translations;
}

export interface VerseRecord {
  verse: number;
  text: string;
}

export async function getChapterVerses(
  translationId: string,
  bookId: string,
  chapter: number,
): Promise<VerseRecord[]> {
  const rows = await prisma.verse.findMany({
    where: { translationId, bookId, chapter },
    select: { verse: true, text: true },
    orderBy: { verse: "asc" },
  });
  return rows;
}

export async function getMaxChapterForBook(
  bookId: string,
  translationId?: string,
): Promise<number> {
  const result = await prisma.verse.aggregate({
    where: translationId ? { bookId, translationId } : { bookId },
    _max: { chapter: true },
  });
  return result._max.chapter ?? 0;
}

export async function getTranslationByCode(
  code: string,
): Promise<TranslationRecord | null> {
  return prisma.translation.findUnique({
    where: { code },
    select: { id: true, code: true, name: true, language: true },
  });
}

export interface SearchHit {
  bookCode: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

export async function searchVerses(
  query: string,
  translationCode: string,
  limit = 50,
): Promise<SearchHit[]> {
  const translation = await getTranslationByCode(translationCode);
  if (!translation) return [];
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const rows = await prisma.verse.findMany({
    where: {
      translationId: translation.id,
      text: { contains: trimmed, mode: "insensitive" },
    },
    select: {
      chapter: true,
      verse: true,
      text: true,
      book: { select: { code: true, name: true, order: true } },
    },
    orderBy: [{ book: { order: "asc" } }, { chapter: "asc" }, { verse: "asc" }],
    take: limit,
  });
  return rows.map((r) => ({
    bookCode: r.book.code,
    bookName: r.book.name,
    chapter: r.chapter,
    verse: r.verse,
    text: r.text,
  }));
}

export async function countSearchMatches(
  query: string,
  translationCode: string,
): Promise<number> {
  const translation = await getTranslationByCode(translationCode);
  if (!translation) return 0;
  const trimmed = query.trim();
  if (trimmed.length < 2) return 0;
  return prisma.verse.count({
    where: {
      translationId: translation.id,
      text: { contains: trimmed, mode: "insensitive" },
    },
  });
}
