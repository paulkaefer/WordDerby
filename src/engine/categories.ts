import type { WordEntry } from "./types";

export type CategoryMode = "all" | "random" | "selected";

export interface CategorySelection {
  mode: CategoryMode;
  /** Used only when mode is "selected". */
  categories: string[];
}

export const DEFAULT_SELECTION: CategorySelection = { mode: "all", categories: [] };

export function listCategories(entries: WordEntry[]): string[] {
  return Array.from(new Set(entries.map((e) => e.category))).sort();
}

/** Narrows the pool per the selection; falls back to all entries if the result would be empty. */
export function filterByCategories(
  entries: WordEntry[],
  selection: CategorySelection,
  rng: () => number = Math.random,
): { entries: WordEntry[]; categories: string[] } {
  const available = listCategories(entries);
  let chosen: string[];

  if (selection.mode === "random") {
    chosen = available.length ? [available[Math.floor(rng() * available.length)]] : [];
  } else if (selection.mode === "selected") {
    chosen = selection.categories.filter((c) => available.includes(c));
  } else {
    chosen = available;
  }

  if (chosen.length === 0) chosen = available;
  return { entries: entries.filter((e) => chosen.includes(e.category)), categories: chosen };
}
