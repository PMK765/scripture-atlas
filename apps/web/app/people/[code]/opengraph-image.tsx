import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ERA_LABELS, type Era, projectMeta } from "@bible-visualizer/config";
import { eraColor } from "@/components/lineages/era-color";
import { getPersonByCode } from "@/lib/people-queries";
import { hasNamedPortrait } from "@/lib/portrait";

/*
 * Per-person Open Graph image. Each shared person URL gets a 1200×630 PNG
 * with portrait + name + era + lifespan + brand mark, generated on-demand
 * and cached at the edge. Same Node.js runtime + bundled fonts pattern as
 * the root /opengraph-image route.
 */

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONT_DIR = join(process.cwd(), "public", "og-fonts");
const serifRegular = readFileSync(join(FONT_DIR, "cormorant-regular.ttf"));
const serifItalic = readFileSync(join(FONT_DIR, "cormorant-italic.ttf"));
const mono = readFileSync(join(FONT_DIR, "jetbrains-mono.ttf"));

const PORTRAIT_DIR = join(process.cwd(), "public", "portraits");
const brandIcon = `data:image/png;base64,${readFileSync(
  join(PORTRAIT_DIR, "mainIcon.png"),
).toString("base64")}`;

const ROLE_LABELS: Record<string, string> = {
  patriarch: "Patriarch",
  matriarch: "Matriarch",
  prophet: "Prophet",
  prophetess: "Prophetess",
  king: "King",
  queen: "Queen",
  priest: "Priest",
  "high-priest": "High Priest",
  judge: "Judge",
  warrior: "Warrior",
  scribe: "Scribe",
  apostle: "Apostle",
  disciple: "Disciple",
  evangelist: "Evangelist",
  "ancestor-of-christ": "In the line of Christ",
};

function loadPortraitDataUri(code: string, gender: string | null): string {
  if (hasNamedPortrait(code)) {
    const path = join(PORTRAIT_DIR, `${code}.png`);
    if (existsSync(path)) {
      return `data:image/png;base64,${readFileSync(path).toString("base64")}`;
    }
  }
  const fallback = gender === "female" ? "default-female.png" : "default-male.png";
  return `data:image/png;base64,${readFileSync(join(PORTRAIT_DIR, fallback)).toString(
    "base64",
  )}`;
}

function pickPrimaryRole(roles: string[]): string | null {
  if (roles.length === 0) return null;
  /*
   * Surface the most evocative role first. "ancestor-of-christ" is high
   * signal for the brand promise but reads weirdly as a primary identifier;
   * promote canonical biblical titles ahead of it.
   */
  const priority = [
    "patriarch",
    "matriarch",
    "king",
    "queen",
    "prophet",
    "prophetess",
    "apostle",
    "disciple",
    "high-priest",
    "priest",
    "judge",
    "evangelist",
    "warrior",
    "scribe",
    "ancestor-of-christ",
  ];
  for (const role of priority) {
    if (roles.includes(role)) return ROLE_LABELS[role] ?? role;
  }
  const first = roles[0];
  return first ? (ROLE_LABELS[first] ?? first) : null;
}

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function PersonOpenGraphImage({
  params,
}: PageProps): Promise<ImageResponse> {
  const { code } = await params;
  const person = await getPersonByCode(code);

  if (!person) {
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
            fontSize: 96,
            color: "#1f2150",
            background: "#fbf7eb",
          }}
        >
          {projectMeta.name}
        </div>
      ),
      {
        ...size,
        fonts: [
          { name: "Cormorant Garamond", data: serifRegular, style: "normal", weight: 500 },
        ],
      },
    );
  }

  const portrait = loadPortraitDataUri(person.code, person.gender);
  const eraLabel = person.era ? ERA_LABELS[person.era as Era] ?? person.era : null;
  const accent = eraColor(person.era);
  const primaryRole = pickPrimaryRole(person.roles);
  const lifespan = person.lifespanYears ? `${person.lifespanYears} years` : null;
  const tribe = person.tribes[0]?.name ?? null;
  const description = person.description?.trim() ?? "";

  const metaPieces = [eraLabel, lifespan, tribe].filter((s): s is string => Boolean(s));
  const metaLine = metaPieces.join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "64px 80px",
          background:
            "radial-gradient(ellipse 80% 60% at 85% 0%, #f5dfbb 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 0% 100%, #d8d8f0 0%, transparent 65%), linear-gradient(180deg, #fbf7eb 0%, #f5efe0 100%)",
        }}
      >
        {primaryRole ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontFamily: "JetBrains Mono",
              fontSize: 18,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#6b6f87",
            }}
          >
            <div style={{ width: 36, height: 1, background: accent }} />
            {primaryRole}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            marginTop: primaryRole ? 32 : 0,
            gap: 56,
            alignItems: "center",
            flex: 1,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portrait}
            width={300}
            height={300}
            alt=""
            style={{
              borderRadius: 24,
              objectFit: "cover",
              boxShadow: `0 0 0 4px ${accent}55, 0 30px 60px rgba(31, 33, 80, 0.18)`,
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: person.name.length > 18 ? 96 : 128,
                lineHeight: 1.0,
                letterSpacing: -2,
                color: "#1f2150",
                display: "flex",
              }}
            >
              {person.name}
            </div>

            {metaLine ? (
              <div
                style={{
                  marginTop: 18,
                  fontFamily: "JetBrains Mono",
                  fontSize: 18,
                  letterSpacing: 1,
                  color: "#3d4060",
                  display: "flex",
                }}
              >
                {metaLine}
              </div>
            ) : null}

            {description ? (
              <div
                style={{
                  marginTop: 24,
                  fontFamily: "Cormorant Garamond",
                  fontStyle: "italic",
                  fontSize: 30,
                  lineHeight: 1.35,
                  color: "#3d4060",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {description}
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "JetBrains Mono",
              fontSize: 18,
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
    {
      ...size,
      fonts: [
        { name: "Cormorant Garamond", data: serifRegular, style: "normal", weight: 500 },
        { name: "Cormorant Garamond", data: serifItalic, style: "italic", weight: 500 },
        { name: "JetBrains Mono", data: mono, style: "normal", weight: 500 },
      ],
    },
  );
}
