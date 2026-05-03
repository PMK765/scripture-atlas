import { prisma } from "@bible-visualizer/db";

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

const PLACE_SELECT = {
  id: true,
  code: true,
  name: true,
  alternateNames: true,
  region: true,
  latitude: true,
  longitude: true,
  modernEquivalent: true,
  description: true,
  scriptureReferences: true,
  confidenceLevel: true,
  traditionTags: true,
  notes: true,
  source: true,
  sourceUrl: true,
  isStub: true,
  prominence: true,
  mentionCount: true,
  events: {
    select: {
      event: { select: { category: true } },
    },
  },
} as const;

export async function getAllPlaces(): Promise<PlaceSummary[]> {
  const rows = await prisma.place.findMany({
    select: PLACE_SELECT,
    orderBy: { name: "asc" },
  });
  return rows.map(({ events, ...rest }) => {
    const cats = new Set<string>();
    for (const e of events) {
      if (e.event.category) cats.add(e.event.category);
    }
    return { ...rest, eventCategories: [...cats] };
  });
}

export async function getPlaceByCode(code: string): Promise<PlaceSummary | null> {
  const row = await prisma.place.findUnique({
    where: { code },
    select: PLACE_SELECT,
  });
  if (!row) return null;
  const { events, ...rest } = row;
  const cats = new Set<string>();
  for (const e of events) {
    if (e.event.category) cats.add(e.event.category);
  }
  return { ...rest, eventCategories: [...cats] };
}
