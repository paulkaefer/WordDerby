import type { Round } from "../../engine/types";
import { WordBlanks } from "../components/WordBlanks";

interface EndScreenProps {
  round: Round;
  onPlayAgain: () => void;
}

/** Never framed as "game over" — a loss is just "the rink's closing for the
 * night" (constitution Principle I/IV). Answers stay visible for learning. */
export function EndScreen({ round, onPlayAgain }: EndScreenProps) {
  const won = round.status === "won";

  let heading = "See you tomorrow — the rink's closing!";
  let message = "No worries — the skates will be waiting for you next time.";
  if (round.assisted) {
    heading = "Solved with a little help!";
    message = "Assisted rounds don't count toward points or achievements.";
  } else if (won) {
    heading = "You solved it! 🎉";
    message = `Nice skating! ${round.fallCount} fall${round.fallCount === 1 ? "" : "s"} this round.`;
  }

  return (
    <div className="end-screen" role="status">
      <h2>{heading}</h2>
      <p>{message}</p>
      <WordBlanks words={round.words} revealAll />
      <button type="button" onClick={onPlayAgain}>
        Play again
      </button>
    </div>
  );
}
