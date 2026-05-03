/**
 * Map overlay registry.
 *
 * Overlays are polygon boundaries (regions, empires, kingdoms) layered on the
 * map to give geographic and temporal context to point markers. Every overlay
 * is attributed to its source so users can distinguish scripture-anchored data
 * from external scholarly reconstructions.
 *
 * The manifest below is hand-curated metadata — colors, eras, friendly names.
 * The actual GeoJSON polygons are generated from upstream sources by an
 * ingest script (see tools/ingest/src/import-obi-overlays.ts) and joined in
 * at module load.
 */

import type * as GeoJSON from "geojson";
import { importedOverlayGeometry } from "./overlays-imported";

export type OverlayKind = "empire" | "region" | "kingdom" | "tribe" | "province";

export interface OverlayManifestEntry {
  id: string;
  name: string;
  kind: OverlayKind;
  description?: string;
  /**
   * The era keys this overlay is most relevant to. Used by the era selector
   * to decide which overlays to highlight or auto-show.
   */
  eras: string[];
  color: string;
  /** Source id (matches DATA_SOURCES). */
  source: string;
  sourceUrl?: string;
  /**
   * The ingest-script-known external id used to look up the actual geometry
   * in importedOverlayGeometry. e.g. "g3ccc7b.isobands" for OBI's Egypt.
   */
  externalGeometryId: string;
}

export interface MapOverlay extends Omit<OverlayManifestEntry, "externalGeometryId"> {
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
}

const EMPIRE_COLOR = "#dc2626";
const REGION_COLOR_LEVANT = "#0891b2";
const REGION_COLOR_NEIGHBOR = "#7c3aed";

/**
 * Hand-curated subset of OBI's geometry corpus. Each entry maps a friendly
 * name + era + color to an upstream OBI geometry id. The ingest script
 * downloads the corresponding GeoJSON and emits it in overlays-imported.ts;
 * we join the metadata here at load time.
 */
