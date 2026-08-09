/**
 * SearchBar.jsx
 * ------------------------------------------------------------------
 * Accessible search input with clear button. role="searchbox",
 * aria-label "Search quotes", ESC clears the input.
 */
import { memo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "../styles/motionVariants";
import styles from "./SearchBar.module.css";

/**
 * SearchBar component.
 * @param {object} props
 * @param {string} props.value - current input value
 * @param {Function} props.onChange - (value)=>void
 * @param {Function} props.onClear - ()=>void
 * @param {string} [props.placeholder]
 */
const SearchBar = memo(function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search quotes..."
}) {
  const inputRef = useRef(null);

  /** Handle input change. */
  const handleChange = useCallback(
    (e) => onChange(e.target.value),
    [onChange]
  );

  /** ESC clears the input. */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onChange("");
        onClear && onClear();
        inputRef.current?.focus();
      }
    },
    [onChange, onClear]
  );

  /** Clear button handler. */
  const handleClear = useCallback(() => {
    onChange("");
    onClear && onClear();
    inputRef.current?.focus();
  }, [onChange, onClear]);

  return (
    <motion.div
      className={styles.wrap}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      style={{ willChange: "transform" }}
    >
      <span className={styles.icon} aria-hidden="true">
        ⌕
      </span>
      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        aria-label="Search quotes"
        className={styles.input}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
      />
      {value && (
        <button
          type="button"
          className={styles.clear}
          onClick={handleClear}
          aria-label="Clear search"
          title="Clear search (Esc)"
        >
          <span aria-hidden="true">✕</span>
        </button>
      )}
    </motion.div>
  );
});

export default SearchBar;
