// Event/timeline data access, backed by static @bible-visualizer/bible-data — no
// database. Event place badges are resolved from `event.placeIds` against the
// static places list.

import { events } from "@bible-visualizer/bible-data/events";
import { places } from "@bible-visualizer/bible-data/places";

export interface EventSummary {
  id: string;
  code: string;
  name: string;
  category: string | null;
  description: string | null;
  startYear: number | null;
  endYear: number | null;
  scriptureReferences: string[];
  confidenceLevel: string;
  traditionTags: string[];
  notes: string | null;
  places: EventPlaceBadge[];
}

export interface EventPlaceBadge {
  code: string;
  name: string;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
}

type BiblicalEvent = (typeof events)[number];

const eventByCode = new Map(events.map((e) => [e.id, e]));
const placeByCode = new Map(places.map((p) => [p.id, p]));

function placeBadges(event: BiblicalEvent): EventPlaceBadge[] {
  return (event.placeIds ?? [])
    .map((code) => placeByCode.get(code))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({
      code: p.id,
      name: p.name,
      region: p.region ?? null,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
    }));
}

function toEventSummary(e: BiblicalEvent): EventSummary {
  return {
    id: e.id,
    code: e.id,
    name: e.name,
    category: e.category ?? null,
    description: e.description ?? null,
    startYear: e.startYear ?? null,
    endYear: e.endYear ?? null,
    scriptureReferences: e.scriptureReferences,
    confidenceLevel: e.confidenceLevel,
    traditionTags: e.traditionTags ?? [],
    notes: e.notes ?? null,
    places: placeBadges(e),
  };
}

export async function getAllEvents(): Promise<EventSummary[]> {
  // startYear asc with nulls first, then name asc.
  return [...events]
    .sort((a, b) => {
      const ay = a.startYear ?? null;
      const by = b.startYear ?? null;
      if (ay !== null && by !== null && ay !== by) return ay - by;
      if (ay === null && by !== null) return -1;
      if (ay !== null && by === null) return 1;
      return a.name.localeCompare(b.name);
    })
    .map(toEventSummary);
}

export async function getEventByCode(code: string): Promise<EventSummary | null> {
  const e = eventByCode.get(code);
  return e ? toEventSummary(e) : null;
}
