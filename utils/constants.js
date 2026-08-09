/**
 * constants.js
 * ------------------------------------------------------------------
 * Central registry for every global constant used across Daily Quotes
 * AI. No magic numbers anywhere else in the codebase.
 */

/** Storage keys for chrome.storage.sync (user preferences). */
export const STORAGE_KEYS = Object.freeze({
  SYNC_THEME: "dq.theme",
  SYNC_HOTKEYS: "dq.hotkeys",
  SYNC_API_KEY: "dq.apiKey",
  SYNC_NOTIFICATIONS: "dq.notificationsEnabled",
  SYNC_SOUNDS: "dq.soundsEnabled",
  SYNC_LAST_VIEWED: "dq.lastViewedToast",
  LOCAL_QUOTE_OF_DAY: "dq.quoteOfDay",
  LOCAL_QUOTES: "dq.quotes",
  LOCAL_FAVORITES: "dq.favorites",
  LOCAL_HISTORY: "dq.history",
  LOCAL_STATS: "dq.stats",
  LOCAL_STREAK: "dq.streak",
  LOCAL_ACHIEVEMENTS: "dq.achievements",
  LOCAL_LAST_OPEN: "dq.lastOpenedAt",
  LOCAL_CONTEXT_QUOTES: "dq.contextQuotes"
});

/** Supported themes matching themes.css data-theme values. */
export const THEMES = Object.freeze([
  { id: "light", label: "Light", emoji: "🌤" },
  { id: "dark", label: "Dark", emoji: "🌙" },
  { id: "amoled", label: "AMOLED", emoji: "⚫" },
  { id: "sunset", label: "Sunset Glow", emoji: "🌅" },
  { id: "ocean", label: "Ocean Depth", emoji: "🌊" },
  { id: "forest", label: "Forest Chill", emoji: "🌲" }
]);

/** Default theme id. */
export const DEFAULT_THEME = "dark";

/** Toast duration in milliseconds. */
export const TOAST_DURATION = 3000;

/** Streak milestone thresholds for achievements. */
export const STREAK_MILESTONES = Object.freeze([3, 7, 14, 30, 60, 100]);

/** Alarm identifiers. */
export const ALARMS = Object.freeze({
  DAILY_QUOTE_RESET: "dailyQuoteReset"
});

/** Notification identifiers. */
export const NOTIFICATIONS = Object.freeze({
  DAILY_QUOTE: "dailyQuoteNotification",
  STREAK_MILESTONE: "streakMilestoneNotification"
});

/** Command identifiers registered in manifest.json. */
export const COMMANDS = Object.freeze({
  OPEN_POPUP: "_execute_action",
  NEXT_QUOTE: "next_quote",
  FAVORITE_QUOTE: "favorite_quote"
});

/** Context menu identifier. */
export const CONTEXT_MENU_IDS = Object.freeze({
  SAVE_AS_QUOTE: "saveSelectionAsQuote"
});

/** howLongSinceLastOpen threshold to consider a new day (hours). */
export const NEW_DAY_THRESHOLD_HOURS = 12;

/** Offscreen document path (bundled from static/ by Plasmo). */
export const OFFSCREEN_DOCUMENT_PATH = "offscreen.html";

/** Web Audio sound identifiers. */
export const SOUNDS = Object.freeze({
  FAVORITE: "favorite",
  SHARE: "share",
  COPY: "copy",
  SUCCESS: "success",
  ERROR: "error",
  TICK: "tick",
  LEVEL_UP: "levelUp"
});

/** Default AI model + endpoint for optional AI generation. */
export const AI_CONFIG = Object.freeze({
  ENDPOINT: "https://api.openai.com/v1/chat/completions",
  MODEL: "gpt-3.5-turbo",
  MAX_TOKENS: 120,
  TEMPERATURE: 0.9
});

/** Maximum number of history entries retained. */
export const MAX_HISTORY_LENGTH = 200;

/** Maximum number of favorites retained. */
export const MAX_FAVORITES_LENGTH = 500;

/** Default page titles used in the options area. */
export const PAGE_TITLES = Object.freeze({
  HOME: "Daily Quote",
  FAVORITES: "Favorites",
  HISTORY: "History",
  STATISTICS: "Statistics",
  SETTINGS: "Settings",
  AI_STUDIO: "AI Studio"
});

/** Daily reminders default state. */
export const DEFAULT_PREFERENCES = Object.freeze({
  [STORAGE_KEYS.SYNC_THEME]: DEFAULT_THEME,
  [STORAGE_KEYS.SYNC_NOTIFICATIONS]: true,
  [STORAGE_KEYS.SYNC_SOUNDS]: true
});
