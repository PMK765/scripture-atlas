"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  defaultTranslation?: string;
}

export function SearchBar({ className, defaultTranslation = "WEB" }: SearchBarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params?.get("q") ?? "";
  const [value, setValue] = useState(initial);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = value.trim();
    if (q.length < 2) return;
    const t = params?.get("t") ?? defaultTranslation;
    router.push(`/search?q=${encodeURIComponent(q)}&t=${encodeURIComponent(t)}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className={cn(
        "group flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm focus-within:border-primary/60",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search verses…"
        aria-label="Search verses"
        className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
      />
    </form>
  );
}
