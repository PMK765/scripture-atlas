import { Suspense } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { projectMeta } from "@bible-visualizer/config";
import { SearchBar } from "@/components/search/search-bar";
import { MobileNav } from "@/components/mobile-nav";

function SearchBarFallback() {
  return <div className="ml-auto h-9 w-full max-w-md rounded-md border bg-background sm:ml-4" />;
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-6">
        <MobileNav />
        <Link href="/" className="hidden shrink-0 items-center gap-2 md:flex">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-sm font-semibold tracking-tight">{projectMeta.name}</span>
        </Link>
        <Suspense fallback={<SearchBarFallback />}>
          <SearchBar className="ml-auto w-full max-w-md sm:ml-4" />
        </Suspense>
        <nav className="hidden gap-5 text-sm text-muted-foreground md:flex">
          <Link className="hover:text-foreground" href="/#books">
            Books
          </Link>
          <Link className="hover:text-foreground" href="/timeline">
            Timeline
          </Link>
          <Link className="hover:text-foreground" href="/people">
            People
          </Link>
          <Link className="hover:text-foreground" href="/tribes">
            Tribes
          </Link>
          <Link className="hover:text-foreground" href="/lineages">
            Lineages
          </Link>
          <Link className="hover:text-foreground" href="/map">
            Map
          </Link>
        </nav>
      </div>
    </header>
  );
}
