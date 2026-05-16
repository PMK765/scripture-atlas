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
  colorScheme: "light",
  themeColor: "#fbf7eb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
