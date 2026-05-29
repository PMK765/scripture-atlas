export interface IngestedVerse {
  bookCode: string;
  chapter: number;
  verse: number;
  text: string;
}

/**
 * The DB-free output of a source adapter: parsed verses plus parse stats.
 * Both the database ingest path and the static JSON generator consume this,
 * so per-source quirks (OSIS, Swete CSV, VPL) live in one place.
 */
export interface CollectedTranslation {
  translationCode: string;
  verses: IngestedVerse[];
  totalLines: number;
  skippedBooks: Map<string, number>;
  unknownBooks: Map<string, number>;
}

export interface IngestionResult {
  translationCode: string;
  totalLines: number;
  parsedVerses: number;
  insertedVerses: number;
  skippedBooks: Map<string, number>;
  unknownBooks: Map<string, number>;
  elapsedMs: number;
}
