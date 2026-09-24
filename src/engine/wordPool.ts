import type { WordEntry, WordPool } from "./types";

const DEFAULT_CYCLE_THRESHOLD = 0.75;

export function createWordPool(
  entries: WordEntry[],
  cycleThreshold: number = DEFAULT_CYCLE_THRESHOLD,
): WordPool {
  return { entries, usedByBucket: {}, cycleThreshold };
}

function bucketEntries(pool: WordPool, category: string): WordEntry[] {
  return pool.entries.filter((e) => e.category === category);
}

/** Words eligible for selection: not used, or bucket already past the cycle threshold. */
function eligibleEntries(pool: WordPool, category: string): WordEntry[] {
  const bucket = bucketEntries(pool, category);
  const used = new Set(pool.usedByBucket[category] ?? []);
  const usedRatio = bucket.length === 0 ? 0 : used.size / bucket.length;
  if (usedRatio >= pool.cycleThreshold) {
    // Pool has cycled enough: allow the least-recently-used (i.e. any) word.
    return bucket;
  }
  return bucket.filter((e) => !used.has(e.text));
}

/**
 * Selects `count` mutually distinct words. Falls back to least-recently-used
 * words rather than throwing if the pool cannot otherwise satisfy `count`.
 */
export function selectWords(pool: WordPool, count: number): WordEntry[] {
  const categories = Array.from(new Set(pool.entries.map((e) => e.category)));
  const candidates = new Map<string, WordEntry>();

  for (const category of categories) {
    for (const entry of eligibleEntries(pool, category)) {
      candidates.set(entry.text, entry);
    }
  }

  // Fallback: if not enough eligible candidates, fill in from the whole pool
  // (least-recently-used first) rather than throwing.
  if (candidates.size < count) {
    for (const entry of pool.entries) {
      candidates.set(entry.text, entry);
    }
  }

  const shuffled = Array.from(candidates.values()).sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function markUsed(pool: WordPool, texts: string[], category: string): WordPool {
  const existing = pool.usedByBucket[category] ?? [];
  const bucket = bucketEntries(pool, category);
  let updated = Array.from(new Set([...existing, ...texts]));
  // Reset the bucket's usage history once it has fully cycled, so tracking
  // doesn't grow unbounded and future selections stay meaningfully "fresh".
  if (bucket.length > 0 && updated.length >= bucket.length) {
    updated = [];
  }
  return {
    ...pool,
    usedByBucket: { ...pool.usedByBucket, [category]: updated },
  };
}
