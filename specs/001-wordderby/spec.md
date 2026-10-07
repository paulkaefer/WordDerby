# Feature Specification: WordDerby

**Feature Branch**: `001-wordderby`
**Created**: 2026-09-23
**Status**: Draft
**Input**: User description: "WordDerby: a playful, multi-word take on Hangman where a cartoony character is learning to roller skate."

## Overview

WordDerby is a multi-word letter-guessing puzzle game. Each round presents 1
to 4 hidden words drawn from a curated word list. The player guesses letters
against a shared pool of blanks. Correct guesses reveal every occurrence of
that letter across all words in the round. Wrong guesses trigger a
lighthearted skater-falls animation and advance a rink clock toward
"closing time." The player wins by fully revealing every word before the
clock reaches closing time, and loses (a "rink closes" state, never framed
as death or defeat of a character) if closing time arrives with any word
unsolved.

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a player, I start a round, see 1–4 blank words with their lengths shown,
and guess letters one at a time. Correct guesses reveal matching letters in
every word at once; wrong guesses make the skater fall, then get back up,
and move the rink clock one step closer to closing. I win the round by
revealing every word before the clock reaches closing time, and I can
immediately start another round afterward, win or lose.

### Acceptance Scenarios

1. **Given** a fresh round with 1–4 hidden words, **When** the round starts,
   **Then** each word's blank length is visible and no letters are guessed
   or revealed yet.
2. **Given** a round in progress, **When** the player guesses a letter that
   appears in one or more words, **Then** every occurrence of that letter in
   every word is revealed simultaneously and the guess is marked correct.
3. **Given** a round in progress, **When** the player guesses a letter that
   appears in none of the words, **Then** the skater falls, gets back up,
   the rink clock advances one step, and the guess is marked wrong.
4. **Given** a letter that appears in some but not all words in the round,
   **When** the player guesses it, **Then** it reveals in the words that
   contain it, counts as a correct guess overall, and does **not** trigger a
   fall or clock advance.
5. **Given** a letter already guessed (correct or wrong) in the current
   round, **When** the player guesses it again, **Then** the game blocks the
   guess, shows gentle feedback (e.g., "already tried that one!"), and does
   not advance the clock or count as a fall.
6. **Given** input that is not a single A–Z letter (digits, symbols, emoji,
   multi-character strings, accented/non-English letters, empty input),
   **When** the player submits it, **Then** the game rejects it with
   friendly guidance and applies no penalty (no fall, no clock advance).
7. **Given** all words are fully revealed, **When** the last correct letter
   is guessed, **Then** the round ends immediately in a win, even if that
   same guess would have coincided with the clock reaching closing time.
8. **Given** the rink clock reaches closing time, **When** at least one word
   remains unsolved, **Then** the round ends immediately in a loss, showing
   a "the rink's closing" state, unless the clock reaching closing time and
   the final solving letter occur on the very same guess (see Scenario 7,
   where the solve takes precedence).
9. **Given** a round ends (win or loss), **When** the end state is shown,
   **Then** the player sees a clear win or loss screen with an option to
   start another round immediately.
10. **Given** a round in progress, **When** the player closes or backgrounds
    the app, **Then** the in-progress round state (revealed letters, guessed
    letters, clock position) is preserved and resumed exactly on return.
11. **Given** a round where every letter A–Z has been guessed, **When** this
    state is somehow reached with a word still unsolved, **Then** the game
    treats this as an invalid state prevented by word-list validation, and
    if it ever occurs, auto-completes the remaining word(s) as a safeguard
    rather than leaving the player stuck.
12. **Given** a word list with only unpunctuated A–Z letters, **When** a
    word contains a hyphen or apostrophe, **Then** that character is shown
    pre-revealed and is never guessable or counted toward guess totals.
13. **Given** the accessibility requirements, **When** a player uses only a
    keyboard or a screen reader, **Then** they can see/hear remaining
    guesses, revealed vs. hidden letters, and clock status without relying
    on color alone, and can opt into reduced-motion fall animations.
14. **Given** a player has opted in to reminders, **When** they have already
    completed a round that day, **Then** no further reminder is sent that
    day.
15. **Given** a player has not opted in to reminders, **When** any trigger
    condition for a reminder occurs, **Then** no notification is sent.

### Edge Cases

- Word list nears exhaustion of unused words for a given length/category:
  the game must avoid repeating a word until the full pool has cycled
  through 75% of the total set.
- A round is configured with 4 long words that could keep the alphabet from
  ever being exhausted before closing time in normal play — this is
  expected and not an edge case requiring special handling beyond Scenario
  11's safeguard.
