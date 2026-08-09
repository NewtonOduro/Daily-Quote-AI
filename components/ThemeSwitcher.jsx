/**
 * ThemeSwitcher.jsx
 * ------------------------------------------------------------------
 * Displays a row of theme swatches. Selecting one applies the theme via
 * the useTheme hook. Animated with a springy pop.
 */
import { memo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, scalePop } from "../styles/motionVariants";
import { useTheme } from "../hooks/useTheme";
import { THEMES } from "../utils/constants";
import styles from "./ThemeSwitcher.module.css";

/**
 * ThemeSwitcher component.
 * @param {object} [props]
 * @param {string} [props.size] - sm | md
 */
const ThemeSwitcher = memo(function ThemeSwitcher({ size = "md" }) {
  const { theme, setTheme } = useTheme();

  return (
    <motion.div
      className={styles.wrap}
      role="radiogroup"
      aria-label="Theme"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      style={{ willChange: "transform" }}
    >
      {THEMES.map((t) => {
        const isActive = t.id === theme;
        return (
          <motion.button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${t.label} theme`}
            className={`${styles.swatch} ${styles[t.id]} ${
              isActive ? styles.active : ""
            } ${size === "sm" ? styles.sm : ""}`}
            onClick={() => setTheme(t.id)}
            variants={scalePop}
            whileHover={{ y: -3, scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            title={t.label}
            style={{ willChange: "transform" }}
          >
            <span className={styles.emoji} aria-hidden="true">
              {t.emoji}
            </span>
            {isActive && <span className={styles.check} aria-hidden="true" />}
          </motion.button>
        );
      })}
    </motion.div>
  );
});

export default ThemeSwitcher;
