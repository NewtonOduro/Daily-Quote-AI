/**
 * useStreak.js
 * ------------------------------------------------------------------
 * Streak tracking hook. Computes the current consecutive-day streak
 * based on the last-visited date, updates it on each open, and flags
 * whether a streak milestone was just reached.
 *
 * Storage shape (LOCAL_STREAK):
 * { current: number, best: number, lastVisit: "YYYY-MM-DD" }
 */
import { useCallback, useEffect, useState } from "react";
import { getLocalValue, setLocal } from "../utils/chromeStorage";
import { STORAGE_KEYS, STREAK_MILESTONES } from "../utils/constants";
import { todayStamp } from "./useQuotes";

/** Storage key for streak. */
const KEY = STORAGE_KEYS.LOCAL_STREAK;

/** Default streak object. */
const DEFAULT_STREAK = Object.freeze({ current: 0, best: 0, lastVisit: null });

/**
 * Compute the difference in whole days between two YYYY-MM-DD stamps.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
const dayDiff = (a, b) => {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db - da) / 86400000);
};

/**
 * Streak hook.
 * @returns {{
 *   streak: {current: number, best: number, lastVisit: string|null},
 *   isLoading: boolean,
 *   milestoneReached: number|null,
 *   refreshStreak: Function,
 *   bestStreak: number
 * }}
 */
export const useStreak = () => {
  const [streak, setStreak] = useState(DEFAULT_STREAK);
  const [isLoading, setIsLoading] = useState(true);
  const [milestoneReached, setMilestoneReached] = useState(null);

  /** Evaluate and update the streak based on today's date. */
  const refreshStreak = useCallback(async () => {
    const stamp = todayStamp();
    const stored = await getLocalValue(KEY, DEFAULT_STREAK);
    const current = stored.current || 0;
    const best = stored.best || 0;
    const lastVisit = stored.lastVisit || null;

    let next = { current, best, lastVisit };
    let milestone = null;

    if (lastVisit === stamp) {
      // Already visited today; no change.
      next = { current, best, lastVisit: stamp };
    } else if (lastVisit === null) {
      // First ever visit.
      next = { current: 1, best: Math.max(1, best), lastVisit: stamp };
    } else {
      const diff = dayDiff(lastVisit, stamp);
      if (diff === 1) {
        const newCurrent = current + 1;
        next = { current: newCurrent, best: Math.max(best, newCurrent), lastVisit: stamp };
        if (STREAK_MILESTONES.includes(newCurrent)) milestone = newCurrent;
      } else if (diff > 1) {
        // Streak broken.
        next = { current: 1, best, lastVisit: stamp };
      }
      // diff===0 caught by lastVisit===stamp above.
    }

    await setLocal({ [KEY]: next });
    setStreak(next);
    setMilestoneReached(milestone);
    return { streak: next, milestone };
  }, []);

  /** Run on mount. */
  useEffect(() => {
    let mounted = true;
    (async () => {
      await refreshStreak();
      if (mounted) setIsLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [refreshStreak]);

  return {
    streak,
    isLoading,
    milestoneReached,
    refreshStreak,
    bestStreak: streak.best
  };
};

export default useStreak;