- Notification permission is denied or unavailable: the game remains fully
  playable, with an in-app fallback prompt on return (e.g., "your skates are
  waiting") instead of a push notification.
- Reminders must respect quiet hours and the player's time zone and be
  frequency-capped (default to three).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game MUST support rounds with a configurable count of 1 to
  4 hidden words drawn from a curated, English-only, pre-screened word list.
- **FR-002**: The game MUST display each word's blank length before any
  letters are guessed.
- **FR-003**: The game MUST accept one letter guess at a time, restricted to
  single A–Z letters only; all other input MUST be rejected without penalty
  and with friendly, non-blaming feedback.
- **FR-004**: A correct letter guess MUST reveal every occurrence of that
  letter across every word in the round in a single action.
- **FR-005**: A letter guess MUST be treated as correct overall if it
  appears in at least one word in the round, and MUST reveal it only in the
  words that contain it.
- **FR-006**: A letter guess MUST be treated as a fall (wrong guess) only if
  it appears in none of the words in the round.
- **FR-007**: Each fall MUST trigger a non-punitive skater-falls-and-gets-
  back-up animation and MUST advance the rink clock one step toward closing
  time; correct guesses MUST NOT advance the clock.
- **FR-008**: Repeat guesses of an already-guessed letter (correct or wrong)
  MUST be blocked, MUST show gentle feedback, and MUST NOT advance the clock
  or count as an additional fall.
- **FR-009**: The round MUST end in a win the instant all words in the round
  are fully revealed, regardless of clock position at that moment.
- **FR-010**: The round MUST end in a loss ("the rink closes") the instant
  the clock reaches closing time with any word unsolved, unless the winning
  reveal and the clock reaching closing time occur on the same guess, in
  which case the win takes precedence (per Scenario 7/8).
- **FR-011**: The game MUST always show, during an active round: each word's
  progress (revealed/blank letters), all guessed letters distinguished as
  correct or wrong, and how close the rink clock is to closing.
- **FR-012**: Difficulty MUST scale via configurable parameters: number of
  words per round (1–4), word length, and time cost per fall.
- **FR-013**: Non-alphabetic characters within a word (hyphens, apostrophes)
  MUST be shown pre-revealed and MUST NOT be guessable or counted as part of
  guess totals.
- **FR-014**: Words within the same round MUST be distinct from one another.
- **FR-015**: The word list MUST be screened to exclude offensive, non-
  English, or ambiguous entries, and MUST use only A–Z letters (plus
  pre-revealed hyphens/apostrophes) so that guessing all 26 letters
  guarantees full word revelation.
- **FR-016**: The game MUST guarantee, via data validation and a defined
  fallback (auto-completing unsolved words), that a player can never reach a
  state where all 26 letters are exhausted with an unsolved word and no
  further recourse.
- **FR-017**: The game MUST preserve an in-progress round's full state
  (revealed letters, guessed letters, clock position) across app close/
  background and resume it exactly on return.
- **FR-018**: The game MUST avoid repeating a word until the available word
  pool for the relevant round configuration has cycled through.
- **FR-019**: The game MUST provide an explicit opt-in mechanism for
  reminders/notifications; reminders MUST NOT be sent to players who have
  not opted in.
- **FR-020**: Reminders MUST be frequency-capped, respect quiet hours and
  the player's time zone, remain changeable/removable at any time, use
  playful non-shaming copy, and MUST NOT be sent once the player has already
  played that day or completed the relevant round.
- **FR-021**: If notification permission is denied or unavailable, the game
  MUST remain fully playable and MUST offer an in-app fallback prompt on
  return instead of a push notification.
- **FR-022**: The game MUST award points per round, with bonuses for fewer
  falls, more words solved, and faster completion.
- **FR-023**: The game MUST offer a daily shared puzzle ("Daily WordDerby")
  with a daily streak counter.
- **FR-024**: The game MUST progress the skater's visible skill/appearance
  (e.g., "wobbly beginner" through higher tiers) based on cumulative player
  performance.
- **FR-025**: The game MUST support unlockable cosmetics (skates, outfits,
  rink themes) earned through play.
- **FR-026**: The game MUST track and award achievements/badges (e.g.,
  "Flawless Lap" for a no-fall win, "Four-Word Finish" for a 4-word win).
- **FR-027**: The game MUST expose personal stats to the player: win rate,
  best streak, average falls, and favorite/most-guessed letters.
- **FR-028**: The game MUST support generating a shareable, spoiler-free
  result summary for a completed round.
- **FR-029**: All game state indicators (remaining time/falls, revealed vs.
  hidden letters, correct/wrong guesses) MUST be conveyed without relying on
  color alone, and MUST meet accessible contrast standards.
- **FR-030**: The game MUST be fully operable via keyboard input and MUST
  support screen readers.
- **FR-031**: The game MUST offer a reduced-motion variant of the fall
  animation.
- **FR-032**: The failure-state character, animation, and all copy MUST
  remain gender-neutral, non-violent, and free of execution/harm imagery at
  all times (see project constitution).
- **FR-033**: This version MUST exclude multiplayer, player-authored puzzle
  words, and non-English languages.
- **FR-034**: The word list MUST be organized into named categories (at
  least 10), each large enough to supply many distinct rounds (at least 20
  words per category).
- **FR-035**: The player MUST be able to choose which categories feed the
  next round: all categories, one random category per round, or a
  player-picked subset. The choice MUST persist, MUST NOT alter a round in
  progress, and an empty or invalid pick MUST fall back to all categories.
- **FR-036**: The game MUST keep an append-only, immutable event log. Every
  entry MUST carry an ISO 8601 timestamp, and entries MUST NOT be editable
  or deletable through the game; tampering with stored history MUST be
  detectable.
- **FR-037**: The event log MUST record: session start; round start, resume
  and end (with result); every guess with its outcome, falls used and
  strikes remaining; each word completed; category selection changes;
  window/tab behavior (focus, blur, visibility change/minimize, page hide,
  online/offline); round abandonment; use of instant solve; and log exports.
- **FR-038**: The event log MUST also record any unexpected behavior
  (uncaught errors, unhandled promise rejections, render failures, corrupt
  saved state, invalid input that should be unreachable, actions on a
  finished round, log persistence/integrity failures). The player MUST be
  able to export the log.
- **FR-039**: Content must not run flush against the page edge (adequate
  margins on all viewport sizes), and the skater MUST be a cartoony,
  expressive character (idle animation, surprised face and tumble on a
  fall) that still respects FR-031 and FR-032.
- **FR-040**: Keyboard shortcuts using Ctrl, Alt or Meta modifiers MUST NOT
  be interpreted as letter guesses.
- **FR-041**: When a round ends, all of its words MUST remain visible on the
  end screen (this is a learning game). On a loss, letters the player never
  found MUST be shown and distinguished from found letters without relying
  on color alone.
- **FR-042**: The player MUST be able to start a new round immediately using
  the currently selected categories, without finishing the round in
  progress. Abandoning a round this way MUST be logged and MUST NOT count as
  a win or loss.
- **FR-043**: The game MUST offer a control to instantly solve the current
  round. Such a round ends as a win flagged "assisted": it MUST award no
  points, bonuses, achievements, streak or stat updates, MUST be labeled as
  assisted on the end screen, and MUST be logged (`solve_used`, and
  `round_end` with `assisted: true`). Whether this stays in the shipped
  game (versus a test-only control) is an open product question.

### Key Entities

- **Round**: A single play session containing 1–4 `Word` entries, a shared
  set of `GuessedLetters`, a clock position, and a status (in progress, won,
  lost). Tracks fall count and elapsed/remaining time to closing.
- **Word**: A puzzle word with its letters, length, and per-letter revealed
  state; may include non-guessable pre-revealed characters (hyphen/
  apostrophe).
- **GuessedLetters**: The set of letters guessed in the current round, each
  tagged correct or wrong, used to block repeat guesses and render the
  on-screen alphabet state.
- **RinkClock**: Tracks progress from round start toward closing time;
  advances by a configurable time cost on each fall; reaching closing time
  with unsolved words ends the round in a loss (unless superseded by a
  simultaneous win).
- **PlayerProfile**: Cumulative stats (win rate, best streak, average falls,
  favorite letters), skill-ladder tier, unlocked cosmetics, achievements,
  and daily streak count.
- **ReminderPreference**: Player's opt-in status, quiet hours, time zone,
  and frequency cap for reminder notifications.
- **WordPool**: The curated, screened, English-only source of puzzle words,
  tracking which words have been used recently to avoid repeats until the
  pool cycles.
- **CategorySelection**: The player's choice of word categories (all,
  random, or a picked subset) used to build the next round's pool.
- **EventLogEntry**: One immutable log record: sequence number, ISO 8601
  timestamp, session id, event type, event data, and a link to the previous
  entry for tamper detection.

## Review & Acceptance Checklist

- [ ] No implementation details (frameworks, languages, storage engines)
      leaked into this spec.
- [ ] All mandatory sections completed.
- [ ] Every acceptance scenario is independently testable.
- [ ] All `[NEEDS CLARIFICATION]` markers resolved before planning begins.
- [ ] Success criteria are measurable and technology-agnostic.
- [ ] No feature in this spec violates the project constitution's
      non-negotiable failure-imagery and gender-neutral character rules.

## Success Criteria

- A new player understands the rules and completes a first round without
  external instructions.
- 100% of correct guesses reveal all matching letters across all words in
  the round, verified by test coverage.
- No sequence of valid or invalid input can produce an unrecoverable or
  unwinnable game state (verified by the FR-016 safeguard).
- Reminders/notifications are sent only to players who explicitly opted in,
  and are dismissible/adjustable at all times.
- The simultaneous win/clock-closing edge case always resolves as a win,
  verified by test coverage.
