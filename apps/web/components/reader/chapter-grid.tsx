import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChapterGridProps {
  bookCode: string;
  totalChapters: number;
  currentChapter: number;
  searchQuery?: string;
  className?: string;
}

export function ChapterGrid({
  bookCode,
  totalChapters,
  currentChapter,
  searchQuery,
  className,
}: ChapterGridProps) {
  if (totalChapters <= 0) return null;
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);
  const qs = searchQuery ? `?${searchQuery}` : "";

  return (
    <nav className={cn("space-y-3", className)} aria-label="Chapters">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">Chapters</h3>
        <span className="text-xs text-muted-foreground">{totalChapters}</span>
      </div>
      <ol className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-5 xl:grid-cols-6">
        {chapters.map((c) => {
          const active = c === currentChapter;
          return (
            <li key={c}>
              <Link
                href={`/books/${bookCode}/${c}${qs}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-md border px-2 py-1.5 text-center text-xs font-mono tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {c}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
