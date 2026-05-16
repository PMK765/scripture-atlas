import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { LineageWorkbench } from "@/components/lineages/lineage-workbench";
import { getLineageGraph } from "@/lib/lineage-queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Lineages · Scripture Atlas",
  description:
    "Explore the biblical family network — pick any person, see ancestors all the way back and descendants forward, and click to drill in.",
};

export default async function LineagesPage() {
  const graph = await getLineageGraph();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] px-6 py-8">
        <PageHero
          marker="Family"
          title={
            <>
              Every <em>lineage</em>, traced.
            </>
          }
          subtitle={
            <>
              {graph.componentSize.toLocaleString()} interconnected people (of{" "}
              {graph.totalPeople.toLocaleString()} total) across{" "}
              {graph.edges.length.toLocaleString()} relationships. Pick a root, walk
              backward or forward, and click any node for details.
            </>
          }
          size="compact"
        />
        <LineageWorkbench people={graph.people} edges={graph.edges} />
      </main>
      <SiteFooter />
    </>
  );
}
