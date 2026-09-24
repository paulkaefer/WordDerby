import { describe, it, expect } from "vitest";
import { shouldSendReminder } from "../../src/notifications/reminderScheduler";
import type { ReminderPreference } from "../../src/engine/types";

function basePref(overrides: Partial<ReminderPreference> = {}): ReminderPreference {
  return {
    optedIn: true,
    quietHoursStart: 22,
    quietHoursEnd: 8,
    frequencyCap: 3,
    sentTimestamps: [],
    lastSentAt: null,
    lastPlayedDate: null,
    ...overrides,
  };
}

describe("reminderScheduler.shouldSendReminder", () => {
  it("never sends when the player has not opted in", () => {
    const pref = basePref({ optedIn: false });
    const now = new Date("2026-09-23T15:00:00");
    expect(shouldSendReminder(pref, now)).toBe(false);
  });

  it("suppresses reminders during quiet hours", () => {
    const pref = basePref();
    const now = new Date("2026-09-23T23:00:00");
    expect(shouldSendReminder(pref, now)).toBe(false);
  });

  it("suppresses once the frequency cap of 3 is reached in the rolling window", () => {
    const now = new Date("2026-09-23T15:00:00");
    const dayMs = 24 * 60 * 60 * 1000;
    const pref = basePref({
      sentTimestamps: [now.getTime() - 1000, now.getTime() - 2000, now.getTime() - 3000],
    });
    expect(shouldSendReminder(pref, now)).toBe(false);
    // Outside the rolling window, the cap resets.
    const later = new Date(now.getTime() + dayMs + 1000);
    expect(shouldSendReminder(pref, later)).toBe(true);
  });

  it("suppresses once the player has already played that day", () => {
    const now = new Date("2026-09-23T15:00:00");
    const pref = basePref({ lastPlayedDate: "2026-09-23" });
    expect(shouldSendReminder(pref, now)).toBe(false);
  });

  it("allows sending when opted-in, outside quiet hours, under the cap, and not yet played today", () => {
    const now = new Date("2026-09-23T15:00:00");
    const pref = basePref({ lastPlayedDate: "2026-09-22" });
    expect(shouldSendReminder(pref, now)).toBe(true);
  });
});
