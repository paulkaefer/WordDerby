import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { startRound, guessLetter, solveRound } from "../../src/engine/gameEngine";
import { scoreRound, createEmptyProfile, updateAchievements } from "../../src/engine/scoring";
import { EndScreen } from "../../src/ui/screens/EndScreen";

describe("solveRound", () => {
  it("reveals everything and wins, flagged as assisted", () => {
    const solved = solveRound(startRound({ wordTexts: ["CAT", "DOG"], closingAtSteps: 6 }));
    expect(solved.status).toBe("won");
    expect(solved.assisted).toBe(true);
    expect(solved.words.every((w) => w.letters.every((l) => l.revealed))).toBe(true);
  });

  it("does nothing to a finished round", () => {
    let round = startRound({ wordTexts: ["CAT"], closingAtSteps: 2 });
    round = guessLetter(round, "X").round;
    round = guessLetter(round, "Y").round;
    expect(solveRound(round)).toBe(round);
  });

  it("earns no points, stats, or achievements", () => {
    const solved = solveRound(startRound({ wordTexts: ["CAT"], closingAtSteps: 6 }));
    expect(scoreRound(solved).points).toBe(0);
    const profile = createEmptyProfile();
    expect(updateAchievements(profile, solved)).toBe(profile);
  });
});

describe("EndScreen", () => {
  it("keeps the words visible after a win", () => {
    let round = startRound({ wordTexts: ["CAT"], closingAtSteps: 6 });
    for (const l of "CAT") round = guessLetter(round, l).round;
    render(<EndScreen round={round} onPlayAgain={() => {}} />);
    expect(screen.getByLabelText("revealed letter C")).toBeInTheDocument();
  });

  it("shows the answer after a loss, marking letters the player missed", () => {
    let round = startRound({ wordTexts: ["CAT"], closingAtSteps: 2 });
    round = guessLetter(round, "X").round;
    round = guessLetter(round, "Y").round;
    render(<EndScreen round={round} onPlayAgain={() => {}} />);
    expect(screen.getByLabelText("missed letter C")).toBeInTheDocument();
  });
});
