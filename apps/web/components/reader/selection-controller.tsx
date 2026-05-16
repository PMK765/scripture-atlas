"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Link2, Share2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { copyText, shareOrCopy } from "@/lib/share";

interface VerseLite {
  verse: number;
  text: string;
}

export interface SelectionControllerProps {
  bookName: string;
  bookCode: string;
  chapter: number;
  primaryTranslationCode: string;
  primaryVerses: VerseLite[];
}

interface Selection {
  start: number;
  end: number;
}

type Feedback = "copied-text" | "copied-link" | "shared" | null;

function parseSelection(value: string | null): Selection | null {
  if (!value) return null;
  const match = value.match(/^(\d+)(?:-(\d+))?$/);
  if (!match) return null;
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : start;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 1 || end < start) return null;
  return { start, end };
}

function formatSelectionParam(sel: Selection | null): string | null {
  if (!sel) return null;
  return sel.start === sel.end ? `${sel.start}` : `${sel.start}-${sel.end}`;
}

function isInSelection(verse: number, sel: Selection | null): boolean {
  if (!sel) return false;
  return verse >= sel.start && verse <= sel.end;
}

function formatReference(bookName: string, chapter: number, sel: Selection): string {
  if (sel.start === sel.end) return `${bookName} ${chapter}:${sel.start}`;
  return `${bookName} ${chapter}:${sel.start}-${sel.end}`;
}

function buildShareText(
  bookName: string,
  chapter: number,
  translationCode: string,
  primaryVerses: VerseLite[],
  sel: Selection,
): string {
  const verses = primaryVerses.filter((v) => v.verse >= sel.start && v.verse <= sel.end);
  const first = verses[0];
  if (!first) return "";
  const reference = formatReference(bookName, chapter, sel);
  /*
   * Single verse: clean inline quote. Multi-verse: keep verse numbers inline
   * so the shared block remains a coherent prose passage rather than a
   * disjointed list — mirrors how people actually quote scripture in writing.
   */
  if (verses.length === 1) {
    return `"${first.text}" — ${reference} (${translationCode})`;
  }
  const body = verses.map((v) => `[${v.verse}] ${v.text}`).join(" ");
  return `${body} — ${reference} (${translationCode})`;
}

