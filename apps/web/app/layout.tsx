import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { projectMeta } from "@bible-visualizer/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(projectMeta.siteUrl),
  title: {
    default: projectMeta.name,
    template: `%s · ${projectMeta.name}`,
  },
  description: projectMeta.description,
  applicationName: projectMeta.name,
  authors: [{ name: projectMeta.name }],
  keywords: [
    "Bible",
    "scripture",
    "biblical genealogy",
    "biblical timeline",
    "biblical map",
    "messianic prophecy",
    "Hebrew names",
    "Old Testament",
    "New Testament",
    "Bible atlas",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: projectMeta.siteUrl,
    siteName: projectMeta.name,
    title: projectMeta.name,
    description: projectMeta.tagline,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${projectMeta.name} — ${projectMeta.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: projectMeta.name,
    description: projectMeta.tagline,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: projectMeta.siteUrl,
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fbf7eb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body className="min-h-dvh antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
