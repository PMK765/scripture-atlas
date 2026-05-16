import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import {
  DIVINE_NAMES,
  HEBREW_NAMES,
  type DivineName,
  type DivineNameCategory,
  type HebrewName,
  type HebrewNameCategory,
  type NameSegment,
} from "@bible-visualizer/bible-data";
import { projectMeta } from "@bible-visualizer/config";

/*
 * Per-name Open Graph image. Renders the Hebrew text, transliteration, and
 * meaning of either a divine name or a Hebrew person name (single id
 * namespace across both lists — divine names take precedence on collision).
 *
 * Hebrew glyphs require a Hebrew-capable font; Cormorant Garamond covers
 * Latin only, so we bundle Frank Ruhl Libre and switch font-family for the
 * Hebrew span. Morpheme colors approximate the on-site OKLCH palette using
 * sRGB hex (Satori does not parse oklch reliably).
 */

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 } as const;

const FONT_DIR = join(process.cwd(), "public", "og-fonts");
const serifRegular = readFileSync(join(FONT_DIR, "cormorant-regular.ttf"));
const serifItalic = readFileSync(join(FONT_DIR, "cormorant-italic.ttf"));
const mono = readFileSync(join(FONT_DIR, "jetbrains-mono.ttf"));
const hebrewSerif = readFileSync(join(FONT_DIR, "frank-ruhl-libre.ttf"));
const brandIcon = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public", "portraits", "mainIcon.png"),
).toString("base64")}`;

const FONTS = [
  { name: "Cormorant Garamond", data: serifRegular, style: "normal" as const, weight: 500 as const },
  { name: "Cormorant Garamond", data: serifItalic, style: "italic" as const, weight: 500 as const },
  { name: "JetBrains Mono", data: mono, style: "normal" as const, weight: 500 as const },
  { name: "Frank Ruhl Libre", data: hebrewSerif, style: "normal" as const, weight: 500 as const },
];

const PARCHMENT_BACKGROUND =
  "radial-gradient(ellipse 80% 60% at 85% 0%, #f5dfbb 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 0% 100%, #d8d8f0 0%, transparent 65%), linear-gradient(180deg, #fbf7eb 0%, #f5efe0 100%)";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
};

const MORPHEME_COLORS = ["#4338ca", "#c2410c", "#0e7490", "#be123c", "#15803d"] as const;

const DIVINE_CATEGORY_LABEL: Record<DivineNameCategory, string> = {
  tetragrammaton: "Tetragrammaton",
  "elohim-family": "El / Elohim family",
  "adonai-family": "Adonai family",
  "yhwh-compound": "YHWH compound",
  title: "Title of God",
};

const HEBREW_CATEGORY_LABEL: Record<HebrewNameCategory, string> = {
  patriarch: "Patriarch",
  matriarch: "Matriarch",
  "tribe-head": "Tribe head",
  judge: "Judge",
  king: "King",
  prophet: "Prophet",
  priest: "Priest",
  leader: "Leader",
  apostle: "Apostle",
  disciple: "Disciple",
  messianic: "Messianic",
  place: "Place",
  other: "Other",
};

type ResolvedName =
  | {
      kind: "divine";
      header: string;
      title: string;
      hebrew: string;
      segments: NameSegment[];
      meaning: string;
    }
  | {
      kind: "hebrew";
      header: string;
      title: string;
      hebrew: string;
      segments: NameSegment[];
      meaning: string;
    };

function resolveName(id: string): ResolvedName | null {
  const divine: DivineName | undefined = DIVINE_NAMES.find((n) => n.id === id);
  if (divine) {
    return {
      kind: "divine",
      header: `NAME OF GOD · ${DIVINE_CATEGORY_LABEL[divine.category].toUpperCase()}`,
      title: divine.transliteration,
      hebrew: divine.hebrew,
      segments: divine.segments,
      meaning: divine.meaning,
    };
  }
  const hebrew: HebrewName | undefined = HEBREW_NAMES.find((n) => n.id === id);
  if (hebrew) {
    return {
      kind: "hebrew",
      header: `${hebrew.englishName.toUpperCase()} · ${HEBREW_CATEGORY_LABEL[hebrew.category].toUpperCase()}`,
      title: hebrew.englishName,
      hebrew: hebrew.hebrew,
      segments: hebrew.segments,
      meaning: hebrew.meaning,
    };
  }
  return null;
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

function pickHebrewFontSize(segments: NameSegment[], hebrew: string): number {
  const len = segments.length > 0 ? segments.reduce((n, s) => n + s.hebrew.length, 0) : hebrew.length;
  if (len <= 6) return 180;
  if (len <= 10) return 140;
  if (len <= 16) return 108;
  return 88;
}

function pickTransliterationFontSize(title: string): number {
  if (title.length <= 10) return 44;
  if (title.length <= 18) return 36;
  return 30;
}

function pickMeaningFontSize(meaning: string): number {
  if (meaning.length < 60) return 44;
  if (meaning.length < 120) return 36;
  return 30;
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return buildBrandFallback();

  const name = resolveName(id);
  if (!name) return buildBrandFallback();

  const hasSegments = name.segments.length > 0;
  const hebrewFontSize = pickHebrewFontSize(name.segments, name.hebrew);
  const transliterationFontSize = pickTransliterationFontSize(name.title);
  const meaningFontSize = pickMeaningFontSize(name.meaning);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "64px 88px",
          background: PARCHMENT_BACKGROUND,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: "JetBrains Mono",
            fontSize: 18,
            letterSpacing: 3,
            color: "#6b6f87",
          }}
        >
          <div style={{ width: 40, height: 1, background: "#9b6a3a" }} />
          {name.header}
          <div style={{ width: 40, height: 1, background: "#9b6a3a" }} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            flex: 1,
            justifyContent: "center",
            marginTop: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row-reverse",
              alignItems: "baseline",
              gap: 14,
              fontFamily: "Frank Ruhl Libre",
              fontSize: hebrewFontSize,
              lineHeight: 1,
              color: "#1f2150",
              direction: "rtl",
            }}
          >
            {hasSegments ? (
              name.segments.map((seg, i) => (
                <span
                  key={i}
                  style={{
                    color: MORPHEME_COLORS[i % MORPHEME_COLORS.length],
                    display: "flex",
                  }}
                >
                  {seg.hebrew}
                </span>
              ))
            ) : (
              <span style={{ display: "flex" }}>{name.hebrew}</span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              fontFamily: "JetBrains Mono",
              fontSize: transliterationFontSize,
              color: "#3d4060",
            }}
          >
            {hasSegments ? (
              name.segments.map((seg, i) => (
                <span
                  key={i}
                  style={{
                    color: MORPHEME_COLORS[i % MORPHEME_COLORS.length],
                    display: "flex",
                  }}
                >
                  {seg.transliteration}
                </span>
              ))
            ) : (
              <span style={{ display: "flex" }}>{name.title}</span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Cormorant Garamond",
              fontStyle: "italic",
              fontSize: meaningFontSize,
              lineHeight: 1.32,
              color: "#1f2150",
              textAlign: "center",
              maxWidth: 920,
              marginTop: 12,
            }}
          >
            {`\u201C${name.meaning}\u201D`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 16,
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
