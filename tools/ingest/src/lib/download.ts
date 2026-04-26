import { createWriteStream, promises as fs } from "node:fs";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import yauzl from "yauzl";

const DATA_DIR_FROM_PACKAGE = "data";

export function getDataDir(packageRoot: string): string {
  return join(packageRoot, DATA_DIR_FROM_PACKAGE);
}

export async function downloadIfMissing(url: string, destination: string): Promise<void> {
  try {
    const stat = await fs.stat(destination);
    if (stat.size > 0) {
      return;
    }
  } catch {
    /* not present */
  }

  await fs.mkdir(dirname(destination), { recursive: true });
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Download failed for ${url}: ${response.status} ${response.statusText}`);
  }
  await pipeline(Readable.fromWeb(response.body), createWriteStream(destination));
}

export async function extractTextFromZip(
  zipPath: string,
  innerFilenameSuffix: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err || !zipfile) {
        reject(err ?? new Error(`Could not open zip: ${zipPath}`));
        return;
      }

      let resolved = false;
      const settle = (action: () => void): void => {
        if (resolved) return;
        resolved = true;
        action();
      };

      zipfile.readEntry();
      zipfile.on("entry", (entry) => {
        if (!entry.fileName.endsWith(innerFilenameSuffix)) {
          zipfile.readEntry();
          return;
        }
        zipfile.openReadStream(entry, (entryErr, readStream) => {
          if (entryErr || !readStream) {
            settle(() => reject(entryErr ?? new Error(`Could not read ${entry.fileName}`)));
            zipfile.close();
            return;
          }
          const chunks: Buffer[] = [];
          readStream.on("data", (chunk: Buffer) => chunks.push(chunk));
          readStream.on("end", () => {
            settle(() => resolve(Buffer.concat(chunks).toString("utf8")));
            zipfile.close();
          });
          readStream.on("error", (streamErr) => {
            settle(() => reject(streamErr));
            zipfile.close();
          });
        });
      });
      zipfile.on("end", () => {
        settle(() => reject(new Error(`No entry ending with ${innerFilenameSuffix} in ${zipPath}`)));
      });
      zipfile.on("error", (zipErr) => {
        settle(() => reject(zipErr));
      });
    });
  });
}

export async function readUtf8(path: string): Promise<string> {
  return fs.readFile(path, "utf8");
}

export interface ExtractedEntry {
  fileName: string;
  content: string;
}

/**
 * Extract every entry whose filename matches `match(fileName)` from the zip.
 * Returns each entry's UTF-8 contents along with its (relative) filename.
 */
export async function extractMatchingEntries(
  zipPath: string,
  match: (fileName: string) => boolean,
): Promise<ExtractedEntry[]> {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err || !zipfile) {
        reject(err ?? new Error(`Could not open zip: ${zipPath}`));
        return;
      }

      const collected: ExtractedEntry[] = [];
      let settled = false;
      const settle = (action: () => void): void => {
        if (settled) return;
        settled = true;
        action();
      };

      zipfile.readEntry();
      zipfile.on("entry", (entry) => {
        const isDirectory = entry.fileName.endsWith("/");
        if (isDirectory || !match(entry.fileName)) {
          zipfile.readEntry();
          return;
        }
        zipfile.openReadStream(entry, (entryErr, readStream) => {
          if (entryErr || !readStream) {
            settle(() => reject(entryErr ?? new Error(`Could not read ${entry.fileName}`)));
            zipfile.close();
            return;
          }
          const chunks: Buffer[] = [];
          readStream.on("data", (chunk: Buffer) => chunks.push(chunk));
          readStream.on("end", () => {
            collected.push({
              fileName: entry.fileName,
              content: Buffer.concat(chunks).toString("utf8"),
            });
            zipfile.readEntry();
          });
          readStream.on("error", (streamErr) => {
            settle(() => reject(streamErr));
            zipfile.close();
          });
        });
      });
      zipfile.on("end", () => settle(() => resolve(collected)));
      zipfile.on("error", (zipErr) => settle(() => reject(zipErr)));
    });
  });
}
