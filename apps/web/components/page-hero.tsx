import { cn } from "@/lib/utils";

interface PageHeroProps {
  marker: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
  size?: "default" | "compact";
}

/**
 * Standard page header used across the app: a small verse-marker ornament,
 * a large serif headline (with an italic gradient accent word for emphasis),
 * and optional subtitle / meta line. Use the <em> tag inside `title` to mark
 * the word that should render in the gradient italic.
 */
export function PageHero({
  marker,
  title,
  subtitle,
  meta,
  className,
  size = "default",
}: PageHeroProps) {
  return (
    <header className={cn(size === "compact" ? "mb-6" : "mb-10", className)}>
      <span className="verse-marker">{marker}</span>
      <h1
        className={cn(
          "hero-headline mt-4 font-serif font-medium leading-[1.05] tracking-tight text-ink",
          size === "compact" ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl",
        )}
      >
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
      {meta ? (
        <p className="mt-2 text-xs text-muted-foreground/80">{meta}</p>
      ) : null}
    </header>
  );
}
