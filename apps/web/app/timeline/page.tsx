import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { TimelineExplorer } from "@/components/timeline/timeline-explorer";
import { getAllEvents } from "@/lib/timeline-queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Timeline · Bible Visualizer",
  description:
    "Major events in scripture from creation to AD 100, with year ranges, categories, places, and confidence levels.",
};

export default async function TimelinePage() {
  const events = await getAllEvents();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <PageHero
          marker="Chronology"
          title={
            <>
              From <em>creation</em> to Revelation.
            </>
          }
          subtitle={
            <>
              Click an era to zoom in. Click any dot for details. Events marked
              &ldquo;Traditional&rdquo; depend on interpretive choices (early-date Exodus, AD 30
              vs AD 33 crucifixion) and carry the relevant tradition tag.
            </>
          }
        />

        <TimelineExplorer events={events} />

        <div className="mt-10 max-w-2xl space-y-3 text-xs leading-relaxed text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Chronology used:</span> Masoretic
            patriarchal ages following the traditional young-earth framework
            (Ussher-adjacent). Creation is anchored at ~4004 BC; the Flood at ~2348 BC; the
            Exodus at 1446 BC per 1 Kings 6:1.
          </p>
          <p>
            <span className="font-semibold text-foreground">Where dates differ:</span>{" "}
            Christ&rsquo;s birth is placed ~5&ndash;4 BC (Herod the Great died 4 BC). The
            crucifixion is most commonly dated AD 30, with AD 33 as a notable alternative.
            Late-date Exodus (~1260 BC) is held by many archaeologists; we use the early date.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
