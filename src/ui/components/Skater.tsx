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
 * back up - never a harm/execution figure (constitution Principle I/II). */
export function Skater({ fallSignal }: SkaterProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [falling, setFalling] = useState(false);

  useEffect(() => {
    if (fallSignal === 0) return;
    if (reducedMotion) return; // static fallback: no wobble animation
    setFalling(true);
    const timeout = setTimeout(() => setFalling(false), 1000);
    return () => clearTimeout(timeout);
  }, [fallSignal, reducedMotion]);


  return (
    <div
      className={falling ? "skater skater--falling" : "skater"}
      role="img"
      aria-label={falling ? "Skater wobbles and gets back up" : "Skater steady on skates"}
    >
      <svg width="140" height="170" viewBox="0 0 140 170" aria-hidden="true">
        <ellipse className="skater__shadow" cx="70" cy="162" rx="46" ry="5" fill="#1b1b1e" opacity="0.15" />
        <g className="skater__body">
          {/* legs */}
          <g className="skater__leg-l">
            <rect x="52" y="104" width="13" height="38" rx="6" fill="#2ec4b6" />
            <rect x="46" y="136" width="26" height="12" rx="6" fill="#ff8b64" stroke="#1b1b1e" strokeWidth="2.5" />
            <circle cx="52" cy="154" r="6" fill="#ffd166" stroke="#1b1b1e" strokeWidth="2.5" />
            <circle cx="68" cy="154" r="6" fill="#ffd166" stroke="#1b1b1e" strokeWidth="2.5" />
          </g>
          <g className="skater__leg-r">
            <rect x="75" y="104" width="13" height="38" rx="6" fill="#2ec4b6" />
            <rect x="69" y="136" width="26" height="12" rx="6" fill="#ff8b64" stroke="#1b1b1e" strokeWidth="2.5" />
            <circle cx="75" cy="154" r="6" fill="#ffd166" stroke="#1b1b1e" strokeWidth="2.5" />
            <circle cx="91" cy="154" r="6" fill="#ffd166" stroke="#1b1b1e" strokeWidth="2.5" />
          </g>
          {/* arms */}
          <g className="skater__arm-l">
            <rect x="26" y="78" width="12" height="34" rx="6" fill="#6246ea" transform="rotate(25 32 80)" />
            <circle cx="22" cy="110" r="8" fill="#ffd9b3" stroke="#1b1b1e" strokeWidth="2.5" />
          </g>
          <g className="skater__arm-r">
            <rect x="102" y="78" width="12" height="34" rx="6" fill="#6246ea" transform="rotate(-25 108 80)" />
            <circle cx="118" cy="110" r="8" fill="#ffd9b3" stroke="#1b1b1e" strokeWidth="2.5" />
          </g>
          {/* torso */}
          <rect x="42" y="72" width="56" height="44" rx="18" fill="#6246ea" stroke="#1b1b1e" strokeWidth="2.5" />
          <rect x="42" y="86" width="56" height="8" fill="#fef6e4" opacity="0.85" />
          <rect x="42" y="102" width="56" height="8" fill="#fef6e4" opacity="0.85" />
          {/* head */}
          <g className="skater__head">
            <circle cx="70" cy="44" r="30" fill="#ffd9b3" stroke="#1b1b1e" strokeWidth="2.5" />
            {/* helmet */}
            <path d="M39 40 A31 31 0 0 1 101 40 L101 36 Q70 26 39 36 Z" fill="#ff8b64" stroke="#1b1b1e" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="70" cy="11" r="6" fill="#ffd166" stroke="#1b1b1e" strokeWidth="2.5" />
            {/* cheeks */}
            <circle cx="51" cy="54" r="5" fill="#ff8b64" opacity="0.5" />
            <circle cx="89" cy="54" r="5" fill="#ff8b64" opacity="0.5" />
            {falling ? (
              <g className="skater__face-oops">
                <circle cx="59" cy="46" r="6" fill="#fff" stroke="#1b1b1e" strokeWidth="2" />
                <circle cx="81" cy="46" r="6" fill="#fff" stroke="#1b1b1e" strokeWidth="2" />
                <circle cx="59" cy="47" r="2.5" fill="#1b1b1e" />
                <circle cx="81" cy="47" r="2.5" fill="#1b1b1e" />
                <ellipse cx="70" cy="60" rx="5" ry="6" fill="#1b1b1e" />
              </g>
            ) : (
              <g className="skater__face-happy">
                <ellipse className="skater__eye" cx="59" cy="46" rx="4" ry="5.5" fill="#1b1b1e" />
                <ellipse className="skater__eye" cx="81" cy="46" rx="4" ry="5.5" fill="#1b1b1e" />
                <circle cx="60.5" cy="44" r="1.5" fill="#fff" />
                <circle cx="82.5" cy="44" r="1.5" fill="#fff" />
                <path d="M58 57 Q70 70 82 57 Z" fill="#fff" stroke="#1b1b1e" strokeWidth="2.5" strokeLinejoin="round" />
              </g>
            )}
          </g>
          {falling && (
            <g className="skater__stars" fill="#ffd166" stroke="#1b1b1e" strokeWidth="1.5">
              <path d="M22 18 l3 7 7 1 -5 5 1 7 -6 -4 -6 4 1 -7 -5 -5 7 -1z" />
              <path d="M112 8 l2.5 6 6 .8 -4.5 4.2 1 6 -5 -3.5 -5 3.5 1 -6 -4.5 -4.2 6 -.8z" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
