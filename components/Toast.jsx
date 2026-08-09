/**
 * Toast.jsx
 * ------------------------------------------------------------------
 * Self-dismissing toast notification. role="status", auto-dismisses
 * after TOAST_DURATION ms. Types: success | error | info.
 */
import { memo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TOAST_DURATION } from "../utils/constants";
import styles from "./Toast.module.css";

/** Toast enter/exit variants. */
const toastVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.15 } }
};

/**
 * ToastManager — renders a list of toasts stacked at bottom.
 * @param {object} props
 * @param {Array<{id: string, message: string, type: string}>} props.toasts
 * @param {Function} props.onClose - (id)=>void
 */
const ToastManager = memo(function ToastManager({ toasts, onClose }) {
  return (
    <div className={styles.stack} aria-live="polite" aria-atomic="false">
      <AnimatePresence>
        {toasts.map((t) => (
          <SingleToast key={t.id} toast={t} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
});

/**
 * SingleToast item.
 * @param {object} props
 * @param {{id: string, message: string, type: string}} props.toast
 * @param {Function} props.onClose
 */
const SingleToast = memo(function SingleToast({ toast, onClose }) {
  const { id, message, type = "success" } = toast;

  /** Auto-dismiss after TOAST_DURATION ms. */
  useEffect(() => {
    const t = setTimeout(() => onClose(id), TOAST_DURATION);
    return () => clearTimeout(t);
  }, [id, onClose]);

  const icons = { success: "✅", error: "⚠️", info: "ℹ️" };

  return (
    <motion.div
      role="status"
      className={`${styles.toast} ${styles[type] || styles.info}`}
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      aria-label={message}
      style={{ willChange: "transform" }}
    >
      <span className={styles.icon} aria-hidden="true">
        {icons[type] || icons.info}
      </span>
      <span className={styles.message}>{message}</span>
      <button
        type="button"
        className={styles.close}
        onClick={() => onClose(id)}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </motion.div>
  );
});

export default ToastManager;
export { SingleToast };
