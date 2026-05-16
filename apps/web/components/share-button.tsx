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
}

export function ShareButton({
  title,
  text,
  url,
  className,
  variant = "outline",
  size = "sm",
}: ShareButtonProps) {
  const [feedback, setFeedback] = useState<"shared" | "copied" | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string>(url ?? "");

  useEffect(() => {
    if (url) {
      setResolvedUrl(url);
      return;
    }
    if (typeof window !== "undefined") setResolvedUrl(window.location.href);
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
    "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
  const variantClasses =
    variant === "outline"
      ? "border border-border bg-card hover:bg-muted text-foreground"
      : "text-foreground hover:bg-muted";
  const sizeClasses = size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-sm";

  const label = feedback === "copied" ? "Copied" : feedback === "shared" ? "Shared" : "Share";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Share this page"
      className={cn(baseClasses, variantClasses, sizeClasses, className)}
    >
      {feedback ? (
        <Check className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Share2 className="h-3.5 w-3.5" aria-hidden />
      )}
      <span>{label}</span>
    </button>
  );
}
