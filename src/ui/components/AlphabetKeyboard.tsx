import { useEffect } from "react";
import type { GuessedLetter } from "../../engine/types";

interface AlphabetKeyboardProps {
  guessedLetters: GuessedLetter[];
  onGuess: (letter: string) => void;
  feedback: string | null;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** On-screen buttons and physical keyboard both drive the same guess path
 * (FR-030), keeping input handling consistent between the two. */
export function AlphabetKeyboard({ guessedLetters, onGuess, feedback }: AlphabetKeyboardProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const letter = event.key.toUpperCase();
      if (/^[A-Z]$/.test(letter)) onGuess(letter);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onGuess]);

  const guessedMap = new Map(guessedLetters.map((g) => [g.letter, g.result]));

  return (
    <div className="alphabet-keyboard">
      <div role="group" aria-label="Letter guesses">
        {LETTERS.map((letter) => {
          const result = guessedMap.get(letter as GuessedLetter["letter"]);
          return (
            <button
              key={letter}
              type="button"
              disabled={Boolean(result)}
              aria-pressed={Boolean(result)}
              data-result={result}
              className={
                result
                  ? `alphabet-keyboard__key alphabet-keyboard__key--${result}`
                  : "alphabet-keyboard__key"
              }
              onClick={() => onGuess(letter)}
            >
              {letter}
            </button>
          );
        })}
      </div>
      {feedback && (
        <p role="status" className="alphabet-keyboard__feedback">
          {feedback}
        </p>
      )}
    </div>
  );
}
