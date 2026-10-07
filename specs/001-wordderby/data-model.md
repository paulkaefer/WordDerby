# Data Model: WordDerby

## Round

Represents a single play session.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique identifier, used as the persistence key |
| `words` | `Word[]` | 1–4 entries, distinct from one another (FR-014) |
| `guessedLetters` | `GuessedLetter[]` | Shared across all words in the round |
| `clock` | `RinkClock` | Progress toward closing time |
| `fallCount` | number | Count of wrong guesses this round |
| `status` | `"in_progress" \| "won" \| "lost"` | Terminal states never framed as "game over" |
| `startedAt` / `updatedAt` | timestamp | Used for resume (FR-017) and speed bonus scoring |

**Transitions**:
- `in_progress → won`: all `words[].revealed` fully true (FR-009); takes
  precedence over a same-guess clock closure (FR-010, Scenario 7/8).
- `in_progress → won/lost` is terminal; no further guesses accepted once set.
- `in_progress → lost`: `clock.isClosingTime === true` and any word unsolved.

## Word

| Field | Type | Notes |
|---|---|---|
| `letters` | `LetterSlot[]` | Ordered slots, each A–Z or a pre-revealed non-guessable character (hyphen/apostrophe, FR-013) |
| `length` | number | Displayed before any guesses (FR-002) |
| `isFullyRevealed` | boolean (derived) | True when every guessable slot is revealed |

`LetterSlot`: `{ char: string; guessable: boolean; revealed: boolean }`

## GuessedLetter

| Field | Type | Notes |
|---|---|---|
| `letter` | `A`-`Z` | Single uppercase letter only (FR-003) |
| `result` | `"correct" \| "wrong"` | Correct if present in ≥1 word (FR-005); wrong only if in none (FR-006) |
| `guessedAt` | timestamp | For stats (average falls, favorite letters) |

Invariant: a letter already present in `guessedLetters` MUST be rejected by
the engine before being added again (FR-008); the engine returns a
"repeat guess" result rather than mutating state.

## RinkClock

| Field | Type | Notes |
|---|---|---|
| `elapsedSteps` | number | Advances by 1 per fall (FR-007); never advances on repeat/invalid guesses (FR-008) |
| `closingAtSteps` | number | Configurable per round (difficulty scaling, FR-012) |
| `isClosingTime` | boolean (derived) | `elapsedSteps >= closingAtSteps` |

## PlayerProfile

| Field | Type | Notes |
|---|---|---|
| `stats` | `{ winRate, bestStreak, averageFalls, favoriteLetters }` | FR-027 |
| `skillTier` | string | Cumulative-performance-driven ladder (FR-024) |
| `unlockedCosmetics` | string[] | Skates/outfits/rink themes (FR-025) |
| `achievements` | string[] | e.g. `"flawless_lap"`, `"four_word_finish"` (FR-026) |
| `dailyStreak` | number | Consecutive days completing the Daily WordDerby (FR-023) |

## ReminderPreference

| Field | Type | Notes |
|---|---|---|
| `optedIn` | boolean | Defaults to `false`; must be explicit (FR-019) |
| `quietHoursStart` / `quietHoursEnd` | local time | Respects device time zone |
| `frequencyCap` | number | Defaults to 3 per rolling window (spec edge case) |
| `lastSentAt` | timestamp \| null | Used to suppress reminders once played that day (FR-020) |

## WordPool

| Field | Type | Notes |
|---|---|---|
| `entries` | `Word[]` | Curated, screened, English-only, A–Z (+ pre-revealed hyphen/apostrophe) source list (FR-015) |
| `recentlyUsed` | Set<string> | Tracks used words per category/length bucket |
| `cycleThreshold` | number | Fixed at 0.75 (75% of bucket used before repeats allowed) |

**Selection invariant**: selection MUST fail closed — if a valid,
non-repeating selection cannot satisfy FR-014/FR-018, the pool falls back to
allowing the least-recently-used word rather than blocking round creation.

## CategorySelection

| Field | Type | Notes |
|---|---|---|
| `mode` | `"all" \| "random" \| "selected"` | Default `"all"` (FR-035) |
| `categories` | `string[]` | Used only for `"selected"`; unknown names ignored; empty → all |

## EventLogEntry

| Field | Type | Notes |
|---|---|---|
| `seq` | number | 0-based, contiguous |
| `timestamp` | string | ISO 8601 UTC (FR-036) |
| `sessionId` | string | Per page load |
| `type` | string | e.g. `guess`, `word_completed`, `round_end`, `window_visibility`, `unexpected` |
| `data` | object | Deep-frozen payload (guesses include `falls`, `strikesRemaining`) |
| `prevHash` / `hash` | string | Hash chain; `verifyLog` reports the first broken entry |

