import { describe, it, expect } from "vitest";
import { guessLetter } from "../../src/engine/gameEngine";
import type { Round } from "../../src/engine/types";

describe("gameEngine FR-016 safeguard", () => {
  it("auto-completes remaining words if all 26 letters are exhausted unsolved", () => {
    // FR-015 guarantees every real word uses only A-Z, so this scenario is
    // unreachable through normal play. To exercise the defensive safeguard
    // anyway, this contrives a round whose word contains a non-A-Z
    // "guessable" slot that no A-Z letter guess could ever match.
    const contrivedRound: Round = {
      id: "contrived",
      words: [
        {
          text: "?",
          letters: [{ char: "?", guessable: true, revealed: false }],
        },
      ],
      guessedLetters: [],
      clock: { elapsedSteps: 0, closingAtSteps: 999 },
      fallCount: 0,
      status: "in_progress",
      startedAt: 0,
      updatedAt: 0,
    };

    let round = contrivedRound;
    for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
      const result = guessLetter(round, letter);
      round = result.round;
      if (round.status !== "in_progress") break;
    }

    expect(round.status).toBe("won");
    expect(round.words[0].letters.every((l) => l.revealed)).toBe(true);
  });
});
