// Shared engine types per specs/001-wordderby/data-model.md

export type Letter =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M"
  | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";

export interface LetterSlot {
  char: string;
  guessable: boolean;
  revealed: boolean;
}

export interface Word {
  text: string;
  category?: string;
  letters: LetterSlot[];
}

export interface GuessedLetter {
  letter: Letter;
  result: "correct" | "wrong";
  guessedAt: number;
}

export interface RinkClock {
  elapsedSteps: number;
  closingAtSteps: number;
}

export type RoundStatus = "in_progress" | "won" | "lost";

export interface Round {
  id: string;
  words: Word[];
  guessedLetters: GuessedLetter[];
  clock: RinkClock;
  fallCount: number;
  status: RoundStatus;
  startedAt: number;
  updatedAt: number;
  /** True if the player used the instant-solve button; excluded from scoring. */
  assisted?: boolean;
}

export interface RoundConfig {
  wordTexts: string[];
  closingAtSteps: number;
}

export type GuessOutcome = "correct" | "wrong" | "repeat" | "invalid";

export interface GuessResult {
  round: Round;
  outcome: GuessOutcome;
}

export interface WordEntry {
  text: string;
  category: string;
}

export interface WordPool {
  entries: WordEntry[];
  usedByBucket: Record<string, string[]>;
  cycleThreshold: number;
}

export interface PlayerStats {
  roundsWon: number;
  roundsPlayed: number;
  bestStreak: number;
  currentStreak: number;
  totalFalls: number;
  letterCounts: Record<string, number>;
}

export interface PlayerProfile {
  stats: PlayerStats;
  skillTier: string;
  unlockedCosmetics: string[];
  achievements: string[];
  dailyStreak: number;
  lastDailyPlayedDate: string | null;
}

export interface ReminderPreference {
  optedIn: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
  frequencyCap: number;
  sentTimestamps: number[];
  lastSentAt: number | null;
  lastPlayedDate: string | null;
}
