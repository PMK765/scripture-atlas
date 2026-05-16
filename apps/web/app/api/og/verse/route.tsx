import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { projectMeta } from "@bible-visualizer/config";
import {
  getAvailableTranslationsForBook,
  getBookByCode,
  getChapterVerses,
} from "@/lib/queries";

/*
 * Per-verse Open Graph image. Reached via query string so we can vary the
 * image by ?v= and ?t= — Next.js's opengraph-image.tsx convention only
 * receives route params, not searchParams, which is why this lives under
 * /api/og/verse instead of being colocated with the chapter route.
 *
 * Cached aggressively via Cache-Control headers — most verse share URLs
 * (especially the popular ones like John 3:16) get hit repeatedly. Vercel's
 * edge CDN serves the PNG without re-running this function once warmed.
 */

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 } as const;

const FONT_DIR = join(process.cwd(), "public", "og-fonts");
const serifRegular = readFileSync(join(FONT_DIR, "cormorant-regular.ttf"));
const serifItalic = readFileSync(join(FONT_DIR, "cormorant-italic.ttf"));
const mono = readFileSync(join(FONT_DIR, "jetbrains-mono.ttf"));
const brandIcon = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public", "portraits", "mainIcon.png"),
).toString("base64")}`;

const FONTS = [
  { name: "Cormorant Garamond", data: serifRegular, style: "normal" as const, weight: 500 as const },
  { name: "Cormorant Garamond", data: serifItalic, style: "italic" as const, weight: 500 as const },
  { name: "JetBrains Mono", data: mono, style: "normal" as const, weight: 500 as const },
];

const PARCHMENT_BACKGROUND =
  "radial-gradient(ellipse 80% 60% at 85% 0%, #f5dfbb 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 0% 100%, #d8d8f0 0%, transparent 65%), linear-gradient(180deg, #fbf7eb 0%, #f5efe0 100%)";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
};

function parseRange(value: string | null): { start: number; end: number } | null {
  if (!value) return null;
  const match = value.match(/^(\d+)(?:-(\d+))?$/);
  if (!match) return null;
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : start;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 1 || end < start) return null;
  return { start, end };
}

function pickFontSize(text: string): number {
  if (text.length < 100) return 64;
  if (text.length < 200) return 52;
  if (text.length < 350) return 42;
  if (text.length < 550) return 34;
  return 28;
}

function buildBrandFallback(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Cormorant Garamond",
          fontSize: 120,
          color: "#1f2150",
          background: PARCHMENT_BACKGROUND,
        }}
      >
        {projectMeta.name}
      </div>
    ),
    { ...SIZE, fonts: FONTS, headers: CACHE_HEADERS },
  );
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const bookCode = url.searchParams.get("book");
  const chapterStr = url.searchParams.get("chapter");
  const vParam = url.searchParams.get("v");
  const tParam = (url.searchParams.get("t") ?? "WEB").toUpperCase();

  if (!bookCode || !chapterStr) return buildBrandFallback();
  const chapter = Number(chapterStr);
  if (!Number.isInteger(chapter) || chapter < 1) return buildBrandFallback();

  const book = await getBookByCode(bookCode);
  if (!book) return buildBrandFallback();

  const available = await getAvailableTranslationsForBook(book.id);
  const translation =
    available.find((t) => t.code === tParam) ??
    available.find((t) => t.code === "WEB") ??
    available[0];
  if (!translation) return buildBrandFallback();

  const allVerses = await getChapterVerses(translation.id, book.id, chapter);
  const range = parseRange(vParam);

  /*
   * Three render modes:
   *   1. No ?v= given          → chapter card (large book name + chapter)
   *   2. ?v=N or ?v=N-M valid  → verse card (quote of the passage)
   *   3. ?v= given but missing → chapter card (graceful degradation)
   */

  let referenceText = `${book.name} ${chapter}`;
  let quoteText: string | null = null;

  if (range) {
    const verses = allVerses.filter((v) => v.verse >= range.start && v.verse <= range.end);
    if (verses.length > 0) {
      referenceText =
        range.start === range.end
          ? `${book.name} ${chapter}:${range.start}`
          : `${book.name} ${chapter}:${range.start}-${range.end}`;
      quoteText =
        verses.length === 1
          ? (verses[0]?.text ?? null)
          : verses.map((v) => `${v.verse} ${v.text}`).join("  ");
    }
  }

  const referenceHeader = `${referenceText.toUpperCase()} · ${translation.code}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px 96px",
          background: PARCHMENT_BACKGROUND,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: "JetBrains Mono",
            fontSize: 20,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#6b6f87",
          }}
        >
          <div style={{ width: 48, height: 1, background: "#9b6a3a" }} />
          {referenceHeader}
          <div style={{ width: 48, height: 1, background: "#9b6a3a" }} />
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 24,
          }}
        >
          {quoteText ? (
            <div
              style={{
                display: "flex",
                fontFamily: "Cormorant Garamond",
                fontStyle: "italic",
                fontSize: pickFontSize(quoteText),
                lineHeight: 1.32,
                color: "#1f2150",
                textAlign: "center",
                maxWidth: 980,
              }}
            >
              {`\u201C${quoteText}\u201D`}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  fontFamily: "Cormorant Garamond",
                  fontSize: 160,
                  lineHeight: 1,
                  letterSpacing: -3,
                  color: "#1f2150",
                  display: "flex",
                }}
              >
                {book.name}
              </div>
              <div
                style={{
                  fontFamily: "Cormorant Garamond",
                  fontStyle: "italic",
                  fontSize: 96,
                  lineHeight: 1,
                  color: "#2e3680",
                  display: "flex",
                  background: "linear-gradient(135deg, #2e3680 0%, #1f2150 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                chapter {chapter}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "JetBrains Mono",
              fontSize: 20,
              color: "#1f2150",
              fontWeight: 500,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brandIcon} width={48} height={48} style={{ borderRadius: 10 }} alt="" />
            scriptureatlas.com
          </div>
          <div
            style={{
              fontFamily: "Cormorant Garamond",
              fontStyle: "italic",
              fontSize: 22,
              color: "#6b6f87",
              display: "flex",
            }}
          >
            {projectMeta.tagline}
          </div>
        </div>
      </div>
    ),
    { ...SIZE, fonts: FONTS, headers: CACHE_HEADERS },
  );
}
