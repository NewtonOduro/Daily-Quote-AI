/**
 * Favorites.jsx
 * ------------------------------------------------------------------
 * Displays the user's saved favorites with remove and clear actions.
 */
import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, listItem } from "../styles/motionVariants";
import AnimatedButton from "../components/AnimatedButton";
import styles from "./Favorites.module.css";
import { useQuoteApp } from "../context/QuoteContext";

/**
 * Favorites page.
 * @param {object} props
 * @param {Function} [props.onNavigate]
 */
const Favorites = memo(function Favorites({ onNavigate }) {
  const {
    favorites,
    isLoading,
    removeFavorite,
    clearFavorites,
    showToast,
    play
  } = useQuoteApp();

  const handleClear = async () => {
    await clearFavorites();
    showToast("All favorites cleared", "info");
  };

  const handleRemove = async (id) => {
    await removeFavorite(id);
    showToast("Removed from favorites", "info");
    play("favorite");
  };

  if (isLoading) {
    return <div className={styles.empty}>Loading favorites…</div>;
  }

  if (favorites.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emoji} aria-hidden="true">
          💛
        </span>
        <h3 className={styles.title}>No favorites yet</h3>
        <p className={styles.sub}>
          Tap the heart on any quote to save it here for quick access.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.root}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.header}>
        <h2 className={styles.heading}>Favorites ({favorites.length})</h2>
        <AnimatedButton variant="ghost" size="sm" onClick={handleClear}>
          Clear all
        </AnimatedButton>
      </div>
      <motion.ul className={styles.list}>
        <AnimatePresence>
          {favorites.map((fav) => (
            <motion.li
              key={fav.id}
              className={styles.item}
              variants={listItem}
              exit="exit"
              layout
            >
              <p className={styles.text}>“{fav.text}”</p>
              <div className={styles.meta}>
                <span className={styles.author}>— {fav.author}</span>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => handleRemove(fav.id)}
                  aria-label="Remove favorite"
                >
                  ✕
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </motion.div>
  );
});

export default Favorites;
