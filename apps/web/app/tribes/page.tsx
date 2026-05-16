import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllTribes } from "@/lib/tribe-queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tribes & nations · Bible Visualizer",
  description:
    "Tribes, clans, and nations of scripture: their founders, members, and place in the larger narrative.",
};

const TYPE_LABELS: Record<string, string> = {
  patriarchal: "Tribe of Israel",
  nation: "Nation",
  clan: "Clan",
  confederation: "Confederation",
  "tribal-group": "Tribal group",
};

const TYPE_ORDER = ["nation", "patriarchal", "clan", "confederation", "tribal-group"];

export default async function TribesPage() {
  const tribes = await getAllTribes();

  const grouped = new Map<string, typeof tribes>();
  for (const t of tribes) {
    const list = grouped.get(t.type) ?? [];
    list.push(t);
    grouped.set(t.type, list);
  }
  const orderedGroups = TYPE_ORDER.filter((t) => grouped.has(t)).map((t) => ({
    type: t,
    tribes: grouped.get(t) ?? [],
  }));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <PageHero
          marker="Peoples"
          title={
            <>
              Tribes &amp; <em>nations</em>.
            </>
          }
          subtitle="Twelve tribes of Israel; nations descended from Abraham, Lot, and Esau. Each tribe links to its founder and members."
        />

        <div className="space-y-10">
          {orderedGroups.map(({ type, tribes: groupTribes }) => (
            <section key={type} className="space-y-3">
              <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {TYPE_LABELS[type] ?? type}
                <span className="ml-2 text-foreground/60">{groupTribes.length}</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {groupTribes.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tribes/${t.code}`}
                    className="group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <Card className="h-full transition-colors group-hover:border-primary/50 group-hover:bg-card/80">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle className="text-base">{t.name}</CardTitle>
                          <Badge variant="outline">
                            {t.memberCount} {t.memberCount === 1 ? "member" : "members"}
                          </Badge>
                        </div>
                        {t.alternateNames.length > 0 ? (
                          <p className="text-xs text-muted-foreground">
                            {t.alternateNames.slice(0, 2).join(" · ")}
                          </p>
                        ) : null}
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2 pt-0 text-xs text-muted-foreground">
                        {t.founder ? (
                          <p>
                            Founder:{" "}
                            <span className="text-foreground/90">{t.founder.name}</span>
                          </p>
                        ) : null}
                        {t.parent ? (
                          <p>
                            Within: <span className="text-foreground/90">{t.parent.name}</span>
                          </p>
                        ) : null}
                        {t.description ? (
                          <p className="line-clamp-3 leading-relaxed">{t.description}</p>
                        ) : null}
                        <span className="mt-1 inline-flex items-center gap-1 text-foreground/80 group-hover:gap-2 transition-all">
                          View tribe <ArrowRight className="h-3 w-3" aria-hidden />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
