import { describe, it, expect } from "vitest";
import { startRound, guessLetter } from "../../src/engine/gameEngine";
import type { RoundConfig } from "../../src/engine/types";

describe("gameEngine multi-word reveal", () => {
  const config: RoundConfig = {
    wordTexts: ["BACON", "TOAST", "MUFFIN"],
    closingAtSteps: 8,
  };

  it("reveals every occurrence of a guessed letter across all words at once", () => {
    const round = startRound(config);
    const result = guessLetter(round, "A");
    const [bacon, toast, muffin] = result.round.words;
    expect(bacon.letters[1].revealed).toBe(true); // B-A-C-O-N
    expect(toast.letters[2].revealed).toBe(true); // T-O-A-S-T
    expect(muffin.letters.some((l) => l.revealed)).toBe(false); // no 'A' in MUFFIN
  });

  it("counts as correct if the letter appears in at least one word, not all", () => {
    const round = startRound(config);
    const result = guessLetter(round, "A");
    expect(result.outcome).toBe("correct");
    expect(result.round.fallCount).toBe(0);
    expect(result.round.clock.elapsedSteps).toBe(0);
  });

  it("counts as a single fall when the letter appears in none of the words", () => {
    const round = startRound(config);
    const result = guessLetter(round, "Z");
    expect(result.outcome).toBe("wrong");
    expect(result.round.fallCount).toBe(1);
  });
});