export const OVERLAY_MANIFEST: ReadonlyArray<OverlayManifestEntry> = [
  {
    id: "obi-empire-egypt",
    name: "Egypt",
    kind: "empire",
    description:
      "Land of Egypt — empire and refuge for the patriarchs, oppressor in the exodus, recurrent military power throughout the OT.",
    eras: ["primeval", "patriarchal", "exodus", "monarchy", "prophets"],
    color: EMPIRE_COLOR,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/a/egypt",
    externalGeometryId: "g40d263",
  },
  {
    id: "obi-empire-assyria",
    name: "Assyria",
    kind: "empire",
    description:
      "Mesopotamian empire that conquered the northern kingdom of Israel in 722 BC.",
    eras: ["monarchy", "prophets"],
    color: EMPIRE_COLOR,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/a/assyria",
    externalGeometryId: "g76b6c9",
  },
  {
    id: "obi-empire-babylonia",
    name: "Babylonia",
    kind: "empire",
    description:
      "Neo-Babylonian empire under Nebuchadnezzar; conquered Judah in 586 BC and exiled the people.",
    eras: ["prophets", "exile"],
    color: EMPIRE_COLOR,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/b/babylonia",
    externalGeometryId: "g523915",
  },
  {
    id: "obi-empire-persia",
    name: "Persia",
    kind: "empire",
    description:
      "Achaemenid Persian empire; Cyrus permitted the Jewish return from exile in 538 BC.",
    eras: ["exile", "return", "intertestamental"],
    color: EMPIRE_COLOR,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/p/persia",
    externalGeometryId: "g0e6b24",
  },
  {
    id: "obi-empire-media",
    name: "Media",
    kind: "empire",
    description:
      "Median empire, partner-then-rival of the Persians; Daniel's 'Medes and Persians.'",
    eras: ["exile", "return"],
    color: EMPIRE_COLOR,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/m/media",
    externalGeometryId: "g64db35",
  },
  {
    id: "obi-empire-macedonia",
    name: "Macedonia",
    kind: "empire",
    description:
      "Alexander the Great's Greek empire; the Hellenistic Seleucid and Ptolemaic kingdoms emerged from its breakup.",
    eras: ["intertestamental"],
    color: EMPIRE_COLOR,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/m/macedonia",
    externalGeometryId: "g1a6676",
  },
  {
    id: "obi-region-canaan",
    name: "Canaan",
    kind: "region",
    description:
      "The land promised to Abraham; the territory the Israelites took under Joshua.",
    eras: ["patriarchal", "exodus", "conquest", "judges"],
    color: REGION_COLOR_LEVANT,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/c/canaan",
    externalGeometryId: "g7e51d1",
  },
  {
    id: "obi-region-philistia",
    name: "Philistia",
    kind: "region",
    description:
      "Coastal pentapolis of the Philistines (Gaza, Ashkelon, Ashdod, Ekron, Gath); Israel's perennial rival through the judges and early monarchy.",
    eras: ["judges", "monarchy"],
    color: REGION_COLOR_NEIGHBOR,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/p/philistia",
    externalGeometryId: "g746ae5",
  },
  {
    id: "obi-region-edom",
    name: "Edom",
    kind: "region",
    description:
      "South of the Dead Sea; territory of Esau's descendants, recurrent enemy of Israel.",
    eras: ["exodus", "monarchy", "prophets"],
    color: REGION_COLOR_NEIGHBOR,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/e/edom",
    externalGeometryId: "g7ad983",
  },
  {
    id: "obi-region-moab",
    name: "Moab",
    kind: "region",
    description:
      "East of the Dead Sea; territory of Lot's descendants. Setting of the book of Ruth.",
    eras: ["exodus", "judges", "monarchy"],
    color: REGION_COLOR_NEIGHBOR,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/m/moab",
    externalGeometryId: "g228665",
  },
  {
    id: "obi-region-ammon",
    name: "Ammon",
    kind: "region",
    description:
      "East of the Jordan, north of Moab; the Ammonites descended from Lot. Capital: Rabbah (modern Amman).",
    eras: ["judges", "monarchy"],
    color: REGION_COLOR_NEIGHBOR,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/a/ammon",
    externalGeometryId: "gadb142",
  },
  {
    id: "obi-region-aram",
    name: "Aram (Syria)",
    kind: "region",
    description:
      "Aramean kingdoms north and northeast of Israel; centered on Damascus.",
    eras: ["monarchy", "prophets"],
    color: REGION_COLOR_NEIGHBOR,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/a/aram",
    externalGeometryId: "g15edcb",
  },
  {
    id: "obi-region-phoenicia",
    name: "Phoenicia",
    kind: "region",
    description:
      "Coastal trading civilization north of Israel (Tyre, Sidon); supplied cedar for Solomon's temple.",
    eras: ["monarchy", "prophets", "christ", "early-church"],
    color: REGION_COLOR_NEIGHBOR,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/p/phoenicia",
    externalGeometryId: "g11a0a9",
  },
  {
    id: "obi-region-galilee",
    name: "Galilee",
    kind: "region",
    description:
      "Northern region of the Holy Land; primary setting of Jesus's earthly ministry.",
    eras: ["monarchy", "christ", "early-church"],
    color: REGION_COLOR_LEVANT,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/g/galilee",
    externalGeometryId: "g99a57f",
  },
  {
    id: "obi-region-judea",
    name: "Judea",
    kind: "region",
    description:
      "Southern province in the NT era; Jerusalem, Bethlehem, Hebron. Ruled by Herods and Roman procurators.",
    eras: ["return", "intertestamental", "christ", "early-church"],
    color: REGION_COLOR_LEVANT,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/j/judea",
    externalGeometryId: "g55ebd7",
  },
  {
    id: "obi-region-samaria",
    name: "Samaria (region)",
    kind: "region",
    description:
      "Central region between Galilee and Judea in the NT era; setting of Jesus's encounter with the Samaritan woman.",
    eras: ["return", "intertestamental", "christ", "early-church"],
    color: REGION_COLOR_LEVANT,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/s/samaria",
    externalGeometryId: "gf5df80",
  },
  {
    id: "obi-region-decapolis",
    name: "Decapolis",
    kind: "region",
    description:
      "League of ten Greek-influenced cities east of the Jordan in the NT era. Jesus traveled and ministered here.",
    eras: ["intertestamental", "christ", "early-church"],
    color: REGION_COLOR_NEIGHBOR,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/d/decapolis",
    externalGeometryId: "ga00ceb",
  },
  {
    id: "obi-region-idumea",
    name: "Idumea",
    kind: "region",
    description:
      "The Greek/Roman name for the territory of former Edom; home of Herod the Great's family.",
    eras: ["intertestamental", "christ"],
    color: REGION_COLOR_NEIGHBOR,
    source: "open-bible-info",
    sourceUrl: "https://www.openbible.info/geo/atlas/i/idumea",
    externalGeometryId: "g5e98fb",
  },
];

export const overlays: ReadonlyArray<MapOverlay> = OVERLAY_MANIFEST.map(
  (entry) => {
    const { externalGeometryId, ...rest } = entry;
    return {
      ...rest,
      geometry: importedOverlayGeometry[externalGeometryId] ?? null,
    };
  },
);

export function getOverlay(id: string): MapOverlay | null {
  return overlays.find((o) => o.id === id) ?? null;
}

export function overlaysByKind(): Record<OverlayKind, MapOverlay[]> {
  const grouped: Record<OverlayKind, MapOverlay[]> = {
    empire: [],
    region: [],
    kingdom: [],
    tribe: [],
    province: [],
  };
  for (const o of overlays) {
    grouped[o.kind].push(o);
  }
  return grouped;
}
