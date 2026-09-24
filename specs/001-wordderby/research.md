# Phase 0 Research: WordDerby

## 1. Word-repeat cycling threshold

- **Decision**: Do not allow a word to repeat within a round configuration
  until at least 75% of the eligible pool (matching that word's category/
  length bucket) has been used, per the spec's edge-case resolution.
- **Rationale**: Matches the explicit value already fixed in `spec.md`;
  keeps repeats rare without requiring a fully exhausted pool before reset,
  which would be brittle for small categories.
- **Alternatives considered**: Exhaust-then-reset (100% before repeat) —
  rejected as unnecessarily strict for small word categories and not what
  the spec specifies. Pure random with no tracking — rejected, fails
  FR-018.

## 2. Reminder frequency cap and quiet hours

- **Decision**: Cap reminders at 3 per rolling window (per spec), respect
  the device's local time zone for quiet-hours computation, and store the
  opt-in/quiet-hours/frequency state in `ReminderPreference`.
- **Rationale**: Spec fixes the cap at 3; using the device's local time zone
  avoids needing a backend for time zone resolution.
- **Alternatives considered**: Server-computed quiet hours — rejected, adds
  an unnecessary backend dependency for v1.

## 3. Daily puzzle determinism

- **Decision**: Derive the daily puzzle deterministically from the calendar
  date (e.g., a seeded index into the bundled word pool), computed
  client-side, so every player on the same date sees the same puzzle
  without a server round-trip.
- **Rationale**: Meets "one shared puzzle per day" without requiring
  backend infrastructure in v1, consistent with Assumption A1 in plan.md.
- **Alternatives considered**: Server-delivered daily puzzle — deferred as a
  future enhancement if server-side anti-cheat or analytics become a
  requirement; not needed to satisfy the current spec.

## 4. Reduced-motion and non-color state signaling

- **Decision**: All fall/skater animations respect the `prefers-reduced-
  motion` media query with a static/simplified fallback; every stateful
  indicator (correct/wrong letter, remaining time, revealed vs. hidden) MUST
  pair color with an icon, shape, or text label.
- **Rationale**: Directly required by FR-029–FR-031 and constitution
  Principle VI.
- **Alternatives considered**: Manual in-app toggle only (no OS-level
  detection) — rejected as insufficient; both are supported, but OS-level
  `prefers-reduced-motion` is the default source of truth.

## 5. Persistence approach for in-progress round resume

- **Decision**: Persist round state (revealed letters, guessed letters,
  clock position, timestamps) to `localStorage`/`IndexedDB` on every state
  change, keyed by an active-round identifier; rehydrate on app load before
  rendering the round screen.
- **Rationale**: Satisfies FR-017 without requiring a backend or account
  system in v1; consistent with Assumption A1.
- **Alternatives considered**: In-memory only (lost on close) — rejected,
  fails FR-017/Scenario 10 directly.

## Outcome

All previously open `[NEEDS CLARIFICATION]` items from `spec.md` are
resolved by explicit values already present in the spec (75% cycling
threshold, frequency cap of 3). No unresolved unknowns remain blocking
Phase 1 design.
