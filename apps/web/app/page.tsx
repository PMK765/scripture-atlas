import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { SectionGrid } from "@/components/section-grid";
import { BookList } from "@/components/book-list";
import { TranslationList } from "@/components/translation-list";
import { PeoplePreview } from "@/components/people/people-preview";
import { TimelinePreview } from "@/components/timeline/timeline-preview";
import { MapPreview } from "@/components/map/map-preview";
import { SiteFooter } from "@/components/site-footer";
import { getVerseCountsByTranslation } from "@/lib/queries";
import { getAllPeople } from "@/lib/people-queries";
import { getAllEvents } from "@/lib/timeline-queries";
import { getAllPlaces } from "@/lib/place-queries";

export const revalidate = 300;

export default async function HomePage() {
  const [verseCounts, people, events, places] = await Promise.all([
    getVerseCountsByTranslation(),
    getAllPeople(),
    getAllEvents(),
    getAllPlaces(),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <SectionGrid />
        <BookList />
        <TranslationList verseCounts={verseCounts} />
        <TimelinePreview events={events} />
        <PeoplePreview people={people} />
        <MapPreview places={places} />
      </main>
      <SiteFooter />
    </>
  );
}
