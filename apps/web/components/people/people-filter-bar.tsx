"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowDownAZ, Clock, Search, X } from "lucide-react";
import { ERA_LABELS, type Era } from "@bible-visualizer/config";
import { cn } from "@/lib/utils";
import type { PeopleSort } from "@/lib/people-queries";

export interface PeopleFilterBarProps {
  eras: Array<{ era: string; count: number }>;
  roles: Array<{ role: string; count: number }>;
  tribes: Array<{ code: string; name: string; count: number }>;
  activeSort: PeopleSort;
}

const ROLE_LABELS: Record<string, string> = {
  patriarch: "Patriarchs",
  matriarch: "Matriarchs",
  prophet: "Prophets",
  prophetess: "Prophetesses",
  king: "Kings",
  queen: "Queens",
  priest: "Priests",
  "high-priest": "High priests",
  judge: "Judges",
  warrior: "Warriors",
  scribe: "Scribes",
  apostle: "Apostles",
  disciple: "Disciples",
  evangelist: "Evangelists",
  "ancestor-of-christ": "Christ's line",
};

const COLLAPSED_LIMIT = 6;

export function PeopleFilterBar({ eras, roles, tribes, activeSort }: PeopleFilterBarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const activeQ = params?.get("q") ?? "";
  const activeEra = params?.get("era");
  const activeRole = params?.get("role");
  const activeTribe = params?.get("tribe");
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = (inputRef.current?.value ?? "").trim();
    const next = new URLSearchParams(params?.toString() ?? "");
    if (q.length > 0) next.set("q", q);
    else next.delete("q");
    router.push(`/people${next.toString() ? `?${next.toString()}` : ""}`);
  };

  const buildHref = (key: "era" | "role" | "tribe" | "sort", val: string | null): string => {
    const next = new URLSearchParams(params?.toString() ?? "");
    if (val === null) next.delete(key);
    else next.set(key, val);
    return `/people${next.toString() ? `?${next.toString()}` : ""}`;
  };

  const hasActiveFilter = !!(activeQ || activeEra || activeRole || activeTribe);

  return (
    <div className="space-y-4">
      <form
        key={activeQ}
        onSubmit={onSubmit}
        role="search"
        className="group flex h-10 w-full items-center gap-2 rounded-md border bg-background px-3 text-sm focus-within:border-primary/60"
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          defaultValue={activeQ}
          placeholder="Search by name or alternate name…"
          aria-label="Search people"
          className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-md border bg-card p-0.5 text-xs">
          <SortChip
            href={buildHref("sort", null)}
            active={activeSort === "name"}
            icon={<ArrowDownAZ className="h-3.5 w-3.5" />}
          >
            Name
          </SortChip>
          <SortChip
            href={buildHref("sort", "chronological")}
            active={activeSort === "chronological"}
            icon={<Clock className="h-3.5 w-3.5" />}
            title="By era, then birth year (when known)"
          >
            Chronological
          </SortChip>
        </div>
        {activeSort === "chronological" ? (
          <p className="text-[11px] text-muted-foreground">
            Bucketed by era → generation depth → birth year (when known) → name. Spouses
            kept adjacent.
          </p>
        ) : null}
      </div>

      {eras.length > 0 ? (
        <CollapsibleFilterRow label="Era" totalCount={eras.length} activeKey={activeEra}>
          <FilterPill href={buildHref("era", null)} active={!activeEra}>
            All
          </FilterPill>
          {eras.map(({ era, count }) => (
            <FilterPill
              key={era}
              filterKey={era}
              href={buildHref("era", era)}
              active={activeEra === era}
            >
              {ERA_LABELS[era as Era] ?? era}
              <span className="ml-1.5 text-[10px] text-muted-foreground">{count}</span>
            </FilterPill>
          ))}
        </CollapsibleFilterRow>
      ) : null}

      {roles.length > 0 ? (
        <CollapsibleFilterRow label="Role" totalCount={roles.length} activeKey={activeRole}>
          <FilterPill href={buildHref("role", null)} active={!activeRole}>
            Any
          </FilterPill>
          {roles.map(({ role, count }) => (
            <FilterPill
              key={role}
              filterKey={role}
              href={buildHref("role", role)}
              active={activeRole === role}
            >
              {ROLE_LABELS[role] ?? role}
              <span className="ml-1.5 text-[10px] text-muted-foreground">{count}</span>
            </FilterPill>
          ))}
        </CollapsibleFilterRow>
      ) : null}

      {tribes.length > 0 ? (
        <CollapsibleFilterRow label="Tribe" totalCount={tribes.length} activeKey={activeTribe}>
          <FilterPill href={buildHref("tribe", null)} active={!activeTribe}>
            Any
          </FilterPill>
          {tribes.map(({ code, name, count }) => (
            <FilterPill
              key={code}
              filterKey={code}
              href={buildHref("tribe", code)}
              active={activeTribe === code}
            >
              {name}
              <span className="ml-1.5 text-[10px] text-muted-foreground">{count}</span>
            </FilterPill>
          ))}
        </CollapsibleFilterRow>
      ) : null}

      {hasActiveFilter ? (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
          <span>Active:</span>
          {activeQ ? (
            <ActiveChip label={`"${activeQ}"`} href={buildHref("era", activeEra)} clear="q" />
          ) : null}
          {activeEra ? (
            <ActiveChip
              label={ERA_LABELS[activeEra as Era] ?? activeEra}
              href={buildHref("era", null)}
              clear="era"
            />
          ) : null}
          {activeRole ? (
            <ActiveChip
              label={ROLE_LABELS[activeRole] ?? activeRole}
              href={buildHref("role", null)}
              clear="role"
            />
          ) : null}
          {activeTribe ? (
            <ActiveChip
              label={tribes.find((t) => t.code === activeTribe)?.name ?? activeTribe}
              href={buildHref("tribe", null)}
              clear="tribe"
            />
          ) : null}
          <Link href="/people?sort=name" className="ml-1 underline-offset-2 hover:underline">
            Clear all
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function CollapsibleFilterRow({
  label,
  totalCount,
  activeKey,
  children,
}: {
  label: string;
  totalCount: number;
  activeKey: string | null;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  const items = useMemo(() => {
    const arr = Array.isArray(children) ? children : [children];
    return arr.flat().filter(Boolean) as Array<React.ReactElement<{ filterKey?: string; active?: boolean }>>;
  }, [children]);

  const overflowCount = Math.max(0, items.length - 1 - COLLAPSED_LIMIT);

  const visible = expanded
    ? items
    : items.filter((child, idx) => {
        if (idx === 0) return true;
        if (idx <= COLLAPSED_LIMIT) return true;
        const fk = child.props.filterKey;
        if (fk && activeKey === fk) return true;
        return false;
      });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {visible}
        {overflowCount > 0 && totalCount > COLLAPSED_LIMIT ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
          >
            {expanded ? "Show less" : `Show ${overflowCount} more`}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SortChip({
  href,
  active,
  icon,
  children,
  title,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <Link
      href={href}
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2 py-1 transition-colors",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  filterKey?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function ActiveChip({
  label,
  href,
  clear,
}: {
  label: string;
  href: string;
  clear: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-full border bg-card px-2 py-0.5 text-xs hover:border-destructive/50"
      aria-label={`Clear filter ${clear}`}
    >
      <span>{label}</span>
      <X className="h-3 w-3" aria-hidden />
    </Link>
  );
}
