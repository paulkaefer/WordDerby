import { describe, it, expect } from "vitest";
import { startRound, guessLetter } from "../../src/engine/gameEngine";
import { saveRound, loadRound, clearRound } from "../../src/persistence/roundStore";

describe("roundStore", () => {
  it("saves and loads a round with identical state", () => {
    const round = startRound({ wordTexts: ["CAT"], closingAtSteps: 6 });
    const guessed = guessLetter(round, "C").round;
    saveRound(guessed);
    const loaded = loadRound();
    expect(loaded).toEqual(guessed);
  });

  it("returns null when there is no saved round", () => {
    clearRound();
    expect(loadRound()).toBeNull();
  });

  it("clearRound removes the persisted round", () => {
    const round = startRound({ wordTexts: ["CAT"], closingAtSteps: 6 });
    saveRound(round);
    clearRound();
    expect(loadRound()).toBeNull();
  });
});
