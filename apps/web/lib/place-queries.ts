// Place data access, backed by static @bible-visualizer/bible-data — no database.
// `eventCategories` is derived from events that reference a place (events carry
// `placeIds`), and `prominence`/`mentionCount` mirror the seed's defaults.

import { places } from "@bible-visualizer/bible-data/places";
import { events } from "@bible-visualizer/bible-data/events";

export interface PlaceSummary {
  id: string;
  code: string;
  name: string;
  alternateNames: string[];
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  modernEquivalent: string | null;
  description: string | null;
  scriptureReferences: string[];
  confidenceLevel: string;
  traditionTags: string[];
  notes: string | null;
  source: string | null;
  sourceUrl: string | null;
  isStub: boolean;
  prominence: string | null;
  mentionCount: number;
  eventCategories: string[];
}

type Place = (typeof places)[number];

const placeByCode = new Map(places.map((p) => [p.id, p]));

const eventCategoriesByPlace = new Map<string, Set<string>>();
for (const event of events) {
  if (!event.category || !event.placeIds?.length) continue;
  for (const placeCode of event.placeIds) {
    let set = eventCategoriesByPlace.get(placeCode);
    if (!set) {
      set = new Set();
      eventCategoriesByPlace.set(placeCode, set);
    }
    set.add(event.category);
  }
}

function toPlaceSummary(p: Place): PlaceSummary {
  return {
    id: p.id,
    code: p.id,
    name: p.name,
    alternateNames: p.alternateNames ?? [],
    region: p.region ?? null,
    latitude: p.latitude ?? null,
    longitude: p.longitude ?? null,
    modernEquivalent: p.modernEquivalent ?? null,
    description: p.description ?? null,
    scriptureReferences: p.scriptureReferences,
    confidenceLevel: p.confidenceLevel,
    traditionTags: p.traditionTags ?? [],
    notes: p.notes ?? null,
    source: p.source ?? null,
    sourceUrl: p.sourceUrl ?? null,
    isStub: p.isStub ?? false,
    prominence: p.prominence ?? (p.source ? "minor" : "major"),
    mentionCount: p.mentionCount ?? 0,
    eventCategories: [...(eventCategoriesByPlace.get(p.id) ?? [])],
  };
}

export async function getAllPlaces(): Promise<PlaceSummary[]> {
  return [...places]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(toPlaceSummary);
}

export async function getPlaceByCode(code: string): Promise<PlaceSummary | null> {
  const p = placeByCode.get(code);
  return p ? toPlaceSummary(p) : null;
}
