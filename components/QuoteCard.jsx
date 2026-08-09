/**
 * QuoteCard.jsx
 * ------------------------------------------------------------------
 * Primary quote display card. Shows the quote text, author, category
 * badge, and action buttons (favorite, copy, share). Supports loading
 * skeleton, empty/error states, keyboard shortcuts (F favorite, C copy),
 * and role=article with aria-live.
 */
import { memo, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { scalePop, slideUp } from "../styles/motionVariants";
import { DURATIONS, EASINGS } from "../styles/motion";
import styles from "./QuoteCard.module.css";
import { SOUNDS } from "../utils/constants";
import { useAudioEffects } from "../hooks/useAudioEffects";
import QuoteCardSkeleton from "./Skeletons";

/**
 * Validate a quote object minimally.
 * @param {object} quote
 * @returns {boolean}
 */
const isValidQuote = (quote) =>
  !!quote && typeof quote.text === "string" && quote.text.length > 0;

/**
 * QuoteCard component.
 * @param {object} props
 * @param {object} props.quote - the quote object {id,text,author,category}
 * @param {Function} props.onFavorite - called with quote when favorited
 * @param {Function} props.onShare - called with quote when shared
 * @param {boolean} props.isLoading - show skeleton when true
 * @param {boolean} [props.isFavorited] - marks the heart as active
 * @param {Function} [props.onCopy] - called with quote when copied
 */
const QuoteCard = memo(function QuoteCard({
  quote,
  onFavorite,
  onShare,
  isLoading = false,
  isFavorited = false,
  onCopy
}) {
  const { play } = useAudioEffects();
  const cardRef = useRef(null);

  /** Copy the quote text to the clipboard. */
  const handleCopy = useCallback(async () => {
    if (!quote) return;
    const text = `"${quote.text}" — ${quote.author}`;
    try {
      await navigator.clipboard.writeText(text);
      if (onCopy) onCopy(quote);
      play(SOUNDS.COPY);
    } catch (e) {
      /* clipboard unavailable */
    }
  }, [quote, onCopy, play]);

  /** Handle favorite action. */
  const handleFavorite = useCallback(() => {
    if (!quote) return;
    onFavorite && onFavorite(quote);
    play(SOUNDS.FAVORITE);
  }, [quote, onFavorite, play]);

  /** Handle share action. */
  const handleShare = useCallback(() => {
    if (!quote) return;
    const text = `"${quote.text}" — ${quote.author}`;
    play(SOUNDS.SHARE);
    onShare && onShare(quote, text);
  }, [quote, onShare, play]);

  /** Keyboard shortcuts: F favorite, C copy. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target !== document.body) return;
      const key = e.key.toLowerCase();
      if (key === "f") {
        e.preventDefault();
        handleFavorite();
      } else if (key === "c") {
        e.preventDefault();
        handleCopy();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleFavorite, handleCopy]);

  if (isLoading) {
    return (
      <div className={styles.cardWrap} ref={cardRef}>
        <QuoteCardSkeleton />
      </div>
    );
  }

  if (!isValidQuote(quote)) {
    return (
      <div className={styles.cardWrap} ref={cardRef}>
        <div className={styles.errorState} role="alert">
          <span className={styles.errorIcon} aria-hidden="true">
            ⚠️
          </span>
          <p className={styles.errorText}>No quote available right now.</p>
          <span className={styles.errorHint}>Try loading another quote.</span>
        </div>
      </div>
    );
  }

  return (
    <motion.article
      ref={cardRef}
      className={styles.card}
      role="article"
      aria-live="polite"
      aria-label={`Quote: ${quote.text}`}
      variants={scalePop}
      initial="hidden"
      animate="visible"
      exit="hidden"
      layout
      style={{ willChange: "transform" }}
    >
      <motion.div
        className={styles.content}
        variants={slideUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: DURATIONS.MEDIUM, ease: EASINGS.DEFAULT }}
      >
        <span className={styles.quoteMark} aria-hidden="true">
          “
        </span>
        <p className={styles.text}>{quote.text}</p>
        <div className={styles.meta}>
          <span className={styles.author}>— {quote.author || "Unknown"}</span>
          {quote.category && (
            <span className={styles.categoryBadge}>{quote.category}</span>
          )}
        </div>
      </motion.div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.actionBtn} ${isFavorited ? styles.active : ""}`}
          onClick={handleFavorite}
          aria-pressed={isFavorited}
          aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
          title="Save to favorites (F)"
        >
          <span aria-hidden="true">{isFavorited ? "♥" : "♡"}</span>
        </button>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={handleCopy}
          aria-label="Copy quote"
          title="Copy quote (C)"
        >
          <span aria-hidden="true">⧉</span>
        </button>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={handleShare}
          aria-label="Share quote"
          title="Share quote"
        >
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </motion.article>
  );
});

export default QuoteCard;
