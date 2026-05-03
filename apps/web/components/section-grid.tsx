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
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Explore</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Six primary lenses for the biblical narrative.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ key, href, icon: Icon }) => {
          const flag = featureFlags[key];
          return (
            <a key={key} href={href} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    {!flag.enabled && (
                      <Badge variant="outline">{flag.experimental ? "Soon" : "Off"}</Badge>
                    )}
                  </div>
                  <CardTitle>{flag.label}</CardTitle>
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
