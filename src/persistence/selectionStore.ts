import type { CategorySelection } from "../engine/categories";
import { DEFAULT_SELECTION } from "../engine/categories";

const KEY = "wordderby.categories";

export function saveSelection(selection: CategorySelection): void {
  localStorage.setItem(KEY, JSON.stringify(selection));
}

export function loadSelection(): CategorySelection {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (
      parsed &&
      ["all", "random", "selected"].includes(parsed.mode) &&
      Array.isArray(parsed.categories)
    ) {
      return parsed as CategorySelection;
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_SELECTION;
}
