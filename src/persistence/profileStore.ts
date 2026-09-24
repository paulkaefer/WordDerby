import type { PlayerProfile } from "../engine/types";
import { createEmptyProfile } from "../engine/scoring";

const STORAGE_KEY = "wordderby.profile";

export function saveProfile(profile: PlayerProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function loadProfile(): PlayerProfile {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createEmptyProfile();
  try {
    return JSON.parse(raw) as PlayerProfile;
  } catch {
    return createEmptyProfile();
  }
}
