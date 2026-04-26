"use client";

import { create } from "zustand";
import type { Testament } from "@bible-visualizer/config";

export type ExploreSection = "books" | "timeline" | "people" | "map";

type ExplorerState = {
  activeSection: ExploreSection;
  testamentFilter: Testament | "All";
  query: string;
  setActiveSection: (section: ExploreSection) => void;
  setTestamentFilter: (filter: Testament | "All") => void;
  setQuery: (query: string) => void;
  reset: () => void;
};

const initialState = {
  activeSection: "books" as ExploreSection,
  testamentFilter: "All" as Testament | "All",
  query: "",
};

export const useExplorerStore = create<ExplorerState>((set) => ({
  ...initialState,
  setActiveSection: (activeSection) => set({ activeSection }),
  setTestamentFilter: (testamentFilter) => set({ testamentFilter }),
  setQuery: (query) => set({ query }),
  reset: () => set(initialState),
}));
