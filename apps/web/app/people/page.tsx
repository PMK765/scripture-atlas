import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@bible-visualizer/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PersonCard } from "@/components/people/person-card";
import { PeopleFilterBar } from "@/components/people/people-filter-bar";
import { getAllPeople } from "@/lib/people-queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "People · Bible Visualizer",
  description:
    "Every named figure in scripture, with relatives, lifespan, scripture references, and confidence levels.",
};

interface PageProps {
  searchParams: Promise<{
    era?: string;
    role?: string;
    tribe?: string;
    q?: string;
    sort?: string;
  }>;
}

export default async function PeoplePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const era = typeof sp.era === "string" ? sp.era : undefined;
  const role = typeof sp.role === "string" ? sp.role : undefined;
  const tribe = typeof sp.tribe === "string" ? sp.tribe : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const sort = sp.sort === "chronological" ? "chronological" : "name";

  const [people, eraGroups, roleGroupsRaw, tribeRows, totalAll] = await Promise.all([
    getAllPeople({ era, role, tribe, search: q, sort }),
    prisma.person.groupBy({
      by: ["era"],
      _count: { _all: true },
      where: { era: { not: null } },
    }),
    prisma.person.findMany({ select: { roles: true } }),
    prisma.tribe.findMany({
      select: {
        code: true,
        name: true,
        type: true,
        _count: { select: { members: true } },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
    prisma.person.count(),
  ]);

  const eras = eraGroups
    .filter((g): g is { era: string; _count: { _all: number } } => g.era !== null)
    .map((g) => ({ era: g.era, count: g._count._all }))
    .sort((a, b) => b.count - a.count);

  const roleCounts = new Map<string, number>();
  for (const row of roleGroupsRaw) {
    for (const r of row.roles) roleCounts.set(r, (roleCounts.get(r) ?? 0) + 1);
  }
  const roles = Array.from(roleCounts.entries())
    .map(([r, count]) => ({ role: r, count }))
    .sort((a, b) => b.count - a.count);

  const tribes = tribeRows
    .map((t) => ({ code: t.code, name: t.name, count: t._count.members }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  const total = people.length;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Figures
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">People</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Named figures in scripture with relatives, lifespan, and scripture references. Every
            claim is traceable; tradition tags surface where readings differ (Masoretic vs.
            Septuagint/Lukan, etc.).{" "}
            <span className="text-foreground/80">
              {total.toLocaleString()} of {totalAll.toLocaleString()} curated
              {q || era || role ? " matching" : ""}.
            </span>
          </p>
        </header>

        <div className="mb-8">
          <PeopleFilterBar eras={eras} roles={roles} tribes={tribes} activeSort={sort} />
        </div>

        {people.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            No people match these filters.{" "}
            <Link href="/people" className="text-foreground underline-offset-2 hover:underline">
              Reset
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((p) => (
              <PersonCard key={p.id} person={p} />
            ))}
          </div>
        )}

        <p className="mt-10 max-w-2xl text-xs text-muted-foreground">
          Curation status: Primeval (Genesis 1&ndash;11), patriarchs (Genesis 12&ndash;50),
          Exodus/Numbers, Joshua/Judges/Ruth, the united and divided monarchies (Saul, David, all
          kings of Judah and Israel), the writing prophets, post-exilic figures (Zerubbabel, Ezra,
          Nehemiah, Esther), the Holy Family, John the Baptist, the Twelve, and the early
          apostolic generation are all in. {totalAll.toLocaleString()} figures curated so far.
          The remaining named biblical figures (priestly genealogies in 1 Chronicles, the post-exile
          lists in Ezra/Nehemiah, the obscure persons in Acts and the epistles) are pending. Every
          claim is rigorously sourced; gaps mean &ldquo;not yet curated&rdquo;, not &ldquo;not in
          scripture&rdquo;.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
