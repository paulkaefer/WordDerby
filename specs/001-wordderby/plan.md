# Implementation Plan: WordDerby

**Branch**: `001-wordderby` | **Date**: 2026-09-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-wordderby/spec.md`

## Summary

WordDerby is a client-side, browser-playable multi-word letter-guessing
game. A round holds 1–4 words; guesses apply to a shared alphabet and reveal
every matching letter across all words at once. Wrong guesses are
non-punitive "falls" that advance a rink clock; the round ends in a win the
instant all words are revealed, or a loss the instant the clock reaches
closing time (win takes precedence on a tie). Core game logic (matching,
win/loss detection, clock, word selection) is implemented as pure,
UI-independent, unit-tested modules per the project constitution. Gamification
(points, daily puzzle, streaks, cosmetics, achievements, stats, sharing) and
opt-in reminders are additive layers on top of the core engine, backed by
local persistence with no required backend for v1.

## Technical Context

**Language/Version**: TypeScript 5.x, targeting evergreen browsers (ES2020+)
**Primary Dependencies**: React 18 (UI), Vite (build/dev server), Vitest +
Testing Library (unit/component tests), no server framework required for v1
**Storage**: Browser `localStorage`/`IndexedDB` for round state, player
profile, stats, cosmetics, and reminder preferences — no backend database in
v1 (see Assumption A1 below)
**Testing**: Vitest for core logic unit tests (required by constitution
Principle V); Testing Library for component-level tests of reveal/guess UI
**Target Platform**: Web browser (desktop + mobile viewport), installable as
a PWA to support Web Notifications and offline resume of in-progress rounds
**Project Type**: Single front-end web application (no separate backend
service in v1)
**Performance Goals**: Letter-guess input-to-reveal latency imperceptible
to the player (target: under one animation frame of logic work, well under
100ms end-to-end) per constitution Principle VI
**Constraints**: Must work with keyboard-only input and screen readers; no
color-only state signaling; reduced-motion variant required for fall
animation; must never render harm/execution imagery (constitution Principle I)
**Scale/Scope**: Single-player, single-device experience; a "Daily WordDerby"
shared puzzle is date-seeded from the bundled word list rather than served
live, so no multiplayer sync or server round-trip is required in v1

**Assumption A1 (flagged for confirmation)**: The spec does not name a tech
stack, so this plan defaults to a TypeScript/React/Vite web app with local
persistence and no backend, since all v1 requirements (single-player rounds,
date-seeded daily puzzle, local stats/cosmetics, opt-in local/Web
notifications) can be met without one. If cross-device sync, server-verified
daily puzzles, or a real backend is desired later, that is a follow-up
feature, not a v1 blocker.

## Constitution Check

*Gate evaluated before Phase 0 research and re-checked after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. No Harm Imagery | Spec defines skater-falls/rink-closing metaphor exclusively; no noose/gallows/execution imagery anywhere in spec or plan | PASS |
| II. Gender-Neutral Design | Spec and entities use "the skater"/neutral copy throughout; no gendered pronouns or human-identity framing planned | PASS |
| III. Multi-Word Mechanics | FR-001–FR-006 define shared-guess, multi-reveal, per-round win detection as centralized `GameEngine` logic (see data-model.md) | PASS |
| IV. Encouraging Failure & Replay | Clock-based "rink closes" loss framing (never "game over"); FR-022–FR-028 define scoring/streak/cosmetics that persist independent of a single loss | PASS |
| V. Test-First Core Logic | Plan isolates `GameEngine`, `RinkClock`, `WordPool` as pure modules with Vitest coverage required before UI wiring (see Phase 2 approach) | PASS |
| VI. Consistent, Accessible UX & Performance | FR-029–FR-031 mapped to a shared design-token palette/typography, non-color state cues, keyboard support, reduced-motion variant | PASS |

No violations identified; no entries required in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```
specs/001-wordderby/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── game-engine.md
```

### Source Code (repository root)

```
src/
├── engine/                  # Pure, UI-independent core logic (constitution Principle V)
│   ├── gameEngine.ts        # Round state machine: guesses, reveal, win/loss
│   ├── rinkClock.ts         # Clock progression, closing-time detection
│   ├── wordPool.ts          # Word selection, repeat-avoidance cycling
│   ├── dailyPuzzle.ts       # Date-seeded shared puzzle selection
│   └── scoring.ts           # Points, bonuses, streak, achievement rules
├── persistence/
│   ├── roundStore.ts        # Save/resume in-progress round
│   └── profileStore.ts      # Stats, streaks, cosmetics, reminder prefs
├── notifications/
│   └── reminderScheduler.ts # Opt-in reminder scheduling, quiet hours, fallback prompt
├── ui/
│   ├── components/          # Word blanks, alphabet keyboard, clock display, skater animation
│   ├── screens/              # Round screen, win/loss screen, stats/profile screen
│   └── theme/                # Shared palette, typography, reduced-motion styles
└── data/
    └── words.json            # Curated, screened, A–Z-only word list

