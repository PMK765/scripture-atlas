-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "testament" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "chapters" INTEGER NOT NULL DEFAULT 0,
    "genre" TEXT,
    "authorTraditional" TEXT,
    "canons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "originalLanguage" TEXT NOT NULL,
    "scriptureReferences" TEXT[],
    "confidenceLevel" TEXT NOT NULL,
    "traditionTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "year" INTEGER,
    "license" TEXT NOT NULL,
    "licenseUrl" TEXT,
    "hasDeuterocanon" BOOLEAN NOT NULL DEFAULT false,
    "sourceUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verse" (
    "id" TEXT NOT NULL,
    "translationId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Verse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lemma" (
    "id" TEXT NOT NULL,
    "strongsNumber" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "lexicalForm" TEXT NOT NULL,
    "transliteration" TEXT,
    "pronunciation" TEXT,
    "definition" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lemma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OriginalLanguageToken" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "surfaceForm" TEXT NOT NULL,
    "lemmaId" TEXT NOT NULL,
    "morphCode" TEXT,
    "morphology" JSONB,

    CONSTRAINT "OriginalLanguageToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrossReference" (
    "id" TEXT NOT NULL,
    "sourceBookId" TEXT NOT NULL,
    "sourceChapter" INTEGER NOT NULL,
    "sourceVerse" INTEGER NOT NULL,
    "sourceVerseEnd" INTEGER,
    "targetBookId" TEXT NOT NULL,
    "targetChapter" INTEGER NOT NULL,
    "targetVerse" INTEGER NOT NULL,
    "targetVerseEnd" INTEGER,
    "category" TEXT,
    "strength" INTEGER,
    "notes" TEXT,

    CONSTRAINT "CrossReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alternateNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "gender" TEXT,
    "description" TEXT,
    "scriptureReferences" TEXT[],
    "confidenceLevel" TEXT NOT NULL,
    "traditionTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "era" TEXT,
    "roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "birthYear" INTEGER,
    "deathYear" INTEGER,
    "lifespanYears" INTEGER,
    "ageAtDeathRef" TEXT,
    "isHistoricallyContested" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alternateNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "region" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "modernEquivalent" TEXT,
    "description" TEXT,
    "scriptureReferences" TEXT[],
    "confidenceLevel" TEXT NOT NULL,
    "traditionTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "source" TEXT,
    "sourceUrl" TEXT,
    "isStub" BOOLEAN NOT NULL DEFAULT false,
    "prominence" TEXT,
    "mentionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "scriptureReferences" TEXT[],
    "confidenceLevel" TEXT NOT NULL,
    "traditionTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenealogyEdge" (
    "id" TEXT NOT NULL,
    "fromPersonId" TEXT NOT NULL,
    "toPersonId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "viaParent" TEXT,
    "relationKind" TEXT NOT NULL DEFAULT 'biological',
    "scriptureReferences" TEXT[],
    "confidenceLevel" TEXT NOT NULL,
    "traditionTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,

    CONSTRAINT "GenealogyEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tribe" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alternateNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "type" TEXT NOT NULL,
    "founderPersonId" TEXT,
    "parentTribeId" TEXT,
    "description" TEXT,
    "scriptureReferences" TEXT[],
    "confidenceLevel" TEXT NOT NULL,
    "traditionTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "jacobsBlessing" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tribe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonTribe" (
    "personId" TEXT NOT NULL,
    "tribeId" TEXT NOT NULL,
    "scriptureReferences" TEXT[],
    "confidenceLevel" TEXT NOT NULL,
    "traditionTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,

    CONSTRAINT "PersonTribe_pkey" PRIMARY KEY ("personId","tribeId")
);

-- CreateTable
CREATE TABLE "EventParticipant" (
    "eventId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("eventId","personId")
);

-- CreateTable
CREATE TABLE "EventPlace" (
    "eventId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,

    CONSTRAINT "EventPlace_pkey" PRIMARY KEY ("eventId","placeId")
);

-- CreateTable
CREATE TABLE "BookEvent" (
    "bookId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "BookEvent_pkey" PRIMARY KEY ("bookId","eventId")
);

-- CreateTable
CREATE TABLE "Prophecy" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "prophecyRef" TEXT NOT NULL,
    "fulfillmentRef" TEXT,
    "status" TEXT NOT NULL,
    "confidenceLevel" TEXT NOT NULL,
    "scriptureReferences" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prophecy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_code_key" ON "Book"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Book_name_key" ON "Book"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Book_abbreviation_key" ON "Book"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "Book_order_key" ON "Book"("order");

-- CreateIndex
CREATE INDEX "Book_testament_order_idx" ON "Book"("testament", "order");

-- CreateIndex
CREATE INDEX "Book_code_idx" ON "Book"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_code_key" ON "Translation"("code");

-- CreateIndex
CREATE INDEX "Verse_bookId_chapter_verse_idx" ON "Verse"("bookId", "chapter", "verse");

-- CreateIndex
CREATE INDEX "Verse_translationId_bookId_idx" ON "Verse"("translationId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "Verse_translationId_bookId_chapter_verse_key" ON "Verse"("translationId", "bookId", "chapter", "verse");

-- CreateIndex
CREATE UNIQUE INDEX "Lemma_strongsNumber_key" ON "Lemma"("strongsNumber");

-- CreateIndex
CREATE INDEX "Lemma_language_idx" ON "Lemma"("language");

-- CreateIndex
CREATE INDEX "Lemma_lexicalForm_idx" ON "Lemma"("lexicalForm");

-- CreateIndex
CREATE INDEX "OriginalLanguageToken_lemmaId_idx" ON "OriginalLanguageToken"("lemmaId");

-- CreateIndex
CREATE INDEX "OriginalLanguageToken_bookId_chapter_verse_idx" ON "OriginalLanguageToken"("bookId", "chapter", "verse");

-- CreateIndex
CREATE UNIQUE INDEX "OriginalLanguageToken_bookId_chapter_verse_position_key" ON "OriginalLanguageToken"("bookId", "chapter", "verse", "position");

-- CreateIndex
CREATE INDEX "CrossReference_sourceBookId_sourceChapter_sourceVerse_idx" ON "CrossReference"("sourceBookId", "sourceChapter", "sourceVerse");

-- CreateIndex
CREATE INDEX "CrossReference_targetBookId_targetChapter_targetVerse_idx" ON "CrossReference"("targetBookId", "targetChapter", "targetVerse");

-- CreateIndex
CREATE INDEX "CrossReference_category_idx" ON "CrossReference"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Person_code_key" ON "Person"("code");

-- CreateIndex
CREATE INDEX "Person_name_idx" ON "Person"("name");

-- CreateIndex
CREATE INDEX "Person_era_idx" ON "Person"("era");

-- CreateIndex
CREATE INDEX "Person_code_idx" ON "Person"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Place_code_key" ON "Place"("code");

-- CreateIndex
CREATE INDEX "Place_name_idx" ON "Place"("name");

-- CreateIndex
CREATE INDEX "Place_code_idx" ON "Place"("code");

-- CreateIndex
CREATE INDEX "Place_source_idx" ON "Place"("source");

-- CreateIndex
CREATE INDEX "Place_prominence_idx" ON "Place"("prominence");

-- CreateIndex
CREATE INDEX "Place_region_idx" ON "Place"("region");

-- CreateIndex
CREATE UNIQUE INDEX "Event_code_key" ON "Event"("code");

-- CreateIndex
CREATE INDEX "Event_startYear_endYear_idx" ON "Event"("startYear", "endYear");

-- CreateIndex
CREATE INDEX "Event_code_idx" ON "Event"("code");

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");

-- CreateIndex
CREATE INDEX "GenealogyEdge_fromPersonId_relationship_idx" ON "GenealogyEdge"("fromPersonId", "relationship");

-- CreateIndex
CREATE INDEX "GenealogyEdge_toPersonId_relationship_idx" ON "GenealogyEdge"("toPersonId", "relationship");

-- CreateIndex
CREATE UNIQUE INDEX "GenealogyEdge_fromPersonId_toPersonId_relationship_viaParen_key" ON "GenealogyEdge"("fromPersonId", "toPersonId", "relationship", "viaParent");

-- CreateIndex
CREATE UNIQUE INDEX "Tribe_code_key" ON "Tribe"("code");

-- CreateIndex
CREATE INDEX "Tribe_type_idx" ON "Tribe"("type");

-- CreateIndex
CREATE INDEX "Tribe_code_idx" ON "Tribe"("code");

-- CreateIndex
CREATE INDEX "PersonTribe_tribeId_idx" ON "PersonTribe"("tribeId");

-- CreateIndex
CREATE INDEX "EventParticipant_personId_idx" ON "EventParticipant"("personId");

-- CreateIndex
CREATE INDEX "EventPlace_placeId_idx" ON "EventPlace"("placeId");

-- CreateIndex
CREATE INDEX "BookEvent_eventId_idx" ON "BookEvent"("eventId");

-- AddForeignKey
ALTER TABLE "Verse" ADD CONSTRAINT "Verse_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "Translation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verse" ADD CONSTRAINT "Verse_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OriginalLanguageToken" ADD CONSTRAINT "OriginalLanguageToken_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OriginalLanguageToken" ADD CONSTRAINT "OriginalLanguageToken_lemmaId_fkey" FOREIGN KEY ("lemmaId") REFERENCES "Lemma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrossReference" ADD CONSTRAINT "CrossReference_sourceBookId_fkey" FOREIGN KEY ("sourceBookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrossReference" ADD CONSTRAINT "CrossReference_targetBookId_fkey" FOREIGN KEY ("targetBookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenealogyEdge" ADD CONSTRAINT "GenealogyEdge_fromPersonId_fkey" FOREIGN KEY ("fromPersonId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenealogyEdge" ADD CONSTRAINT "GenealogyEdge_toPersonId_fkey" FOREIGN KEY ("toPersonId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tribe" ADD CONSTRAINT "Tribe_founderPersonId_fkey" FOREIGN KEY ("founderPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tribe" ADD CONSTRAINT "Tribe_parentTribeId_fkey" FOREIGN KEY ("parentTribeId") REFERENCES "Tribe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonTribe" ADD CONSTRAINT "PersonTribe_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonTribe" ADD CONSTRAINT "PersonTribe_tribeId_fkey" FOREIGN KEY ("tribeId") REFERENCES "Tribe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPlace" ADD CONSTRAINT "EventPlace_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPlace" ADD CONSTRAINT "EventPlace_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookEvent" ADD CONSTRAINT "BookEvent_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookEvent" ADD CONSTRAINT "BookEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

