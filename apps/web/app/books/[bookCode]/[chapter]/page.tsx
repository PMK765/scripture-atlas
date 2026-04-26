import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ChapterReader } from "@/components/reader/chapter-reader";
import { ParallelReader } from "@/components/reader/parallel-reader";
import { TranslationPicker } from "@/components/reader/translation-picker";
import { ChapterGrid } from "@/components/reader/chapter-grid";
import { ChapterPager } from "@/components/reader/chapter-pager";
import { Badge } from "@/components/ui/badge";
import { isSeptuagintExtended } from "@bible-visualizer/config";
import {
  getAvailableTranslationsForBook,
  getBookByCode,
  getChapterVerses,
  getMaxChapterForBook,
  type TranslationRecord,
  type VerseRecord,
} from "@/lib/queries";

export const revalidate = 300;

const DEFAULT_TRANSLATION = "WEB";
const MAX_PARALLEL = 3;

interface PageProps {
  params: Promise<{ bookCode: string; chapter: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parseTranslationsParam(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

function pickEffective(requested: string[], available: TranslationRecord[]): string[] {
  const allowed = new Set(available.map((t) => t.code));
  const validRequested = requested.filter((c) => allowed.has(c)).slice(0, MAX_PARALLEL);
  if (validRequested.length > 0) return validRequested;
  if (allowed.has(DEFAULT_TRANSLATION)) return [DEFAULT_TRANSLATION];
  const first = available[0];
  return first ? [first.code] : [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bookCode, chapter } = await params;
  const book = await getBookByCode(bookCode);
  if (!book) return { title: "Not found" };
  return {
    title: `${book.name} ${chapter}`,
    description: `Read ${book.name} chapter ${chapter} across multiple translations.`,
  };
}

export default async function ChapterReaderPage({ params, searchParams }: PageProps) {
  const { bookCode, chapter: chapterStr } = await params;
  const search = await searchParams;

  const chapter = Number.parseInt(chapterStr, 10);
  if (!Number.isInteger(chapter) || chapter < 1) notFound();

  const book = await getBookByCode(bookCode);
  if (!book) notFound();

  const available = await getAvailableTranslationsForBook(book.id);
  if (available.length === 0) notFound();

  const requested = parseTranslationsParam(search.t);
  const effective = pickEffective(requested, available);
  if (effective.length === 0) notFound();

  if (requested.length > 0 && requested.join(",") !== effective.join(",")) {
    redirect(`/books/${book.code}/${chapter}?t=${effective.join(",")}`);
  }

  const maxChapter = book.chapters > 0 ? book.chapters : await getMaxChapterForBook(book.id);
  if (chapter > maxChapter) notFound();

  const translations = effective
    .map((code) => available.find((t) => t.code === code))
    .filter((t): t is TranslationRecord => Boolean(t));

  const verseLoads = await Promise.all(
    translations.map(
      async (t): Promise<{ translation: TranslationRecord; verses: VerseRecord[] }> => ({
        translation: t,
        verses: await getChapterVerses(t.id, book.id, chapter),
      }),
    ),
  );

  const isParallel = verseLoads.length > 1;
  const isSeptuagint = isSeptuagintExtended(book.canons as Parameters<typeof isSeptuagintExtended>[0]);
  const persistedQuery = effective.length > 0 ? `t=${effective.join(",")}` : "";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/#books"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            All books
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{book.testament} Testament</span>
            <span aria-hidden>·</span>
            <span className="capitalize">{book.genre}</span>
          </div>
        </div>

        <header className="mb-8 border-b pb-6">
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {book.name}{" "}
              <span className="text-muted-foreground">{chapter}</span>
            </h1>
            <span className="hidden text-xs text-muted-foreground sm:block">
              #{book.order} · {maxChapter} chapters
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="primary">{book.originalLanguage}</Badge>
            {isSeptuagint ? <Badge variant="accent">Septuagint</Badge> : null}
            {book.authorTraditional ? (
              <Badge variant="outline">Tradition: {book.authorTraditional}</Badge>
            ) : null}
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <ChapterGrid
              bookCode={book.code}
              totalChapters={maxChapter}
              currentChapter={chapter}
              searchQuery={persistedQuery}
            />
            <TranslationPicker available={available} selected={effective} />
          </aside>

          <div className="min-w-0 space-y-8">
            {isParallel ? (
              <ParallelReader columns={verseLoads} />
            ) : verseLoads[0] ? (
              <ChapterReader
                translation={verseLoads[0].translation}
                verses={verseLoads[0].verses}
              />
            ) : null}

            <ChapterPager
              bookCode={book.code}
              currentChapter={chapter}
              totalChapters={maxChapter}
              searchQuery={persistedQuery}
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
