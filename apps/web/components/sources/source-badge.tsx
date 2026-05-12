"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { getDataSource, getDataSourceShortName } from "@bible-visualizer/bible-data";
import { cn } from "@/lib/utils";

interface SourceBadgeProps {
  sourceId: string | null;
  sourceUrl?: string | null;
  variant?: "compact" | "default";
  className?: string;
}

export function SourceBadge({ sourceId, sourceUrl, variant = "default", className }: SourceBadgeProps) {
  const source = getDataSource(sourceId);
  if (!source) return null;

  const compact = variant === "compact";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
        className,
      )}
      title={`External source: ${source.name}. ${source.notes ?? ""}`}
    >
      <Info className={cn(compact ? "h-2.5 w-2.5" : "h-3 w-3")} aria-hidden />
      <span>
        {compact ? "ext" : "Source"}
        {compact ? null : (
          <>
            :{" "}
            <a
              href={sourceUrl ?? source.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline-offset-2 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {getDataSourceShortName(source.id) ?? source.name}
            </a>
          </>
        )}
      </span>
      {!compact ? (
        <Link
          href="/sources"
          className="ml-1 text-[10px] opacity-70 underline-offset-2 hover:underline hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          why?
        </Link>
      ) : null}
    </span>
  );
}
