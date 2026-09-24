import { describe, it, expect, beforeEach } from "vitest";
import {
  loadProfile,
  saveProfile,
} from "../../src/persistence/profileStore";
import { createEmptyProfile } from "../../src/engine/scoring";

describe("profileStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns a fresh empty profile when nothing is persisted", () => {
    const profile = loadProfile();
    expect(profile.stats.roundsPlayed).toBe(0);
    expect(profile.achievements).toEqual([]);
  });

  it("persists and reloads stats, streaks, cosmetics, and achievements", () => {
    const profile = createEmptyProfile();
    profile.stats.roundsPlayed = 5;
    profile.unlockedCosmetics.push("classic-skates");
    profile.achievements.push("flawless_lap");
    profile.dailyStreak = 2;
    saveProfile(profile);

    const reloaded = loadProfile();
    expect(reloaded).toEqual(profile);
  });
});
