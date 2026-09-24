import type { RinkClock } from "../../engine/types";

interface RinkClockDisplayProps {
  clock: RinkClock;
}

/** Clock proximity to closing is conveyed via text, not color alone (FR-029). */
export function RinkClockDisplay({ clock }: RinkClockDisplayProps) {
  const remaining = Math.max(0, clock.closingAtSteps - clock.elapsedSteps);
  const label =
    remaining === 0
      ? "The rink is closing soon!"
      : `${remaining} fall${remaining === 1 ? "" : "s"} left before closing`;

  return (
    <div className="rink-clock" role="status">
      <span className="rink-clock__label">{label}</span>
    </div>
  );
}
