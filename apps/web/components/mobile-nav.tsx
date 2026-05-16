"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link, { type LinkProps } from "next/link";
import { BookOpen } from "lucide-react";
import { projectMeta } from "@bible-visualizer/config";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavLink = {
  href: LinkProps["href"];
  label: string;
  hint: string;
};

const PRIMARY_LINKS: NavLink[] = [
  { href: "/#books", label: "Books", hint: "Read scripture across translations" },
  { href: "/timeline", label: "Timeline", hint: "Events across biblical history" },
  { href: "/people", label: "People", hint: "Every named figure in scripture" },
  { href: "/tribes", label: "Tribes", hint: "Tribes, dynasties, and lineages" },
  { href: "/lineages", label: "Lineages", hint: "Interactive genealogy graphs" },
  { href: "/map", label: "Map", hint: "Biblical sites with sources" },
  { href: "/prophecies", label: "Prophecies", hint: "Promise and fulfillment, cited" },
  { href: "/names", label: "Names", hint: "Hebrew names broken into meaning" },
];

const SECONDARY_LINKS: NavLink[] = [
  { href: "/sources", label: "Sources & data", hint: "Attribution and methodology" },
];

function isActive(currentPath: string, href: LinkProps["href"]): boolean {
  const target = typeof href === "string" ? href : href.pathname ?? "";
  if (!target) return false;
  if (target.startsWith("/#")) return currentPath === "/";
  if (target === "/") return currentPath === "/";
  return currentPath === target || currentPath.startsWith(`${target}/`);
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-primary-foreground shadow-sm md:hidden"
          style={{ background: "var(--gradient-primary)" }}
          aria-label="Open navigation menu"
        >
          <BookOpen className="h-4 w-4" aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="gap-6 p-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-serif text-base font-medium">
            <span
              className="grid h-8 w-8 place-items-center rounded-md text-primary-foreground shadow-sm"
              style={{ background: "var(--gradient-primary)" }}
            >
              <BookOpen className="h-4 w-4" aria-hidden />
            </span>
            {projectMeta.name}
          </SheetTitle>
          <SheetDescription className="text-xs">{projectMeta.tagline}</SheetDescription>
        </SheetHeader>
        <nav className="-mx-2 flex flex-col">
          {PRIMARY_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={typeof link.href === "string" ? link.href : link.label}
                href={link.href}
                className={cn(
                  "flex flex-col gap-0.5 rounded-md px-3 py-2.5 transition-colors",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "hover:bg-muted/60 text-foreground/90",
                )}
              >
                <span className="text-sm font-medium tracking-tight">{link.label}</span>
                <span className="text-[11px] text-muted-foreground">{link.hint}</span>
              </Link>
            );
          })}
        </nav>
        <div className="-mx-2 mt-auto border-t pt-4">
          {SECONDARY_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={typeof link.href === "string" ? link.href : link.label}
                href={link.href}
                className={cn(
                  "flex items-baseline justify-between gap-3 rounded-md px-3 py-2 text-xs transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <span className="font-medium">{link.label}</span>
                <span className="text-[10px] opacity-70">{link.hint}</span>
              </Link>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
