import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlphabetKeyboard } from "../../src/ui/components/AlphabetKeyboard";

describe("AlphabetKeyboard", () => {
  it("invokes onGuess when clicking an on-screen letter button", async () => {
    const user = userEvent.setup();
    let guessed = "";
    render(
      <AlphabetKeyboard
        guessedLetters={[]}
        onGuess={(letter) => (guessed = letter)}
        feedback={null}
      />,
    );
    await user.click(screen.getByRole("button", { name: "C" }));
    expect(guessed).toBe("C");
  });

  it("invokes onGuess when pressing a physical keyboard letter key", async () => {
    const user = userEvent.setup();
    let guessed = "";
    render(
      <AlphabetKeyboard
        guessedLetters={[]}
        onGuess={(letter) => (guessed = letter)}
        feedback={null}
      />,
    );
    await user.keyboard("c");
    expect(guessed).toBe("C");
  });

  it("disables already-guessed letters and shows friendly feedback on repeat", () => {
    render(
      <AlphabetKeyboard
        guessedLetters={[{ letter: "C", result: "correct", guessedAt: 0 }]}
        onGuess={() => {}}
        feedback="already tried that one!"
      />,
    );
    expect(screen.getByRole("button", { name: "C" })).toBeDisabled();
    expect(screen.getByText(/already tried that one!/i)).toBeInTheDocument();
  });
});
