import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChapterPagerProps {
  bookCode: string;
  currentChapter: number;
  totalChapters: number;
  searchQuery?: string;
}

export function ChapterPager({
  bookCode,
  currentChapter,
  totalChapters,
  searchQuery,
}: ChapterPagerProps) {
  const qs = searchQuery ? `?${searchQuery}` : "";
  const prev = currentChapter > 1 ? currentChapter - 1 : null;
  const next = currentChapter < totalChapters ? currentChapter + 1 : null;

  return (
    <div className="flex items-center justify-between gap-3 border-t pt-6">
      {prev ? (
        <Link
          href={`/books/${bookCode}/${prev}${qs}`}
          className={cn(buttonVariants({ variant: "outline", size: "default" }), "gap-2")}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Chapter {prev}
        </Link>
      ) : (
        <span className="text-xs text-muted-foreground">Beginning of book</span>
      )}
      <span className="text-xs text-muted-foreground" aria-current="page">
        Chapter {currentChapter} of {totalChapters}
      </span>
      {next ? (
        <Link
          href={`/books/${bookCode}/${next}${qs}`}
          className={cn(buttonVariants({ variant: "outline", size: "default" }), "gap-2")}
        >
          Chapter {next}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span className="text-xs text-muted-foreground">End of book</span>
      )}
    </div>
  );
}