export function SelectionController(props: SelectionControllerProps) {
  /*
   * Selection lives in window.history (not Next.js router state) on purpose.
   * Using router.replace would trigger a server route transition on every
   * verse click — re-running the page function and hitting the DB even with
   * scroll: false. Selection is pure client UI; URL updates via
   * history.replaceState keep deep-linking + copy-from-address-bar working
   * without any server involvement.
   *
   * Initial state must be null (not derived from window) to match the SSR
   * render — otherwise React's hydration uses the server's null state and
   * the deep-link highlight never fires on first paint. We read the URL
   * inside an effect below.
   */
  const [selection, setSelectionState] = useState<Selection | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [shareUrl, setShareUrl] = useState<string>("");

  /*
   * Apply / clear visual selection on the server-rendered verse rows by
   * toggling `data-selected` so styling lives in CSS rather than in JS state.
   * Handles both single-column and parallel readers since both render rows
   * with `data-verse-row="N"`.
   */
  useEffect(() => {
    const rows = document.querySelectorAll<HTMLElement>("[data-verse-row]");
    rows.forEach((row) => {
      const v = Number(row.getAttribute("data-verse-row"));
      if (isInSelection(v, selection)) {
        row.setAttribute("data-selected", "true");
      } else {
        row.removeAttribute("data-selected");
      }
    });
  }, [selection]);

  /*
   * On the first deep-link selection, scroll the first selected verse into
   * view. Tracked via a ref so user-driven selection changes don't yank
   * scroll afterwards. The selection itself is populated by the URL-read
   * effect above, which runs after the initial null render.
   */
  const hasAutoScrolled = useRef(false);
  useEffect(() => {
    if (!selection || hasAutoScrolled.current) return;
    hasAutoScrolled.current = true;
    const target = document.getElementById(`v${selection.start}`);
    if (target) {
      window.requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [selection]);

  const updateSelection = useCallback((next: Selection | null) => {
    setSelectionState(next);
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const value = formatSelectionParam(next);
    if (value) params.set("v", value);
    else params.delete("v");
    const query = params.toString();
    const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", newUrl);
    setShareUrl(window.location.origin + newUrl);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const initial = parseSelection(
      new URLSearchParams(window.location.search).get("v"),
    );
    if (initial) setSelectionState(initial);
    setShareUrl(window.location.href);
  }, []);

  /*
   * Click rules — same on desktop and mobile so behavior is uniform across
   * platforms (mobile has no shift key):
   *
   *   no current selection      → select just the clicked verse
   *   single, click same verse  → clear selection
   *   click inside a range      → narrow range to just that verse
   *   click outside selection   → extend range from anchor to clicked verse
   */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement | null)?.closest?.("[data-verse-toggle]");
      if (!btn) return;
      e.preventDefault();
      const verse = Number(btn.getAttribute("data-verse-toggle"));
      if (!Number.isFinite(verse)) return;

      if (!selection) {
        updateSelection({ start: verse, end: verse });
        return;
      }
      if (selection.start === selection.end && selection.start === verse) {
        updateSelection(null);
        return;
      }
      if (isInSelection(verse, selection)) {
        updateSelection({ start: verse, end: verse });
        return;
      }
      const anchor = selection.start;
      updateSelection(
        verse < anchor ? { start: verse, end: anchor } : { start: anchor, end: verse },
      );
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [selection, updateSelection]);

  useEffect(() => {
    if (!feedback) return;
    const t = window.setTimeout(() => setFeedback(null), 1800);
    return () => window.clearTimeout(t);
  }, [feedback]);

  if (!selection) return null;

  const reference = formatReference(props.bookName, props.chapter, selection);
  const shareText = buildShareText(
    props.bookName,
    props.chapter,
    props.primaryTranslationCode,
    props.primaryVerses,
    selection,
  );

  const handleCopyText = async () => {
    const ok = await copyText(`${shareText}\n\n${shareUrl}`);
    if (ok) setFeedback("copied-text");
  };

  const handleCopyLink = async () => {
    const ok = await copyText(shareUrl);
    if (ok) setFeedback("copied-link");
  };

  const handleShare = async () => {
    const result = await shareOrCopy({
      title: reference,
      text: shareText,
      url: shareUrl,
    });
    if (result === "shared") setFeedback("shared");
    else if (result === "copied") setFeedback("copied-text");
  };

  const handleClear = () => updateSelection(null);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-4 z-40 flex justify-center px-4",
        "pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200",
      )}
      aria-live="polite"
    >
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-xl items-center gap-1 rounded-full border bg-card/95 p-1.5 pl-4 shadow-lg backdrop-blur-sm",
          "sm:gap-2",
        )}
      >
        <span className="font-mono text-xs font-medium text-foreground sm:text-sm">
          {reference}
        </span>
        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <ToolbarButton onClick={handleCopyText} label={feedback === "copied-text" ? "Copied" : "Copy text"}>
            {feedback === "copied-text" ? (
              <Check className="h-4 w-4" aria-hidden />
            ) : (
              <Copy className="h-4 w-4" aria-hidden />
            )}
            <span className="hidden sm:inline">
              {feedback === "copied-text" ? "Copied" : "Text"}
            </span>
          </ToolbarButton>
          <ToolbarButton onClick={handleCopyLink} label={feedback === "copied-link" ? "Link copied" : "Copy link"}>
            {feedback === "copied-link" ? (
              <Check className="h-4 w-4" aria-hidden />
            ) : (
              <Link2 className="h-4 w-4" aria-hidden />
            )}
            <span className="hidden sm:inline">
              {feedback === "copied-link" ? "Copied" : "Link"}
            </span>
          </ToolbarButton>
          <ToolbarButton onClick={handleShare} label="Share" primary>
            <Share2 className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Share</span>
          </ToolbarButton>
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear selection"
            className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  label,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-xs font-medium transition-colors sm:px-3",
        primary
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
