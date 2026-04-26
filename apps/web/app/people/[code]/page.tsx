import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ERA_LABELS, type Era } from "@bible-visualizer/config";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { FamilyTree } from "@/components/people/family-tree";
import { RelationshipList } from "@/components/people/relationship-list";
import { getPersonByCode, getPersonNeighborhood } from "@/lib/people-queries";
import { cn } from "@/lib/utils";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const person = await getPersonByCode(code);
  if (!person) return { title: "Person not found · Bible Visualizer" };
  return {
    title: `${person.name} · People · Bible Visualizer`,
    description: person.description ?? undefined,
  };
}

const ROLE_LABELS: Record<string, string> = {
  patriarch: "Patriarch",
  matriarch: "Matriarch",
  prophet: "Prophet",
  prophetess: "Prophetess",
  king: "King",
  queen: "Queen",
  priest: "Priest",
  "high-priest": "High priest",
  judge: "Judge",
  warrior: "Warrior",
  scribe: "Scribe",
  apostle: "Apostle",
  disciple: "Disciple",
  evangelist: "Evangelist",
  "ancestor-of-christ": "In the line of Christ",
};

const CONFIDENCE_LABELS: Record<string, string> = {
  explicit: "Explicit",
  inferred: "Inferred",
  traditional: "Traditional",
  debated: "Debated",
};

export default async function PersonPage({ params }: PageProps) {
  const { code } = await params;
  const person = await getPersonByCode(code);
  if (!person) notFound();

  const neighborhood = await getPersonNeighborhood(person.id, 2);
  const eraLabel = person.era ? ERA_LABELS[person.era as Era] ?? person.era : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6">
          <Link
            href="/people"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> All people
          </Link>
        </div>

        <header className="mb-8 space-y-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{person.name}</h1>
            {person.gender ? (
              <span className="text-lg text-muted-foreground" aria-label={person.gender}>
                {person.gender === "male" ? "♂" : person.gender === "female" ? "♀" : ""}
              </span>
            ) : null}
            <Badge
              variant={person.confidenceLevel === "debated" ? "outline" : "primary"}
              className={cn(
                person.confidenceLevel === "debated" &&
                  "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300",
              )}
            >
              {CONFIDENCE_LABELS[person.confidenceLevel] ?? person.confidenceLevel}
            </Badge>
          </div>

          {person.alternateNames.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              Also known as{" "}
              <span className="text-foreground">{person.alternateNames.join(" · ")}</span>
            </p>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {eraLabel ? <Badge variant="primary">{eraLabel}</Badge> : null}
            {person.lifespanYears ? (
              <Badge variant="outline">{person.lifespanYears} years</Badge>
            ) : null}
            {person.roles.map((r) => (
              <Badge
                key={r}
                variant={r === "ancestor-of-christ" ? "accent" : "default"}
              >
                {ROLE_LABELS[r] ?? r}
              </Badge>
            ))}
            {person.tribes.map((t) => (
              <Link
                key={t.code}
                href={`/tribes/${t.code}`}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md"
              >
                <Badge
                  variant="default"
                  className="cursor-pointer hover:bg-primary/10 hover:text-foreground"
                >
                  {t.name}
                </Badge>
              </Link>
            ))}
            {person.traditionTags.map((t) => (
              <Badge key={t} variant="outline" className="font-mono">
                {t}
              </Badge>
            ))}
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
          <div className="min-w-0 space-y-8">
            {person.description ? (
              <section className="space-y-2">
                <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Description
                </h2>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {person.description}
                </p>
              </section>
            ) : null}

            <section className="space-y-3">
              <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Relationships
              </h2>
              {neighborhood ? (
                <RelationshipList
                  focusId={person.id}
                  nodes={neighborhood.nodes}
                  edges={neighborhood.edges}
                />
              ) : null}
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Family tree
              </h2>
              <p className="text-xs text-muted-foreground">
                Two generations up and down. Click any other person to recenter the tree on them.
                Solid lines are parent-of relationships; dashed pink lines are spouses; dashed amber
                lines are debated/tradition-divergent edges.
              </p>
              {neighborhood ? (
                <FamilyTree
                  focusId={person.id}
                  nodes={neighborhood.nodes}
                  edges={neighborhood.edges}
                />
              ) : null}
            </section>

            {person.notes ? (
              <section className="space-y-2">
                <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Notes
                </h2>
                <p className="text-sm leading-relaxed text-foreground/80">{person.notes}</p>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <section className="space-y-3 rounded-lg border bg-card p-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Scripture references
              </h3>
              {person.scriptureReferences.length === 0 ? (
                <p className="text-xs text-muted-foreground">None recorded.</p>
              ) : (
                <ol className="space-y-1.5 text-xs">
                  {person.scriptureReferences.map((ref) => (
                    <li key={ref} className="font-mono text-foreground/80">
                      {ref}
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {person.ageAtDeathRef ? (
              <section className="space-y-1 rounded-lg border bg-card p-4">
                <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Lifespan source
                </h3>
                <p className="font-mono text-xs text-foreground/80">{person.ageAtDeathRef}</p>
              </section>
            ) : null}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
