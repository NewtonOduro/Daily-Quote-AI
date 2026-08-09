/**
 * Settings.jsx
 * ------------------------------------------------------------------
 * Preferences: theme switcher, notifications toggle, sounds toggle,
 * AI API key input. Persists to chrome.storage.sync.
 */
import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "../styles/motionVariants";
import ThemeSwitcher from "../components/ThemeSwitcher";
import AnimatedButton from "../components/AnimatedButton";
import { saveApiKey, getCurrentApiKey } from "../utils/aiGenerator";
import styles from "./Settings.module.css";
import { useQuoteApp } from "../context/QuoteContext";

/**
 * Settings page.
 * @param {object} props
 * @param {Function} [props.onNavigate]
 */
const Settings = memo(function Settings({ onNavigate }) {
  const { soundsEnabled, setSoundsEnabled, showToast } = useQuoteApp();
  const [notifications, setNotifications] = useState(true);
  const [apiKey, setApiKey] = useState("");

  /** Load persisted settings. */
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { getSyncValue } = await import("../utils/chromeStorage");
      const { STORAGE_KEYS } = await import("../utils/constants");
      const [notif, key] = await Promise.all([
        getSyncValue(STORAGE_KEYS.SYNC_NOTIFICATIONS, true),
        getCurrentApiKey()
      ]);
      if (mounted) {
        setNotifications(notif !== false);
        setApiKey(key || "");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /** Toggle notifications. */
  const toggleNotifications = async (val) => {
    setNotifications(val);
    const { setSync } = await import("../utils/chromeStorage");
    const { STORAGE_KEYS } = await import("../utils/constants");
    await setSync({ [STORAGE_KEYS.SYNC_NOTIFICATIONS]: val });
    showToast(val ? "Daily notifications enabled" : "Notifications disabled", "info");
  };

/** Save the API key. */
  const handleSaveKey = async () => {
    await saveApiKey(apiKey.trim());
    showToast("API key saved", "success");
  };

  return (
    <motion.div
      className={styles.root}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.section variants={slideUp} className={styles.card}>
        <h3 className={styles.title}>Theme</h3>
        <p className={styles.desc}>Choose your visual style.</p>
        <ThemeSwitcher />
      </motion.section>

      <motion.section variants={slideUp} className={styles.card}>
        <h3 className={styles.title}>Notifications</h3>
        <p className={styles.desc}>Receive daily quote reminders and streak milestones.</p>
        <label className={styles.switchRow}>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => toggleNotifications(e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.switch} aria-hidden="true" />
          <span className={styles.switchLabel}>
            {notifications ? "Enabled" : "Disabled"}
          </span>
        </label>
      </motion.section>

      <motion.section variants={slideUp} className={styles.card}>
        <h3 className={styles.title}>Sound Effects</h3>
        <p className={styles.desc}>Play subtle feedback sounds for actions.</p>
        <label className={styles.switchRow}>
          <input
            type="checkbox"
            checked={soundsEnabled}
            onChange={(e) => setSoundsEnabled(e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.switch} aria-hidden="true" />
          <span className={styles.switchLabel}>
            {soundsEnabled ? "Enabled" : "Disabled"}
          </span>
        </label>
      </motion.section>

      <motion.section variants={slideUp} className={styles.card}>
        <h3 className={styles.title}>AI Studio (Optional)</h3>
        <p className={styles.desc}>
          Add an OpenAI API key to generate custom quotes. Leave blank to use
          offline generation.
        </p>
        <div className={styles.inputRow}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className={styles.input}
            aria-label="OpenAI API key"
          />
          <AnimatedButton onClick={handleSaveKey} size="sm">
            Save
          </AnimatedButton>
        </div>
      </motion.section>
    </motion.div>
  );
});

export default Settings;
