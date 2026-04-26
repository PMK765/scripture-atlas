import {
  englishTranslations,
  sourceLanguageTranslations,
  type Translation,
} from "@bible-visualizer/bible-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VerseCountsByTranslation } from "@/lib/queries";

function formatVerseCount(count: number | undefined): string | null {
  if (count === undefined || count === 0) return null;
  return `${count.toLocaleString()} verses ingested`;
}

function TranslationCard({
  translation,
  verseCount,
}: {
  translation: Translation;
  verseCount: number | undefined;
}) {
  const verseLabel = formatVerseCount(verseCount);
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{translation.name}</CardTitle>
          <Badge variant="outline">{translation.code}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {translation.language}
          {translation.year ? ` · ${translation.year}` : ""}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0">
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary">{translation.license}</Badge>
          {translation.hasDeuterocanon ? <Badge variant="accent">Deuterocanon</Badge> : null}
          {verseLabel ? <Badge variant="default">{verseLabel}</Badge> : null}
        </div>
        {translation.notes ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{translation.notes}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function TranslationList({
  verseCounts,
}: {
  verseCounts: VerseCountsByTranslation;
}) {
  const totalVerses = Object.values(verseCounts).reduce((a, b) => a + b, 0);

  return (
    <section id="translations" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Translations &amp; Source Texts</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Three open-license English translations and four critical source-language texts.
            {totalVerses > 0
              ? ` ${totalVerses.toLocaleString()} verses ingested across English translations.`
              : " Verse text and morphology are ingested separately into the database."}
          </p>
        </div>
      </div>
      <div className="space-y-12">
        <div>
          <h3 className="mb-4 text-lg font-semibold tracking-tight">English</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {englishTranslations.map((t) => (
              <TranslationCard
                key={t.code}
                translation={t}
                verseCount={verseCounts[t.code]}
              />
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-semibold tracking-tight">Source Languages</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sourceLanguageTranslations.map((t) => (
              <TranslationCard
                key={t.code}
                translation={t}
                verseCount={verseCounts[t.code]}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
