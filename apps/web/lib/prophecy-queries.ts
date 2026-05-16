import { prisma } from "@bible-visualizer/db";

export interface ProphecySummary {
  id: string;
  code: string;
  title: string;
  category: string | null;
  summary: string;
  fulfillmentSummary: string | null;
  prophecyRef: string;
  fulfillmentRef: string | null;
  prophecyYear: number | null;
  fulfillmentYear: number | null;
  status: string;
  confidenceLevel: string;
  scriptureReferences: string[];
  notes: string | null;
}

const PROPHECY_SELECT = {
  id: true,
  code: true,
  title: true,
  category: true,
  summary: true,
  fulfillmentSummary: true,
  prophecyRef: true,
  fulfillmentRef: true,
  prophecyYear: true,
  fulfillmentYear: true,
  status: true,
  confidenceLevel: true,
  scriptureReferences: true,
  notes: true,
} as const;

export async function getAllProphecies(): Promise<ProphecySummary[]> {
  try {
    return await prisma.prophecy.findMany({
      select: PROPHECY_SELECT,
      orderBy: [
        { prophecyYear: { sort: "asc", nulls: "last" } },
        { title: "asc" },
      ],
    });
  } catch {
    return [];
  }
}

export async function getProphecyByCode(code: string): Promise<ProphecySummary | null> {
  try {
    return await prisma.prophecy.findUnique({
      where: { code },
      select: PROPHECY_SELECT,
    });
  } catch {
    return null;
  }
}
