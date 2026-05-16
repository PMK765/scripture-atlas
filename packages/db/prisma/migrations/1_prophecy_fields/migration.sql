-- Extend the Prophecy table with curated identifiers, classification,
-- fulfillment narrative, and approximate dating columns. Idempotent so it
-- can re-apply cleanly on environments that may have hand-edited rows.

ALTER TABLE "Prophecy"
  ADD COLUMN IF NOT EXISTS "code" TEXT,
  ADD COLUMN IF NOT EXISTS "title" TEXT,
  ADD COLUMN IF NOT EXISTS "category" TEXT,
  ADD COLUMN IF NOT EXISTS "fulfillmentSummary" TEXT,
  ADD COLUMN IF NOT EXISTS "prophecyYear" INTEGER,
  ADD COLUMN IF NOT EXISTS "fulfillmentYear" INTEGER;

-- Backfill code and title for any pre-existing rows so the NOT NULL
-- constraints below can be applied safely. Production already starts empty,
-- so this is a no-op there; included for resilience on dev DBs that may
-- already contain test data.
UPDATE "Prophecy" SET "code" = "id" WHERE "code" IS NULL;
UPDATE "Prophecy" SET "title" = LEFT("summary", 80) WHERE "title" IS NULL;

ALTER TABLE "Prophecy"
  ALTER COLUMN "code" SET NOT NULL,
  ALTER COLUMN "title" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Prophecy_code_key" ON "Prophecy"("code");
CREATE INDEX IF NOT EXISTS "Prophecy_category_idx" ON "Prophecy"("category");
CREATE INDEX IF NOT EXISTS "Prophecy_status_idx" ON "Prophecy"("status");
