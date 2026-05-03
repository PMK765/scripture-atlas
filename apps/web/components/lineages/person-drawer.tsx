"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, Locate } from "lucide-react";
import { ERA_LABELS, type Era } from "@bible-visualizer/config";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Portrait } from "@/components/people/portrait";
import { cn } from "@/lib/utils";
import { eraColor } from "./era-color";

interface PersonDrawerProps {
  open: boolean;
  code: string | null;
  onOpenChange: (open: boolean) => void;
  onSetRoot?: (code: string) => void;
}

interface DrawerPerson {
  id: string;
  code: string;
  name: string;
  alternateNames: string[];
  gender: string | null;
  era: string | null;
  roles: string[];
  description: string | null;
  notes: string | null;
  lifespanYears: number | null;
  birthYear: number | null;
  deathYear: number | null;
  confidenceLevel: string;
  traditionTags: string[];
  scriptureReferences: string[];
  ageAtDeathRef: string | null;
  tribes: Array<{ code: string; name: string; type: string }>;
}

const ROLE_LABELS: Record<string, string> = {
  patriarch: "Patriarch",
  matriarch: "Matriarch",
  prophet: "Prophet",
  prophetess: "Prophetess",
  king: "King",
  queen: "Queen",
  "queen-mother": "Queen mother",
  priest: "Priest",
  "high-priest": "High priest",
  levite: "Levite",
  judge: "Judge",
  warrior: "Warrior",
  scribe: "Scribe",
  apostle: "Apostle",
  disciple: "Disciple",
  evangelist: "Evangelist",
  "ancestor-of-christ": "In the line of Christ",
};

const CONFIDENCE_LABELS: Record<string, string> = {
  stated: "Stated",
  inferred: "Inferred",
  traditional: "Traditional",
  debated: "Debated",
};

export function PersonDrawer({ open, code, onOpenChange, onSetRoot }: PersonDrawerProps) {
  const [person, setPerson] = useState<DrawerPerson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !code) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPerson(null);
    fetch(`/api/people/${encodeURIComponent(code)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<DrawerPerson>;
      })
      .then((data) => {
        if (!cancelled) setPerson(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, code]);

  const accent = eraColor(person?.era ?? null);
  const eraLabel = person?.era ? ERA_LABELS[person.era as Era] ?? person.era : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-md overflow-y-auto sm:max-w-lg"
      >
        {!person ? (
          <VisuallyHidden.Root>
            <SheetTitle>Person details</SheetTitle>
          </VisuallyHidden.Root>
        ) : null}
        {loading && !person ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-sm text-destructive">
            {error}
          </div>
        ) : person ? (
          <div className="flex flex-col gap-6">
            <div
              className="-mx-6 -mt-6 px-6 py-5"
              style={{
                background: `linear-gradient(180deg, ${accent}1f 0%, transparent 100%)`,
                borderBottom: `1px solid ${accent}33`,
              }}
            >
              <SheetHeader>
                <div className="flex items-start gap-4">
                  <Portrait
                    code={person.code}
                    gender={person.gender}
                    name={person.name}
                    size={72}
                    rounded="lg"
                    ringColor={`${accent}55`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <SheetTitle className="text-2xl">{person.name}</SheetTitle>
                      {person.gender ? (
                        <span
                          className="text-base text-muted-foreground"
                          aria-label={person.gender}
                        >
                          {person.gender === "male" ? "♂" : person.gender === "female" ? "♀" : ""}
                        </span>
                      ) : null}
                    </div>
                    {person.alternateNames.length > 0 ? (
                      <SheetDescription className="mt-1">
                        Also known as{" "}
                        <span className="text-foreground">
                          {person.alternateNames.join(" · ")}
                        </span>
                      </SheetDescription>
                    ) : null}
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {eraLabel ? (
                  <span
                    className="rounded-sm px-2 py-0.5 text-[11px] font-medium"
                    style={{ backgroundColor: `${accent}22`, color: accent }}
                  >
                    {eraLabel}
                  </span>
                ) : null}
                {person.lifespanYears ? (
                  <Badge variant="outline" className="font-mono text-[11px]">
                    {person.lifespanYears} years
                  </Badge>
                ) : null}
                <Badge
                  variant={person.confidenceLevel === "debated" ? "outline" : "default"}
                  className={cn(
                    "text-[11px]",
                    person.confidenceLevel === "debated" &&
                      "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                  )}
                >
                  {CONFIDENCE_LABELS[person.confidenceLevel] ?? person.confidenceLevel}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {onSetRoot ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      onSetRoot(person.code);
                      onOpenChange(false);
                    }}
                  >
                    <Locate className="mr-1.5 h-3.5 w-3.5" />
                    Center graph here
                  </Button>
                ) : null}
                <Link
                  href={`/people/${person.code}`}
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                    "text-xs",
                  )}
                >
                  Full page
                  <ExternalLink className="ml-1.5 h-3 w-3" />
                </Link>
              </div>
            </div>

            {person.roles.length > 0 || person.tribes.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {person.roles.map((r) => (
                  <Badge
                    key={r}
                    variant={r === "ancestor-of-christ" ? "accent" : "default"}
                    className="text-[11px]"
                  >
                    {ROLE_LABELS[r] ?? r}
                  </Badge>
                ))}
                {person.tribes.map((t) => (
                  <Link key={t.code} href={`/tribes/${t.code}`}>
                    <Badge variant="outline" className="cursor-pointer text-[11px] hover:bg-muted">
                      {t.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : null}

            {person.description ? (
              <section className="space-y-2">
                <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Description
                </h3>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {person.description}
                </p>
              </section>
            ) : null}

            {person.notes ? (
              <section className="space-y-2">
                <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Notes
                </h3>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {person.notes}
                </p>
              </section>
            ) : null}

            {person.scriptureReferences.length > 0 ? (
              <section className="space-y-2">
                <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Scripture references
                </h3>
                <ol className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
                  {person.scriptureReferences.map((ref) => (
                    <li key={ref} className="font-mono text-foreground/80">
                      {ref}
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {person.ageAtDeathRef ? (
              <section className="space-y-1 rounded-md border bg-muted/40 p-3">
                <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Lifespan source
                </h3>
                <p className="font-mono text-xs text-foreground/80">
                  {person.ageAtDeathRef}
                </p>
              </section>
            ) : null}

            <Link
              href={`/people/${person.code}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "self-start text-xs",
              )}
            >
              Open full profile
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Link>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
