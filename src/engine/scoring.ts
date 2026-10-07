import type { PlayerProfile, Round } from "./types";

const FOUR_WORD_COUNT = 4;
const SPEED_BONUS_MS = 30_000;
const POINTS_PER_WORD = 100;
const FEW_FALLS_BONUS = 50;
const SPEED_BONUS = 25;

export function createEmptyProfile(): PlayerProfile {
  return {
    stats: {
      roundsWon: 0,
      roundsPlayed: 0,
      bestStreak: 0,
      currentStreak: 0,
      totalFalls: 0,
      letterCounts: {},
    },
    skillTier: "wobbly-beginner",
    unlockedCosmetics: [],
    achievements: [],
    dailyStreak: 0,
    lastDailyPlayedDate: null,
  };
}

export function scoreRound(round: Round): {
  points: number;
  bonuses: { fewFalls: boolean; wordsSolved: number; speed: boolean };
} {
  const wordsSolved = round.words.filter((w) => w.letters.every((l) => l.revealed)).length;
  const fewFalls = round.fallCount === 0;
  const elapsed = round.updatedAt - round.startedAt;
  const speed = round.status === "won" && elapsed <= SPEED_BONUS_MS;

  if (round.assisted) {
    return { points: 0, bonuses: { fewFalls: false, wordsSolved, speed: false } };
  }

  let points = wordsSolved * POINTS_PER_WORD;
  if (fewFalls) points += FEW_FALLS_BONUS;
  if (speed) points += SPEED_BONUS;

  return { points, bonuses: { fewFalls, wordsSolved, speed } };
}

export function updateAchievements(profile: PlayerProfile, round: Round): PlayerProfile {
  if (round.assisted) return profile;

  const won = round.status === "won";
  const stats = { ...profile.stats };

  stats.roundsPlayed += 1;
  if (won) stats.roundsWon += 1;
  stats.currentStreak = won ? stats.currentStreak + 1 : 0;
  stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
  stats.totalFalls += round.fallCount;

  const letterCounts = { ...stats.letterCounts };
  for (const guess of round.guessedLetters) {
    letterCounts[guess.letter] = (letterCounts[guess.letter] ?? 0) + 1;
  }
  stats.letterCounts = letterCounts;

  const achievements = new Set(profile.achievements);
  if (won && round.fallCount === 0) achievements.add("flawless_lap");
  if (won && round.words.length === FOUR_WORD_COUNT) achievements.add("four_word_finish");

  return {
    ...profile,
    stats,
    achievements: Array.from(achievements),
  };
}
