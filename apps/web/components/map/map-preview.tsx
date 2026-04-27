import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PlaceSummary } from "@/lib/place-queries";

interface MapPreviewProps {
  places: PlaceSummary[];
}

const SPOTLIGHT_CODES = [
  "jerusalem",
  "bethlehem",
  "nazareth",
  "babylon",
  "rome",
  "ephesus",
  "mount-sinai",
  "shiloh",
];

export function MapPreview({ places }: MapPreviewProps) {
  const byCode = new Map(places.map((p) => [p.code, p]));
  const spotlight = SPOTLIGHT_CODES.map((c) => byCode.get(c)).filter(
    (p): p is PlaceSummary => p !== undefined,
  );

  return (
    <section id="map" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Geography
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">Map</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Major biblical sites placed on a modern map, with scripture references and
            modern equivalents. {places.length} sites curated so far. Territorial borders are
            intentionally not drawn — single-frame ancient borders are always a lie.
          </p>
        </div>
        <Link
          href="/map"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Open map <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {spotlight.map((p) => (
          <li
            key={p.code}
            className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/30"
          >
            <Link href={`/places/${p.code}`} className="block">
              <h3 className="text-sm font-semibold tracking-tight">{p.name}</h3>
              {p.region ? (
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {p.region}
                </p>
              ) : null}
              {p.modernEquivalent ? (
                <p className="mt-1 text-xs text-muted-foreground">{p.modernEquivalent}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
