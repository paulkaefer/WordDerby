import type { RinkClock } from "./types";

export function advance(clock: RinkClock): RinkClock {
  return { ...clock, elapsedSteps: clock.elapsedSteps + 1 };
}

export function isClosingTime(clock: RinkClock): boolean {
  return clock.elapsedSteps >= clock.closingAtSteps;
}
