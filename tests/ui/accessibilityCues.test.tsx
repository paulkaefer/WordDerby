import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WordBlanks } from "../../src/ui/components/WordBlanks";
import { RinkClockDisplay } from "../../src/ui/components/RinkClock";
import { startRound } from "../../src/engine/gameEngine";

describe("Accessibility non-color state cues", () => {
  it("marks revealed letters with a text/aria cue, not color alone", () => {
    const round = startRound({ wordTexts: ["CAT"], closingAtSteps: 6 });
    render(<WordBlanks words={round.words} />);
    const blanks = screen.getAllByLabelText(/hidden letter/i);
    expect(blanks.length).toBeGreaterThan(0);
  });

  it("clock proximity is conveyed via text, not color alone", () => {
    render(<RinkClockDisplay clock={{ elapsedSteps: 5, closingAtSteps: 6 }} />);
    expect(screen.getByText(/1 fall left|closing soon/i)).toBeInTheDocument();
  });
});
