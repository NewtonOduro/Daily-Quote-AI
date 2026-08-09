/**
 * motionVariants.js
 * ------------------------------------------------------------------
 * Shared reusable Framer Motion variants built on top of the global
 * motion tokens (motion.js). All variants enforce GPU acceleration by
 * declaring `willChange: "transform"` in their styles where relevant.
 */
import { DURATIONS, EASINGS, SPRINGS, gpu } from "./motion";

/**
 * fadeIn — opacity 0 -> 1.
 */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATIONS.MEDIUM, ease: EASINGS.DEFAULT, ...gpu() } }
};

/**
 * slideUp — opacity + Y offset 20px -> 0px.
 */
export const slideUp = {
  hidden: { opacity: 0, y: 20, ...gpu() },
  visible: { opacity: 1, y: 0, transition: { duration: DURATIONS.MEDIUM, ease: EASINGS.EASE_IN_OUT } }
};

/**
 * scalePop — scale 0.92 -> 1.0 with spring physics.
 */
export const scalePop = {
  hidden: { opacity: 0, scale: 0.92, ...gpu() },
  visible: { opacity: 1, scale: 1, transition: SPRINGS.SMOOTH }
};

/**
 * staggerContainer — parent that staggers children by 0.05s.
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, duration: DURATIONS.FAST }
  }
};

/**
 * cardFlip — 3D card rotation along the Y-axis (rotateY 180deg).
 * Accepts a boolean to toggle between front/back faces.
 * @param {boolean} isFlipped
 * @returns {{front: {rotateY: number}, back: {rotateY: number}}}
 */
export const cardFlip = (isFlipped) => ({
  front: {
    rotateY: 0,
    ...gpu(),
    transition: { duration: DURATIONS.SLOW, ease: EASINGS.EASE_IN_OUT }
  },
  back: {
    rotateY: 180,
    ...gpu(),
    transition: { duration: DURATIONS.SLOW, ease: EASINGS.EASE_IN_OUT }
  }
});

/**
 * listItem — convenient single-list-item variant (slide + stagger ready).
 */
export const listItem = {
  hidden: { opacity: 0, x: -12, ...gpu() },
  visible: { opacity: 1, x: 0, transition: { duration: DURATIONS.FAST, ease: EASINGS.DEFAULT } },
  exit: { opacity: 0, x: 12, transition: { duration: DURATIONS.FAST, ease: EASINGS.DEFAULT } }
};

export default { fadeIn, slideUp, scalePop, staggerContainer, cardFlip, listItem };

