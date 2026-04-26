import type { Metadata, Viewport } from "next";
import { projectMeta } from "@bible-visualizer/config";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: projectMeta.name,
    template: `%s · ${projectMeta.name}`,
  },
  description: projectMeta.description,
  applicationName: projectMeta.name,
  authors: [{ name: projectMeta.name }],
  keywords: [
    "Bible",
    "visualization",
    "scripture",
    "genealogy",
    "timeline",
    "biblical map",
    "prophecy",
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1020" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
