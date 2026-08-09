/**
 * motion.js
 * ------------------------------------------------------------------
 * Global Animation System & Motion Tokens.
 *
 * Centralizes every duration and easing used by Framer Motion to
 * eliminate inline magic numbers across the codebase. Enforces GPU
 * acceleration by applying `will-change: transform` via the `transform`
 * style guard we attach in components and variants.
 */

/**
 * Duration tokens (seconds).
 * @type {Readonly<{FAST: number, MEDIUM: number, SLOW: number}>}
 */
export const DURATIONS = Object.freeze({
  /** Hover, click feedback, small toggles. */
  FAST: 0.15,
  /** Card transitions, tab switches, dropdown expansions. */
  MEDIUM: 0.25,
  /** Page views, complex layout morphs, background sweeps. */
  SLOW: 0.4
});

/**
 * Named easing curves exposed for Framer Motion transition definitions.
 * @type {Readonly<{DEFAULT: number[], EASE_IN_OUT: number[]}>}
 */
export const EASINGS = Object.freeze({
  /** Cubic-bezier standard. */
  DEFAULT: [0.25, 0.1, 0.25, 1.0],
  /** Material style accelerate-decelerate. */
  EASE_IN_OUT: [0.4, 0.0, 0.2, 1]
});

/**
 * Spring physics presets for bouncy UI moments.
 * @type {Readonly<{BOUNCY: {type: string, stiffness: number, damping: number}, SMOOTH: {type: string, stiffness: number, damping: number}}>}
 */
export const SPRINGS = Object.freeze({
  /** Heart bursts, achievements. */
  BOUNCY: { type: "spring", stiffness: 400, damping: 15 },
  /** Page shifts, modal pops. */
  SMOOTH: { type: "spring", stiffness: 200, damping: 22 }
});

/**
 * Shortcut token references as plain objects so transforms can spread
 * them into a transition field preserving GPU optimization hints.
 */
export const TRANSITIONS = Object.freeze({
  fade: { duration: DURATIONS.MEDIUM, ease: EASINGS.DEFAULT },
  slide: { duration: DURATIONS.MEDIUM, ease: EASINGS.EASE_IN_OUT },
  pop: SPRINGS.SMOOTH,
  bouncy: SPRINGS.BOUNCY
});

/**
 * Ensures transforms are GPU-accelerated. Components apply this in
 * their motion style props.
 * @returns {{willChange: string}} frame style
 */
export const gpu = () => ({ willChange: "transform" });

