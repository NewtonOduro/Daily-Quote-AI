/**
 * useQuotes.js
 * ------------------------------------------------------------------
 * Central quote management hook: loads the bundled quote dataset,
 * persists the Quote of the Day, filters by category, performs search,
 * and fetches the next random quote with a loading state.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import quotesData from "../data/quotes.json";
import { getLocalValue, setLocal } from "../utils/chromeStorage";
import { STORAGE_KEYS } from "../utils/constants";

/**
 * Compute the "date stamp" YYYY-MM-DD for the local timezone.
 * @returns {string}
 */
export const todayStamp = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * Build a deterministic pseudo-random index from a seed string.
 * @param {string} seed
 * @param {number} max
 * @returns {number}
 */
const seededIndex = (seed, max) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % max;
};

/**
 * Quote management hook.
 * @returns {{
 *   quotes: object[],
 *   categories: string[],
 *   quoteOfDay: object|null,
 *   activeQuote: object|null,
 *   isLoading: boolean,
 *   error: string|null,
 *   activeCategory: string,
 *   searchTerm: string,
 *   filteredQuotes: object[],
 *   setActiveCategory: Function,
 *   setSearchTerm: Function,
 *   nextQuote: Function,
 *   refreshQuoteOfDay: Function,
 *   getById: Function
 * }}
 */
export const useQuotes = () => {
  const allQuotes = useMemo(() => quotesData.quotes, []);
  const categories = useMemo(() => quotesData.categories, []);

  const [quoteOfDay, setQuoteOfDay] = useState(null);
  const [activeQuote, setActiveQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  /** Load or compute the Quote of the Day. */
  const refreshQuoteOfDay = useCallback(async () => {
    const stamp = todayStamp();
    const stored = await getLocalValue(STORAGE_KEYS.LOCAL_QUOTE_OF_DAY, null);
    if (stored && stored.date === stamp && stored.quote) {
      setQuoteOfDay(stored.quote);
      return stored.quote;
    }
    const index = seededIndex(stamp, allQuotes.length);
    const quote = allQuotes[index];
    const payload = { date: stamp, quote };
    await setLocal({ [STORAGE_KEYS.LOCAL_QUOTE_OF_DAY]: payload });
    setQuoteOfDay(quote);
    return quote;
  }, [allQuotes]);

  /** Initialize the active quote. */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const qod = await refreshQuoteOfDay();
        if (mounted) {
          setActiveQuote(qod);
          setIsLoading(false);
        }
      } catch (e) {
        if (mounted) {
          setError("Unable to load quotes.");
          setIsLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refreshQuoteOfDay]);

  /** Fetch next random quote (optionally filtered by category). */
  const nextQuote = useCallback(
    async (category = activeCategory) => {
      setIsLoading(true);
      setError(null);
      await new Promise((r) => setTimeout(r, 350));
      const pool =
        category && category !== "all"
          ? allQuotes.filter((q) => q.category === category)
          : allQuotes;
      const next =
        pool.length > 0
          ? pool[Math.floor(Math.random() * pool.length)]
          : allQuotes[Math.floor(Math.random() * allQuotes.length)];
      setActiveQuote(next);
      setIsLoading(false);
      return next;
    },
    [allQuotes, activeCategory]
  );

  /** Filter quotes by search + category (memoized). */
  const filteredQuotes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return allQuotes.filter((q) => {
      const matchCat = activeCategory === "all" || q.category === activeCategory;
      const matchSearch =
        !term ||
        q.text.toLowerCase().includes(term) ||
        q.author.toLowerCase().includes(term) ||
        q.category.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [allQuotes, searchTerm, activeCategory]);

  /** Lookup a quote by id. */
  const getById = useCallback(
    (id) => allQuotes.find((q) => q.id === id) || null,
    [allQuotes]
  );

  return {
    quotes: allQuotes,
    categories,
    quoteOfDay,
    activeQuote,
    isLoading,
    error,
    activeCategory,
    searchTerm,
    filteredQuotes,
    setActiveCategory,
    setSearchTerm,
    nextQuote,
    refreshQuoteOfDay,
    getById
  };
};

export default useQuotes;
