import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MapExplorer } from "@/components/map/map-explorer";
import { getAllPlaces } from "@/lib/place-queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Map · Bible Visualizer",
  description:
    "Major biblical places marked on a modern map, with region, scripture references, and modern equivalents.",
};

export default async function MapPage() {
  const places = await getAllPlaces();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Geography
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Map</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Major biblical sites marked on a modern map. Coordinates point to the most-commonly
            accepted identification; tradition tags appear on places where the location is
            disputed (Sodom, Mount Sinai, Golgotha). Territorial borders are intentionally not
            drawn — ancient kingdom boundaries shifted on every reign and any single-frame border
            is a lie. City-point markers are honest.
          </p>
        </header>

        <MapExplorer places={places} />

        <p className="mt-10 max-w-2xl text-xs text-muted-foreground">
          Curation status: 53 major sites curated so far. The remaining biblical place-names
          (Levitical cities, prophetic-oracle cities, Pauline waypoints) are pending.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
