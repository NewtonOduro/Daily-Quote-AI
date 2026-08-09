/**
 * AnimatedButton.jsx
 * ------------------------------------------------------------------
 * Reusable animated button with Framer Motion press/hover feedback and
 * springy press scale. Used across all pages for consistent look & feel.
 */
import { memo } from "react";
import { motion } from "framer-motion";
import { SPRINGS } from "../styles/motion";
import styles from "./AnimatedButton.module.css";

/**
 * AnimatedButton component.
 * @param {object} props
 * @param {React.ReactNode} props.children - button label/content
 * @param {Function} props.onClick - click handler
 * @param {string} [props.variant] - primary | secondary | ghost | danger
 * @param {string} [props.size] - sm | md | lg
 * @param {boolean} [props.disabled]
 * @param {string} [props.type] - button submit reset
 * @param {string} [props.className]
 * @param {string} [props.ariaLabel]
 */
const AnimatedButton = memo(function AnimatedButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  className = "",
  ariaLabel,
  ...rest
}) {
  const classes = [
    styles.btn,
    styles[variant] || styles.primary,
    styles[size] || styles.md,
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={SPRINGS.SMOOTH}
      style={{ willChange: "transform" }}
      {...rest}
    >
      {children}
    </motion.button>
  );
});

export default AnimatedButton;
