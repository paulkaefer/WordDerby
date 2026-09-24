import { describe, it, expect } from "vitest";
import { startRound, guessLetter } from "../../src/engine/gameEngine";
import { scoreRound, updateAchievements } from "../../src/engine/scoring";
import { createEmptyProfile } from "../../src/engine/scoring";
import type { RoundConfig } from "../../src/engine/types";

describe("scoring", () => {
  it("awards a fewFalls bonus for a flawless win", () => {
    const config: RoundConfig = { wordTexts: ["CAT"], closingAtSteps: 6 };
    let round = startRound(config);
    for (const letter of "CAT") round = guessLetter(round, letter).round;
    const score = scoreRound(round);
    expect(score.bonuses.fewFalls).toBe(true);
    expect(score.points).toBeGreaterThan(0);
  });

  it("grants the Flawless Lap achievement on a no-fall win", () => {
    const config: RoundConfig = { wordTexts: ["CAT"], closingAtSteps: 6 };
    let round = startRound(config);
    for (const letter of "CAT") round = guessLetter(round, letter).round;
    const profile = updateAchievements(createEmptyProfile(), round);
    expect(profile.achievements).toContain("flawless_lap");
  });

  it("grants the Four-Word Finish achievement on a 4-word win", () => {
    const config: RoundConfig = {
      wordTexts: ["CAT", "DOG", "PIG", "COW"],
      closingAtSteps: 20,
    };
    let round = startRound(config);
    for (const letter of "CATDOGPIW") {
      round = guessLetter(round, letter).round;
      if (round.status !== "in_progress") break;
    }
    const profile = updateAchievements(createEmptyProfile(), round);
    expect(profile.achievements).toContain("four_word_finish");
  });

  it("does not erase prior streak/score progress on a loss", () => {
    const winConfig: RoundConfig = { wordTexts: ["CAT"], closingAtSteps: 6 };
    let win = startRound(winConfig);
    for (const letter of "CAT") win = guessLetter(win, letter).round;
    const profile = updateAchievements(createEmptyProfile(), win);
    profile.stats.currentStreak = 3;
    profile.stats.bestStreak = 3;

    const lossConfig: RoundConfig = { wordTexts: ["DOG"], closingAtSteps: 1 };
    let loss = startRound(lossConfig);
    loss = guessLetter(loss, "X").round;
    const afterLoss = updateAchievements(profile, loss);

    expect(afterLoss.stats.bestStreak).toBe(3);
  });
});
