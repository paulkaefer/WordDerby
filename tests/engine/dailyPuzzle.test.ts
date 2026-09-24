import { describe, it, expect } from "vitest";
import { getDailyPuzzle } from "../../src/engine/dailyPuzzle";
import { createWordPool } from "../../src/engine/wordPool";
import type { WordEntry } from "../../src/engine/types";

const entries: WordEntry[] = Array.from({ length: 20 }, (_, i) => ({
  text: `WORD${i}`,
  category: "daily",
}));

describe("dailyPuzzle.getDailyPuzzle", () => {
  it("is a pure function of date and pool: same inputs, same output", () => {
    const pool = createWordPool(entries);
    const a = getDailyPuzzle("2026-09-23", pool);
    const b = getDailyPuzzle("2026-09-23", pool);
    expect(a).toEqual(b);
  });

  it("produces a different puzzle on a different date (with enough pool variety)", () => {
    const pool = createWordPool(entries);
    const a = getDailyPuzzle("2026-09-23", pool);
    const b = getDailyPuzzle("2026-09-24", pool);
    expect(a.wordTexts).not.toEqual(b.wordTexts);
  });
});
