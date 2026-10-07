# Quickstart: WordDerby Manual Verification

Run these steps against a local dev build to manually verify the spec's
acceptance scenarios before/alongside automated tests.

## Setup

1. Start the app locally (dev server) with a 1-word round configuration.
2. Confirm the word's blank length is visible with no letters revealed
   (Scenario 1 / FR-002).

## Core guessing loop

3. Guess a letter present in the word → every occurrence reveals at once;
   letter marked correct on the on-screen alphabet (Scenario 2 / FR-004).
4. Guess a letter absent from the word → skater falls, gets back up, rink
   clock advances one step, letter marked wrong (Scenario 3 / FR-006–FR-007).
5. Repeat the same letter guess → blocked with gentle feedback, no clock
   change, no additional fall (Scenario 5 / FR-008).
6. Enter invalid input (digit, symbol, emoji, multi-char, empty, accented
   letter) → rejected with friendly guidance, no penalty (Scenario 6 / FR-003).

## Multi-word behavior

7. Start a 3-word round; guess a letter present in 2 of 3 words → reveals in
   those 2 words, counts as correct, no fall (Scenario 4 / FR-005).
8. Guess a letter present in none of the 3 words → counts as one fall only,
   not three (FR-006).

## Win/loss edge cases

9. Reduce closing time to be reachable quickly; drive the round to the last
   wrong guess before closing time with a word still unsolved → loss screen
   ("the rink's closing"), never "game over" (Scenario 8 / FR-010).
10. Set up a round where the final correct guess would coincide with the
    clock reaching closing time → confirm the round resolves as a **win**
    (Scenario 7 / FR-009–FR-010).
11. Guess every letter A–Z in sequence without solving a word (construct a
    contrived test word list to force this) → confirm the game
    auto-completes the remaining word and ends in a win rather than getting
    stuck (Scenario 11 / FR-016).

## Persistence

12. Mid-round, reload/close and reopen the app → round resumes exactly
    where left off, including revealed letters, guessed letters, and clock
    position (Scenario 10 / FR-017).

## Accessibility

13. Unplug the mouse; complete a full round using only keyboard input
    (Scenario 13 / FR-030).
14. Enable a screen reader; confirm remaining time, revealed/hidden
    letters, and correct/wrong guesses are announced (FR-029–FR-030).
15. Enable OS-level reduced motion; confirm the fall animation switches to
    a simplified/static variant (FR-031).
16. Simulate color-blindness (e.g., grayscale filter) and confirm correct/
    wrong/remaining-time state is still distinguishable via icon/shape/text
    (FR-029).

## Reminders

17. With reminders not opted in, trigger any reminder condition → confirm
    no notification is sent (Scenario 15 / FR-019).
18. Opt in, complete a round for the day → confirm no further reminder is
    sent that day (Scenario 14 / FR-020).
19. Deny notification permission at the OS level → confirm the game is
    still fully playable and shows the in-app fallback prompt on return
    instead (FR-021).

## Categories, logging, visuals

- Open the "Word categories" panel, choose "Pick categories" with one
  category, finish the round, start another → all words come from it
  (FR-035). Try "Random" and "All" too; reload and confirm the choice
  persisted.
- Make a wrong guess → skater tumbles with a surprised face and recovers;
  with reduced motion on, no animation (FR-039, FR-031).
- Confirm content has comfortable margins at narrow and wide window sizes.
- Play a round, switch tabs, minimize, then click "Download event log" →
  file has ISO 8601 timestamps, guesses with `strikesRemaining`,
  `word_completed`, `round_end`, and window events (FR-036, FR-037).
- Press Ctrl+R / Ctrl+C → no guess is registered (FR-040).
- Finish a round (win and loss) → all words stay visible; on a loss the
  missed letters are shown with a wavy underline (FR-041).
- Mid-round, open "Word categories" and press "Start a new round now" → a
  new round starts from the selected categories; log has `round_abandoned`
  (FR-042).
- Press "Solve it for me (no score)" → end screen says "Solved with a little
  help", log has `solve_used` and `round_end` with `assisted: true`
  (FR-043).

## Gamification

20. Complete a flawless (no-fall) round → confirm the "Flawless Lap"
    achievement is granted (FR-026).
21. Complete a 4-word round → confirm the "Four-Word Finish" achievement is
    granted (FR-026).
22. Play the Daily WordDerby on two different simulated dates → confirm the
    puzzle differs and the daily streak counter updates correctly (FR-023).
