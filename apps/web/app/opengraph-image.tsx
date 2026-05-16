import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { projectMeta } from "@bible-visualizer/config";

/*
 * Programmatic Open Graph image rendered via Satori (next/og). 1200×630 PNG
 * served at /opengraph-image and referenced by layout metadata for social
 * previews on iMessage, Twitter/X, Discord, Slack, LinkedIn, etc.
 *
 * Runtime notes:
 *   - Node.js runtime (not edge) so we can use fs to load bundled fonts.
 *     Turbopack does not currently resolve `new URL(...import.meta.url)` for
 *     binary asset imports the way Webpack does, so the edge-friendly
 *     pattern from Vercel's docs fails the build.
 *   - Fonts live under public/ so Vercel always includes them in the
 *     deployment bundle — files inside app/ are only tracked when statically
 *     imported, which doesn't apply to fs.readFileSync calls.
 *   - Fonts are bundled rather than fetched from Google Fonts because
 *     Vercel datacenter IPs were being silently rejected by Google's CSS
 *     endpoint, producing blank PNGs in production.
 */

export const runtime = "nodejs";
export const alt = `${projectMeta.name} — ${projectMeta.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONT_DIR = join(process.cwd(), "public", "og-fonts");
const serifRegular = readFileSync(join(FONT_DIR, "cormorant-regular.ttf"));
const serifItalic = readFileSync(join(FONT_DIR, "cormorant-italic.ttf"));
const mono = readFileSync(join(FONT_DIR, "jetbrains-mono.ttf"));

const brandIcon = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public", "portraits", "mainIcon.png"),
).toString("base64")}`;

export default async function OpenGraphImage(): Promise<ImageResponse> {
  const marker = "Gen 1:1 → Rev 22:21";
  const url = "scriptureatlas.com";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px 96px",
          background:
            "radial-gradient(ellipse 80% 60% at 85% 0%, #f5dfbb 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 0% 100%, #d8d8f0 0%, transparent 65%), linear-gradient(180deg, #fbf7eb 0%, #f5efe0 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: "JetBrains Mono",
            fontSize: 22,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#6b6f87",
          }}
        >
          <div style={{ width: 48, height: 1, background: "#9b6a3a" }} />
          {marker}
          <div style={{ width: 48, height: 1, background: "#9b6a3a" }} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 56,
            gap: 4,
          }}
        >
          <div
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: 156,
              lineHeight: 1.02,
              letterSpacing: -3,
              color: "#1f2150",
              display: "flex",
            }}
          >
            Scripture
          </div>
          <div
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: 156,
              lineHeight: 1.02,
              letterSpacing: -3,
              fontStyle: "italic",
              color: "#2e3680",
              display: "flex",
              background: "linear-gradient(135deg, #2e3680 0%, #1f2150 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Atlas.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 720,
            }}
          >
            <div
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: 36,
                lineHeight: 1.3,
                color: "#3d4060",
                display: "flex",
              }}
            >
              People, places, events, and prophecies of scripture — mapped, sourced, and connected.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontFamily: "JetBrains Mono",
              fontSize: 22,
              color: "#1f2150",
              fontWeight: 500,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brandIcon}
              width={64}
              height={64}
              style={{ borderRadius: 12 }}
              alt=""
            />
            {url}
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
