import Link from "next/link";
import { ERA_LABELS, type Era } from "@bible-visualizer/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Portrait } from "@/components/people/portrait";
import { eraColor } from "@/components/lineages/era-color";
import { cn } from "@/lib/utils";
import type { PersonSummary } from "@/lib/people-queries";

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

export function PersonCard({ person }: { person: PersonSummary }) {
  const lifespan = person.lifespanYears ? `${person.lifespanYears} yrs` : null;
  const eraLabel = person.era ? ERA_LABELS[person.era as Era] ?? person.era : null;
  const accent = eraColor(person.era);
  const primaryRoles = person.roles
    .filter((r) => r !== "ancestor-of-christ")
    .slice(0, 3);

  return (
    <Link
      href={`/people/${person.code}`}
      className="group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      aria-label={`View ${person.name}`}
    >
      <Card
        className={cn(
          "h-full transition-colors group-hover:border-primary/50 group-hover:bg-card/80",
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Portrait
              code={person.code}
              gender={person.gender}
              name={person.name}
              size={48}
              rounded="md"
              ringColor={`${accent}55`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-tight">{person.name}</CardTitle>
                {lifespan ? <Badge variant="outline">{lifespan}</Badge> : null}
              </div>
              {person.alternateNames.length > 0 ? (
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {person.alternateNames.slice(0, 3).join(" · ")}
                </p>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-0">
          <div className="flex flex-wrap gap-1.5">
            {eraLabel ? <Badge variant="primary">{eraLabel}</Badge> : null}
            {primaryRoles.map((r) => (
              <Badge key={r} variant="default">
                {ROLE_LABELS[r] ?? r}
              </Badge>
            ))}
            {person.tribes.slice(0, 2).map((t) => (
              <Badge key={t.code} variant="default">
                {t.name}
              </Badge>
            ))}
            {person.roles.includes("ancestor-of-christ") ? (
              <Badge variant="accent">Christ&apos;s line</Badge>
            ) : null}
          </div>
          {person.description ? (
            <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {person.description}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
