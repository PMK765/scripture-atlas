import Link from "next/link";
import { projectMeta } from "@bible-visualizer/config";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          {projectMeta.name} · Accuracy over interpretation. Traceable references and labeled
          confidence levels.
        </p>
        <nav className="flex items-center gap-4">
          <Link href="/sources" className="hover:text-foreground">
            Sources
          </Link>
          <span aria-hidden>·</span>
          <span>Scaffold v0.0.0</span>
        </nav>
      </div>
    </footer>
  );
}
