import type { LetterSlot, Word } from "./types";

/** A slot is guessable only if it is a single A-Z letter. */
function isGuessableChar(char: string): boolean {
  return /^[A-Z]$/.test(char);
}

export function buildWord(text: string, category?: string): Word {
  const letters: LetterSlot[] = text
    .toUpperCase()
    .split("")
    .map((char) => {
      const guessable = isGuessableChar(char);
      return { char, guessable, revealed: !guessable };
    });
  return { text: text.toUpperCase(), category, letters };
}

export function isWordFullyRevealed(word: Word): boolean {
  return word.letters.every((slot) => slot.revealed);
}

export function revealLetter(word: Word, letter: string): Word {
  const letters = word.letters.map((slot) =>
    slot.guessable && slot.char === letter ? { ...slot, revealed: true } : slot,
  );
  return { ...word, letters };
}

export function wordContainsGuessableLetter(word: Word, letter: string): boolean {
  return word.letters.some((slot) => slot.guessable && slot.char === letter);
}
