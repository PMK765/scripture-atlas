import type { MetadataRoute } from "next";
import { projectMeta } from "@bible-visualizer/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /*
         * /api/ — Next.js API routes (not relevant for SEO)
         * /search — search results pages are query-string driven, low value
         *   to index and risk infinite duplicate-content paths
         */
        disallow: ["/api/", "/search"],
      },
    ],
    sitemap: `${projectMeta.siteUrl}/sitemap.xml`,
    host: projectMeta.siteUrl,
  };
}
