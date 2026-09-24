import { describe, it, expect } from "vitest";
import { advance, isClosingTime } from "../../src/engine/rinkClock";
import type { RinkClock } from "../../src/engine/types";

describe("rinkClock", () => {
  it("advance increments elapsedSteps by exactly 1", () => {
    const clock: RinkClock = { elapsedSteps: 0, closingAtSteps: 5 };
    const next = advance(clock);
    expect(next.elapsedSteps).toBe(1);
    expect(next.closingAtSteps).toBe(5);
  });

  it("isClosingTime is false before closingAtSteps and true at/after it", () => {
    expect(isClosingTime({ elapsedSteps: 4, closingAtSteps: 5 })).toBe(false);
    expect(isClosingTime({ elapsedSteps: 5, closingAtSteps: 5 })).toBe(true);
    expect(isClosingTime({ elapsedSteps: 6, closingAtSteps: 5 })).toBe(true);
  });
});
