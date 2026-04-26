import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PersonSummary, RelationshipEdge } from "@/lib/people-queries";

interface RelationshipListProps {
  focusId: string;
  nodes: PersonSummary[];
  edges: RelationshipEdge[];
}

interface OrganizedRelations {
  parents: Array<{ person: PersonSummary; edge: RelationshipEdge }>;
  spouses: Array<{ person: PersonSummary; edge: RelationshipEdge }>;
  children: Array<{ person: PersonSummary; edge: RelationshipEdge }>;
  siblings: PersonSummary[];
}

function organize(
  focusId: string,
  nodes: PersonSummary[],
  edges: RelationshipEdge[],
): OrganizedRelations {
  const byId = new Map(nodes.map((n) => [n.id, n]));

  const parents: Array<{ person: PersonSummary; edge: RelationshipEdge }> = [];
  const childrenLst: Array<{ person: PersonSummary; edge: RelationshipEdge }> = [];
  const spousesLst: Array<{ person: PersonSummary; edge: RelationshipEdge }> = [];
  const seenSpouseIds = new Set<string>();

  for (const e of edges) {
    if (e.relationship === "parent-of") {
      if (e.toPersonId === focusId) {
        const p = byId.get(e.fromPersonId);
        if (p) parents.push({ person: p, edge: e });
      } else if (e.fromPersonId === focusId) {
        const p = byId.get(e.toPersonId);
        if (p) childrenLst.push({ person: p, edge: e });
      }
    } else if (e.relationship === "spouse-of") {
      const otherId = e.fromPersonId === focusId ? e.toPersonId : e.toPersonId === focusId ? e.fromPersonId : null;
      if (otherId && !seenSpouseIds.has(otherId)) {
        seenSpouseIds.add(otherId);
        const p = byId.get(otherId);
        if (p) spousesLst.push({ person: p, edge: e });
      }
    }
  }

  const parentIds = new Set(parents.map((p) => p.person.id));
  const siblingIds = new Set<string>();
  for (const e of edges) {
    if (
      e.relationship === "parent-of" &&
      parentIds.has(e.fromPersonId) &&
      e.toPersonId !== focusId
    ) {
      siblingIds.add(e.toPersonId);
    }
  }
  const siblings = [...siblingIds]
    .map((id) => byId.get(id))
    .filter((p): p is PersonSummary => p !== undefined);

  return { parents, spouses: spousesLst, children: childrenLst, siblings };
}

function PersonChip({
  person,
  edge,
}: {
  person: PersonSummary;
  edge?: RelationshipEdge;
}) {
  const tradition =
    edge?.traditionTags.includes("septuagint") || edge?.traditionTags.includes("lukan-genealogy")
      ? "LXX / Luke"
      : edge?.traditionTags.includes("masoretic")
        ? "MT"
        : null;
  const isContested = edge?.confidenceLevel === "debated";

  return (
    <Link
      href={`/people/${person.code}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs transition-colors hover:border-primary/50 hover:bg-card/80",
        isContested && "border-dashed border-amber-500/60",
      )}
    >
      <span className="font-medium">{person.name}</span>
      {edge?.viaParent && edge.relationship === "parent-of" ? (
        <span className="text-[10px] text-muted-foreground">
          ({edge.viaParent})
        </span>
      ) : null}
      {tradition ? (
        <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {tradition}
        </span>
      ) : null}
    </Link>
  );
}

function Row({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div className="flex flex-col gap-2 border-b py-3 last:border-b-0 sm:flex-row sm:gap-4">
      <div className="flex shrink-0 items-baseline gap-2 sm:w-32">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Badge variant="outline">{count}</Badge>
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function RelationshipList({ focusId, nodes, edges }: RelationshipListProps) {
  const { parents, spouses, children, siblings } = organize(focusId, nodes, edges);
  const total = parents.length + spouses.length + children.length + siblings.length;

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No genealogical relationships recorded yet.
      </p>
    );
  }

  return (
    <div className="rounded-lg border bg-card px-4 py-1">
      <Row label="Parents" count={parents.length}>
        {parents.map(({ person, edge }) => (
          <PersonChip key={`p-${edge.id}`} person={person} edge={edge} />
        ))}
      </Row>
      <Row label="Spouses" count={spouses.length}>
        {spouses.map(({ person, edge }) => (
          <PersonChip key={`s-${person.id}`} person={person} edge={edge} />
        ))}
      </Row>
      <Row label="Children" count={children.length}>
        {children.map(({ person, edge }) => (
          <PersonChip key={`c-${edge.id}`} person={person} edge={edge} />
        ))}
      </Row>
      <Row label="Siblings" count={siblings.length}>
        {siblings.map((person) => (
          <PersonChip key={`sib-${person.id}`} person={person} />
        ))}
      </Row>
    </div>
  );
}
