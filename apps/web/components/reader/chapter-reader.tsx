import { cn } from "@/lib/utils";
import type { TranslationRecord, VerseRecord } from "@/lib/queries";

interface ChapterReaderProps {
  translation: TranslationRecord;
  verses: VerseRecord[];
  className?: string;
}

const RTL_LANGUAGES: ReadonlySet<string> = new Set(["hebrew", "aramaic"]);

function isRtl(language: string): boolean {
  return RTL_LANGUAGES.has(language);
}

function languageBodyClass(language: string): string {
  switch (language) {
    case "hebrew":
    case "aramaic":
      return "font-serif text-2xl leading-loose tracking-normal";
    case "greek":
      return "font-serif text-xl leading-relaxed";
    default:
      return "font-serif text-lg leading-relaxed";
  }
}

export function ChapterReader({ translation, verses, className }: ChapterReaderProps) {
  if (verses.length === 0) {
    return (
      <div className={cn("rounded-md border bg-card p-6 text-sm text-muted-foreground", className)}>
        No verses found for {translation.name} in this chapter.
      </div>
    );
  }

  const dir = isRtl(translation.language) ? "rtl" : "ltr";

  return (
    <article
      dir={dir}
      lang={translation.language === "english" ? "en" : translation.language}
      className={cn(
        "rounded-lg border bg-card p-6 sm:p-8",
        languageBodyClass(translation.language),
        className,
      )}
    >
      <div className="mb-4 flex items-baseline justify-between gap-3 text-xs uppercase tracking-wider text-muted-foreground" dir="ltr">
        <span className="font-mono">{translation.code}</span>
        <span>{translation.name}</span>
      </div>
      <div className="space-y-2 text-foreground">
        {verses.map((v) => (
          <p key={v.verse} id={`v${v.verse}`} className="scroll-mt-24">
            <sup
              className="me-2 select-none align-super text-[0.65em] font-mono font-medium text-muted-foreground"
              dir="ltr"
            >
              {v.verse}
            </sup>
            {v.text}
          </p>
        ))}
      </div>
    </article>
  );
}
