# Tasks: WordDerby

**Input**: Design documents from `specs/001-wordderby/`
**Prerequisites**: [plan.md](./plan.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/game-engine.md](./contracts/game-engine.md), [quickstart.md](./quickstart.md)

**Tests are required before implementation** per constitution Principle V
(test-first core logic). Tasks marked `[P]` touch different files with no
dependency between them and can run in parallel; tasks without `[P]` share a
file or have a dependency and must run in sequence.

## Phase 3.1: Setup

- [ ] **T001** Scaffold the Vite + React + TypeScript project at repo root
  (`package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`)
- [ ] **T002** Configure Vitest + Testing Library (`vitest.config.ts`,
  `tests/setup.ts`) and add `test`/`test:watch` scripts to `package.json`
- [ ] **T003** [P] Configure ESLint + Prettier for TypeScript/React
  (`.eslintrc.cjs`, `.prettierrc`)
- [ ] **T004** [P] Create the folder skeleton from plan.md's Project
  Structure: `src/engine/`, `src/persistence/`, `src/notifications/`,
  `src/ui/components/`, `src/ui/screens/`, `src/ui/theme/`, `src/data/`,
  `tests/engine/`, `tests/ui/`
- [ ] **T005** [P] Author the curated, screened, A–Z-only word list at
  `src/data/words.json` (English-only, offensive-term-screened, includes
  category tags and any hyphen/apostrophe words correctly marked)

## Phase 3.2: Tests First (TDD) — write and confirm failing before Phase 3.3

- [ ] **T006** [P] Contract test for `startRound`/`guessLetter` core outcomes
  (correct/wrong/repeat/invalid, per contracts/game-engine.md) in
  `tests/engine/gameEngine.test.ts`
- [ ] **T007** [P] Unit tests for multi-word reveal: single letter revealing
  across 1–4 words, partial-match-counts-as-correct (FR-005), no-match
  counts as one fall (FR-006) in `tests/engine/gameEngine.multiWord.test.ts`
- [ ] **T008** [P] Unit tests for win/loss precedence: win-on-full-reveal
  (FR-009), loss-on-closing-time (FR-010), and the simultaneous-guess tie
  resolving as a win (Scenario 7/8) in `tests/engine/gameEngine.winLoss.test.ts`
- [ ] **T009** [P] Unit tests for the FR-016 safeguard: all 26 letters
  guessed with a word unsolved triggers auto-complete rather than a stuck
  state, in `tests/engine/gameEngine.safeguard.test.ts`
- [ ] **T010** [P] Unit tests for `rinkClock` (`advance`, `isClosingTime`,
  advances only on `"wrong"` outcome) in `tests/engine/rinkClock.test.ts`
- [ ] **T011** [P] Unit tests for `wordPool.selectWords`: distinct words per
  round (FR-014), 75% cycling threshold before repeats (FR-018), and
  least-recently-used fallback, in `tests/engine/wordPool.test.ts`
- [ ] **T012** [P] Unit tests for `dailyPuzzle.getDailyPuzzle` determinism
  (same date + pool → same `RoundConfig`) in `tests/engine/dailyPuzzle.test.ts`
- [ ] **T013** [P] Unit tests for `scoring.scoreRound` (bonuses for fewer
  falls/more words/speed) and `updateAchievements` (Flawless Lap,
  Four-Word Finish, loss never erases prior streak/score) in
  `tests/engine/scoring.test.ts`
- [ ] **T014** [P] Unit tests for `roundStore` save/resume round state
  round-trip (FR-017) in `tests/engine/roundStore.test.ts`
- [ ] **T015** [P] Unit tests for `profileStore` persistence of stats,
  streaks, cosmetics, achievements in `tests/engine/profileStore.test.ts`
- [ ] **T016** [P] Unit tests for `reminderScheduler`: no-op when not
  opted-in (FR-019), frequency cap of 3 and quiet-hours suppression
  (FR-020), suppressed once played that day (Scenario 14), in
  `tests/engine/reminderScheduler.test.ts`
- [ ] **T017** [P] Component test: on-screen alphabet + keyboard input both
  drive the same guess path, invalid/repeat input shows friendly inline
  feedback with no penalty, in `tests/ui/guessInput.test.tsx`
- [ ] **T018** [P] Component test: state indicators (revealed/hidden
  letters, correct/wrong letters, clock proximity) render with non-color
  cues (icon/shape/text) alongside color, in `tests/ui/accessibilityCues.test.tsx`

## Phase 3.3: Core Implementation (engine) — only after Phase 3.2 tests exist and fail

- [ ] **T019** Define shared types (`Round`, `Word`, `LetterSlot`,
  `GuessedLetter`, `RinkClock`, `PlayerProfile`, `ReminderPreference`,
  `WordPool`, `RoundConfig`) in `src/engine/types.ts` per data-model.md
- [ ] **T020** Implement `src/engine/rinkClock.ts` (`advance`,
  `isClosingTime`) to satisfy T010
- [ ] **T021** Implement `src/engine/wordPool.ts` (`selectWords` with
  distinctness + 75% cycling + LRU fallback) to satisfy T011, depends on T019
- [ ] **T022** Implement `src/engine/gameEngine.ts` (`startRound`,
  `guessLetter` with invalid/repeat/correct/wrong outcomes, multi-word
  reveal, win-before-loss precedence, FR-016 auto-complete safeguard) to
  satisfy T006–T009, depends on T019–T021
