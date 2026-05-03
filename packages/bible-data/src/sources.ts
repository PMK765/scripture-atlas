export interface DataSource {
  id: string;
  name: string;
  url: string;
  license: string;
  licenseUrl?: string;
  description: string;
  attribution?: string;
  notes?: string;
}

export const DATA_SOURCES = {
  "open-bible-info": {
    id: "open-bible-info",
    name: "Open Bible Info — Bible Geocoding",
    url: "https://www.openbible.info/geo/",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    description:
      "Coordinates and identification of ~1,300 biblical places, compiled by Stephen Smith.",
    attribution:
      'Bible geocoding data © Stephen Smith / OpenBible.info, licensed under CC BY 4.0. Source: https://www.openbible.info/geo/',
    notes:
      "OBI is a community-built atlas; identifications are best-effort modern proposals and can vary among scholars. Some places appear with numbered variants (e.g., 'Bethlehem 1', 'Bethlehem 2') representing competing or distinct biblical references.",
  },
  pleiades: {
    id: "pleiades",
    name: "Pleiades — A gazetteer of past places",
    url: "https://pleiades.stoa.org/",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    description:
      "Academic gazetteer of ancient Greek, Roman, and Near Eastern places maintained by the Institute for the Study of the Ancient World (NYU).",
    attribution:
      "Pleiades: A community-built gazetteer and graph of ancient places (https://pleiades.stoa.org/), licensed under CC BY 3.0. Original contributors credited per record.",
    notes:
      "Strict scholarly sourcing per record. Used selectively for non-biblical context (Roman roads, Greek city-states).",
  },
  openstreetmap: {
    id: "openstreetmap",
    name: "OpenStreetMap",
    url: "https://www.openstreetmap.org/copyright",
    license: "ODbL 1.0",
    licenseUrl: "https://opendatacommons.org/licenses/odbl/1-0/",
    description: "Modern map tiles displayed as the base layer on the geography page.",
    attribution: "© OpenStreetMap contributors",
  },
} as const satisfies Record<string, DataSource>;

export type DataSourceId = keyof typeof DATA_SOURCES;

export function getDataSource(id: string | null | undefined): DataSource | null {
  if (!id) return null;
  return (DATA_SOURCES as Record<string, DataSource>)[id] ?? null;
}

export function listDataSources(): DataSource[] {
  return Object.values(DATA_SOURCES);
}

export function getDataSourceShortName(id: string | null | undefined): string | null {
  const src = getDataSource(id);
  if (!src) return null;
  const parts = src.name.split("—");
  return (parts[0] ?? src.name).trim();
}
