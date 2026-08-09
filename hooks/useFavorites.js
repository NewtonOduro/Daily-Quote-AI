/**
 * useFavorites.js
 * ------------------------------------------------------------------
 * Favorites management hook persisted to chrome.storage.local.
 * Supports saving, removing, duplicate prevention, and checking
 * whether a quote is already favorited.
 */
import { useCallback, useEffect, useState } from "react";
import { getLocalValue, setLocal, subscribeKey } from "../utils/chromeStorage";
import { STORAGE_KEYS, MAX_FAVORITES_LENGTH } from "../utils/constants";

/** Storage key for favorites. */
const KEY = STORAGE_KEYS.LOCAL_FAVORITES;

/**
 * Favorites hook.
 * @returns {{
 *   favorites: object[],
 *   isLoading: boolean,
 *   isFavorite: Function,
 *   addFavorite: Function,
 *   removeFavorite: Function,
 *   toggleFavorite: Function,
 *   clearFavorites: Function
 * }}
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /** Load favorites from storage. */
  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await getLocalValue(KEY, []);
      if (mounted) {
        setFavorites(Array.isArray(stored) ? stored : []);
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /** Subscribe to external changes (e.g. background worker). */
  useEffect(() => {
    return subscribeKey(KEY, (newValue) => {
      setFavorites(Array.isArray(newValue) ? newValue : []);
    });
  }, []);

  /** Persist updated favorites array. */
  const persist = useCallback(async (next) => {
    setFavorites(next);
    await setLocal({ [KEY]: next });
  }, []);

  /**
   * Check if a quote is favorited.
   * @param {string} id
   * @returns {boolean}
   */
  const isFavorite = useCallback(
    (id) => favorites.some((f) => f.id === id),
    [favorites]
  );

  /**
   * Add a favorite. Prevents duplicates by id.
   * @param {object} quote
   * @returns {Promise<boolean>} true if newly added
   */
  const addFavorite = useCallback(
    async (quote) => {
      if (!quote || !quote.id) return false;
      if (favorites.some((f) => f.id === quote.id)) return false;
      const next = [
        { ...quote, favoritedAt: Date.now() },
        ...favorites
      ].slice(0, MAX_FAVORITES_LENGTH);
      await persist(next);
      return true;
    },
    [favorites, persist]
  );

  /**
   * Remove a favorite by id.
   * @param {string} id
   * @returns {Promise<boolean>} true if removed
   */
  const removeFavorite = useCallback(
    async (id) => {
      const next = favorites.filter((f) => f.id !== id);
      await persist(next);
      return next.length !== favorites.length;
    },
    [favorites, persist]
  );

  /**
   * Toggle favorite state.
   * @param {object} quote
   * @returns {Promise<boolean>} resulting favorite state
   */
  const toggleFavorite = useCallback(
    async (quote) => {
      if (!quote || !quote.id) return false;
      if (favorites.some((f) => f.id === quote.id)) {
        await removeFavorite(quote.id);
        return false;
      }
      await addFavorite(quote);
      return true;
    },
    [favorites, addFavorite, removeFavorite]
  );

  /**
   * Remove all favorites.
   * @returns {Promise<void>}
   */
  const clearFavorites = useCallback(async () => {
    await persist([]);
  }, [persist]);

  return {
    favorites,
    isLoading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites
  };
};

export default useFavorites;
