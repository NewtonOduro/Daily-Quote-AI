/**
 * Home.jsx
 * ------------------------------------------------------------------
 * Main view: Quote of the Day card + category filter + next button.
 */
import { memo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "../styles/motionVariants";
import QuoteCard from "../components/QuoteCard";
import CategoryFilter from "../components/CategoryFilter";
import AnimatedButton from "../components/AnimatedButton";
import styles from "./Home.module.css";
import { useQuoteApp } from "../context/QuoteContext";
import { SOUNDS } from "../utils/constants";

/**
 * Home page.
 * @param {object} props
 * @param {Function} [props.onNavigate] - callback for cross-page nav
 */
const Home = memo(function Home({ onNavigate }) {
  const {
    activeQuote,
    isLoading,
    error,
    categories,
    activeCategory,
    setActiveCategory,
    nextQuote,
    isFavorite,
    handleFavorite,
    handleShare,
    showToast,
    streak,
    play
  } = useQuoteApp();

  const handleNext = async () => {
    play(SOUNDS.TICK);
    await nextQuote(activeCategory);
  };

  return (
    <motion.div
      className={styles.root}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      role="tabpanel"
      id="quote-panel"
      aria-labelledby="quote-panel"
    >
      <motion.div variants={slideUp} className={styles.filters}>
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </motion.div>

      <motion.div variants={slideUp} className={styles.cardArea}>
        <QuoteCard
          quote={activeQuote}
          isLoading={isLoading}
          onFavorite={(q) => {
            if (error) return;
            handleFavorite(q);
          }}
          onShare={handleShare}
          onCopy={() => showToast("Quote copied", "success")}
          isFavorited={isFavorite(activeQuote?.id)}
        />
        {error && (
          <span className={styles.error} role="alert">
            {error}
          </span>
        )}
      </motion.div>

      <motion.div variants={slideUp} className={styles.footer}>
        <div className={styles.streak}>
          <span className={styles.flame} aria-hidden="true">
            🔥
          </span>
          <span className={styles.streakValue}>{streak.current || 0}-day streak</span>
        </div>
        <AnimatedButton onClick={handleNext} disabled={isLoading} size="md" variant="secondary">
          <span aria-hidden="true">↻</span> Next Quote
        </AnimatedButton>
      </motion.div>
    </motion.div>
  );
});

export default Home;
