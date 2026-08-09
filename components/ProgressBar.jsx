/**
 * ProgressBar.jsx
 * ------------------------------------------------------------------
 * Animated progress bar with Framer Motion width animation. Used for
 * streak progress toward next milestone and achievement thresholds.
 */
import { memo } from "react";
import { motion } from "framer-motion";
import { EASINGS, DURATIONS } from "../styles/motion";
import styles from "./ProgressBar.module.css";

/**
 * ProgressBar component.
 * @param {object} props
 * @param {number} props.value - 0..100
 * @param {string} [props.label] - optional ARIA label
 * @param {string} [props.color] - optional css color override
 * @param {string} [props.size] - sm | md | lg
 */
const ProgressBar = memo(function ProgressBar({
  value,
  label,
  color,
  size = "md"
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={styles.track}
      style={{ height: size === "sm" ? 6 : size === "lg" ? 14 : 10 }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || "Progress"}
    >
      <motion.div
        className={styles.fill}
        style={{ background: color || "var(--color-accent)", willChange: "transform" }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: DURATIONS.SLOW, ease: EASINGS.EASE_IN_OUT }}
      />
    </div>
  );
});

export default ProgressBar;
