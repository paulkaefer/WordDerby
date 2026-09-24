import type { Round } from "../../engine/types";

interface EndScreenProps {
  round: Round;
  onPlayAgain: () => void;
}

/** Never framed as "game over" — a loss is just "the rink's closing for the
 * night" (constitution Principle I/IV). */
export function EndScreen({ round, onPlayAgain }: EndScreenProps) {
  const won = round.status === "won";

  return (
    <div className="end-screen" role="status">
      <h2>{won ? "You solved it! 🎉" : "See you tomorrow — the rink's closing!"}</h2>
      <p>
        {won
          ? `Nice skating! ${round.fallCount} fall${round.fallCount === 1 ? "" : "s"} this round.`
          : "No worries — the skates will be waiting for you next time."}
      </p>
      <button type="button" onClick={onPlayAgain}>
        Play again
      </button>
    </div>
  );
}
