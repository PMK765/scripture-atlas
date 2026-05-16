import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { listDataSources } from "@bible-visualizer/bible-data";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Sources & attributions · Bible Visualizer",
  description:
    "Provenance for all external data used by Bible Visualizer — distinguishing scripture-anchored claims from external scholarly reconstructions.",
};

export default function SourcesPage() {
  const sources = listDataSources();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <PageHero
          marker="Provenance"
          title={
            <>
              Sources &amp; <em>attributions</em>.
            </>
          }
          subtitle="Bible Visualizer mixes two kinds of data — and the difference matters."
        />

        <section className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="mb-2 text-sm font-semibold tracking-tight text-foreground">
              Scripture-anchored data
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Names, relationships, scripture references, narrative descriptions, lifespans —
              everything traceable to a verse — is hand-curated and labeled with a confidence
              level (stated · inferred · traditional · debated). Scripture itself is treated as
              the authoritative source. Curated entries do not carry a source badge.
            </p>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5">
            <h2 className="mb-2 text-sm font-semibold tracking-tight text-amber-800 dark:text-amber-200">
              External scholarly data
            </h2>
            <p className="text-xs leading-relaxed text-amber-900/80 dark:text-amber-100/80">
              Modern coordinates for ancient places, tribal allotment polygons, and empire
              boundaries come from external datasets compiled by scholars and atlas-makers.
              These are <span className="font-medium">best-effort reconstructions</span> — not
              divinely inspired — and different scholars sometimes disagree. Anything sourced
              externally is marked with a <span className="font-medium">Source</span> badge that
              links back to the original dataset.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-base font-semibold tracking-tight">
            External sources currently in use
          </h2>
          <ul className="space-y-4">
            {sources.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border bg-card p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-base font-semibold tracking-tight text-foreground hover:text-primary"
                  >
                    {s.name}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                  <span className="rounded-full border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {s.license}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
                {s.attribution ? (
                  <p className="mt-3 rounded-md border bg-muted/30 p-2.5 font-mono text-[11px] leading-relaxed text-foreground/80">
                    {s.attribution}
                  </p>
                ) : null}
                {s.notes ? (
                  <p className="mt-3 text-[11px] italic leading-relaxed text-muted-foreground">
                    Note: {s.notes}
                  </p>
                ) : null}
                {s.licenseUrl ? (
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    License:{" "}
                    <a
                      href={s.licenseUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline-offset-2 hover:underline"
                    >
                      {s.license}
                    </a>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-12 text-xs leading-relaxed text-muted-foreground">
          See an attribution problem or have a more authoritative source for a place or
          territory boundary? File an issue on{" "}
          <Link
            href="https://github.com/PMK765/bible-visualizer"
            className="underline-offset-2 hover:underline"
          >
            GitHub
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
