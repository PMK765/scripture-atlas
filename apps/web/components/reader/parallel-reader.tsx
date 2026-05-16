import { cn } from "@/lib/utils";
import type { TranslationRecord, VerseRecord } from "@/lib/queries";

interface ParallelReaderColumn {
  translation: TranslationRecord;
  verses: VerseRecord[];
}

interface ParallelReaderProps {
  columns: ParallelReaderColumn[];
  className?: string;
}

const RTL_LANGUAGES: ReadonlySet<string> = new Set(["hebrew", "aramaic"]);

function isRtl(language: string): boolean {
  return RTL_LANGUAGES.has(language);
}

function languageColumnClass(language: string): string {
  switch (language) {
    case "hebrew":
    case "aramaic":
      return "font-serif text-xl leading-loose";
    case "greek":
      return "font-serif text-lg leading-relaxed";
    default:
      return "font-serif text-base leading-relaxed";
  }
}

function buildVerseUnion(columns: ParallelReaderColumn[]): number[] {
  const set = new Set<number>();
  for (const c of columns) for (const v of c.verses) set.add(v.verse);
  return [...set].sort((a, b) => a - b);
}

export function ParallelReader({ columns, className }: ParallelReaderProps) {
  const verseNumbers = buildVerseUnion(columns);
  if (verseNumbers.length === 0) {
    return (
      <div className={cn("rounded-md border bg-card p-6 text-sm text-muted-foreground", className)}>
        No verses available in any selected translation for this chapter.
      </div>
    );
  }

  const verseLookups = columns.map(
    (c) => new Map(c.verses.map((v) => [v.verse, v.text] as const)),
  );

  const gridClass =
    columns.length === 2
      ? "grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-1"
      : "grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-1";

  return (
    <div className={cn("rounded-lg border bg-card p-4 sm:p-6", className)}>
      <div className={cn(gridClass, "mb-4")}>
        {columns.map((c) => (
          <div
            key={c.translation.code}
            className="flex items-baseline justify-between gap-3 border-b pb-2 text-xs uppercase tracking-wider text-muted-foreground"
          >
            <span className="font-mono">{c.translation.code}</span>
            <span className="truncate">{c.translation.name}</span>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {verseNumbers.map((v) => (
          <div
            key={v}
            id={`v${v}`}
            data-verse-row={v}
            className={cn(
              gridClass,
              "scroll-mt-24 rounded-md transition-colors data-[selected=true]:bg-amber-200/50 data-[selected=true]:px-2 data-[selected=true]:-mx-2",
            )}
          >
            {columns.map((c, idx) => {
              const text = verseLookups[idx]?.get(v);
              const dir = isRtl(c.translation.language) ? "rtl" : "ltr";
              const lang = c.translation.language === "english" ? "en" : c.translation.language;
              return (
                <p
                  key={c.translation.code}
                  dir={dir}
                  lang={lang}
                  className={cn(languageColumnClass(c.translation.language), "text-foreground")}
                >
                  {idx === 0 ? (
                    <button
                      type="button"
                      data-verse-toggle={v}
                      aria-label={`Select verse ${v}`}
                      className="me-2 inline-flex select-none items-baseline align-super text-[0.7em] font-mono font-medium text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:text-primary cursor-pointer"
                      dir="ltr"
                    >
                      {v}
                    </button>
                  ) : (
                    <sup
                      className="me-2 select-none align-super text-[0.7em] font-mono font-medium text-muted-foreground"
                      dir="ltr"
                    >
                      {v}
                    </sup>
                  )}
                  {text ?? <span className="text-muted-foreground italic">—</span>}
                </p>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
