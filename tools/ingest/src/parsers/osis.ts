import type { IngestedVerse } from "../lib/types";
import { resolveUsfmCode } from "../lib/book-resolver";

/**
 * Parses an OSIS XML book file (e.g. morphhb's `wlc/Gen.xml`) into verses.
 *
 * morphhb encodes each verse as:
 *   <verse osisID="Gen.1.1">
 *     <w lemma="..." morph="..." id="...">בְּ/רֵאשִׁ֖ית</w>
 *     <w ...>בָּרָ֣א</w>
 *     ...
 *     <w ...>הָ/אָֽרֶץ</w><seg type="x-sof-pasuq">׃</seg>
 *   </verse>
 *
 * Verse text is reconstructed by walking <w> and <seg> tokens in document order:
 *   - <w> contributes a leading space (except at the start of a verse) before its content
 *   - <seg> attaches inline (no leading space) — these are punctuation: maqqef "־",
 *     sof-pasuq "׃", paseq "׀", and a few others
 *   - The morpheme delimiter "/" inside <w> tokens (e.g. "בְּ/רֵאשִׁ֖ית") is
 *     stripped: it marks prefix/suffix morphemes glued to a stem and is not part
 *     of the actual Hebrew text
 */
export interface OsisParseResult {
  verses: IngestedVerse[];
  skippedBooks: Map<string, number>;
  unknownBooks: Map<string, number>;
}

const VERSE_PATTERN = /<verse\b[^>]*\bosisID="([^"]+)"[^>]*>([\s\S]*?)<\/verse>/g;
const TOKEN_PATTERN = /<(w|seg)\b[^>]*>([\s\S]*?)<\/\1>/g;
const OSIS_REF_PATTERN = /^([^.]+)\.(\d+)\.(\d+)$/;
const MORPHEME_DELIMITER = /\//g;

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function extractVerseText(verseInner: string): string {
  const parts: string[] = [];
  TOKEN_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_PATTERN.exec(verseInner)) !== null) {
    const tag = match[1] ?? "";
    const raw = decodeXmlEntities(match[2] ?? "");
    if (tag === "w") {
      const cleaned = raw.replace(MORPHEME_DELIMITER, "").trim();
      if (!cleaned) continue;
      parts.push(parts.length === 0 ? cleaned : ` ${cleaned}`);
    } else if (tag === "seg") {
      const cleaned = raw.trim();
      if (!cleaned) continue;
      parts.push(cleaned);
    }
  }
  return parts.join("");
}

export function parseOsisBook(xml: string): OsisParseResult {
  const verses: IngestedVerse[] = [];
  const skippedBooks = new Map<string, number>();
  const unknownBooks = new Map<string, number>();

  VERSE_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = VERSE_PATTERN.exec(xml)) !== null) {
    const osisId = match[1];
    const inner = match[2] ?? "";
    if (!osisId) continue;

    const refMatch = OSIS_REF_PATTERN.exec(osisId);
    if (!refMatch) continue;

    const bookCode = refMatch[1];
    const chapterStr = refMatch[2];
    const verseStr = refMatch[3];
    if (!bookCode || !chapterStr || !verseStr) continue;

    const resolved = resolveUsfmCode(bookCode);
    if (resolved === "skip") {
      skippedBooks.set(bookCode, (skippedBooks.get(bookCode) ?? 0) + 1);
      continue;
    }
    if (resolved === "unknown") {
      unknownBooks.set(bookCode, (unknownBooks.get(bookCode) ?? 0) + 1);
      continue;
    }

    const text = extractVerseText(inner);
    if (!text) continue;

    verses.push({
      bookCode: resolved,
      chapter: Number.parseInt(chapterStr, 10),
      verse: Number.parseInt(verseStr, 10),
      text,
    });
  }

  return { verses, skippedBooks, unknownBooks };
}
