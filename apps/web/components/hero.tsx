import { projectMeta } from "@bible-visualizer/config";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {projectMeta.tagline}
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            {projectMeta.name}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {projectMeta.description} Every datum is anchored to scripture references and labeled
            with an explicit confidence level so you always know the difference between what the
            text says, what tradition holds, and what scholars debate.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#books" className={cn(buttonVariants({ size: "lg" }))}>
              Explore the Books
            </a>
            <a
              href="#map"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              View the Map
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
