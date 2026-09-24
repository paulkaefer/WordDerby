import { useEffect, useState } from "react";

interface SkaterProps {
  /** Increment this whenever a new fall occurs to retrigger the animation. */
  fallSignal: number;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);
  return reduced;
}

/** A gender-neutral, cartoony skater that wobbles on a fall and always gets
 * back up — never a harm/execution figure (constitution Principle I/II). */
export function Skater({ fallSignal }: SkaterProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [falling, setFalling] = useState(false);

  useEffect(() => {
    if (fallSignal === 0) return;
    if (reducedMotion) return; // static fallback: no wobble animation
    setFalling(true);
    const timeout = setTimeout(() => setFalling(false), 500);
    return () => clearTimeout(timeout);
  }, [fallSignal, reducedMotion]);

  return (
    <div
      className={falling ? "skater skater--falling" : "skater"}
      role="img"
      aria-label={falling ? "Skater wobbles and gets back up" : "Skater steady on skates"}
    >
      <svg width="80" height="100" viewBox="0 0 80 100" aria-hidden="true">
        <circle cx="40" cy="20" r="14" fill="#6246EA" />
        <line x1="40" y1="34" x2="40" y2="70" stroke="#6246EA" strokeWidth="6" strokeLinecap="round" />
        <line x1="40" y1="45" x2="20" y2="60" stroke="#6246EA" strokeWidth="6" strokeLinecap="round" />
        <line x1="40" y1="45" x2="60" y2="60" stroke="#6246EA" strokeWidth="6" strokeLinecap="round" />
        <line x1="40" y1="70" x2="25" y2="90" stroke="#6246EA" strokeWidth="6" strokeLinecap="round" />
        <line x1="40" y1="70" x2="55" y2="90" stroke="#6246EA" strokeWidth="6" strokeLinecap="round" />
        <rect x="15" y="90" width="20" height="6" rx="3" fill="#FF8B64" />
        <rect x="45" y="90" width="20" height="6" rx="3" fill="#FF8B64" />
      </svg>
    </div>
  );
}
