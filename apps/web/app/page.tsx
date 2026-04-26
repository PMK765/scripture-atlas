import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { SectionGrid } from "@/components/section-grid";
import { BookList } from "@/components/book-list";
import { TranslationList } from "@/components/translation-list";
import { PlaceholderSection } from "@/components/placeholder-section";
import { PeoplePreview } from "@/components/people/people-preview";
import { SiteFooter } from "@/components/site-footer";
import { getVerseCountsByTranslation } from "@/lib/queries";
import { getAllPeople } from "@/lib/people-queries";

export const revalidate = 300;

export default async function HomePage() {
  const [verseCounts, people] = await Promise.all([
    getVerseCountsByTranslation(),
    getAllPeople(),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <SectionGrid />
        <BookList />
        <TranslationList verseCounts={verseCounts} />
        <PlaceholderSection
          id="timeline"
          eyebrow="Chronology"
          title="Timeline"
          description="A chronological view of biblical events with start and end years, participants, and places."
        />
        <PeoplePreview people={people} />
        <PlaceholderSection
          id="map"
          eyebrow="Geography"
          title="Map"
          description="Geographic exploration of biblical places with coordinates and modern equivalents."
        />
      </main>
      <SiteFooter />
    </>
  );
}
