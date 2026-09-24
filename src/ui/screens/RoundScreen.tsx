import { useCallback, useMemo, useState } from "react";
import { guessLetter, startRound } from "../../engine/gameEngine";
import { createWordPool, selectWords } from "../../engine/wordPool";
import type { Round } from "../../engine/types";
import { saveRound, loadRound, clearRound } from "../../persistence/roundStore";
import { WordBlanks } from "../components/WordBlanks";
import { AlphabetKeyboard } from "../components/AlphabetKeyboard";
import { RinkClockDisplay } from "../components/RinkClock";
import { Skater } from "../components/Skater";
import { EndScreen } from "./EndScreen";
import wordsJson from "../../data/words.json";

const CLOSING_STEPS = 7;
const WORDS_PER_ROUND = 3;

function createNewRound(): Round {
  const pool = createWordPool(wordsJson as { text: string; category: string }[]);
  const picked = selectWords(pool, WORDS_PER_ROUND);
  return startRound({
    wordTexts: picked.map((w) => w.text),
    closingAtSteps: CLOSING_STEPS,
  });
}

interface RoundScreenProps {
  onPlayAgain?: () => void;
}

export function RoundScreen({ onPlayAgain }: RoundScreenProps) {
  const [round, setRound] = useState<Round>(() => loadRound() ?? createNewRound());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [fallSignal, setFallSignal] = useState(0);

  const guessedLettersForKeyboard = useMemo(() => round.guessedLetters, [round.guessedLetters]);

  const handleGuess = useCallback(
    (letter: string) => {
      const result = guessLetter(round, letter);
      setRound(result.round);
      saveRound(result.round);

      if (result.outcome === "repeat") {
        setFeedback("already tried that one!");
      } else if (result.outcome === "invalid") {
        setFeedback("letters A to Z only, please!");
      } else {
        setFeedback(null);
        if (result.outcome === "wrong") setFallSignal((n) => n + 1);
      }

      if (result.round.status !== "in_progress") {
        clearRound();
      }
    },
    [round],
  );

  const handlePlayAgain = useCallback(() => {
    clearRound();
    setRound(createNewRound());
    setFeedback(null);
    setFallSignal(0);
    onPlayAgain?.();
  }, [onPlayAgain]);

  if (round.status !== "in_progress") {
    return <EndScreen round={round} onPlayAgain={handlePlayAgain} />;
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
    </div>
  );
}
