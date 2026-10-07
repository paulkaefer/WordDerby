# Internal Module Contract: Game Engine

No network API exists for v1 (client-only app). These are the internal
TypeScript module boundaries the UI layer depends on. Treat this as the
"contract" surface for test-first development (constitution Principle V).

## `gameEngine.ts`

```ts
function startRound(config: RoundConfig): Round;

function guessLetter(round: Round, letter: string): {
  round: Round;
  outcome: "correct" | "wrong" | "repeat" | "invalid";
};
```

**Invariants**:
- `guessLetter` MUST validate `letter` is a single A–Z character before
  anything else; non-matching input returns `outcome: "invalid"` and an
  unchanged `round` (FR-003, Scenario 6).
- A letter already in `round.guessedLetters` returns `outcome: "repeat"`
  with an unchanged `round` (FR-008, Scenario 5).
- A valid new letter present in ≥1 word returns `outcome: "correct"`,
  reveals every occurrence in every word, and does not advance the clock
  (FR-004, FR-005).
- A valid new letter present in 0 words returns `outcome: "wrong"`,
  increments `fallCount`, and advances `round.clock` by one step (FR-006,
  FR-007).
- After applying a guess, `gameEngine` MUST check win before loss: if all
  words are fully revealed, `round.status` becomes `"won"` even if the same
  guess also made `clock.isClosingTime` true (FR-009, FR-010).
- Once `round.status !== "in_progress"`, `guessLetter` MUST reject further
  guesses (returns unchanged round, no new outcome semantics needed beyond
  UI treating the round as terminal).
- If, after any guess, every A–Z letter has been guessed and any word
  remains unsolved, `gameEngine` MUST auto-complete the remaining word(s)
  and set `status: "won"` as the FR-016 safeguard rather than leaving the
  round stuck.

## `rinkClock.ts`

```ts
function advance(clock: RinkClock): RinkClock;
function isClosingTime(clock: RinkClock): boolean;
```

**Invariants**: `advance` only ever increments `elapsedSteps` by 1 and is
only called by `gameEngine` on a `"wrong"` outcome.

## `wordPool.ts`

```ts
function selectWords(pool: WordPool, count: 1 | 2 | 3 | 4): Word[];
```

**Invariants**: returned words are mutually distinct (FR-014); a word is
excluded from selection unless its category/length bucket has already used
≥75% of its entries, per the cycling rule (FR-018); if no compliant
selection exists, falls back to least-recently-used words rather than
throwing.

## `categories.ts`

```ts
function listCategories(entries: WordEntry[]): string[];
function filterByCategories(
  entries: WordEntry[],
  selection: CategorySelection,
  rng?: () => number,
): { entries: WordEntry[]; categories: string[] };
```

**Invariants**: `"random"` yields exactly one category; unknown categories
are ignored; an empty result falls back to all categories (FR-035).

## `logging/eventLog.ts`

```ts
function createEventLog(storage: LogStorage | null, now?: () => Date): EventLog;
function verifyLog(events: readonly LogEvent[]): number; // -1 if intact
```

**Invariants**: entries are deep-frozen and append-only; timestamps are ISO
8601; each entry hashes its predecessor; load/persist failures are logged as
`unexpected` and never throw into the game (FR-036–FR-038).

## `dailyPuzzle.ts`

```ts
function getDailyPuzzle(date: string, pool: WordPool): RoundConfig;
```

**Invariants**: pure function of `date` (e.g. `"2026-09-23"`) and `pool`
contents — same inputs always produce the same `RoundConfig` so every
player sees an identical Daily WordDerby without a server call.

## `scoring.ts`

```ts
function scoreRound(round: Round): {
  points: number;
  bonuses: { fewFalls: boolean; wordsSolved: number; speed: boolean };
};

function updateAchievements(profile: PlayerProfile, round: Round): PlayerProfile;
```

**Invariants**: `scoreRound` is a pure function of a completed (`"won"` or
`"lost"`) `Round`; a loss MUST still be able to contribute partial stats
(e.g., average falls) without deducting from `PlayerProfile.dailyStreak` or
`bestStreak` beyond simply not extending the streak (constitution Principle
IV: losing never erases prior progress).
