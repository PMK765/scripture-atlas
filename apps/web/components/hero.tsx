import Link from "next/link";
import { ArrowRight, MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroProps {
  stats?: {
    people: number;
    places: number;
    events: number;
    verses: number;
  };
}

const NUM_FMT = new Intl.NumberFormat("en-US");

export function Hero({ stats }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="absolute inset-0 bg-hero-gradient" aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] h-[420px] w-[420px] rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--gradient-accent)" }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:py-24 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16 lg:py-28">
        <div>
          <span className="verse-marker">Gen 1:1 → Rev 22:21</span>
          <h1 className="mt-6 text-balance font-serif text-5xl font-medium leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            See scripture
            <br />
            <span className="italic text-gradient-primary">as a whole.</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Every person, place, and event — connected, sourced, and visualized.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/people"
              className={cn(
                "group inline-flex h-11 items-center gap-2 rounded-md bg-primary-gradient px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-110",
              )}
            >
              Meet the People
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <Link
              href="/map"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border-strong/60 bg-background-elevated px-6 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <MapIcon className="h-4 w-4" aria-hidden />
              Open the map
            </Link>
          </div>
        </div>

        {stats ? (
          <dl className="relative grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border-strong/40 bg-border/60 shadow-sm">
            <StatTile label="People" value={stats.people} hint="named figures" />
            <StatTile label="Places" value={stats.places} hint="biblical sites" />
            <StatTile label="Events" value={stats.events} hint="dated moments" />
            <StatTile label="Verses" value={stats.verses} hint="across 7 translations" />
          </dl>
        ) : null}
      </div>
    </section>
  );
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="bg-card px-5 py-6">
      <div className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-serif text-3xl font-medium tabular-nums text-ink">
        {NUM_FMT.format(value)}
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}
