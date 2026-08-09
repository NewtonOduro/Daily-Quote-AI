/**
 * CategoryFilter.jsx
 * ------------------------------------------------------------------
 * Horizontal scrollable list of category chips. role="tablist" with
 * arrow-key navigation between chips. Includes an "All" option.
 */
import { memo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { staggerContainer, listItem } from "../styles/motionVariants";
import styles from "./CategoryFilter.module.css";

/**
 * CategoryFilter component.
 * @param {object} props
 * @param {string[]} props.categories - list of category ids
 * @param {string} props.activeCategory - currently selected category ("all" for none)
 * @param {Function} props.onSelect - (categoryId)=>void
 */
const CategoryFilter = memo(function CategoryFilter({
  categories,
  activeCategory,
  onSelect
}) {
  const listRef = useRef(null);
  const allChips = ["all", ...categories];
  const activeIndex = allChips.indexOf(activeCategory);

  /** Move focus to the chip at a given index. */
  const focusIndex = useCallback(
    (idx) => {
      const nodes = listRef.current?.querySelectorAll('[role="tab"]');
      if (!nodes || !nodes[idx]) return;
      nodes[idx].focus();
    },
    []
  );

  /** Handle arrow-key navigation. */
  const handleKeyDown = useCallback(
    (e) => {
      let next = activeIndex;
      if (e.key === "ArrowRight") {
        next = (activeIndex + 1) % allChips.length;
      } else if (e.key === "ArrowLeft") {
        next = (activeIndex - 1 + allChips.length) % allChips.length;
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        next = (activeIndex + 1) % allChips.length;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        next = (activeIndex - 1 + allChips.length) % allChips.length;
      } else {
        return;
      }
      e.preventDefault();
      focusIndex(next);
    },
    [activeIndex, allChips.length, focusIndex]
  );

  return (
    <motion.div
      role="tablist"
      aria-label="Quote categories"
      className={styles.list}
      ref={listRef}
      onKeyDown={handleKeyDown}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      style={{ willChange: "transform" }}
    >
      {allChips.map((cat) => {
        const isActive = cat === activeCategory;
        return (
          <motion.button
            key={cat}
            type="button"
            role="tab"
            id={`cat-${cat}`}
            aria-selected={isActive}
            aria-controls="quote-panel"
            tabIndex={isActive ? 0 : -1}
            className={`${styles.chip} ${isActive ? styles.active : ""}`}
            onClick={() => onSelect(cat)}
            variants={listItem}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{ willChange: "transform" }}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </motion.button>
        );
      })}
    </motion.div>
  );
});

export default CategoryFilter;
