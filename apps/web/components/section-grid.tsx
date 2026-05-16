import {
  BookOpen,
  Clock,
  GitBranch,
  Map,
  Network,
  Users,
  type LucideIcon,
} from "lucide-react";
import { featureFlags, type FeatureFlagKey } from "@bible-visualizer/config";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SectionDef = {
  key: FeatureFlagKey;
  href: string;
  icon: LucideIcon;
};

const sections: SectionDef[] = [
  { key: "books", href: "#books", icon: BookOpen },
  { key: "timeline", href: "/timeline", icon: Clock },
  { key: "people", href: "/people", icon: Users },
  { key: "tribes", href: "/tribes", icon: Network },
  { key: "lineages", href: "/lineages", icon: GitBranch },
  { key: "map", href: "/map", icon: Map },
];

export function SectionGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="mb-10 max-w-2xl">
        <span className="verse-marker">Six lenses</span>
        <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          Pick a way in.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Read the books. Walk the timeline. Trace a lineage. Stand on the map.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ key, href, icon: Icon }) => {
          const flag = featureFlags[key];
          return (
            <a key={key} href={href} className="group">
              <Card className="h-full overflow-hidden transition-all group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-md">
                <CardHeader>
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-md text-primary-foreground shadow-sm"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    {!flag.enabled && (
                      <Badge variant="outline">{flag.experimental ? "Soon" : "Off"}</Badge>
                    )}
                  </div>
                  <CardTitle className="font-serif text-xl font-medium tracking-tight">
                    {flag.label}
                  </CardTitle>
                  <CardDescription>{flag.description}</CardDescription>
                </CardHeader>
              </Card>
            </a>
          );
        })}
      </div>
    </section>
  );
}
