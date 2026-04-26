import type { IngestedVerse } from "../lib/types";
import { resolveBookName } from "../lib/book-resolver";

export interface BsbParseResult {
  verses: IngestedVerse[];
  totalLines: number;
  unknownBooks: Map<string, number>;
}

const REFERENCE_PATTERN = /^(.+?)\s+(\d+):(\d+)$/;

export function parseBsb(text: string): BsbParseResult {
  const verses: IngestedVerse[] = [];
  const unknownBooks = new Map<string, number>();
  const lines = text.split(/\r?\n/);
  let totalLines = 0;

  for (const rawLine of lines) {
    if (rawLine.trim() === "") continue;
    const tabIndex = rawLine.indexOf("\t");
    if (tabIndex < 0) continue;

    const reference = rawLine.slice(0, tabIndex).trim();
    const verseText = rawLine.slice(tabIndex + 1).trim();
    if (verseText === "") continue;

    const refMatch = REFERENCE_PATTERN.exec(reference);
    if (!refMatch) {
      // Header line ("Verse\tBerean Standard Bible") and metadata lines fall here.
      continue;
    }
    totalLines += 1;
    const [, bookName, chapterStr, verseStr] = refMatch;
    if (!bookName || !chapterStr || !verseStr) continue;

    const resolved = resolveBookName(bookName);
    if (resolved === "unknown") {
      unknownBooks.set(bookName, (unknownBooks.get(bookName) ?? 0) + 1);
      continue;
    }

    verses.push({
      bookCode: resolved,
      chapter: Number.parseInt(chapterStr, 10),
      verse: Number.parseInt(verseStr, 10),
      text: verseText,
    });
  }

  return { verses, totalLines, unknownBooks };
}
