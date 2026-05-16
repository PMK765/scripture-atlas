import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
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
        <PageHero
          marker="Geography"
          title={
            <>
              Walk the <em>land</em>.
            </>
          }
          subtitle="Cities, regions, and shifting borders — sourced and dated. Tradition tags appear where a site is disputed."
        />

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
