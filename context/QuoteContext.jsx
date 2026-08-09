/**
 * QuoteContext.jsx
 * ------------------------------------------------------------------
 * Global context bundling quotes, favorites, history, streak, theme and
 * audio hooks to eliminate prop drilling across pages. Consumed via
 * useQuoteApp().
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQuotes } from "../hooks/useQuotes";
import { useFavorites } from "../hooks/useFavorites";
import { useHistory } from "../hooks/useHistory";
import { useStreak } from "../hooks/useStreak";
import { useTheme } from "../hooks/useTheme";
import { useAudioEffects } from "../hooks/useAudioEffects";
import { TOAST_DURATION } from "../utils/constants";

/** Context object. */
const QuoteAppContext = createContext(null);

/** Unique id generator for toasts. */
let toastCounter = 0;

/**
 * QuoteAppProvider — wraps the entire extension UI.
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export const QuoteAppProvider = ({ children }) => {
  const quotesApi = useQuotes();
  const favoritesApi = useFavorites();
  const historyApi = useHistory();
  const streakApi = useStreak();
  const themeApi = useTheme();
  const audioApi = useAudioEffects();

  /** Toast state. */
  const [toasts, setToasts] = useState([]);

  /** Add a toast. */
  const showToast = useCallback((message, type = "info") => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION);
  }, []);

  /** Remove a toast by id. */
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /** Add current quote to history when it changes. */
  useEffect(() => {
    if (quotesApi.activeQuote) {
      historyApi.addToHistory(quotesApi.activeQuote);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotesApi.activeQuote?.id]);

  /** Shared handlers. */
  const handleFavorite = useCallback(
    async (quote) => {
      const added = await favoritesApi.toggleFavorite(quote);
      showToast(added ? "Added to favorites" : "Removed from favorites", "success");
    },
    [favoritesApi, showToast]
  );

  const handleShare = useCallback(
    (quote, text) => {
      if (navigator.share) {
        navigator.share({ title: "Daily Quotes AI", text }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() =>
          showToast("Quote copied to clipboard", "success")
        );
      } else {
        showToast("Sharing unavailable", "info");
      }
    },
    [showToast]
  );

  const value = useMemo(
    () => ({
      ...quotesApi,
      ...favoritesApi,
      ...historyApi,
      ...streakApi,
      ...themeApi,
      ...audioApi,
      toasts,
      showToast,
      dismissToast,
      handleFavorite,
      handleShare
    }),
    [quotesApi, favoritesApi, historyApi, streakApi, themeApi, audioApi, toasts, showToast, dismissToast, handleFavorite, handleShare]
  );

  return <QuoteAppContext.Provider value={value}>{children}</QuoteAppContext.Provider>;
};

/**
 * Consume the quote app context.
 * @returns {object} combined app API
 */
export const useQuoteApp = () => {
  const ctx = useContext(QuoteAppContext);
  if (!ctx) throw new Error("useQuoteApp must be used within QuoteAppProvider");
  return ctx;
};

export default QuoteAppProvider;