tests/
├── engine/                   # Unit tests for gameEngine, rinkClock, wordPool, scoring
└── ui/                       # Component tests for accessibility and reveal behavior
```

**Structure Decision**: Single front-end project (Option 1: web app only, no
backend service). Core logic lives under `src/engine/` fully decoupled from
`src/ui/`, satisfying the constitution's requirement that game logic be
pure, modular, and independently testable.

## Phase 0: Outline & Research

See [research.md](./research.md) for decisions and rationale on:
1. Word-repeat cycling threshold (spec fixes this at 75% of pool cycled).
2. Reminder frequency cap and quiet-hours handling (spec fixes cap at 3).
3. Daily puzzle determinism approach (date-seeded index, no server needed).
4. Reduced-motion and non-color state signaling approach for accessibility.
5. Persistence approach for resuming an in-progress round.

**Output**: [research.md](./research.md) — all prior `NEEDS CLARIFICATION`
items from the spec are now resolved; no open unknowns remain for Phase 1.

## Phase 1: Design & Contracts

1. **Data model** — entities, fields, states, and transitions extracted from
   the spec's Key Entities section: see [data-model.md](./data-model.md).
2. **Contracts** — this is a client-only app with no network API in v1, so
   "contracts" are the internal module boundaries the UI depends on (inputs/
   outputs/invariants of `GameEngine`, `RinkClock`, `WordPool`, `Scoring`):
   see [contracts/game-engine.md](./contracts/game-engine.md).
3. **Quickstart** — manual verification steps mirroring the spec's
   acceptance scenarios: see [quickstart.md](./quickstart.md).
4. Agent-specific guidance file update is skipped for this plan run (no
   agent context file present yet in this repo); re-run the update step if
   one is introduced later.

**Output**: [data-model.md](./data-model.md), [contracts/game-engine.md](./contracts/game-engine.md), [quickstart.md](./quickstart.md)

**Post-design Constitution Check**: Re-evaluated against the table above —
no new violations introduced by the data model or module contracts. PASS.

## Phase 2: Task Planning Approach

*This section describes what the `/speckit-tasks` command will do; it is
not executed by `/speckit-plan`.*

- Load `.specify/templates/tasks-template.md` if present, otherwise derive
  task structure directly from this plan's Project Structure and the
  contracts.
- Generate one task per contract module (`gameEngine`, `rinkClock`,
  `wordPool`, `dailyPuzzle`, `scoring`) to write its unit tests first, then
  its implementation, per constitution Principle V (test-first core logic).
- Generate tasks for persistence (`roundStore`, `profileStore`) after the
  engine modules they depend on.
- Generate UI tasks (word blanks, alphabet input, clock display, skater
  animation incl. reduced-motion variant, win/loss screens) after their
  underlying engine/persistence tasks, marked `[P]` where independent
  components can be built in parallel.
- Generate notification/reminder tasks last, since they are additive and
  depend on `profileStore` for opt-in state.
- Order groups: Setup → Engine (tests+impl) → Persistence → UI → Gamification
  → Notifications → Polish/accessibility pass.

**Estimated Output**: ~30-40 numbered, dependency-ordered tasks in
`tasks.md`, produced by the `/speckit-tasks` command (not created here).

## Complexity Tracking

*No entries — no constitution principle required a deviation.*
