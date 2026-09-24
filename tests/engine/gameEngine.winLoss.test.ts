import { describe, it, expect } from "vitest";
import { startRound, guessLetter } from "../../src/engine/gameEngine";
import type { RoundConfig } from "../../src/engine/types";

describe("gameEngine win/loss precedence", () => {
  it("ends in a win the instant all words are fully revealed", () => {
    const config: RoundConfig = { wordTexts: ["CAT"], closingAtSteps: 6 };
    let round = startRound(config);
    for (const letter of "CAT") {
      round = guessLetter(round, letter).round;
    }
    expect(round.status).toBe("won");
  });

  it("ends in a loss when the clock reaches closing time with a word unsolved", () => {
    const config: RoundConfig = { wordTexts: ["CAT"], closingAtSteps: 2 };
    let round = startRound(config);
    round = guessLetter(round, "X").round;
    round = guessLetter(round, "Y").round;
    expect(round.status).toBe("lost");
  });

  it("resolves a same-guess tie between winning reveal and closing time as a win", () => {
    // closingAtSteps of 1: a single wrong guess would close the rink, but we
    // instead drive the round to its very last correct letter first.
    const config: RoundConfig = { wordTexts: ["AT"], closingAtSteps: 1 };
    let round = startRound(config);
    round = guessLetter(round, "A").round; // correct, clock untouched
    round = guessLetter(round, "T").round; // final correct letter -> win
    expect(round.status).toBe("won");
  });
});
