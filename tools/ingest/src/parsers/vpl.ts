import type { IngestedVerse } from "../lib/types";
import { resolveUsfmCode } from "../lib/book-resolver";

export interface VplParseResult {
  verses: IngestedVerse[];
  totalLines: number;
  skippedBooks: Map<string, number>;
  unknownBooks: Map<string, number>;
}

const LINE_PATTERN = /^([0-9A-Z]{3})\s+(\d+):(\d+)\s+(.*)$/;

export function parseVpl(text: string): VplParseResult {
  const verses: IngestedVerse[] = [];
  const skippedBooks = new Map<string, number>();
  const unknownBooks = new Map<string, number>();

  const lines = text.split(/\r?\n/);
  let totalLines = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === "") continue;
    if (line.startsWith("#")) continue;

    const match = LINE_PATTERN.exec(line);
    if (!match) {
      continue;
    }
    totalLines += 1;
    const [, rawCode, chapterStr, verseStr, rawText] = match;
    if (!rawCode || !chapterStr || !verseStr || rawText === undefined) continue;

    const resolved = resolveUsfmCode(rawCode);
    if (resolved === "skip") {
      skippedBooks.set(rawCode, (skippedBooks.get(rawCode) ?? 0) + 1);
      continue;
    }
    if (resolved === "unknown") {
      unknownBooks.set(rawCode, (unknownBooks.get(rawCode) ?? 0) + 1);
      continue;
    }

    const text = rawText.trim();
    if (text === "") continue;

    verses.push({
      bookCode: resolved,
      chapter: Number.parseInt(chapterStr, 10),
      verse: Number.parseInt(verseStr, 10),
      text,
    });
  }

  return { verses, totalLines, skippedBooks, unknownBooks };
}
