import Link from "next/link";
import { projectMeta } from "@bible-visualizer/config";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="divider-gradient" aria-hidden />
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium">
          <span className="font-serif text-sm italic text-foreground">
            {projectMeta.name}
          </span>
          <span className="mx-2 opacity-50">·</span>
          Accuracy over interpretation. Sources cited.
        </p>
        <nav className="flex items-center gap-4">
          <Link href="/sources" className="hover:text-foreground">
            Sources
          </Link>
          <span aria-hidden className="opacity-50">
            ·
          </span>
          <span className="font-mono text-[10px]">v0.0.0</span>
        </nav>
      </div>
    </footer>
  );
}
