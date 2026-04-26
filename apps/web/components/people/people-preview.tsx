import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PersonSummary } from "@/lib/people-queries";
import { PersonCard } from "@/components/people/person-card";

interface PeoplePreviewProps {
  people: PersonSummary[];
}

const SPOTLIGHT_CODES = [
  "abraham",
  "isaac",
  "jacob",
  "joseph",
  "judah",
  "noah",
  "esau",
  "ishmael",
];

export function PeoplePreview({ people }: PeoplePreviewProps) {
  const byCode = new Map(people.map((p) => [p.code, p]));
  const spotlight = SPOTLIGHT_CODES.map((c) => byCode.get(c)).filter(
    (p): p is PersonSummary => p !== undefined,
  );
  const total = people.length;

  return (
    <section id="people" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Figures
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">People</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Named figures in scripture with relatives, lifespans, and verse-traceable references.
            Genesis 1–50 patriarchal narratives are complete through Joseph.{" "}
            <span className="text-foreground/80">{total} curated so far.</span>
          </p>
        </div>
        <Link
          href="/people"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Browse all <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      {spotlight.length === 0 ? (
        <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          No people seeded yet. Run <code>pnpm db:seed</code> from the repo root.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {spotlight.slice(0, 4).map((p) => (
            <PersonCard key={p.id} person={p} />
          ))}
        </div>
      )}
    </section>
  );
}
