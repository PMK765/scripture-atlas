export const projectMeta = {
  name: "Scripture Atlas",
  shortName: "Scripture Atlas",
  tagline: "An atlas of scripture.",
  description:
    "Every person, place, event, genealogy, prophecy, and Hebrew name in scripture — mapped, sourced, and connected, with traceable references and explicit confidence levels.",
  repository: "https://github.com/bible-visualizer/bible-visualizer",
} as const;

export type FeatureFlagKey =
  | "books"
  | "timeline"
  | "people"
  | "tribes"
  | "map"
  | "lineages"
  | "genealogy"
  | "prophecy"
  | "names"
  | "originalLanguages"
  | "crossReferences"
  | "mobileApp";

export type FeatureFlag = {
  key: FeatureFlagKey;
  label: string;
  description: string;
  enabled: boolean;
  experimental?: boolean;
};

export const featureFlags: Record<FeatureFlagKey, FeatureFlag> = {
  books: {
    key: "books",
    label: "Books",
    description: "Browse the canonical books of the Bible.",
    enabled: true,
  },
  timeline: {
    key: "timeline",
    label: "Timeline",
    description: "Chronological visualization of biblical events.",
    enabled: true,
  },
  people: {
    key: "people",
    label: "People",
    description: "Searchable index of biblical figures with references.",
    enabled: true,
  },
  tribes: {
    key: "tribes",
    label: "Tribes",
    description: "Tribes, nations, and clans across scripture.",
    enabled: true,
  },
  map: {
    key: "map",
    label: "Map",
    description: "Geographic exploration of biblical places.",
    enabled: true,
  },
  lineages: {
    key: "lineages",
    label: "Lineages",
    description: "One sprawling family tree from Adam through the apostles.",
    enabled: true,
  },
  genealogy: {
    key: "genealogy",
    label: "Genealogy",
    description: "Family-tree relationships between biblical figures.",
    enabled: false,
    experimental: true,
  },
  prophecy: {
    key: "prophecy",
    label: "Prophecy",
    description: "Old Testament prophecy → New Testament fulfillment, cited and dated.",
    enabled: true,
  },
  names: {
    key: "names",
    label: "Names",
    description: "Hebrew names of God and biblical figures, broken into morphemes and meanings.",
    enabled: true,
  },
  originalLanguages: {
    key: "originalLanguages",
    label: "Original Languages",
    description: "Hebrew, Aramaic, and Greek source overlays with morphology.",
    enabled: false,
    experimental: true,
  },
  crossReferences: {
    key: "crossReferences",
    label: "Cross References",
    description: "Inter-passage citation graph (TSK + manual).",
    enabled: false,
    experimental: true,
  },
  mobileApp: {
    key: "mobileApp",
    label: "Mobile App",
    description: "Native mobile companion (planned).",
    enabled: false,
    experimental: true,
  },
};

export const isFeatureEnabled = (key: FeatureFlagKey): boolean => featureFlags[key].enabled;

export const TESTAMENTS = ["Old", "New"] as const;
export type Testament = (typeof TESTAMENTS)[number];

export const CONFIDENCE_LEVELS = ["stated", "inferred", "traditional", "debated"] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const CANONICAL_TRADITIONS = [
  "protestant",
  "catholic",
  "eastern-orthodox",
  "ethiopian-orthodox",
] as const;
export type CanonicalTradition = (typeof CANONICAL_TRADITIONS)[number];

export const CANONICAL_TRADITION_LABELS: Record<CanonicalTradition, string> = {
  protestant: "Protestant",
  catholic: "Catholic",
  "eastern-orthodox": "Eastern Orthodox",
  "ethiopian-orthodox": "Ethiopian Orthodox",
};

export const ORIGINAL_LANGUAGES = ["hebrew", "aramaic", "greek"] as const;
export type OriginalLanguage = (typeof ORIGINAL_LANGUAGES)[number];

export const TRANSLATION_LANGUAGES = ["english", "hebrew", "aramaic", "greek"] as const;
export type TranslationLanguage = (typeof TRANSLATION_LANGUAGES)[number];

export const LICENSE_KINDS = [
  "public-domain",
  "cc0",
  "cc-by-4.0",
  "cc-by-sa-4.0",
  "custom-free",
] as const;
export type LicenseKind = (typeof LICENSE_KINDS)[number];

export const BOOK_GENRES = [
  "law",
  "history",
  "wisdom",
  "prophecy",
  "gospel",
  "epistle",
  "apocalyptic",
] as const;
export type BookGenre = (typeof BOOK_GENRES)[number];

export const PROTESTANT_CANON_TOTAL = 66;
export const CATHOLIC_CANON_TOTAL = 73;

export const ERAS = [
  "antediluvian",
  "postdiluvian",
  "patriarchal",
  "egyptian-sojourn",
  "wilderness",
  "conquest",
  "judges",
  "united-kingdom",
  "divided-kingdom",
  "exile",
  "return",
  "intertestamental",
  "ministry",
  "apostolic",
] as const;
export type Era = (typeof ERAS)[number];

export const ERA_LABELS: Record<Era, string> = {
  antediluvian: "Antediluvian",
  postdiluvian: "Post-flood",
  patriarchal: "Patriarchal",
  "egyptian-sojourn": "Egyptian sojourn",
  wilderness: "Wilderness",
  conquest: "Conquest",
  judges: "Judges",
  "united-kingdom": "United kingdom",
  "divided-kingdom": "Divided kingdom",
  exile: "Exile",
  return: "Return",
  intertestamental: "Intertestamental",
  ministry: "Ministry of Christ",
  apostolic: "Apostolic",
};

export const RELATIONSHIP_TYPES = [
  "parent-of",
  "spouse-of",
  "sibling-of",
  "ancestor-of",
] as const;
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const VIA_PARENTS = ["father", "mother", "either", "unspecified"] as const;
export type ViaParent = (typeof VIA_PARENTS)[number];

export const RELATION_KINDS = [
  "biological",
  "adopted",
  "step",
  "levirate",
  "concubine",
  "betrothed",
] as const;
export type RelationKind = (typeof RELATION_KINDS)[number];

export const GENDERS = ["male", "female", "unknown"] as const;
export type Gender = (typeof GENDERS)[number];

export const PERSON_ROLES = [
  "patriarch",
  "matriarch",
  "prophet",
  "prophetess",
  "king",
  "queen",
  "queen-mother",
  "priest",
  "high-priest",
  "levite",
  "judge",
  "warrior",
  "scribe",
  "lawgiver",
  "deliverer",
  "nazirite",
  "apostle",
  "disciple",
  "evangelist",
  "deacon",
  "elder",
  "missionary",
  "edomite-king",
  "philistine-ruler",
  "foreign-king",
  "messiah",
  "ancestor-of-christ",
  "musician",
  "psalmist",
  "craftsman",
  "gatekeeper",
  "governor",
  "pharisee",
  "sadducee",
] as const;
export type PersonRole = (typeof PERSON_ROLES)[number];

export const TRIBE_TYPES = [
  "patriarchal",
  "nation",
  "kingdom",
  "ethnic-group",
  "priestly-line",
] as const;
export type TribeType = (typeof TRIBE_TYPES)[number];

export const isInProtestantCanon = (canons: readonly CanonicalTradition[]): boolean =>
  canons.includes("protestant");

export const isSeptuagintExtended = (canons: readonly CanonicalTradition[]): boolean =>
  !canons.includes("protestant") &&
  (canons.includes("catholic") ||
    canons.includes("eastern-orthodox") ||
    canons.includes("ethiopian-orthodox"));
