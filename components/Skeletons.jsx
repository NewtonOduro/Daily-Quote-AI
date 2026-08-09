/**
 * Skeletons.jsx
 * ------------------------------------------------------------------
 * Built-in skeleton loaders for quotes, cards, and full pages. Used as
 * loading fallbacks across the extension and as <Suspense> fallbacks
 * for lazy-loaded secondary pages.
 */
import { memo } from "react";
import { motion } from "framer-motion";
import styles from "./Skeletons.module.css";

/** CSS-only shimmering block. */
const Block = memo(function Block({ className = "" }) {
  return <div className={`${styles.block} ${className}`} aria-hidden="true" />;
});

/**
 * QuoteCardSkeleton — loading placeholder for the QuoteCard.
 */
const QuoteCardSkeleton = memo(function QuoteCardSkeleton() {
  return (
    <div className={styles.card} role="status" aria-label="Loading quote">
      <Block className={styles.mark} />
      <Block className={styles.line} />
      <Block className={styles.line} />
      <Block className={`${styles.line} ${styles.short}`} />
      <div className={styles.row}>
        <Block className={styles.thumb} />
        <Block className={styles.thumb} />
        <Block className={styles.thumb} />
      </div>
    </div>
  );
});

/**
 * CardSkeleton — generic grid card placeholder.
 */
const CardSkeleton = memo(function CardSkeleton() {
  return (
    <div className={styles.gridCard} role="status" aria-label="Loading">
      <Block className={styles.avatar} />
      <Block className={`${styles.line} ${styles.short}`} />
      <Block className={styles.line} />
    </div>
  );
});

/**
 * PageSkeleton — full-page loading fallback for Suspense.
 */
const PageSkeleton = memo(function PageSkeleton() {
  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      aria-label="Page loading"
      role="status"
    >
      <Block className={styles.headerLine} />
      <div className={styles.grid}>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </motion.div>
  );
});

export default QuoteCardSkeleton;
export { QuoteCardSkeleton, CardSkeleton, PageSkeleton };
