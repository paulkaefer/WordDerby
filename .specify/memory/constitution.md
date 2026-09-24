# WordDerby Constitution

## Core Principles

### I. No Harm Imagery — Whimsical Failure Only (NON-NEGOTIABLE)
The game MUST NEVER depict a human figure being hanged, injured, or executed,
and MUST NOT render a noose, gallows, or any silhouette taking bodily damage.
Every wrong-guess and loss state MUST instead use the roller-rink metaphor: a
cartoonish figure learning to roller skate. Each wrong guess is a fall from
which the figure visibly gets back up; the terminal failure state is "the
roller rink closes for the night," never a defeat, death, or "game over"
framed around a character. Any implementation detail, asset, animation, or
copy that reintroduces execution/violence imagery MUST be rejected in review
before merge, no exceptions for placeholder or debug art.

**Rationale**: This is the foundational reason the game exists in its
reimagined form; violating it defeats the product's purpose regardless of
how polished the rest of the implementation is.

### II. Inclusive, Gender-Neutral Character Design
The failure-state character and all narrative copy MUST be gender-neutral
and MUST NOT imply a specific human identity (no "the man," "the person,"
gendered pronouns, or silhouettes coded to a specific gender/body type).
Character design MUST use a simple, rounded, ambiguous form (e.g., a
stick-figure-style skater) that reads as a friendly mascot, not a person
standing in for a real human being harmed. Copywriting, UI labels, and audio
cues follow the same neutrality rule.

**Rationale**: Removing implicit human-harm framing requires more than
swapping the animation — the language and character identity must also avoid
reintroducing a "person" that the player is implicitly hurting.

### III. Multi-Word Puzzle Mechanics
A round MUST support 1–4 related words or a phrase (e.g., a themed category
like "breakfast foods"), not only single words. A correct letter guess MUST
reveal all matching instances of that letter across every word in the round
simultaneously. Win detection MUST require all words/phrase blanks to be
fully revealed; this logic MUST be centralized in one testable module, not
duplicated per UI screen.

**Rationale**: Multi-word support is a core differentiator from classic
Hangman and touches matching, reveal, and win-detection logic that must stay
consistent across single- and multi-word rounds.

### IV. Encouraging Failure & Replayability
Wrong guesses are tracked against a configurable limit (default 6–8,
adjustable without code changes to core logic). Reaching the limit ends the
round in a "try again" state — framed as the rink closing for the night —
and MUST NEVER be labeled or visually treated as "game over," defeat, or
punishment. A lightweight scoring or streak system MUST reward completed
rounds and correct-guess efficiency, and MUST persist across rounds within a
session to encourage replay. Losing a round MUST NOT erase streak/score
progress earned in prior rounds.

**Rationale**: The product goal is a low-stakes, encouraging experience;
scoring and loss-framing decisions directly determine whether the game feels
punitive or fun.

### V. Code Quality & Test-First Core Logic
Core game logic — letter matching, per-round win/loss detection, multi-word
state tracking, wrong-guess counting, and scoring/streak calculation — MUST
be implemented as pure, UI-independent functions/modules and MUST have unit
test coverage written alongside (or before) the implementation. Prefer clear
function and component boundaries over clever, hard-to-test one-liners.
Tests MUST cover: multi-word reveal correctness, win detection across 1–4
word rounds, wrong-guess limit enforcement, and streak/score updates on
win/loss. No PR that changes core logic merges without passing tests for
the paths it touches.

**Rationale**: Game logic is the most reused, most bug-prone layer; treating
it as untestable UI-coupled code is the most common way these projects
accumulate regressions in matching/win-detection edge cases.

### VI. Consistent, Accessible UX & Performance
All screens MUST share one color palette and typography system. Game state
(remaining wrong guesses, revealed vs. hidden letters, correct/incorrect
feedback) MUST be conveyed through shape, icon, text, or position in
addition to color — never color alone — and MUST meet accessible contrast
levels. Letter guessing MUST work via keyboard input and on-screen buttons,
kept in sync with each other. The failure-state animation MUST read as
lighthearted (bounce/wobble/get-back-up energy), not punitive (no jarring
shake, red flash of "damage," or somber tone). Letter-guess interactions
MUST feel instant in-browser, with no noticeable input lag.

**Rationale**: Consistency and accessibility are non-negotiable for a game
aimed at all ages and all players; performance directly affects the
moment-to-moment feel of a letter-guessing game.

## Additional Constraints

- Configurable values (wrong-guess limit, word-count per round, palette
  tokens) live in a single config/theme source, not scattered magic numbers.
- New visual assets (character poses, rink background states, clock
  progression frames) must be reviewed against Principle I and II before
  being added to the asset pipeline.
- The optional clock-progression feature (clock advances as falls occur) is
  a nice-to-have and MUST NOT block core gameplay if deferred, but if
  implemented it MUST follow the same non-punitive tone as the fall
  animation.

## Development Workflow

- Any change touching failure-state visuals, copy, or loss framing requires
  explicit review against Principle I and II before merge.
- Core logic changes (Principle III–V) require unit tests in the same PR;
  reviewers reject PRs that add game-logic behavior without corresponding
  tests.
- UX/accessibility changes (Principle VI) require a manual check that state
  is distinguishable without color and that keyboard input still works.

## Governance

This constitution supersedes ad hoc practice for WordDerby. Amendments
require documenting the change, rationale, and version bump in this file.
Compliance with these principles MUST be verified during code review; use
project-specific agent guidance files for day-to-day implementation details
that must remain consistent with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-09-23 | **Last Amended**: 2026-09-23
