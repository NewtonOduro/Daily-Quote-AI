/**
 * Statistics.jsx
 * ------------------------------------------------------------------
 * Analytics dashboard: streak, favorites count, history count, top
 * category, and achievement badges. Uses StatsCard and AchievementCard.
 */
import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "../styles/motionVariants";
import StatsCard from "../components/StatsCard";
import AchievementCard from "../components/AchievementCard";
import styles from "./Statistics.module.css";
import { useQuoteApp } from "../context/QuoteContext";
import { STREAK_MILESTONES } from "../utils/constants";

/**
 * Statistics page.
 * @param {object} props
 * @param {Function} [props.onNavigate]
 */
const Statistics = memo(function Statistics({ onNavigate }) {
  const { favorites, history, streak, bestStreak } = useQuoteApp();

  /** Compute top favorite category (memoized). */
  const topCategory = useMemo(() => {
    const counts = {};
    favorites.forEach((f) => {
      counts[f.category] = (counts[f.category] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries.length ? entries[0][0] : "—";
  }, [favorites]);

  /** Compute next milestone target. */
  const nextMilestone = useMemo(() => {
    const current = streak.current || 0;
    return STREAK_MILESTONES.find((m) => m > current) || 100;
  }, [streak.current]);

  /** Progress toward next milestone. */
  const milestoneProgress = useMemo(() => {
    const current = streak.current || 0;
    const bounds = [0, ...STREAK_MILESTONES];
    const prev = bounds.filter((m) => m < current).pop() || 0;
    return Math.min(100, Math.round(((current - prev) / (nextMilestone - prev)) * 100));
  }, [streak.current, nextMilestone]);

  const achievements = [
    {
      title: "First Spark",
      description: "Open the extension for the first time",
      icon: "✨",
      unlocked: (history.length || 0) > 0 || (streak.current || 0) > 0,
      progress: 100
    },
    {
      title: "3-Day Streak",
      description: "Visit 3 days in a row",
      icon: "🔥",
      unlocked: (streak.current || 0) >= 3,
      progress: Math.min(100, ((streak.current || 0) / 3) * 100)
    },
    {
      title: "7-Day Streak",
      description: "Visit 7 days in a row",
      icon: "💪",
      unlocked: (streak.current || 0) >= 7,
      progress: Math.min(100, ((streak.current || 0) / 7) * 100)
    },
    {
      title: "Collector",
      description: "Save 10 favorites",
      icon: "💛",
      unlocked: favorites.length >= 10,
      progress: Math.min(100, (favorites.length / 10) * 100)
    },
    {
      title: "Explorer",
      description: "View 25 quotes",
      icon: "🧭",
      unlocked: history.length >= 25,
      progress: Math.min(100, (history.length / 25) * 100)
    }
  ];

  return (
    <motion.div
      className={styles.root}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={slideUp} className={styles.grid}>
        <StatsCard
          label="Current Streak"
          value={`${streak.current || 0} days`}
          icon="🔥"
          progress={milestoneProgress}
          hint={`Next milestone: ${nextMilestone} days`}
        />
        <StatsCard label="Best Streak" value={`${bestStreak || 0} days`} icon="🏆" />
        <StatsCard label="Favorites" value={favorites.length} icon="💛" />
        <StatsCard label="Quotes Viewed" value={history.length} icon="📖" />
        <StatsCard label="Top Category" value={topCategory} icon="🏷" />
      </motion.div>

      <motion.div variants={slideUp} className={styles.section}>
        <h3 className={styles.sectionTitle}>Achievements</h3>
        <div className={styles.achievements}>
          {achievements.map((a) => (
            <AchievementCard key={a.title} {...a} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
});

export default Statistics;
