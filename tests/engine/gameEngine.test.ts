import { describe, it, expect } from "vitest";
import { startRound, guessLetter } from "../../src/engine/gameEngine";
import type { RoundConfig } from "../../src/engine/types";

const config: RoundConfig = { wordTexts: ["CAT"], closingAtSteps: 6 };

describe("gameEngine core outcomes", () => {
  it("startRound creates an in-progress round with no letters revealed", () => {
    const round = startRound(config);
    expect(round.status).toBe("in_progress");
    expect(round.fallCount).toBe(0);
    expect(round.guessedLetters).toHaveLength(0);
    expect(round.words[0].letters.every((l) => !l.revealed)).toBe(true);
  });

  it("returns outcome 'invalid' for non A-Z single-letter input", () => {
    const round = startRound(config);
    for (const bad of ["1", "$", "", "ab", "é", "🙂"]) {
      const result = guessLetter(round, bad);
      expect(result.outcome).toBe("invalid");
      expect(result.round.guessedLetters).toHaveLength(0);
    }
  });

  it("returns outcome 'correct' and reveals matching letters", () => {
    const round = startRound(config);
    const result = guessLetter(round, "C");
    expect(result.outcome).toBe("correct");
    expect(result.round.words[0].letters[0].revealed).toBe(true);
    expect(result.round.clock.elapsedSteps).toBe(0);
  });

  it("returns outcome 'wrong' and advances the clock on a non-matching letter", () => {
    const round = startRound(config);
    const result = guessLetter(round, "Z");
    expect(result.outcome).toBe("wrong");
    expect(result.round.fallCount).toBe(1);
    expect(result.round.clock.elapsedSteps).toBe(1);
  });

  it("returns outcome 'repeat' for an already-guessed letter and does not penalize", () => {
    const round = startRound(config);
    const first = guessLetter(round, "Z");
    const second = guessLetter(first.round, "Z");
    expect(second.outcome).toBe("repeat");
    expect(second.round.fallCount).toBe(1);
    expect(second.round.clock.elapsedSteps).toBe(1);
  });

  it("rejects further guesses once the round is terminal", () => {
    let round = startRound(config);
    for (const letter of "CAT") {
      round = guessLetter(round, letter).round;
    }
    expect(round.status).toBe("won");
    const result = guessLetter(round, "X");
    expect(result.round.status).toBe("won");
  });
});
