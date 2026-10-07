import type { GuessOutcome, GuessResult, Letter, Round, RoundConfig } from "./types";
import { buildWord, isWordFullyRevealed, revealLetter, wordContainsGuessableLetter } from "./word";
import { advance, isClosingTime } from "./rinkClock";

const ALPHABET_SIZE = 26;

function makeId(): string {
  return `round-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function startRound(config: RoundConfig): Round {
  const now = Date.now();
  return {
    id: makeId(),
    words: config.wordTexts.map((text) => buildWord(text)),
    guessedLetters: [],
    clock: { elapsedSteps: 0, closingAtSteps: config.closingAtSteps },
    fallCount: 0,
    status: "in_progress",
    startedAt: now,
    updatedAt: now,
  };
}

function normalizeGuess(input: string): Letter | null {
  const upper = input.toLocaleUpperCase();
  return /^[A-Z]$/.test(upper) ? (upper as Letter) : null;
}

function allWordsRevealed(round: Round): boolean {
  return round.words.every(isWordFullyRevealed);
}

/** Defensive safeguard (FR-016): never leave a round stuck once the full
 * alphabet has been exhausted, even though FR-015 makes this unreachable
 * with valid word data. */
function applySafeguardIfExhausted(round: Round): Round {
  if (round.status !== "in_progress") return round;
  if (round.guessedLetters.length < ALPHABET_SIZE) return round;
  if (allWordsRevealed(round)) return round;

  const words = round.words.map((word) => ({
    ...word,
    letters: word.letters.map((slot) => ({ ...slot, revealed: true })),
  }));
  return { ...round, words, status: "won", updatedAt: Date.now() };
}

export function guessLetter(round: Round, rawInput: string): GuessResult {
  if (round.status !== "in_progress") {
    return { round, outcome: "invalid" };
  }

  const letter = normalizeGuess(rawInput);
  if (!letter) {
    return { round, outcome: "invalid" };
  }

  if (round.guessedLetters.some((g) => g.letter === letter)) {
    return { round, outcome: "repeat" };
  }

  const matches = round.words.some((word) => wordContainsGuessableLetter(word, letter));
  const outcome: GuessOutcome = matches ? "correct" : "wrong";
  const now = Date.now();

  let words = round.words;
  let clock = round.clock;
  let fallCount = round.fallCount;

  if (matches) {
    words = round.words.map((word) => revealLetter(word, letter));
  } else {
    fallCount += 1;
    clock = advance(clock);
  }

  let next: Round = {
    ...round,
    words,
    clock,
    fallCount,
    guessedLetters: [...round.guessedLetters, { letter, result: outcome, guessedAt: now }],
    updatedAt: now,
  };

  // Win takes precedence over a same-guess clock closure (FR-009/FR-010).
  if (allWordsRevealed(next)) {
    next = { ...next, status: "won" };
  } else if (isClosingTime(next.clock)) {
    next = { ...next, status: "lost" };
  }

  next = applySafeguardIfExhausted(next);

  return { round: next, outcome };
}

/** Reveals everything and ends the round as a win flagged `assisted` (no score/stats). */
export function solveRound(round: Round): Round {
  if (round.status !== "in_progress") return round;
  const words = round.words.map((word) => ({
    ...word,
    letters: word.letters.map((slot) => ({ ...slot, revealed: true })),
  }));
  return { ...round, words, status: "won", assisted: true, updatedAt: Date.now() };
}
