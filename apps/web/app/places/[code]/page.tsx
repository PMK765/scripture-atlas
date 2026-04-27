import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { getAllPlaces, getPlaceByCode } from "@/lib/place-queries";

export const revalidate = 300;

export async function generateStaticParams() {
  const places = await getAllPlaces();
  return places.map((p) => ({ code: p.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const place = await getPlaceByCode(code);
  if (!place) return { title: "Place not found · Bible Visualizer" };
  return {
    title: `${place.name} · Bible Visualizer`,
    description: place.description?.slice(0, 160) ?? `${place.name} on the biblical map.`,
  };
}

export default async function PlacePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const place = await getPlaceByCode(code);
  if (!place) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/map"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to map
        </Link>

        <header className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {place.region ? (
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {place.region}
              </span>
            ) : null}
            {place.confidenceLevel === "traditional" ? (
              <Badge variant="outline">Traditional identification</Badge>
            ) : null}
            {place.traditionTags?.length ? (
              <Badge variant="outline">{place.traditionTags.join(", ")}</Badge>
            ) : null}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{place.name}</h1>
          {place.alternateNames.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              Also: {place.alternateNames.join(" · ")}
            </p>
          ) : null}
        </header>

        {place.description ? (
          <p className="mt-6 text-sm leading-relaxed text-foreground/90">{place.description}</p>
        ) : null}

        {place.notes ? (
          <p className="mt-4 text-xs italic text-muted-foreground">{place.notes}</p>
        ) : null}

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          {place.modernEquivalent ? (
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Modern equivalent
              </dt>
              <dd className="mt-1 text-sm">{place.modernEquivalent}</dd>
            </div>
          ) : null}
          {place.latitude !== null && place.longitude !== null ? (
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Coordinates
              </dt>
              <dd className="mt-1 font-mono text-sm tabular-nums">
                {place.latitude.toFixed(4)}°, {place.longitude.toFixed(4)}°
              </dd>
            </div>
          ) : null}
        </dl>

        {place.scriptureReferences.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Scripture references
            </h2>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {place.scriptureReferences.map((ref) => (
                <li
                  key={ref}
                  className="rounded-full border bg-card px-2.5 py-0.5 text-xs"
                >
                  {ref}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
