/**
 * background/index.js
 * ------------------------------------------------------------------
 * Manifest V3 service worker for Daily Quotes AI.
 *
 * Responsibilities:
 *  - chrome.runtime.onInstalled: seed default storage, set badge, open
 *    onboarding tab.
 *  - chrome.commands: next_quote / favorite_quote handlers.
 *  - chrome.contextMenus: "Save text as Daily Quote".
 *  - chrome.alarms: dailyQuoteReset at midnight — rotate Quote of the
 *    Day, evaluate streaks, send daily notification.
 *  - chrome.notifications: daily quote + milestone alerts.
 *  - chrome.offscreen: manage offscreen document for Web Audio when
 *    popup is closed.
 *  - chrome.runtime.onMessage: PLAY_SOUND, NEXT_QUOTE, FAVORITE_QUOTE,
 *    GET_QUOTE_OF_DAY.
 */
import {
  STORAGE_KEYS,
  DEFAULT_PREFERENCES,
  ALARMS,
  NOTIFICATIONS,
  COMMANDS,
  CONTEXT_MENU_IDS,
  OFFSCREEN_DOCUMENT_PATH,
  STREAK_MILESTONES,
  PAGE_TITLES
} from "../utils/constants";
import {
  getLocal,
  setLocal,
  getSync,
  setSync
} from "../utils/chromeStorage";

/** @type {boolean} guards against duplicate offscreen creation. */
let hasOffscreen = false;

/**
 * Build today's YYYY-MM-DD date stamp (local timezone).
 * @returns {string}
 */
const dateStamp = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * Compute deterministic seeded index for quote of the day.
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
 * Load the bundled quote dataset (imported at build time).
 */
const loadQuotes = async () => {
  const data = await import("../data/quotes.json");
  return data.default.quotes;
};

/**
 * Set the extension action badge text and color.
 * @param {string} text
 */
const setBadge = (text) => {
  if (!chrome?.action) return;
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color: "#4f46e5" });
};

/**
 * Ensure the offscreen document exists for audio playback.
 * @returns {Promise<void>}
 */
const ensureOffscreen = async () => {
  if (hasOffscreen || !chrome?.offscreen) return;
  try {
    await chrome.offscreen.createDocument({
      url: chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH),
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play notification and feedback sounds."
    });
    hasOffscreen = true;
  } catch (e) {
    // Offscreen may already exist; ignore.
  }
};

/**
 * Send a message to the offscreen document to play a sound.
 * @param {string} name
 */
const playSoundOffscreen = async (name) => {
  try {
    await ensureOffscreen();
    if (chrome?.runtime?.sendMessage) {
      await chrome.runtime.sendMessage({ type: "PLAY_SOUND", payload: { name } });
    }
  } catch (e) {
    /* non-fatal */
  }
};

/**
 * Seed default storage on install/update.
 * @returns {Promise<void>}
 */
const initializeDefaults = async () => {
  const [sync, local] = await Promise.all([getSync(null), getLocal(null)]);
  const syncUpdates = {};
  const localUpdates = {};
  const stamp = dateStamp();

  Object.entries(DEFAULT_PREFERENCES).forEach(([key, val]) => {
    if (!(key in (sync || {}))) syncUpdates[key] = val;
  });

  if (!(STORAGE_KEYS.LOCAL_QUOTE_OF_DAY in (local || {}))) {
    const quotes = await loadQuotes();
    const index = seededIndex(stamp, quotes.length);
    localUpdates[STORAGE_KEYS.LOCAL_QUOTE_OF_DAY] = { date: stamp, quote: quotes[index] };
  }

  if (!(STORAGE_KEYS.LOCAL_FAVORITES in (local || {}))) {
    localUpdates[STORAGE_KEYS.LOCAL_FAVORITES] = [];
  }
  if (!(STORAGE_KEYS.LOCAL_HISTORY in (local || {}))) {
    localUpdates[STORAGE_KEYS.LOCAL_HISTORY] = [];
  }
  if (!(STORAGE_KEYS.LOCAL_ACHIEVEMENTS in (local || {}))) {
    localUpdates[STORAGE_KEYS.LOCAL_ACHIEVEMENTS] = [];
  }
  if (!(STORAGE_KEYS.LOCAL_STATS in (local || {}))) {
    localUpdates[STORAGE_KEYS.LOCAL_STATS] = {
      totalViewed: 0,
      totalFavorites: 0,
      lastUpdated: stamp
    };
  }
  if (!(STORAGE_KEYS.LOCAL_STREAK in (local || {}))) {
    localUpdates[STORAGE_KEYS.LOCAL_STREAK] = {
      current: 0,
      best: 0,
      lastVisit: null
    };
  }

  if (Object.keys(syncUpdates).length) await setSync(syncUpdates);
  if (Object.keys(localUpdates).length) await setLocal(localUpdates);
};

