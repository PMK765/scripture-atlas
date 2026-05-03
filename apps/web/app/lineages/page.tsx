import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LineageWorkbench } from "@/components/lineages/lineage-workbench";
import { getLineageGraph } from "@/lib/lineage-queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Lineages · Bible Visualizer",
  description:
    "Explore the biblical family network — pick any person, see ancestors all the way back and descendants forward, and click to drill in.",
};

export default async function LineagesPage() {
  const graph = await getLineageGraph();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] px-6 py-8">
        <header className="mb-4 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Lineages</h1>
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground">{graph.componentSize.toLocaleString()}</span>{" "}
            interconnected people (of {graph.totalPeople.toLocaleString()} total) across{" "}
            <span className="text-foreground">{graph.edges.length.toLocaleString()}</span>{" "}
            relationships. Pick a root person, set how far back and forward to walk, and
            click any node for details.
          </p>
        </header>
        <LineageWorkbench people={graph.people} edges={graph.edges} />
      </main>
      <SiteFooter />
    </>
  );
}
