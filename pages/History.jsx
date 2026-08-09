/**
 * History.jsx
 * ------------------------------------------------------------------
 * Shows the browsing/review history of quotes with search + clear.
 */
import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, listItem } from "../styles/motionVariants";
import SearchBar from "../components/SearchBar";
import AnimatedButton from "../components/AnimatedButton";
import styles from "./History.module.css";
import { useQuoteApp } from "../context/QuoteContext";

/**
 * History page.
 * @param {object} props
 * @param {Function} [props.onNavigate]
 */
const History = memo(function History({ onNavigate }) {
  const { history, clearHistory, showToast, searchTerm, setSearchTerm } = useQuoteApp();

  /** Filter history by search (memoized). */
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return history;
    return history.filter(
      (h) =>
        h.text.toLowerCase().includes(term) ||
        h.author.toLowerCase().includes(term)
    );
  }, [history, searchTerm]);

  const handleClear = async () => {
    await clearHistory();
    showToast("History cleared", "info");
  };

  return (
    <motion.div
      className={styles.root}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.header}>
        <h2 className={styles.heading}>History ({history.length})</h2>
        <AnimatedButton variant="ghost" size="sm" onClick={handleClear}>
          Clear
        </AnimatedButton>
      </div>
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        onClear={() => setSearchTerm("")}
        placeholder="Search history..."
      />
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emoji} aria-hidden="true">
            🕘
          </span>
          <p className={styles.sub}>No history entries yet.</p>
        </div>
      ) : (
        <motion.ul className={styles.list}>
          <AnimatePresence>
            {filtered.map((entry) => (
              <motion.li
                key={`${entry.id}-${entry.viewedAt}`}
                className={styles.item}
                variants={listItem}
                exit="exit"
                layout
              >
                <p className={styles.text}>“{entry.text}”</p>
                <div className={styles.meta}>
                  <span className={styles.author}>— {entry.author}</span>
                  <span className={styles.time}>
                    {new Date(entry.viewedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </motion.div>
  );
});

export default History;
