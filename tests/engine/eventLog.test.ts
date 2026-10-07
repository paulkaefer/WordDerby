import { describe, it, expect } from "vitest";
import { createEventLog, verifyLog, type LogEvent } from "../../src/logging/eventLog";

function memoryStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
  };
}

describe("eventLog", () => {
  it("stamps ISO 8601 timestamps and builds a valid chain", () => {
    const log = createEventLog(null, () => new Date("2026-10-07T12:00:00.000Z"));
    log.log("session_start");
    log.log("guess", { letter: "A", strikesRemaining: 5 });
    const events = log.getEvents();
    expect(events[0].timestamp).toBe("2026-10-07T12:00:00.000Z");
    expect(events.every((e) => /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(e.timestamp))).toBe(true);
    expect(verifyLog(events)).toBe(-1);
  });

  it("entries are frozen and tampering is detected", () => {
    const log = createEventLog(null);
    log.log("guess", { letter: "A" });
    const [e] = log.getEvents();
    expect(Object.isFrozen(e)).toBe(true);
    expect(Object.isFrozen(e.data)).toBe(true);
    expect(() => {
      (e as { type: string }).type = "x";
    }).toThrow();
    const forged = [{ ...e, data: { letter: "Z" } }] as LogEvent[];
    expect(verifyLog(forged)).toBe(0);
  });

  it("persists append-only and continues the chain across sessions", () => {
    const storage = memoryStorage();
    createEventLog(storage).log("session_start");
    const second = createEventLog(storage);
    second.log("session_start");
    const events = second.getEvents();
    expect(events.length).toBe(2);
    expect(verifyLog(events)).toBe(-1);
  });

  it("records an unexpected event when stored history is corrupted", () => {
    const storage = memoryStorage();
    createEventLog(storage).log("session_start");
    storage.setItem("wordderby.eventlog", storage.getItem("wordderby.eventlog")!.replace("session_start", "round_end"));
    const events = createEventLog(storage).getEvents();
    expect(events[events.length - 1].type).toBe("unexpected");
  });
});
