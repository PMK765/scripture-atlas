import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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
        <header className="mb-8 space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Chronology
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Timeline</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Major events in the biblical narrative laid out by year. Drag the range sliders to
            zoom; filter by category. Dates marked &ldquo;Traditional&rdquo; depend on
            interpretive choices (early-date Exodus, AD 30 vs AD 33 crucifixion, etc.) and the
            relevant tradition tag is shown on the event.
          </p>
        </header>

        <TimelineExplorer events={events} />

        <p className="mt-10 max-w-2xl text-xs text-muted-foreground">
          Dating notes: Patriarchal years follow the Masoretic-text chronology. The Exodus is
          dated 1446 BC per 1 Kings 6:1; the late-date (~1260 BC) reading is also defensible.
          Christ&rsquo;s birth is placed ~5&ndash;4 BC (Herod the Great died in 4 BC). The
          crucifixion is most commonly dated AD 30, with AD 33 as a notable alternative.
          Pre-Abrahamic events (Creation, Flood) are listed without years to respect both
          young-earth and old-earth readings.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
