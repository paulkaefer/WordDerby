import { describe, it, expect } from "vitest";
import { selectWords, createWordPool } from "../../src/engine/wordPool";
import type { WordEntry } from "../../src/engine/types";

function buildEntries(count: number, category: string): WordEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    text: `WORD${i}`,
    category,
  }));
}

describe("wordPool.selectWords", () => {
  it("returns mutually distinct words", () => {
    const pool = createWordPool(buildEntries(10, "test"));
    const words = selectWords(pool, 4);
    const texts = words.map((w) => w.text);
    expect(new Set(texts).size).toBe(4);
  });

  it("does not repeat a word until 75% of its bucket has been used", () => {
    let pool = createWordPool(buildEntries(4, "test"));
    const seen = new Set<string>();
    for (let i = 0; i < 3; i++) {
      const [word] = selectWords(pool, 1);
      // Before 75% (3 of 4) of the bucket is used, no repeats should occur.
      expect(seen.has(word.text)).toBe(false);
      seen.add(word.text);
      pool = markUsed(pool, [word.text], "test");
    }
  });

  it("falls back to least-recently-used words rather than throwing when pool is small", () => {
    const pool = createWordPool(buildEntries(2, "test"));
    expect(() => selectWords(pool, 4)).not.toThrow();
  });
});

// Re-exported for the test above; matches wordPool's internal usage tracker.
import { markUsed } from "../../src/engine/wordPool";
