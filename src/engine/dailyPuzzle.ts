import type { RoundConfig, WordPool } from "./types";

/** Simple deterministic string hash (djb2) for seeding the daily selection. */
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash);
}

function seededPick<T>(items: T[], seed: number, count: number): T[] {
  if (items.length === 0) return [];
  const picked: T[] = [];
  let cursor = seed;
  const remaining = [...items];
  for (let i = 0; i < count && remaining.length > 0; i++) {
    cursor = (cursor * 1103515245 + 12345) % 2147483648;
    const index = cursor % remaining.length;
    picked.push(remaining[index]);
    remaining.splice(index, 1);
  }
  return picked;
}

const DEFAULT_WORD_COUNT = 3;
const DEFAULT_CLOSING_STEPS = 8;

/** Pure function of (date, pool): same inputs always yield the same puzzle. */
export function getDailyPuzzle(date: string, pool: WordPool): RoundConfig {
  const seed = hashString(date);
  const words = seededPick(pool.entries, seed, DEFAULT_WORD_COUNT);
  return {
    wordTexts: words.map((w) => w.text),
    closingAtSteps: DEFAULT_CLOSING_STEPS,
  };
}
