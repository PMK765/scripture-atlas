import type { MetadataRoute } from "next";
import { books } from "@bible-visualizer/bible-data";
import { projectMeta } from "@bible-visualizer/config";
import { getAllPeople } from "@/lib/people-queries";
import { getAllPlaces } from "@/lib/place-queries";
import { getAllTribes } from "@/lib/tribe-queries";

/*
 * Sitemap generated at runtime, cached for 1 hour. Includes:
 *   - All top-level static routes
 *   - Each book overview + each chapter within
 *   - Each person, tribe, and place detail page
 *
 * Lineages/timeline/prophecies/names don't yet have per-entity detail pages,
 * so they appear only as their list URLs. When detail routes ship for those
 * sections, add them to the corresponding loop below.
 */

export const revalidate = 3600;

const BASE = projectMeta.siteUrl;

type SitemapEntry = MetadataRoute.Sitemap[number];

function entry(
  path: string,
  options: { changeFrequency?: SitemapEntry["changeFrequency"]; priority?: number } = {},
): SitemapEntry {
  return {
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: options.changeFrequency ?? "monthly",
    priority: options.priority ?? 0.5,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: SitemapEntry[] = [
    entry("/", { changeFrequency: "weekly", priority: 1.0 }),
    entry("/timeline", { changeFrequency: "monthly", priority: 0.9 }),
    entry("/people", { changeFrequency: "weekly", priority: 0.9 }),
    entry("/tribes", { changeFrequency: "monthly", priority: 0.8 }),
    entry("/lineages", { changeFrequency: "monthly", priority: 0.9 }),
    entry("/map", { changeFrequency: "monthly", priority: 0.9 }),
    entry("/prophecies", { changeFrequency: "monthly", priority: 0.8 }),
    entry("/names", { changeFrequency: "monthly", priority: 0.8 }),
    entry("/sources", { changeFrequency: "yearly", priority: 0.3 }),
  ];

  const bookRoutes: SitemapEntry[] = books.flatMap((book) => {
    const overview = entry(`/books/${book.id}`, {
      changeFrequency: "yearly",
      priority: 0.7,
    });
    const chapters: SitemapEntry[] = [];
    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      chapters.push(
        entry(`/books/${book.id}/${chapter}`, {
          changeFrequency: "yearly",
          priority: 0.6,
        }),
      );
    }
    return [overview, ...chapters];
  });

  /*
   * Pull dynamic-route entities in parallel. If any one query fails (DB
   * downtime, schema drift), we degrade gracefully to "no entries from that
   * source" rather than returning a broken sitemap with HTTP 500. Static
   * routes still get served.
   */
  const [peopleResult, placesResult, tribesResult] = await Promise.allSettled([
    getAllPeople(),
    getAllPlaces(),
    getAllTribes(),
  ]);

  const peopleRoutes: SitemapEntry[] =
    peopleResult.status === "fulfilled"
      ? peopleResult.value.map((p) =>
          entry(`/people/${p.code}`, { changeFrequency: "monthly", priority: 0.6 }),
        )
      : [];

  const placesRoutes: SitemapEntry[] =
    placesResult.status === "fulfilled"
      ? placesResult.value.map((p) =>
          entry(`/places/${p.code}`, { changeFrequency: "monthly", priority: 0.6 }),
        )
      : [];

  const tribesRoutes: SitemapEntry[] =
    tribesResult.status === "fulfilled"
      ? tribesResult.value.map((t) =>
          entry(`/tribes/${t.code}`, { changeFrequency: "monthly", priority: 0.6 }),
        )
      : [];

  return [
    ...staticRoutes,
    ...bookRoutes,
    ...peopleRoutes,
    ...placesRoutes,
    ...tribesRoutes,
  ];
}