- [ ] **T023** [P] Implement `src/engine/dailyPuzzle.ts` (`getDailyPuzzle`
  deterministic date-seeded selection) to satisfy T012, depends on T019, T021
- [ ] **T024** [P] Implement `src/engine/scoring.ts` (`scoreRound`,
  `updateAchievements`) to satisfy T013, depends on T019

## Phase 3.4: Persistence & Notifications

- [ ] **T025** Implement `src/persistence/roundStore.ts` (save/load/clear
  in-progress round via `localStorage`/`IndexedDB`) to satisfy T014,
  depends on T019
- [ ] **T026** [P] Implement `src/persistence/profileStore.ts` (stats,
  streaks, cosmetics, achievements, reminder prefs persistence) to satisfy
  T015, depends on T019
- [ ] **T027** Implement `src/notifications/reminderScheduler.ts` (opt-in
  check, quiet hours by local time zone, frequency cap of 3, suppress after
  same-day play, in-app fallback prompt when permission denied/unavailable)
  to satisfy T016, depends on T026

## Phase 3.5: UI Layer

- [ ] **T028** [P] Build shared theme tokens (palette, typography, spacing,
  reduced-motion variants) in `src/ui/theme/`
- [ ] **T029** [P] Build `WordBlanks` component (word length display, per-
  letter revealed/hidden rendering, non-color state cues) in
  `src/ui/components/WordBlanks.tsx`
- [ ] **T030** [P] Build `AlphabetKeyboard` component supporting both
  on-screen buttons and physical keyboard input, disabling already-guessed
  letters, in `src/ui/components/AlphabetKeyboard.tsx` to satisfy T017
- [ ] **T031** [P] Build `RinkClockDisplay` + skater fall animation
  component (with `prefers-reduced-motion` fallback) in
  `src/ui/components/RinkClock.tsx` and `src/ui/components/Skater.tsx`
- [ ] **T032** Build `RoundScreen` composing WordBlanks, AlphabetKeyboard,
  RinkClockDisplay, and Skater, wired to `gameEngine`/`roundStore`, in
  `src/ui/screens/RoundScreen.tsx`, depends on T022, T025, T029–T031
- [ ] **T033** [P] Build win/loss end screens ("rink's closing" framing,
  never "game over") with a play-again action, in
  `src/ui/screens/EndScreen.tsx`
- [ ] **T034** [P] Build profile/stats screen (win rate, best streak,
  average falls, favorite letters, skill tier, cosmetics, achievements,
  shareable spoiler-free summary) in `src/ui/screens/ProfileScreen.tsx`,
  depends on T024, T026
- [ ] **T035** [P] Build reminder opt-in settings UI (quiet hours, frequency
  cap display, opt-out control) in `src/ui/screens/ReminderSettings.tsx`,
  depends on T027

## Phase 3.6: Polish

- [ ] **T036** [P] Run and validate every step of [quickstart.md](./quickstart.md)
  manually against a local dev build; fix any discrepancies found
- [ ] **T037** [P] Add reduced-motion and screen-reader manual verification
  notes/checklist to CI or PR template (no new automated test framework)
- [ ] **T038** [P] Performance pass: verify letter-guess input has no
  noticeable lag (constitution Principle VI) using browser dev tools
  profiling on the `RoundScreen`
- [ ] **T039** Review all copy/animations against constitution Principle I
  and II (no harm imagery, no gendered framing) across `Skater`,
  `EndScreen`, and reminder copy
- [ ] **T040** Update repository README with setup/run/test instructions
  once the above tasks are complete

## Phase 3.7: Update 2026-10-07 (categories, logging, visuals)

- [x] **T041** Layout: centered column with side padding; wrapping keyboard
  (FR-039)
- [x] **T042** Redraw `Skater` as an expressive cartoony character with idle,
  fall and reduced-motion behavior (FR-039)
- [x] **T043** Expand `src/data/words.json` to 13 categories / 500+ words via
  `scripts/buildWords.mjs` (FR-034)
- [x] **T044** `src/engine/categories.ts` + `src/persistence/selectionStore.ts`
  + `CategoryPicker` UI + tests (FR-035)
- [x] **T045** `src/logging/eventLog.ts` immutable hash-chained log + tests
  (FR-036)
- [x] **T046** Instrument `RoundScreen`, `roundStore` and `App` for game events
  and unexpected behavior; `activityMonitor.ts` for window behavior; log
  export button (FR-037, FR-038)
- [x] **T047** Ignore Ctrl/Alt/Meta key combos in `AlphabetKeyboard` (FR-040)

## Dependencies Summary

- Setup (T001–T005) before all tests and implementation.
- Tests (T006–T018) before their corresponding implementation tasks
  (T019–T035), per constitution Principle V.
- T019 (types) blocks T020–T027.
- T020–T021 block T022; T022 blocks T032.
- T025 blocks T032; T026 blocks T027 and T034; T027 blocks T035.
- UI tasks (T028–T035) depend on their respective engine/persistence tasks
  as noted above but are otherwise parallelizable `[P]`.
- Polish (T036–T040) runs last, after all prior phases.

## Parallel Execution Example

```
# After T001–T005 (setup) complete, launch all Phase 3.2 test-writing tasks together:
T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016, T017, T018

# After T019 lands, these engine implementations can proceed in parallel:
T020, T021 (T021 needs T019 only) — then T022 (needs both)
T023, T024 (each only needs T019)
```
