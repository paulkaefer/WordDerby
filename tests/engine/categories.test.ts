import { describe, it, expect } from "vitest";
import { filterByCategories, listCategories } from "../../src/engine/categories";
import words from "../../src/data/words.json";

const entries = words as { text: string; category: string }[];

describe("categories", () => {
  it("lists many categories, each with enough words for a 4-word round", () => {
    const cats = listCategories(entries);
    expect(cats.length).toBeGreaterThanOrEqual(10);
    for (const c of cats) {
      expect(entries.filter((e) => e.category === c).length).toBeGreaterThanOrEqual(20);
    }
  });

  it("only uses A-Z, spaces, hyphens, apostrophes, with no duplicates", () => {
    const texts = entries.map((e) => e.text);
    expect(new Set(texts).size).toBe(texts.length);
    for (const t of texts) expect(t).toMatch(/^[A-Z][A-Z' -]*$/);
  });

  it("all mode returns every category", () => {
    const r = filterByCategories(entries, { mode: "all", categories: [] });
    expect(r.entries.length).toBe(entries.length);
  });

  it("selected mode restricts to chosen categories and ignores unknown ones", () => {
    const r = filterByCategories(entries, { mode: "selected", categories: ["space", "nope"] });
    expect(r.categories).toEqual(["space"]);
    expect(r.entries.every((e) => e.category === "space")).toBe(true);
  });

  it("selected mode with nothing valid falls back to all", () => {
    const r = filterByCategories(entries, { mode: "selected", categories: [] });
    expect(r.entries.length).toBe(entries.length);
  });

  it("random mode picks exactly one category", () => {
    const r = filterByCategories(entries, { mode: "random", categories: [] }, () => 0);
    expect(r.categories.length).toBe(1);
  });
});
