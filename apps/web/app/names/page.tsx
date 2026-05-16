import type { Metadata } from "next";
import {
  DIVINE_NAMES,
  HEBREW_NAMES,
  type DivineName,
  type DivineNameCategory,
} from "@bible-visualizer/bible-data";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { NameCard } from "@/components/names/name-card";
import { NamesExplorer } from "@/components/names/names-explorer";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Names · Scripture Atlas",
  description:
    "The Hebrew names of God and biblical figures, broken into morphemes with color-matched Hebrew, transliteration, and meaning.",
};

const DIVINE_CATEGORY_LABEL: Record<DivineNameCategory, string> = {
  tetragrammaton: "The Name",
  "elohim-family": "El / Elohim family",
  "adonai-family": "Adonai family",
  "yhwh-compound": "YHWH compounds",
  title: "Titles",
};

const DIVINE_CATEGORY_ORDER: DivineNameCategory[] = [
  "tetragrammaton",
  "elohim-family",
  "adonai-family",
  "yhwh-compound",
  "title",
];

const DIVINE_CATEGORY_BLURB: Record<DivineNameCategory, string> = {
  tetragrammaton:
    "The four-letter covenant name God reveals to Moses at the burning bush — the very ground of being.",
  "elohim-family":
    "El, Eloah, Elohim — and the El-compounds the patriarchs received. The names that locate God as the one true deity above all powers.",
  "adonai-family":
    "Lord and Master — the title that became the spoken substitute for the Tetragrammaton in Jewish reverence.",
  "yhwh-compound":
    "Each one carved into history at a moment of crisis or covenant: provision, healing, peace, righteousness.",
  title:
    "Other titles by which scripture addresses God — the Holy One of Israel, the Ancient of Days, our Father.",
};

function groupDivineNames(list: DivineName[]): Map<DivineNameCategory, DivineName[]> {
  const map = new Map<DivineNameCategory, DivineName[]>();
  for (const cat of DIVINE_CATEGORY_ORDER) map.set(cat, []);
  for (const n of list) {
    const arr = map.get(n.category) ?? [];
    arr.push(n);
    map.set(n.category, arr);
  }
  return map;
}

export default function NamesPage() {
  const grouped = groupDivineNames(DIVINE_NAMES);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <PageHero
          marker="Hebrew lexicon"
          title={
            <>
              The <em>names</em> God writes himself into.
            </>
          }
          subtitle={
            <>
              Names in scripture aren&apos;t labels — they are theology. Each one breaks open into
              morphemes that the original audience heard as full sentences. Color-matched across
              Hebrew, transliteration, and English.
            </>
          }
          meta={
            <>
              {DIVINE_NAMES.length} names of God · {HEBREW_NAMES.length} curated Hebrew names of
              people.
            </>
          }
        />

        <section className="mt-14 space-y-12">
          {DIVINE_CATEGORY_ORDER.map((cat) => {
            const items = grouped.get(cat) ?? [];
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <header className="mb-5 border-b border-border/60 pb-3">
                  <h2 className="font-serif text-2xl font-medium tracking-tight text-ink">
                    {DIVINE_CATEGORY_LABEL[cat]}
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
                    {DIVINE_CATEGORY_BLURB[cat]}
                  </p>
                </header>
                <div
                  className={
                    cat === "tetragrammaton"
                      ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  }
                >
                  {items.map((n) => (
                    <NameCard
                      key={n.id}
                      hebrew={n.hebrew}
                      transliteration={n.transliteration}
                      meaning={n.meaning}
                      segments={n.segments}
                      title={n.transliteration}
                      subtitle={DIVINE_CATEGORY_LABEL[n.category]}
                      scriptureRef={n.firstOccurrence}
                      notes={n.notes}
                      size={cat === "tetragrammaton" ? "large" : "default"}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <hr className="divider-gradient my-16" />

        <section>
          <header className="mb-6">
            <h2 className="font-serif text-3xl font-medium tracking-tight text-ink">
              Names of the people.
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Hebrew names are sermons. Yehoshua = &quot;YHWH saves.&quot; Yisra&apos;el =
              &quot;strives with God.&quot; Search the patriarchs, judges, kings, prophets, and
              apostles — every breakdown linked back to the person.
            </p>
          </header>

          <NamesExplorer names={HEBREW_NAMES} />
        </section>

        <p className="mt-16 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          Curation status: a selected set of the most theologically and linguistically notable
          Hebrew names. Etymologies follow standard lexicons (BDB, HALOT, TWOT); where genuinely
          debated, the notes name the alternatives rather than pretending consensus. The lexicon
          will expand to include place names and additional figures over time.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
