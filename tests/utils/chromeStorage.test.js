/**
 * chromeStorage.test.js
 * ------------------------------------------------------------------
 * Tests for the chromeStorage wrapper: mocks chrome.storage.local and
 * tests sync event listeners.
 */
import {
  getLocal,
  setLocal,
  removeLocal,
  getSync,
  setSync,
  subscribeStorage,
  subscribeKey,
  getLocalValue,
  getSyncValue,
  isChromeAvailable
} from "../../utils/chromeStorage";

describe("chromeStorage", () => {
  beforeEach(() => {
    chrome.storage.local.set({ "test.key": "local-value" });
    chrome.storage.sync.set({ "test.syncKey": "sync-value" });
    // Reset listener mocks so call-accounting is per-test.
    chrome.storage.onChanged.addListener.mockClear();
    chrome.storage.onChanged.removeListener.mockClear();
  });

  afterEach(() => {
    // Ensure no stray listeners accumulate between tests.
    chrome.storage.onChanged.addListener.mockClear();
    chrome.storage.onChanged.removeListener.mockClear();
  });

  test("isChromeAvailable returns true in test env", () => {
    expect(isChromeAvailable()).toBe(true);
  });

  test("getLocal returns stored values", async () => {
    const result = await getLocal("test.key");
    expect(result["test.key"]).toBe("local-value");
  });

  test("getLocalValue returns fallback when missing", async () => {
    const val = await getLocalValue("missing.key", "fallback");
    expect(val).toBe("fallback");
  });

  test("getLocalValue returns stored value", async () => {
    const val = await getLocalValue("test.key", "fallback");
    expect(val).toBe("local-value");
  });

  test("setLocal writes values", async () => {
    await setLocal({ "test.new": 123 });
    const result = await getLocal("test.new");
    expect(result["test.new"]).toBe(123);
  });

  test("removeLocal removes keys", async () => {
    await removeLocal("test.key");
    const result = await getLocal("test.key");
    expect(result["test.key"]).toBeUndefined();
  });

  test("getSync returns sync values", async () => {
    const result = await getSync("test.syncKey");
    expect(result["test.syncKey"]).toBe("sync-value");
  });

  test("getSyncValue returns fallback when missing", async () => {
    const val = await getSyncValue("missing.sync", "fb");
    expect(val).toBe("fb");
  });

  test("setSync writes values", async () => {
    await setSync({ "test.syncNew": "x" });
    const result = await getSync("test.syncNew");
    expect(result["test.syncNew"]).toBe("x");
  });

  test("subscribeStorage registers a listener and returns unsubscribe", () => {
    const cb = jest.fn();
    const unsubscribe = subscribeStorage(cb);
    // subscribeStorage uses the top-level chrome.storage.onChanged API
    expect(chrome.storage.onChanged.addListener).toHaveBeenCalledTimes(1);
    expect(typeof unsubscribe).toBe("function");
    unsubscribe();
    expect(chrome.storage.onChanged.removeListener).toHaveBeenCalledTimes(1);
  });

  test("subscribeKey filters by key and calls with new value", () => {
    const cb = jest.fn();
    subscribeKey("some.key", cb);
    // Simulate a change event via the top-level onChanged handler.
    const handler = chrome.storage.onChanged.addListener.mock.calls[0][0];
    handler({ "some.key": { newValue: 42 } }, "local");
    expect(cb).toHaveBeenCalledWith(42);
    handler({ "other.key": { newValue: 1 } }, "local");
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
