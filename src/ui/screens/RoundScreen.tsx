import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { guessLetter, startRound } from "../../engine/gameEngine";
import { createWordPool, selectWords } from "../../engine/wordPool";
import {
  filterByCategories,
  listCategories,
  type CategorySelection,
} from "../../engine/categories";
import { isWordFullyRevealed } from "../../engine/word";
import type { Round } from "../../engine/types";
import { saveRound, loadRound, clearRound } from "../../persistence/roundStore";
import { loadSelection, saveSelection } from "../../persistence/selectionStore";
import { eventLog } from "../../logging/eventLog";
import { WordBlanks } from "../components/WordBlanks";
import { AlphabetKeyboard } from "../components/AlphabetKeyboard";
import { RinkClockDisplay } from "../components/RinkClock";
import { Skater } from "../components/Skater";
import { CategoryPicker } from "../components/CategoryPicker";
import { EndScreen } from "./EndScreen";
import wordsJson from "../../data/words.json";

const CLOSING_STEPS = 7;
const WORDS_PER_ROUND = 3;
const ALL_ENTRIES = wordsJson as { text: string; category: string }[];
const ALL_CATEGORIES = listCategories(ALL_ENTRIES);

function createNewRound(selection: CategorySelection): { round: Round; categories: string[] } {
  const filtered = filterByCategories(ALL_ENTRIES, selection);
  const picked = selectWords(createWordPool(filtered.entries), WORDS_PER_ROUND);
  const round = startRound({
    wordTexts: picked.map((w) => w.text),
    closingAtSteps: CLOSING_STEPS,
  });
  return { round, categories: filtered.categories };
}

const strikesRemaining = (r: Round) => Math.max(0, r.clock.closingAtSteps - r.clock.elapsedSteps);

function logRoundStart(round: Round, categories: string[] | null, mode: string) {
  eventLog.log("round_start", {
    roundId: round.id,
    wordCount: round.words.length,
    wordLengths: round.words.map((w) => w.letters.length),
    categories,
    categoryMode: mode,
    strikesRemaining: strikesRemaining(round),
  });
}

function logRoundEnd(round: Round) {
  eventLog.log("round_end", {
    roundId: round.id,
    result: round.status,
    falls: round.fallCount,
    strikesRemaining: strikesRemaining(round),
    wordsSolved: round.words.filter(isWordFullyRevealed).length,
    wordCount: round.words.length,
    durationMs: Date.now() - round.startedAt,
  });
}

interface RoundScreenProps {
  onPlayAgain?: () => void;
}

export function RoundScreen({ onPlayAgain }: RoundScreenProps) {
  const [selection, setSelection] = useState<CategorySelection>(() => loadSelection());
  const [initial] = useState(() => {
    const saved = loadRound();
    if (saved) return { round: saved, categories: null as string[] | null, resumed: true };
    return { ...createNewRound(loadSelection()), resumed: false };
  });
  const [round, setRound] = useState<Round>(initial.round);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [fallSignal, setFallSignal] = useState(0);
  const loggedInitial = useRef(false);

  // Ref guard keeps StrictMode's double effect from logging twice.
  useEffect(() => {
    if (loggedInitial.current) return;
    loggedInitial.current = true;
    if (initial.resumed) {
      eventLog.log("round_resumed", {
        roundId: initial.round.id,
        falls: initial.round.fallCount,
        strikesRemaining: strikesRemaining(initial.round),
        guessedLetters: initial.round.guessedLetters.map((g) => g.letter),
      });
    } else {
      logRoundStart(initial.round, initial.categories, selection.mode);
    }
  }, [initial, selection.mode]);

  const guessedLettersForKeyboard = useMemo(() => round.guessedLetters, [round.guessedLetters]);

  const handleGuess = useCallback(
    (letter: string) => {
      if (round.status !== "in_progress") {
        eventLog.log("unexpected", { kind: "guess_on_finished_round", roundId: round.id, letter });
        return;
      }
      const result = guessLetter(round, letter);
      const next = result.round;
      setRound(next);
      saveRound(next);

      eventLog.log("guess", {
        roundId: round.id,
        letter,
        outcome: result.outcome,
        falls: next.fallCount,
        strikesRemaining: strikesRemaining(next),
      });

      if (result.outcome === "invalid") {
        eventLog.log("unexpected", { kind: "invalid_guess_input", roundId: round.id, letter });
      }

      round.words.forEach((before, i) => {
        if (!isWordFullyRevealed(before) && isWordFullyRevealed(next.words[i])) {
          eventLog.log("word_completed", {
            roundId: round.id,
            wordIndex: i,
            word: next.words[i].text,
            wordsRemaining: next.words.filter((w) => !isWordFullyRevealed(w)).length,
          });
        }
      });

      if (result.outcome === "repeat") {
        setFeedback("already tried that one!");
      } else if (result.outcome === "invalid") {
        setFeedback("letters A to Z only, please!");
      } else {
        setFeedback(null);
        if (result.outcome === "wrong") setFallSignal((n) => n + 1);
      }

      if (next.status !== "in_progress") {
        logRoundEnd(next);
        clearRound();
      }
    },
    [round],
  );

  const handleSelection = useCallback((next: CategorySelection) => {
    setSelection(next);
    saveSelection(next);
    eventLog.log("categories_changed", { mode: next.mode, categories: next.categories });
  }, []);

  const handlePlayAgain = useCallback(() => {
    clearRound();
    const fresh = createNewRound(selection);
    setRound(fresh.round);
    setFeedback(null);
    setFallSignal(0);
    logRoundStart(fresh.round, fresh.categories, selection.mode);
    onPlayAgain?.();
  }, [onPlayAgain, selection]);

  const picker = (
    <CategoryPicker
      categories={ALL_CATEGORIES}
      selection={selection}
      onChange={handleSelection}
      defaultOpen={round.status !== "in_progress"}
    />
  );

  if (round.status !== "in_progress") {
    return (
      <div className="round-screen">
        <EndScreen round={round} onPlayAgain={handlePlayAgain} />
        {picker}
      </div>
    );
  }

  return (
    <div className="round-screen">
      <Skater fallSignal={fallSignal} />
      <RinkClockDisplay clock={round.clock} />
      <WordBlanks words={round.words} />
      <AlphabetKeyboard
        guessedLetters={guessedLettersForKeyboard}
        onGuess={handleGuess}
        feedback={feedback}
      />
      {picker}
    </div>
  );
}
