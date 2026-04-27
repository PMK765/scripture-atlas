import type {
  BookGenre,
  CanonicalTradition,
  ConfidenceLevel,
  Era,
  Gender,
  LicenseKind,
  OriginalLanguage,
  PersonRole,
  RelationKind,
  RelationshipType,
  Testament,
  TranslationLanguage,
  TribeType,
  ViaParent,
} from "@bible-visualizer/config";

export type {
  BookGenre,
  CanonicalTradition,
  ConfidenceLevel,
  Era,
  Gender,
  LicenseKind,
  OriginalLanguage,
  PersonRole,
  RelationKind,
  RelationshipType,
  Testament,
  TranslationLanguage,
  TribeType,
  ViaParent,
};

export type ScriptureReference = string;

export interface Traceable {
  scriptureReferences: ScriptureReference[];
  confidenceLevel: ConfidenceLevel;
  traditionTags?: string[];
  notes?: string;
}

export interface Book extends Traceable {
  id: string;
  name: string;
  abbreviation: string;
  testament: Testament;
  order: number;
  chapters: number;
  genre: BookGenre;
  authorTraditional?: string;
  canons: CanonicalTradition[];
  originalLanguage: OriginalLanguage;
}

export interface Translation {
  code: string;
  name: string;
  language: TranslationLanguage;
  year?: number;
  license: LicenseKind;
  licenseUrl?: string;
  hasDeuterocanon: boolean;
  sourceUrl?: string;
  notes?: string;
}

export interface Person extends Traceable {
  id: string;
  name: string;
  alternateNames?: string[];
  gender?: Gender;
  description?: string;
  era?: Era;
  roles?: PersonRole[];
  tribes?: string[];
  birthYear?: number;
  deathYear?: number;
  lifespanYears?: number;
  ageAtDeathRef?: ScriptureReference;
  isHistoricallyContested?: boolean;
}

export interface GenealogyEdge extends Traceable {
  from: string;
  to: string;
  relationship: RelationshipType;
  viaParent?: ViaParent;
  relationKind?: RelationKind;
}

export interface Tribe extends Traceable {
  id: string;
  name: string;
  alternateNames?: string[];
  type: TribeType;
  founderId?: string;
  parentTribeId?: string;
  description?: string;
}

export interface PersonTribeMembership extends Traceable {
  personId: string;
  tribeId: string;
}

export interface Place extends Traceable {
  id: string;
  name: string;
  alternateNames?: string[];
  region?: string;
  latitude?: number;
  longitude?: number;
  modernEquivalent?: string;
  description?: string;
}

export interface BiblicalEvent extends Traceable {
  id: string;
  name: string;
  category?: string;
  description?: string;
  startYear?: number;
  endYear?: number;
  participantIds?: string[];
  placeIds?: string[];
}

export interface ProphecyLink extends Traceable {
  id: string;
  prophecyRef: ScriptureReference;
  fulfillmentRef?: ScriptureReference;
  summary: string;
  status: "fulfilled" | "partially-fulfilled" | "unfulfilled" | "debated";
}

export interface Lemma {
  strongsNumber: string;
  language: OriginalLanguage;
  lexicalForm: string;
  transliteration?: string;
  pronunciation?: string;
  definition?: string;
  notes?: string;
}

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "article"
  | "preposition"
  | "conjunction"
  | "particle"
  | "interjection"
  | "numeral"
  | "proper-noun";

export interface HebrewMorphology {
  language: "hebrew" | "aramaic";
  partOfSpeech: PartOfSpeech;
  stem?: "qal" | "niphal" | "piel" | "pual" | "hiphil" | "hophal" | "hithpael" | "other";
  form?:
    | "perfect"
    | "imperfect"
    | "imperative"
    | "cohortative"
    | "jussive"
    | "wayyiqtol"
    | "participle"
    | "infinitive-construct"
    | "infinitive-absolute";
  person?: "1st" | "2nd" | "3rd";
  gender?: "masculine" | "feminine" | "common";
  number?: "singular" | "plural" | "dual";
  state?: "absolute" | "construct" | "determined";
}

export interface GreekMorphology {
  language: "greek";
  partOfSpeech: PartOfSpeech;
  tense?: "present" | "imperfect" | "aorist" | "future" | "perfect" | "pluperfect";
  voice?: "active" | "middle" | "passive" | "middle-passive";
  mood?: "indicative" | "imperative" | "subjunctive" | "optative" | "infinitive" | "participle";
  person?: "1st" | "2nd" | "3rd";
  gender?: "masculine" | "feminine" | "neuter";
  number?: "singular" | "plural";
  case?: "nominative" | "genitive" | "dative" | "accusative" | "vocative";
}

export type ParsedMorphology = HebrewMorphology | GreekMorphology;

export interface OriginalLanguageToken {
  bookCode: string;
  chapter: number;
  verse: number;
  position: number;
  surfaceForm: string;
  strongsNumber: string;
  morphCode?: string;
  morphology?: ParsedMorphology;
}

export interface CrossReferenceCanonical {
  sourceBookCode: string;
  sourceChapter: number;
  sourceVerse: number;
  sourceVerseEnd?: number;
  targetBookCode: string;
  targetChapter: number;
  targetVerse: number;
  targetVerseEnd?: number;
  category?: "tsk" | "manual" | "thematic" | "quotation" | "allusion";
  strength?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}
