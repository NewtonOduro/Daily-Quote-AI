/**
 * useTheme.js
 * ------------------------------------------------------------------
 * Theme management hook persisted to chrome.storage.sync. Applies the
 * active theme by setting `data-theme` on the document root and keeps
 * the preference synchronized across extension contexts.
 */
import { useCallback, useEffect, useState } from "react";
import { getSyncValue, setSync, subscribeKey } from "../utils/chromeStorage";
import { STORAGE_KEYS, DEFAULT_THEME } from "../utils/constants";

/** Storage key for theme. */
const KEY = STORAGE_KEYS.SYNC_THEME;

/**
 * Apply a theme id to the document root.
 * @param {string} theme
 */
const applyThemeToDom = (theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
};

/**
 * Theme hook.
 * @returns {{ theme: string, setTheme: Function, toggleTheme: Function }}
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState(DEFAULT_THEME);

  /** Load persisted theme and apply. */
  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await getSyncValue(KEY, DEFAULT_THEME);
      if (mounted) {
        setThemeState(stored);
        applyThemeToDom(stored);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /** React to storage changes from other contexts. */
  useEffect(() => {
    return subscribeKey(KEY, (newValue) => {
      if (newValue) {
        setThemeState(newValue);
        applyThemeToDom(newValue);
      }
    });
  }, []);

  /**
   * Set the active theme.
   * @param {string} next
   * @returns {Promise<void>}
   */
  const setTheme = useCallback(async (next) => {
    setThemeState(next);
    applyThemeToDom(next);
    await setSync({ [KEY]: next });
  }, []);

  /**
   * Cycle to the next theme in the THEMES list (for quick toggling).
   * @returns {Promise<void>}
   */
  const toggleTheme = useCallback(async () => {
    const { THEMES } = await import("../utils/constants");
    const order = THEMES.map((t) => t.id);
    const idx = order.indexOf(theme);
    const next = order[(idx + 1) % order.length];
    await setTheme(next);
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
};

export default useTheme;
