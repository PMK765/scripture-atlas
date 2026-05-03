import { projectMeta } from "@bible-visualizer/config";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          {projectMeta.name} · Accuracy over interpretation. Traceable references and labeled
          confidence levels.
        </p>
        <p>Scaffold v0.0.0</p>
      </div>
    </footer>
  );
}
