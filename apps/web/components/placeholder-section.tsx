import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PlaceholderSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PlaceholderSection({
  id,
  eyebrow,
  title,
  description,
  children,
}: PlaceholderSectionProps) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Coming soon</CardTitle>
          <CardDescription>
            This view is wired into the same data-driven foundation as Books, but the visualization
            layer is not yet built.
          </CardDescription>
        </CardHeader>
        {children ? <CardContent>{children}</CardContent> : null}
      </Card>
    </section>
  );
}
