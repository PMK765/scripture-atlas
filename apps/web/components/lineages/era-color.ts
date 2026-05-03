import { ERAS, type Era } from "@bible-visualizer/config";

export const ERA_COLOR: Record<Era, string> = {
  antediluvian: "#6366f1",
  postdiluvian: "#0ea5e9",
  patriarchal: "#06b6d4",
  "egyptian-sojourn": "#14b8a6",
  wilderness: "#10b981",
  conquest: "#84cc16",
  judges: "#eab308",
  "united-kingdom": "#f59e0b",
  "divided-kingdom": "#f97316",
  exile: "#ef4444",
  return: "#ec4899",
  intertestamental: "#a855f7",
  ministry: "#8b5cf6",
  apostolic: "#6366f1",
};

export const ERA_RANK: Record<Era, number> = ERAS.reduce(
  (acc, era, idx) => {
    acc[era] = idx;
    return acc;
  },
  {} as Record<Era, number>,
);

export function eraColor(era: string | null): string {
  if (!era) return "#94a3b8";
  return ERA_COLOR[era as Era] ?? "#94a3b8";
}

export function eraRank(era: string | null): number {
  if (!era) return ERAS.length;
  return ERA_RANK[era as Era] ?? ERAS.length;
}
