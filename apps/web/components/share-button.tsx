"use client";

import { useEffect, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { shareOrCopy } from "@/lib/share";

interface ShareButtonProps {
  title: string;
  text: string;
  /*
   * Optional override for the share URL. When omitted, defaults to the
   * current page URL — captured from window.location after mount so SSR
   * doesn't lock in a stale URL.
   */
  url?: string;
  className?: string;
  variant?: "ghost" | "outline";
  size?: "sm" | "md";
  /*
   * Hides the text label so the button collapses to just the icon. Useful
   * inside dense card headers where a labeled button would dominate the
   * layout. Tooltip + aria-label remain available for screen readers.
   */
  iconOnly?: boolean;
}

export function ShareButton({
  title,
  text,
  url,
  className,
  variant = "outline",
  size = "sm",
  iconOnly = false,
}: ShareButtonProps) {
  const [feedback, setFeedback] = useState<"shared" | "copied" | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string>(url ?? "");

  useEffect(() => {
    if (typeof window === "undefined") return;
    /*
     * Resolve relative URLs against window.location.origin so the Web Share
     * API receives an absolute URL — sharing a relative path like
     * `/names?id=yhwh` would land at whatever origin the recipient opens it
     * from (or fail entirely in apps that validate URLs).
     */
    if (url) {
      setResolvedUrl(url.startsWith("http") ? url : `${window.location.origin}${url}`);
      return;
    }
    setResolvedUrl(window.location.href);
  }, [url]);

  useEffect(() => {
    if (!feedback) return;
    const t = window.setTimeout(() => setFeedback(null), 1800);
    return () => window.clearTimeout(t);
  }, [feedback]);

  const handleClick = async () => {
    const result = await shareOrCopy({ title, text, url: resolvedUrl });
    if (result === "shared") setFeedback("shared");
    else if (result === "copied") setFeedback("copied");
  };

  const baseClasses =
    "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
  const variantClasses =
    variant === "outline"
      ? "border border-border bg-card hover:bg-muted text-foreground"
      : "text-foreground hover:bg-muted";
  const sizeClasses = iconOnly
    ? size === "sm"
      ? "h-7 w-7 text-xs text-muted-foreground hover:text-foreground"
      : "h-8 w-8 text-sm text-muted-foreground hover:text-foreground"
    : size === "sm"
      ? "h-8 px-2.5 text-xs"
      : "h-9 px-3 text-sm";

  const label = feedback === "copied" ? "Copied" : feedback === "shared" ? "Shared" : "Share";

  return (
    <button
      type="button"
      onClick={handleClick}
      title={iconOnly ? label : undefined}
      aria-label={iconOnly ? "Share" : "Share this page"}
      className={cn(baseClasses, !iconOnly && variantClasses, sizeClasses, className)}
    >
      {feedback ? (
        <Check className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Share2 className="h-3.5 w-3.5" aria-hidden />
      )}
      {iconOnly ? null : <span>{label}</span>}
    </button>
  );
}
