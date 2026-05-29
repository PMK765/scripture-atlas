// Scripture-text data access. Backed entirely by the static corpus in
// @bible-visualizer/bible-data (book/translation metadata + generated verse
// files) — no database. The public surface here is intentionally unchanged
// from the previous Prisma-backed version, so callers (the chapter reader,
// search, the homepage, and /api/og/verse) keep working as-is.
//
// Convention: entity `id` === entity `code`. The static layer has no surrogate
// keys, so callers that pass a previous `.id` through to another query keep
// working because that value is just the code (e.g. "gen", "WEB").

import { books } from "@bible-visualizer/bible-data/books";
import { translations } from "@bible-visualizer/bible-data/translations";
import {
  getChapterVerses as readChapterVerses,
  getMaxChapter,
  getTotalVerseCounts,
  getTranslationCodesForBook,
  searchTranslationVerses,
} from "@bible-visualizer/bible-data/verses";

const bookByCode = new Map(books.map((b) => [b.id, b]));
const translationByCode = new Map(translations.map((t) => [t.code, t]));

export type VerseCountsByTranslation = Record<string, number>;

export async function getVerseCountsByTranslation(): Promise<VerseCountsByTranslation> {
  return getTotalVerseCounts();
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
  const book = bookByCode.get(code);
  if (!book) return null;
  return {
    id: book.id,
    code: book.id,
    name: book.name,
    abbreviation: book.abbreviation,
    testament: book.testament,
    order: book.order,
    chapters: book.chapters,
    genre: book.genre ?? null,
    authorTraditional: book.authorTraditional ?? null,
    canons: book.canons,
    originalLanguage: book.originalLanguage,
  };
}

export interface TranslationRecord {
  id: string;
  code: string;
  name: string;
  language: string;
}

function toTranslationRecord(t: (typeof translations)[number]): TranslationRecord {
  return { id: t.code, code: t.code, name: t.name, language: t.language };
}

export async function getAvailableTranslationsForBook(
  bookId: string,
): Promise<TranslationRecord[]> {
  const records = getTranslationCodesForBook(bookId)
    .map((code) => translationByCode.get(code))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .map(toTranslationRecord);
  records.sort(
    (a, b) => a.language.localeCompare(b.language) || a.code.localeCompare(b.code),
  );
  return records;
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
  return readChapterVerses(translationId, bookId, chapter);
}

export async function getMaxChapterForBook(
  bookId: string,
  translationId?: string,
): Promise<number> {
  return getMaxChapter(bookId, translationId);
}

export async function getTranslationByCode(
  code: string,
): Promise<TranslationRecord | null> {
  const t = translationByCode.get(code);
  return t ? toTranslationRecord(t) : null;
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
  const { hits } = await searchTranslationVerses(translationCode, query, limit);
  return hits.map((hit) => ({
    bookCode: hit.bookCode,
    bookName: bookByCode.get(hit.bookCode)?.name ?? hit.bookCode,
    chapter: hit.chapter,
    verse: hit.verse,
    text: hit.text,
  }));
}

export async function countSearchMatches(
  query: string,
  translationCode: string,
): Promise<number> {
  const { total } = await searchTranslationVerses(translationCode, query, 0);
  return total;
}
