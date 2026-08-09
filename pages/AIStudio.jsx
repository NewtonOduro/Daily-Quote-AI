/**
 * AIStudio.jsx
 * ------------------------------------------------------------------
 * Generate custom quotes via AI (OpenAI) or offline fallback. Lets the
 * user pick a category, generate, and save the result to favorites.
 */
import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, slideUp } from "../styles/motionVariants";
import AnimatedButton from "../components/AnimatedButton";
import QuoteCard from "../components/QuoteCard";
import styles from "./AIStudio.module.css";
import { useQuoteApp } from "../context/QuoteContext";
import { generateQuote } from "../utils/aiGenerator";

/**
 * AIStudio page.
 * @param {object} props
 * @param {Function} [props.onNavigate]
 */
const AIStudio = memo(function AIStudio({ onNavigate }) {
  const { categories, handleFavorite, isFavorite, showToast, play } = useQuoteApp();
  const [category, setCategory] = useState("motivation");
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);

  /** Generate a new quote. */
  const handleGenerate = async () => {
    setLoading(true);
    play("tick");
    const quote = await generateQuote(category);
    setGenerated(quote);
    setLoading(false);
    showToast(quote.local ? "Generated offline" : "AI quote generated", "success");
  };

  return (
    <motion.div
      className={styles.root}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={slideUp} className={styles.card}>
        <h3 className={styles.title}>AI Quote Studio</h3>
        <p className={styles.desc}>
          Choose a category and generate a fresh, original quote. Works online
          with an API key, or offline with built-in inspiration.
        </p>

        <div className={styles.categories}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.chip} ${cat === category ? styles.active : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <AnimatedButton onClick={handleGenerate} disabled={loading} size="lg">
          <span aria-hidden="true">✨</span> {loading ? "Generating…" : "Generate Quote"}
        </AnimatedButton>
      </motion.div>

      <AnimatePresence>
        {generated && (
          <motion.div key={generated.id} variants={slideUp} className={styles.result}>
            <QuoteCard
              quote={generated}
              isLoading={false}
              onFavorite={handleFavorite}
              onShare={() => showToast("Share API unavailable", "info")}
              isFavorited={isFavorite(generated.id)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default AIStudio;
