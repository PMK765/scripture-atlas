import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import {
  countSearchMatches,
  getTranslationByCode,
  searchVerses,
  type SearchHit,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

export const revalidate = 60;

const DEFAULT_TRANSLATION = "WEB";
const MAX_RESULTS = 50;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  return {
    title: q ? `Search: ${q}` : "Search",
    description: "Search Bible verses across translations.",
  };
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const needle = query.toLowerCase();
  if (!lower.includes(needle)) return text;
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let idx = lower.indexOf(needle, cursor);
  let key = 0;
  while (idx !== -1) {
    if (idx > cursor) parts.push(text.slice(cursor, idx));
    parts.push(
      <mark
        key={key++}
        className="rounded bg-primary/25 px-0.5 text-foreground"
      >
        {text.slice(idx, idx + needle.length)}
      </mark>,
    );
    cursor = idx + needle.length;
    idx = lower.indexOf(needle, cursor);
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

const RTL_LANGUAGES: ReadonlySet<string> = new Set(["hebrew", "aramaic"]);

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = (typeof params.q === "string" ? params.q : "").trim();
  const tParam = typeof params.t === "string" ? params.t.toUpperCase() : DEFAULT_TRANSLATION;

  const translation = (await getTranslationByCode(tParam)) ?? (await getTranslationByCode(DEFAULT_TRANSLATION));

  const hasQuery = q.length >= 2;
  const hits: SearchHit[] = hasQuery && translation
    ? await searchVerses(q, translation.code, MAX_RESULTS)
    : [];
  const totalMatches = hasQuery && translation ? await countSearchMatches(q, translation.code) : 0;

  const dir = translation && RTL_LANGUAGES.has(translation.language) ? "rtl" : "ltr";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Search</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasQuery ? (
              <>
                {totalMatches.toLocaleString()} match{totalMatches === 1 ? "" : "es"} for{" "}
                <span className="text-foreground">“{q}”</span> in{" "}
                <span className="text-foreground">{translation?.name ?? tParam}</span>
                {totalMatches > MAX_RESULTS ? (
                  <span> · showing first {MAX_RESULTS}</span>
                ) : null}
                .
              </>
            ) : (
              "Type at least two characters and press Enter."
            )}
          </p>
          {translation ? (
            <div className="mt-3">
              <Badge variant="primary">{translation.code}</Badge>
            </div>
          ) : null}
        </header>

        {hits.length === 0 && hasQuery ? (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            No verses contain “{q}” in {translation?.name ?? tParam}.
          </div>
        ) : (
          <ol className="space-y-3">
            {hits.map((hit) => {
              const href = `/books/${hit.bookCode}/${hit.chapter}?t=${translation?.code ?? DEFAULT_TRANSLATION}#v${hit.verse}`;
              return (
                <li key={`${hit.bookCode}-${hit.chapter}-${hit.verse}`}>
                  <Link
                    href={href}
                    className="block rounded-lg border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-card/80"
                  >
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold">
                        {hit.bookName}{" "}
                        <span className="font-mono text-muted-foreground">
                          {hit.chapter}:{hit.verse}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">→ open</span>
                    </div>
                    <p
                      dir={dir}
                      lang={translation?.language === "english" ? "en" : translation?.language}
                      className={cn(
                        "text-sm leading-relaxed text-foreground",
                        translation?.language === "hebrew" || translation?.language === "aramaic"
                          ? "text-lg leading-loose"
                          : translation?.language === "greek"
                          ? "text-base"
                          : "",
                      )}
                    >
                      {highlight(hit.text, q)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
