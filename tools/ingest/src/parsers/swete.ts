import type { IngestedVerse } from "../lib/types";
import { resolveUsfmCode } from "../lib/book-resolver";

/**
 * Parses Swete's 1930 LXX (eliranwong/LXX-Swete-1930) into verses.
 *
 * The repo distributes the text as two TSV files:
 *   `00-Swete_versification.csv`: <wordIndex>\t<bookRef>   (e.g. `1\tGen.1:1`)
 *     Each row marks the FIRST word index of a verse. Word indices are
 *     1-based and contiguous across the entire LXX.
 *
 *   `01-Swete_word_with_punctuations.csv`: <wordIndex>\t<word>
 *     The Greek surface form, accented, with punctuation inline.
 *
 * Verse N spans words [start_N, start_{N+1} - 1]. Verse text is the words
 * joined by spaces. Out-of-canon Swete books (Bel, Sus, EpJer, 3Ma, 4Ma,
 * 1En, Ode, Pss, Bet, Dat, Tbs, etc.) are filtered via the resolver's
 * SKIP_CODES set.
 */
export interface SweteParseResult {
  verses: IngestedVerse[];
  totalVerses: number;
  totalWords: number;
  skippedBooks: Map<string, number>;
  unknownBooks: Map<string, number>;
}

const VERSIFICATION_PATTERN = /^(\d+)\t([^.]+)\.(\d+):(\d+)\s*$/;
const WORD_PATTERN = /^(\d+)\t(.+?)\s*$/;

interface VerseAnchor {
  startWordIndex: number;
  bookRaw: string;
  chapter: number;
  verse: number;
}

function parseVersification(versificationCsv: string): VerseAnchor[] {
  const lines = versificationCsv.split(/\r?\n/);
  const anchors: VerseAnchor[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const match = VERSIFICATION_PATTERN.exec(line);
    if (!match) continue;
    const startStr = match[1];
    const bookRaw = match[2];
    const chapterStr = match[3];
    const verseStr = match[4];
    if (!startStr || !bookRaw || !chapterStr || !verseStr) continue;
    anchors.push({
      startWordIndex: Number.parseInt(startStr, 10),
      bookRaw,
      chapter: Number.parseInt(chapterStr, 10),
      verse: Number.parseInt(verseStr, 10),
    });
  }
  return anchors;
}

function parseWords(wordsCsv: string): Map<number, string> {
  const lines = wordsCsv.split(/\r?\n/);
  const words = new Map<number, string>();
  for (const line of lines) {
    if (!line.trim()) continue;
    const match = WORD_PATTERN.exec(line);
    if (!match) continue;
    const idxStr = match[1];
    const word = match[2];
    if (!idxStr || !word) continue;
    words.set(Number.parseInt(idxStr, 10), word);
  }
  return words;
}

export function parseSwete(versificationCsv: string, wordsCsv: string): SweteParseResult {
  const anchors = parseVersification(versificationCsv);
  const words = parseWords(wordsCsv);
  const verses: IngestedVerse[] = [];
  const skippedBooks = new Map<string, number>();
  const unknownBooks = new Map<string, number>();

  for (let i = 0; i < anchors.length; i += 1) {
    const anchor = anchors[i];
    if (!anchor) continue;
    const next = anchors[i + 1];
    const endExclusive = next ? next.startWordIndex : Number.POSITIVE_INFINITY;

    const resolved = resolveUsfmCode(anchor.bookRaw);
    if (resolved === "skip") {
      skippedBooks.set(anchor.bookRaw, (skippedBooks.get(anchor.bookRaw) ?? 0) + 1);
      continue;
    }
    if (resolved === "unknown") {
      unknownBooks.set(anchor.bookRaw, (unknownBooks.get(anchor.bookRaw) ?? 0) + 1);
      continue;
    }

    const tokens: string[] = [];
    for (let idx = anchor.startWordIndex; idx < endExclusive; idx += 1) {
      const word = words.get(idx);
      if (word === undefined) {
        if (!Number.isFinite(endExclusive)) break;
        continue;
      }
      tokens.push(word);
    }
    if (tokens.length === 0) continue;

    verses.push({
      bookCode: resolved,
      chapter: anchor.chapter,
      verse: anchor.verse,
      text: tokens.join(" "),
    });
  }

  return {
    verses,
    totalVerses: anchors.length,
    totalWords: words.size,
    skippedBooks,
    unknownBooks,
  };
}
