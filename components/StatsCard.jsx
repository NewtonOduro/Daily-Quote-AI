/**
 * StatsCard.jsx
 * ------------------------------------------------------------------
 * Displays a single statistic with an icon, label and value. Supports a
 * progress sub-bar and sparkline for chart-style stats.
 */
import { memo } from "react";
import { motion } from "framer-motion";
import { scalePop } from "../styles/motionVariants";
import ProgressBar from "./ProgressBar";
import styles from "./StatsCard.module.css";

/**
 * StatsCard component.
 * @param {object} props
 * @param {string} props.label - statistic label
 * @param {string|number} props.value - main value
 * @param {string} [props.icon] - emoji/icon glyph
 * @param {number} [props.progress] - 0..100 optional progress
 * @param {string} [props.hint] - optional sub-text
 */
const StatsCard = memo(function StatsCard({
  label,
  value,
  icon = "📊",
  progress,
  hint
}) {
  return (
    <motion.div
      className={styles.card}
      variants={scalePop}
      whileHover={{ y: -3 }}
      style={{ willChange: "transform" }}
    >
      <div className={styles.top}>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        <span className={styles.label}>{label}</span>
      </div>
      <span className={styles.value}>{value}</span>
      {typeof progress === "number" && (
        <ProgressBar value={progress} label={`${label} progress`} size="sm" />
      )}
      {hint && <span className={styles.hint}>{hint}</span>}
    </motion.div>
  );
});

export default StatsCard;
