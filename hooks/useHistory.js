/**
 * useHistory.js
 * ------------------------------------------------------------------
 * History management hook persisted to chrome.storage.local. Tracks
 * viewed quotes with timestamps, capped at MAX_HISTORY_LENGTH entries.
 */
import { useCallback, useEffect, useState } from "react";
import { getLocalValue, setLocal, subscribeKey } from "../utils/chromeStorage";
import { STORAGE_KEYS, MAX_HISTORY_LENGTH } from "../utils/constants";

/** Storage key for history. */
const KEY = STORAGE_KEYS.LOCAL_HISTORY;

/**
 * History hook.
 * @returns {{
 *   history: object[],
 *   isLoading: boolean,
 *   addToHistory: Function,
 *   removeFromHistory: Function,
 *   clearHistory: Function
 * }}
 */
export const useHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /** Load history from storage. */
  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await getLocalValue(KEY, []);
      if (mounted) {
        setHistory(Array.isArray(stored) ? stored : []);
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /** Subscribe to external storage changes. */
  useEffect(() => {
    return subscribeKey(KEY, (newValue) => {
      setHistory(Array.isArray(newValue) ? newValue : []);
    });
  }, []);

  /** Persist history array. */
  const persist = useCallback(async (next) => {
    setHistory(next);
    await setLocal({ [KEY]: next });
  }, []);

  /**
   * Add a quote to history (prepended, deduped, capped).
   * @param {object} quote
   * @returns {Promise<void>}
   */
  const addToHistory = useCallback(
    async (quote) => {
      if (!quote || !quote.id) return;
      const filtered = history.filter((h) => h.id !== quote.id);
      const next = [
        { ...quote, viewedAt: Date.now() },
        ...filtered
      ].slice(0, MAX_HISTORY_LENGTH);
      await persist(next);
    },
    [history, persist]
  );

  /**
   * Remove a single history entry by id.
   * @param {string} id
   * @returns {Promise<void>}
   */
  const removeFromHistory = useCallback(
    async (id) => {
      await persist(history.filter((h) => h.id !== id));
    },
    [history, persist]
  );

  /**
   * Clear all history.
   * @returns {Promise<void>}
   */
  const clearHistory = useCallback(async () => {
    await persist([]);
  }, [persist]);

  return { history, isLoading, addToHistory, removeFromHistory, clearHistory };
};

export default useHistory;