/**
 * Rotate the Quote of the Day (called by midnight alarm).
 * @returns {Promise<void>}
 */
const rotateQuoteOfDay = async () => {
  const quotes = await loadQuotes();
  const stamp = dateStamp();
  const index = seededIndex(stamp, quotes.length);
  const quote = quotes[index];
  await setLocal({ [STORAGE_KEYS.LOCAL_QUOTE_OF_DAY]: { date: stamp, quote } });
  return quote;
};

/**
 * Evaluate streak on daily reset and notify on milestones.
 * @returns {Promise<void>}
 */
const evaluateStreak = async () => {
  const local = await getLocal(STORAGE_KEYS.LOCAL_STREAK);
  const streak = local[STORAGE_KEYS.LOCAL_STREAK] || { current: 0, best: 0, lastVisit: null };
  let current = streak.current || 0;
  let best = streak.best || 0;
  const lastVisit = streak.lastVisit;

  if (lastVisit === dateStamp()) return;

  if (lastVisit) {
    const last = new Date(lastVisit + "T00:00:00");
    const today = new Date(dateStamp() + "T00:00:00");
    const diff = Math.round((today - last) / 86400000);
    if (diff === 1) {
      current += 1;
      best = Math.max(best, current);
    } else if (diff > 1) {
      current = 1;
    }
  } else {
    current = 1;
    best = Math.max(best, current);
  }

  await setLocal({
    [STORAGE_KEYS.LOCAL_STREAK]: { current, best, lastVisit: dateStamp() }
  });

  if (STREAK_MILESTONES.includes(current)) {
    const prefs = await getSync(STORAGE_KEYS.SYNC_NOTIFICATIONS);
    if (prefs[STORAGE_KEYS.SYNC_NOTIFICATIONS] !== false) {
      chrome.notifications?.create(NOTIFICATIONS.STREAK_MILESTONE, {
        type: "basic",
        iconUrl: chrome?.runtime?.getURL("assets/icon-128.png"),
        title: "🔥 Streak Milestone",
        message: `You've reached a ${current}-day streak! Keep going.`
      });
      await playSoundOffscreen("levelUp");
    }
  }
};

/**
 * Send the daily quote notification.
 * @returns {Promise<void>}
 */
const sendDailyNotification = async () => {
  const prefs = await getSync(STORAGE_KEYS.SYNC_NOTIFICATIONS);
  if (prefs[STORAGE_KEYS.SYNC_NOTIFICATIONS] === false) return;
  const local = await getLocal(STORAGE_KEYS.LOCAL_QUOTE_OF_DAY);
  const qod = local[STORAGE_KEYS.LOCAL_QUOTE_OF_DAY]?.quote;
  if (!qod) return;
  chrome.notifications?.create(NOTIFICATIONS.DAILY_QUOTE, {
    type: "basic",
    iconUrl: chrome?.runtime?.getURL("assets/icon-128.png"),
    title: "☀️ Daily Quotes AI",
    message: `"${qod.text}" — ${qod.author}`
  });
  await playSoundOffscreen("success");
};

/**
 * Save arbitrary text as a quote (context menu action).
 * @param {string} selectionText
 * @returns {Promise<void>}
 */
