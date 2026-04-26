"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import type { TranslationRecord } from "@/lib/queries";

const MAX_PARALLEL = 3;

interface TranslationPickerProps {
  available: TranslationRecord[];
  selected: string[];
}

const LANGUAGE_LABELS: Record<string, string> = {
  english: "English",
  hebrew: "Hebrew",
  aramaic: "Aramaic",
  greek: "Greek",
};

function groupByLanguage(translations: TranslationRecord[]): Map<string, TranslationRecord[]> {
  const groups = new Map<string, TranslationRecord[]>();
  for (const t of translations) {
    const list = groups.get(t.language) ?? [];
    list.push(t);
    groups.set(t.language, list);
  }
  return groups;
}

export function TranslationPicker({ available, selected }: TranslationPickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const buildHref = (next: string[]): string => {
    const params = new URLSearchParams();
    if (next.length > 0) params.set("t", next.join(","));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const toggle = (code: string): void => {
    let next: string[];
    if (selected.includes(code)) {
      next = selected.filter((c) => c !== code);
      if (next.length === 0) next = [code];
    } else if (selected.length >= MAX_PARALLEL) {
      next = [...selected.slice(1), code];
    } else {
      next = [...selected, code];
    }
    startTransition(() => router.replace(buildHref(next)));
  };

  const switchPrimary = (code: string): void => {
    startTransition(() => router.replace(buildHref([code])));
  };

  const groups = groupByLanguage(available);
  const orderedLanguages = ["english", "hebrew", "aramaic", "greek"].filter((l) => groups.has(l));

  return (
    <div className={cn("space-y-3", isPending && "opacity-70")} aria-busy={isPending}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">Translation</h3>
        <p className="text-xs text-muted-foreground">
          {selected.length === 1
            ? "Click to switch · click another to compare side-by-side"
            : `${selected.length} of ${MAX_PARALLEL} selected · click to toggle`}
        </p>
      </div>
      <div className="space-y-2">
        {orderedLanguages.map((lang) => {
          const items = groups.get(lang) ?? [];
          return (
            <div key={lang} className="flex flex-wrap items-center gap-2">
              <span className="w-16 shrink-0 text-xs uppercase tracking-wider text-muted-foreground">
                {LANGUAGE_LABELS[lang] ?? lang}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {items.map((t) => {
                  const isActive = selected.includes(t.code);
                  return (
                    <button
                      key={t.code}
                      type="button"
                      onClick={(e) => {
                        if (e.shiftKey || e.metaKey || e.ctrlKey) {
                          toggle(t.code);
                        } else if (isActive && selected.length > 1) {
                          toggle(t.code);
                        } else {
                          switchPrimary(t.code);
                        }
                      }}
                      title={`${t.name} — click to switch · ⌘/Shift+click to compare`}
                      aria-pressed={isActive}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        isActive
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-transparent bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      )}
                    >
                      {t.code}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
