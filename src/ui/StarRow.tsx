import type { StarCount } from "../domain";
import "./motion.css";

export interface StarRowProps {
  readonly stars: StarCount;
  /** Shown when no star was earned at all. */
  readonly fallback?: string;
}

/**
 * The stars a child earned.
 *
 * Each star pops in one after the other instead of appearing all at once —
 * the stagger is what makes the result feel like a reward rather than a
 * status readout. The stars are decorative, so the count is exposed to
 * assistive technology as a single label instead.
 */
export function StarRow({ stars, fallback = "💪" }: StarRowProps) {
  if (stars === 0) {
    return (
      <p className="play__stars" aria-label="0">
        {fallback}
      </p>
    );
  }

  return (
    <p className="play__stars" aria-label={`${stars}`}>
      {Array.from({ length: stars }, (_, index) => (
        <span
          // The index is the identity here: each star is the same glyph, so
          // there is nothing else to key it by.
          key={index}
          className={`play__star motion-pop${
            index === 0
              ? ""
              : index === 1
                ? " motion-pop--stagger-1"
                : index === 2
                  ? " motion-pop--stagger-2"
                  : " motion-pop--stagger-3"
          }`}
          aria-hidden="true"
        >
          ⭐
        </span>
      ))}
    </p>
  );
}
