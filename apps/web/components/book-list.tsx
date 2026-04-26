import Link from "next/link";
import {
  books,
  deuterocanonicalBooks,
  newTestamentBooks,
  oldTestamentBooks,
  type Book,
} from "@bible-visualizer/bible-data";
import { isSeptuagintExtended } from "@bible-visualizer/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function BookCard({ book }: { book: Book }) {
  const isSeptuagint = isSeptuagintExtended(book.canons);

  return (
    <Link
      href={`/books/${book.id}/1`}
      className="group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      aria-label={`Open ${book.name}`}
    >
      <Card className="h-full transition-colors group-hover:border-primary/50 group-hover:bg-card/80">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base group-hover:text-primary">{book.name}</CardTitle>
            <Badge variant="outline">#{book.order}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {book.chapters} {book.chapters === 1 ? "chapter" : "chapters"} · {book.genre} ·{" "}
            {book.originalLanguage}
            {book.authorTraditional ? ` · ${book.authorTraditional}` : ""}
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 pt-0">
          <Badge variant="primary">{book.confidenceLevel}</Badge>
          {isSeptuagint ? <Badge variant="accent">Septuagint</Badge> : null}
          {book.traditionTags
            ?.filter((tag) => tag !== "Septuagint" && tag !== "Deuterocanonical")
            .map((tag) => (
              <Badge key={tag} variant="accent">
                {tag}
              </Badge>
            ))}
        </CardContent>
      </Card>
    </Link>
  );
}

function TestamentBlock({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: Book[];
}) {
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <span className="text-xs text-muted-foreground">
          {items.length} {items.length === 1 ? "book" : "books"}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}

export function BookList() {
  const protestantOTCount = oldTestamentBooks.length - deuterocanonicalBooks.length;

  return (
    <section id="books" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Books</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All {books.length} books across the major canons — {protestantOTCount} Hebrew
            Bible + {deuterocanonicalBooks.length} Septuagint deuterocanonical +{" "}
            {newTestamentBooks.length} New Testament. Sourced from{" "}
            <code className="font-mono text-xs">@bible-visualizer/bible-data</code>.
          </p>
        </div>
      </div>
      <div className="space-y-12">
        <TestamentBlock
          title="Old Testament"
          subtitle="Catholic canonical order; Septuagint additions inline."
          items={oldTestamentBooks}
        />
        <TestamentBlock title="New Testament" items={newTestamentBooks} />
      </div>
    </section>
  );
}
