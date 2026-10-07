import type { Round } from "../engine/types";
import { eventLog } from "../logging/eventLog";

const STORAGE_KEY = "wordderby.round";

export function saveRound(round: Round): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(round));
}

function isValidRound(r: unknown): r is Round {
  const round = r as Round | null;
  return (
    !!round &&
    typeof round === "object" &&
    round.status === "in_progress" &&
    Array.isArray(round.words) &&
    round.words.length > 0 &&
    round.words.every((w) => w && Array.isArray(w.letters)) &&
    Array.isArray(round.guessedLetters) &&
    !!round.clock &&
    typeof round.clock.elapsedSteps === "number" &&
    typeof round.clock.closingAtSteps === "number"
  );
}

export function loadRound(): Round | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isValidRound(parsed)) return parsed;
    eventLog.log("unexpected", { kind: "saved_round_invalid_shape" });
  } catch {
    eventLog.log("unexpected", { kind: "saved_round_corrupt" });
  }
  localStorage.removeItem(STORAGE_KEY);
  return null;
}

export function clearRound(): void {
  localStorage.removeItem(STORAGE_KEY);
}
