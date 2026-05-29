// Prophecy data access, backed by static @bible-visualizer/bible-data — no database.

import { prophecies } from "@bible-visualizer/bible-data/prophecies";

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

type Prophecy = (typeof prophecies)[number];

const prophecyByCode = new Map(prophecies.map((p) => [p.id, p]));

function toProphecySummary(p: Prophecy): ProphecySummary {
  return {
    id: p.id,
    code: p.id,
    title: p.title,
    category: p.category ?? null,
    summary: p.summary,
    fulfillmentSummary: p.fulfillmentSummary ?? null,
    prophecyRef: p.prophecyRef,
    fulfillmentRef: p.fulfillmentRef ?? null,
    prophecyYear: p.prophecyYear ?? null,
    fulfillmentYear: p.fulfillmentYear ?? null,
    status: p.status,
    confidenceLevel: p.confidenceLevel,
    scriptureReferences: p.scriptureReferences,
    notes: p.notes ?? null,
  };
}

export async function getAllProphecies(): Promise<ProphecySummary[]> {
  // prophecyYear asc with nulls last, then title asc.
  return [...prophecies]
    .sort((a, b) => {
      const ay = a.prophecyYear ?? null;
      const by = b.prophecyYear ?? null;
      if (ay !== null && by !== null && ay !== by) return ay - by;
      if (ay !== null && by === null) return -1;
      if (ay === null && by !== null) return 1;
      return a.title.localeCompare(b.title);
    })
    .map(toProphecySummary);
}

export async function getProphecyByCode(code: string): Promise<ProphecySummary | null> {
  const p = prophecyByCode.get(code);
  return p ? toProphecySummary(p) : null;
}
