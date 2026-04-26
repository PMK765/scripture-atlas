export interface IngestedVerse {
  bookCode: string;
  chapter: number;
  verse: number;
  text: string;
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
