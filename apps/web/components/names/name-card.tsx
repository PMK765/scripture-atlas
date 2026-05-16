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

/*
 * Extract a short, meaningful English label from a segment's prose gloss for
 * use in the colored "phrase strip" below the meaning quote. The verbose
 * `gloss` field is the lexicon entry; here we want the punchy 1-3 word
 * concept. Returns null for purely grammatical segments (endings, prefixes
 * with no semantic content) so they're skipped in the strip.
 */
function deriveGlossKey(gloss: string): string | null {
  let g = gloss.trim();
  g = g.replace(/^\([a-z]+\)\s*([—–-]\s*)?/i, "");

  if (
    /^(uncertain|opening|closing|ending|noun-forming|verbal stem|passive ending|completing|infinitive(-construct)?|plural ending|extended ending|stem letter|feminine ending)/i.test(
      g,
    )
  ) {
    return null;
  }

  if (/^(?:possibly )?from [\w\-']+\s*$/i.test(g)) return null;

  if (/^(?:possibly )?from /i.test(g)) {
    const allQuoted = [...g.matchAll(/'([^']{1,30})'/g)];
    if (allQuoted.length) return allQuoted[allQuoted.length - 1]![1] ?? null;
    const meaningMatch = g.match(/meaning ([\w\s\-/]{1,25})/i);
    if (meaningMatch) return meaningMatch[1]!.trim();
    const propMatch = g.match(/^(?:possibly )?from ([A-Z][A-Za-z]+)/);
    if (propMatch) return propMatch[1] ?? null;
    return null;
  }

  const shortFor = g.match(/^short (?:for|form of) ([A-Za-z]+)/i);
  if (shortFor) return shortFor[1] ?? null;

  const parts = g
    .split(/[,;/()]/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length > 1) {
    const head = parts[0];
    if (
      head &&
      head.length <= 22 &&
      !/^(\d+(st|nd|rd|th)-person|prefix|suffix|construct|imperative|noun-forming)/i.test(head) &&
      !head.includes("+")
    ) {
      return head;
    }
  }

  const quoted = g.match(/'([^']{1,30})'/);
  if (quoted) return quoted[1] ?? null;

  if (g.length <= 18) return g;
  return null;
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
  const phraseStrip = hasSegments
    ? segments
        .map((s, i) => ({ key: deriveGlossKey(s.gloss), index: i }))
        .filter((g): g is { key: string; index: number } => Boolean(g.key))
    : [];

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

      {phraseStrip.length >= 1 ? (
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-sm">
          {phraseStrip.map((g, idx) => (
            <span key={idx} className="flex items-baseline gap-2.5">
              {idx > 0 ? (
                <span aria-hidden className="text-muted-foreground/40">
                  ·
                </span>
              ) : null}
              <span style={morphemeStyle(g.index)} className="morpheme-text">
                {g.key}
              </span>
            </span>
          ))}
        </div>
      ) : null}

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