const saveTextAsQuote = async (selectionText) => {
  const stamped = {
    id: `ctx-${Date.now()}`,
    text: selectionText,
    author: "Saved selection",
    category: "context",
    savedAt: Date.now()
  };
  const local = await getLocal(STORAGE_KEYS.LOCAL_CONTEXT_QUOTES);
  const existing = local[STORAGE_KEYS.LOCAL_CONTEXT_QUOTES] || [];
  await setLocal({
    [STORAGE_KEYS.LOCAL_CONTEXT_QUOTES]: [stamped, ...existing].slice(0, 200)
  });
  chrome.notifications?.create("contextSaved", {
    type: "basic",
    iconUrl: chrome?.runtime?.getURL("assets/icon-128.png"),
    title: "Saved to Daily Quotes",
    message: "Your highlighted text was saved as a quote."
  });
};

/** Register context menu. */
const registerContextMenu = () => {
  if (!chrome?.contextMenus) return;
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_IDS.SAVE_AS_QUOTE,
      title: "Save text as Daily Quote",
      contexts: ["selection"]
    });
  });
};

/** Register midnight alarm. */
const registerAlarm = () => {
  if (!chrome?.alarms) return;
  chrome.alarms.create(ALARMS.DAILY_QUOTE_RESET, {
    when: (() => {
      const next = new Date();
      next.setHours(24, 0, 0, 0);
      return next.getTime();
    })(),
    periodInMinutes: 24 * 60
  });
};

/** Handle command triggers. */
const onCommand = async (command) => {
  if (command === COMMANDS.NEXT_QUOTE) {
    const local = await getLocal("pendingNextQuote");
    // Notify the popup if open.
    await chrome.runtime?.sendMessage({ type: "COMMAND_NEXT_QUOTE" });
  } else if (command === COMMANDS.FAVORITE_QUOTE) {
    await chrome.runtime?.sendMessage({ type: "COMMAND_FAVORITE_QUOTE" });
  }
};

/** Handle context menu clicks. */
const onContextMenuClicked = (info) => {
  if (info.menuItemId === CONTEXT_MENU_IDS.SAVE_AS_QUOTE && info.selectionText) {
    saveTextAsQuote(info.selectionText);
  }
};

/** Handle messages from popup/options. */
const onMessage = (msg, sender, sendResponse) => {
  switch (msg?.type) {
    case "PLAY_SOUND":
      playSoundOffscreen(msg.payload?.name);
      sendResponse({ ok: true });
      break;
    case "NEXT_QUOTE":
      sendResponse({ type: "COMMAND_NEXT_QUOTE" });
      break;
    case "FAVORITE_QUOTE":
      sendResponse({ type: "COMMAND_FAVORITE_QUOTE" });
      break;
    case "GET_QUOTE_OF_DAY":
      (async () => {
        const local = await getLocal(STORAGE_KEYS.LOCAL_QUOTE_OF_DAY);
        sendResponse({ quote: local[STORAGE_KEYS.LOCAL_QUOTE_OF_DAY] });
      })();
      return true;
    default:
      sendResponse({ ok: false });
  }
  return true;
};

/** Open onboarding on install. */
const onInstalled = async (details) => {
  if (details.reason === "install") {
    await initializeDefaults();
    setBadge("1");
    ensureOffscreen();
    const url = chrome?.runtime?.getURL("options.html#welcome");
    chrome?.tabs?.create({ url });
    registerAlarm();
    registerContextMenu();
  } else if (details.reason === "update") {
    await initializeDefaults();
    registerAlarm();
    registerContextMenu();
  }
};

/** Alarm handler. */
const onAlarm = (alarm) => {
  if (alarm.name === ALARMS.DAILY_QUOTE_RESET) {
    (async () => {
      await rotateQuoteOfDay();
      await evaluateStreak();
      await sendDailyNotification();
    })();
  }
};

/** Wire up all listeners. */
const init = () => {
  chrome?.runtime?.onInstalled?.addListener(onInstalled);
  chrome?.commands?.onCommand?.addListener(onCommand);
  chrome?.contextMenus?.onClicked?.addListener(onContextMenuClicked);
  chrome?.alarms?.onAlarm?.addListener(onAlarm);
  chrome?.runtime?.onMessage?.addListener(onMessage);
  // Register alarm & menu on worker wake too.
  if (chrome?.alarms) registerAlarm();
  if (chrome?.contextMenus) registerContextMenu();
};

init();

// Keep worker alive via alarm-driven wake; export for tests.
export {
  initializeDefaults,
  rotateQuoteOfDay,
  evaluateStreak,
  dateStamp,
  PAGE_TITLES
};
