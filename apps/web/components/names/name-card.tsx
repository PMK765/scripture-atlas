import type { CSSProperties } from "react";
import Link from "next/link";
import type { NameSegment } from "@bible-visualizer/bible-data";
import { cn } from "@/lib/utils";

const MORPHEME_COUNT = 5;

function morphemeStyle(index: number): CSSProperties {
  const slot = index % MORPHEME_COUNT;
  return {
    ["--morpheme-color" as string]: `var(--morpheme-${slot}-text)`,
    ["--morpheme-bg" as string]: `var(--morpheme-${slot}-bg)`,
  };
}

interface NameCardProps {
  hebrew: string;
  transliteration: string;
  meaning: string;
  segments: NameSegment[];
  title: string;
  subtitle?: string;
  rightLabel?: React.ReactNode;
  scriptureRef?: string;
  notes?: string;
  personHref?: string;
  className?: string;
  size?: "default" | "large";
}

export function NameCard({
  hebrew,
  transliteration,
  meaning,
  segments,
  title,
  subtitle,
  rightLabel,
  scriptureRef,
  notes,
  personHref,
  className,
  size = "default",
}: NameCardProps) {
  const hasSegments = segments.length > 0;
  return (
    <article
      className={cn(
        "group rounded-xl border bg-card p-5 transition-colors hover:border-primary/30",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h3
            className={cn(
              "font-serif font-medium tracking-tight text-ink",
              size === "large" ? "text-2xl" : "text-xl",
            )}
          >
            {personHref ? (
              <Link
                href={personHref}
                className="hover:text-primary hover:underline underline-offset-4"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
          {subtitle ? (
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-mono">
              {subtitle}
            </p>
          ) : null}
        </div>
        {rightLabel ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground whitespace-nowrap pt-1">
            {rightLabel}
          </span>
        ) : null}
      </header>

      <div
        className={cn(
          "mt-5 flex flex-wrap items-baseline gap-x-1 gap-y-1 hebrew-text",
          size === "large" && "text-[2.75rem]",
        )}
        dir="rtl"
        lang="he"
        aria-label={`Hebrew: ${hebrew}`}
      >
        {hasSegments ? (
          segments.map((seg, i) => (
            <span key={i} style={morphemeStyle(i)} className="morpheme-text">
              {seg.hebrew}
            </span>
          ))
        ) : (
          <span>{hebrew}</span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-base font-mono">
        {hasSegments ? (
          segments.map((seg, i) => (
            <span key={i} style={morphemeStyle(i)} className="morpheme-text">
              {seg.transliteration}
            </span>
          ))
        ) : (
          <span>{transliteration}</span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink">
        <span className="italic text-muted-foreground">“{meaning}”</span>
      </p>

      {hasSegments ? (
        <dl className="mt-4 grid gap-1.5 border-t border-border/60 pt-4">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-baseline gap-2.5 text-[13px]">
              <dt>
                <span style={morphemeStyle(i)} className="morpheme-chip text-xs font-mono">
                  {seg.transliteration}
                </span>
              </dt>
              <dd className="text-muted-foreground leading-snug">{seg.gloss}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {scriptureRef ? (
        <p className="mt-4 font-mono text-[11px] text-muted-foreground tabular-nums">
          First occurrence · {scriptureRef}
        </p>
      ) : null}

      {notes ? (
        <p className="mt-3 text-xs italic text-muted-foreground/80 leading-relaxed">{notes}</p>
      ) : null}
    </article>
  );
}
