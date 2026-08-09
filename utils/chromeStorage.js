/**
 * chromeStorage.js
 * ------------------------------------------------------------------
 * Wrapper modules around chrome.storage.sync and chrome.storage.local.
 * Provides promisified get/set/remove plus a subscription helper so
 * hooks can react to background changes. All reads/writes are safe in
 * environments where chrome.storage is unavailable (e.g. tests).
 */
import { STORAGE_KEYS } from "./constants";

/** True when running inside a Chromium extension context. */
export const isChromeAvailable = () =>
  typeof chrome !== "undefined" && !!chrome?.storage;

/**
 * Promisified chrome.storage.local.get.
 * @param {string|string[]|object} [keys]
 * @returns {Promise<object>}
 */
export const getLocal = (keys) =>
  new Promise((resolve) => {
    if (!isChromeAvailable()) return resolve({});
    chrome.storage.local.get(keys, (result) => resolve(result || {}));
  });

/**
 * Promisified chrome.storage.local.set.
 * @param {object} items
 * @returns {Promise<void>}
 */
export const setLocal = (items) =>
  new Promise((resolve) => {
    if (!isChromeAvailable()) return resolve();
    chrome.storage.local.set(items, () => resolve());
  });

/**
 * Promisified chrome.storage.local.remove.
 * @param {string|string[]} keys
 * @returns {Promise<void>}
 */
export const removeLocal = (keys) =>
  new Promise((resolve) => {
    if (!isChromeAvailable()) return resolve();
    chrome.storage.local.remove(keys, () => resolve());
  });

/**
 * Promisified chrome.storage.sync.get.
 * @param {string|string[]|object} [keys]
 * @returns {Promise<object>}
 */
export const getSync = (keys) =>
  new Promise((resolve) => {
    if (!isChromeAvailable()) return resolve({});
    chrome.storage.sync.get(keys, (result) => resolve(result || {}));
  });

/**
 * Promisified chrome.storage.sync.set.
 * @param {object} items
 * @returns {Promise<void>}
 */
export const setSync = (items) =>
  new Promise((resolve) => {
    if (!isChromeAvailable()) return resolve();
    chrome.storage.sync.set(items, () => resolve());
  });

/**
 * Promisified chrome.storage.sync.remove.
 * @param {string|string[]} keys
 * @returns {Promise<void>}
 */
export const removeSync = (keys) =>
  new Promise((resolve) => {
    if (!isChromeAvailable()) return resolve();
    chrome.storage.sync.remove(keys, () => resolve());
  });

/**
 * Subscribe to storage changes across both sync and local areas.
 * @param {Function} callback invoked with (changes, areaName)
 * @returns {Function} unsubscribe function
 */
export const subscribeStorage = (callback) => {
  if (!isChromeAvailable()) return () => {};
  const handler = (changes, areaName) => callback(changes, areaName);
  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
};

/**
 * Subscribe to a single storage key change.
 * @param {string} key
 * @param {Function} callback receives newValue
 * @returns {Function} unsubscribe
 */
export const subscribeKey = (key, callback) =>
  subscribeStorage((changes) => {
    if (changes[key]) callback(changes[key].newValue);
  });

/**
 * Read a single local value with a fallback.
 * @param {string} key
 * @param {*} fallback
 * @returns {Promise<*>}
 */
export const getLocalValue = async (key, fallback) => {
  const result = await getLocal(key);
  return key in result ? result[key] : fallback;
};

/**
 * Read a single sync value with a fallback.
 * @param {string} key
 * @param {*} fallback
 * @returns {Promise<*>}
 */
export const getSyncValue = async (key, fallback) => {
  const result = await getSync(key);
  return key in result ? result[key] : fallback;
};

export default {
  getLocal,
  setLocal,
  removeLocal,
  getSync,
  setSync,
  removeSync,
  subscribeStorage,
  subscribeKey,
  getLocalValue,
  getSyncValue,
  isChromeAvailable
};
