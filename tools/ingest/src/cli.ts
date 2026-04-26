import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { prisma } from "@bible-visualizer/db";
import type { IngestionResult } from "./lib/types";
import { ingestWeb } from "./sources/web";
import { ingestKjv } from "./sources/kjv";
import { ingestBrenton } from "./sources/brenton";
import { ingestBsb } from "./sources/bsb";
import { ingestSblgnt } from "./sources/sblgnt";
import { ingestWlc } from "./sources/wlc";
import { ingestLxx } from "./sources/lxx";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

type Source = "web" | "bsb" | "kjv" | "brenton" | "sblgnt" | "wlc" | "lxx";

const SOURCES: Record<Source, (root: string) => Promise<IngestionResult>> = {
  web: ingestWeb,
  bsb: ingestBsb,
  kjv: ingestKjv,
  brenton: ingestBrenton,
  sblgnt: ingestSblgnt,
  wlc: ingestWlc,
  lxx: ingestLxx,
};

const SOURCE_ORDER: Source[] = ["web", "bsb", "kjv", "brenton", "sblgnt", "wlc", "lxx"];

function printResult(result: IngestionResult): void {
  console.log(
    `[${result.translationCode}] ${result.insertedVerses.toLocaleString()} verses inserted ` +
      `(${result.parsedVerses.toLocaleString()} parsed from ${result.totalLines.toLocaleString()} lines) ` +
      `in ${result.elapsedMs}ms`,
  );
  if (result.skippedBooks.size > 0) {
    const skipped = [...result.skippedBooks.entries()]
      .map(([code, n]) => `${code}=${n}`)
      .join(", ");
    console.log(`  skipped (out of canon): ${skipped}`);
  }
  if (result.unknownBooks.size > 0) {
    const unknown = [...result.unknownBooks.entries()]
      .map(([code, n]) => `${code}=${n}`)
      .join(", ");
    console.warn(`  unknown book codes (NOT INGESTED): ${unknown}`);
  }
}

async function runOne(source: Source): Promise<IngestionResult> {
  const fn = SOURCES[source];
  console.log(`-> ingesting ${source}...`);
  const result = await fn(PACKAGE_ROOT);
  printResult(result);
  return result;
}

async function main(): Promise<void> {
  const arg = (process.argv[2] ?? "all").toLowerCase();

  try {
    if (arg === "all") {
      for (const source of SOURCE_ORDER) {
        await runOne(source);
      }
    } else if (arg in SOURCES) {
      await runOne(arg as Source);
    } else {
      console.error(`Unknown source: "${arg}". Use one of: ${SOURCE_ORDER.join(", ")}, all.`);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Ingestion failed:", error);
  prisma.$disconnect().finally(() => process.exit(1));
});
