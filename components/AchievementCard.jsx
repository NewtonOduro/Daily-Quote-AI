/**
 * AchievementCard.jsx
 * ------------------------------------------------------------------
 * Displays an achievement (badge) with icon, title, description and
 * locked/unlocked state. Uses a bouncy spring when unlocked.
 */
import { memo } from "react";
import { motion } from "framer-motion";
import { SPRINGS } from "../styles/motion";
import styles from "./AchievementCard.module.css";

/**
 * AchievementCard component.
 * @param {object} props
 * @param {string} props.title - achievement title
 * @param {string} [props.description]
 * @param {string} [props.icon]
 * @param {boolean} props.unlocked
 * @param {number} [props.progress] - 0..100 toward unlock
 */
const AchievementCard = memo(function AchievementCard({
  title,
  description,
  icon = "🏅",
  unlocked = false,
  progress = 100
}) {
  return (
    <motion.div
      className={`${styles.card} ${unlocked ? styles.unlocked : styles.locked}`}
      whileHover={{ y: -3 }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={SPRINGS.SMOOTH}
      style={{ willChange: "transform" }}
    >
      <motion.div
        className={styles.medal}
        animate={unlocked ? { scale: [1, 1.15, 1] } : {}}
        transition={{ ...SPRINGS.BOUNCY, repeat: unlocked ? Infinity : 0, repeatDelay: 2 }}
      >
        <span aria-hidden="true">{icon}</span>
        {!unlocked && <span className={styles.lock} aria-hidden="true">🔒</span>}
      </motion.div>
      <div className={styles.body}>
        <h4 className={styles.title}>{title}</h4>
        {description && <p className={styles.desc}>{description}</p>}
        <div className={styles.progressRow}>
          <div className={styles.track}>
            <div
              className={styles.fill}
              style={{ width: `${unlocked ? 100 : Math.min(100, progress)}%` }}
            />
          </div>
          <span className={styles.pct}>{unlocked ? 100 : Math.min(100, progress)}%</span>
        </div>
      </div>
    </motion.div>
  );
});

export default AchievementCard;
