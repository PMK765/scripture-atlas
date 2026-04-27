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
}

export async function getAllPlaces(): Promise<PlaceSummary[]> {
  const rows = await prisma.place.findMany({
    select: {
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
    },
    orderBy: { name: "asc" },
  });
  return rows;
}

export async function getPlaceByCode(code: string): Promise<PlaceSummary | null> {
  return prisma.place.findUnique({
    where: { code },
    select: {
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
    },
  });
}
