import type { Round } from "../engine/types";

const STORAGE_KEY = "wordderby.round";

export function saveRound(round: Round): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(round));
}

export function loadRound(): Round | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Round;
  } catch {
    return null;
  }
}

export function clearRound(): void {
  localStorage.removeItem(STORAGE_KEY);
}
