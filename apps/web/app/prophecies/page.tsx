import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { ProphecyExplorer } from "@/components/prophecy/prophecy-explorer";
import { getAllProphecies } from "@/lib/prophecy-queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Prophecies · Scripture Atlas",
  description:
    "Old Testament messianic prophecies and their New Testament fulfillments — every link cited and dated.",
};

export default async function PropheciesPage() {
  const prophecies = await getAllProphecies();
  const fulfilled = prophecies.filter((p) => p.status === "fulfilled").length;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <PageHero
          marker="Promise & fulfillment"
          title={
            <>
              Prophecy &amp; <em>fulfillment</em>.
            </>
          }
          subtitle="Old Testament prophecies of the Messiah, paired with the New Testament passages that record their fulfillment in Jesus of Nazareth. Every link is cited and dated."
          meta={
            <>
              {prophecies.length} prophecies curated · {fulfilled} fulfilled in Christ.
            </>
          }
        />

        {prophecies.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            No prophecies have been seeded yet. Run{" "}
            <code className="font-mono text-foreground">pnpm db:seed</code> to load the
            curated set.
          </div>
        ) : (
          <ProphecyExplorer prophecies={prophecies} />
        )}

        <p className="mt-12 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          Curation status: messianic prophecies fulfilled in the gospels and the apostolic
          witness. The catalog will expand to non-messianic prophecy/fulfillment pairs
          (judgment on the nations, return from exile, the day of the Lord) over time.
          Every entry cites both the prophetic text and the New Testament fulfillment passage.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
