import type { ReminderPreference } from "../engine/types";

const ROLLING_WINDOW_MS = 24 * 60 * 60 * 1000;

function localDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isWithinQuietHours(pref: ReminderPreference, date: Date): boolean {
  const hour = date.getHours();
  const { quietHoursStart: start, quietHoursEnd: end } = pref;
  if (start === end) return false;
  // Quiet window wraps midnight (e.g. 22 -> 8).
  return start > end ? hour >= start || hour < end : hour >= start && hour < end;
}

function sentWithinRollingWindow(pref: ReminderPreference, now: Date): number {
  const windowStart = now.getTime() - ROLLING_WINDOW_MS;
  return pref.sentTimestamps.filter((t) => t > windowStart).length;
}

/** Never sends without opt-in, during quiet hours, over the frequency cap,
 * or once the player has already played that day (all local-time-zone aware). */
export function shouldSendReminder(pref: ReminderPreference, now: Date): boolean {
  if (!pref.optedIn) return false;
  if (isWithinQuietHours(pref, now)) return false;
  if (pref.lastPlayedDate === localDateString(now)) return false;
  if (sentWithinRollingWindow(pref, now) >= pref.frequencyCap) return false;
  return true;
}
