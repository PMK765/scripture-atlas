import { prisma } from "@bible-visualizer/db";

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

export async function getAllEvents(): Promise<EventSummary[]> {
  const rows = await prisma.event.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      category: true,
      description: true,
      startYear: true,
      endYear: true,
      scriptureReferences: true,
      confidenceLevel: true,
      traditionTags: true,
      notes: true,
      places: {
        select: {
          place: {
            select: {
              code: true,
              name: true,
              region: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      },
    },
    orderBy: [
      { startYear: { sort: "asc", nulls: "first" } },
      { name: "asc" },
    ],
  });
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    category: r.category,
    description: r.description,
    startYear: r.startYear,
    endYear: r.endYear,
    scriptureReferences: r.scriptureReferences,
    confidenceLevel: r.confidenceLevel,
    traditionTags: r.traditionTags,
    notes: r.notes,
    places: r.places.map((p) => p.place),
  }));
}

export async function getEventByCode(code: string): Promise<EventSummary | null> {
  const r = await prisma.event.findUnique({
    where: { code },
    select: {
      id: true,
      code: true,
      name: true,
      category: true,
      description: true,
      startYear: true,
      endYear: true,
      scriptureReferences: true,
      confidenceLevel: true,
      traditionTags: true,
      notes: true,
      places: {
        select: {
          place: {
            select: {
              code: true,
              name: true,
              region: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      },
    },
  });
  if (!r) return null;
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    category: r.category,
    description: r.description,
    startYear: r.startYear,
    endYear: r.endYear,
    scriptureReferences: r.scriptureReferences,
    confidenceLevel: r.confidenceLevel,
    traditionTags: r.traditionTags,
    notes: r.notes,
    places: r.places.map((p) => p.place),
  };
}
