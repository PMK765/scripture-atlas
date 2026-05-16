import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ERA_LABELS, type Era } from "@bible-visualizer/config";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTribeByCode, getTribeMembers } from "@/lib/tribe-queries";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ code: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  patriarchal: "Tribe of Israel",
  nation: "Nation",
  clan: "Clan",
  confederation: "Confederation",
  "tribal-group": "Tribal group",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const tribe = await getTribeByCode(code);
  if (!tribe) return { title: "Tribe not found · Bible Visualizer" };
  return {
    title: `${tribe.name} · Tribes · Bible Visualizer`,
    description: tribe.description ?? undefined,
  };
}

export default async function TribePage({ params }: PageProps) {
  const { code } = await params;
  const tribe = await getTribeByCode(code);
  if (!tribe) notFound();

  const members = await getTribeMembers(tribe.id);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6">
          <Link
            href="/tribes"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> All tribes
          </Link>
        </div>

        <header className="mb-8 space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {TYPE_LABELS[tribe.type] ?? tribe.type}
          </p>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            {tribe.name}
          </h1>
          {tribe.alternateNames.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              Also known as{" "}
              <span className="text-foreground">{tribe.alternateNames.join(" · ")}</span>
            </p>
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            {tribe.founder ? (
              <Link href={`/people/${tribe.founder.code}`}>
                <Badge variant="primary" className="cursor-pointer hover:bg-primary/20">
                  Founder: {tribe.founder.name}
                </Badge>
              </Link>
            ) : null}
            {tribe.parent ? (
              <Link href={`/tribes/${tribe.parent.code}`}>
                <Badge variant="default" className="cursor-pointer hover:bg-primary/10">
                  Within: {tribe.parent.name}
                </Badge>
              </Link>
            ) : null}
            <Badge variant="outline">
              {members.length} {members.length === 1 ? "member" : "members"}
            </Badge>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
          <div className="min-w-0 space-y-8">
            {tribe.description ? (
              <section className="space-y-2">
                <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  About
                </h2>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {tribe.description}
                </p>
              </section>
            ) : null}

            {tribe.jacobsBlessing ? (
              <section className="space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Jacob's {tribe.jacobsBlessing.type === "curse" ? "curse" : tribe.jacobsBlessing.type === "mixed" ? "oracle" : "blessing"}
                  </h2>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {tribe.jacobsBlessing.reference} ({tribe.jacobsBlessing.translation})
                  </span>
                </div>
                <blockquote
                  className={`rounded-lg border-l-2 bg-card/60 px-5 py-4 text-sm italic leading-relaxed text-foreground/90 ${
                    tribe.jacobsBlessing.type === "curse"
                      ? "border-l-destructive/60"
                      : tribe.jacobsBlessing.type === "mixed"
                        ? "border-l-amber-500/60"
                        : "border-l-primary/60"
                  }`}
                >
                  {tribe.jacobsBlessing.text}
                </blockquote>
              </section>
            ) : null}

            {tribe.subtribes.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Sub-tribes
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tribe.subtribes.map((s) => (
                    <Link key={s.code} href={`/tribes/${s.code}`}>
                      <Badge
                        variant="default"
                        className="cursor-pointer hover:bg-primary/10"
                      >
                        {s.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="space-y-3">
              <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Members{" "}
                <span className="text-foreground/60">{members.length}</span>
              </h2>
              {members.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No members curated yet.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {members.map((m) => (
                    <Link
                      key={m.id}
                      href={`/people/${m.code}`}
                      className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <Card className="h-full transition-colors group-hover:border-primary/50 group-hover:bg-card/80">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-baseline justify-between gap-2 text-sm">
                            <span>{m.name}</span>
                            {m.gender ? (
                              <span
                                className="text-xs text-muted-foreground"
                                aria-label={m.gender}
                              >
                                {m.gender === "male" ? "♂" : m.gender === "female" ? "♀" : ""}
                              </span>
                            ) : null}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-1.5 pt-0 text-xs">
                          {m.era ? (
                            <span className="text-muted-foreground">
                              {ERA_LABELS[m.era as Era] ?? m.era}
                            </span>
                          ) : null}
                          {m.lifespanYears ? (
                            <span className="text-muted-foreground">
                              · {m.lifespanYears} yrs
                            </span>
                          ) : null}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {tribe.notes ? (
              <section className="space-y-2">
                <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Notes
                </h2>
                <p className="text-sm leading-relaxed text-foreground/80">{tribe.notes}</p>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <section className="space-y-3 rounded-lg border bg-card p-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Scripture references
              </h3>
              {tribe.scriptureReferences.length === 0 ? (
                <p className="text-xs text-muted-foreground">None recorded.</p>
              ) : (
                <ol className="space-y-1.5 text-xs">
                  {tribe.scriptureReferences.map((ref) => (
                    <li key={ref} className="font-mono text-foreground/80">
                      {ref}
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className="space-y-1 rounded-lg border bg-card p-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Browse members
              </h3>
              <Link
                href={`/people?tribe=${tribe.code}`}
                className="text-xs text-foreground underline-offset-2 hover:underline"
              >
                Filter all people by {tribe.name} →
              </Link>
            </section>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
