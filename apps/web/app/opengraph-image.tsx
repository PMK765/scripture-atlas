import { ImageResponse } from "next/og";
import { projectMeta } from "@bible-visualizer/config";

/*
 * Programmatic Open Graph image rendered via Satori (next/og). Output:
 * 1200×630 PNG served at /opengraph-image and referenced by layout metadata
 * for social previews on iMessage, Twitter, Slack, LinkedIn, etc.
 *
 * Brand: matches the "illuminated parchment" theme — cream gradient ground,
 * deep indigo headline ink, amber accent on the italicized key word. Uses
 * Cormorant Garamond fetched at runtime to match the serif used in-app.
 */

export const runtime = "edge";
export const alt = `${projectMeta.name} — ${projectMeta.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/*
 * Fetch a Google Font as TTF for Satori. Sending a desktop User-Agent forces
 * the woff2-only fallback to omit unsupported variants and return TTF that
 * Satori can parse. The `text=` subset query keeps the payload small so cold
 * starts stay fast.
 */
async function loadGoogleFont(family: string, weight: number, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(
    / /g,
    "+",
  )}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  }).then((r) => r.text());
  const fontUrl = css.match(/src: url\((.+?)\) format\(/)?.[1];
  if (!fontUrl) throw new Error(`Could not locate font URL for ${family}`);
  return fetch(fontUrl).then((r) => r.arrayBuffer());
}

export default async function OpenGraphImage(): Promise<ImageResponse> {
  const headline = "Scripture Atlas";
  const tagline = projectMeta.tagline;
  const marker = "Gen 1:1 → Rev 22:21";
  const url = "scriptureatlas.com";

  const headlineChars = headline + tagline + marker + url + "An atlas of scripture.";
  const [serifRegular, serifItalic, mono] = await Promise.all([
    loadGoogleFont("Cormorant Garamond", 500, headlineChars),
    loadGoogleFont("Cormorant Garamond", 500, headlineChars),
    loadGoogleFont("JetBrains Mono", 500, marker + url),
  ]);

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
              Every person, place, event, and prophecy — mapped, sourced, and connected.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontFamily: "JetBrains Mono",
              fontSize: 22,
              color: "#1f2150",
              fontWeight: 500,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 56,
                height: 56,
                borderRadius: 12,
                background: "#2a2a5e",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "#f4d690",
                  border: "5px solid #e0a440",
                  display: "flex",
                }}
              />
            </div>
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
