/**
 * setupTests.js
 * ------------------------------------------------------------------
 * Jest setup: imports jest-dom matchers and provides global mocks for
 * chrome APIs and browser globals used across the test suite.
 */
import "@testing-library/jest-dom";

/** Build a result object for a given keys argument (omits missing keys). */
const resolveKeys = (keys, data) => {
  if (typeof keys === "string") {
    // Chrome omits keys that aren't present
    return keys in data ? { [keys]: data[keys] } : {};
  }
  if (Array.isArray(keys)) {
    const out = {};
    keys.forEach((k) => {
      if (k in data) out[k] = data[k];
    });
    return out;
  }
  if (keys && typeof keys === "object") {
    const out = {};
    Object.keys(keys).forEach((k) => {
      out[k] = k in data ? data[k] : keys[k];
    });
    return out;
  }
  return { ...data };
};

/** Make a chrome.storage result object promise-compatible. */
const asPromise = (result) => {
  const p = Promise.resolve(result);
  p.get = (k) => Promise.resolve(result);
  return p;
};

/** Mock chrome.storage and runtime for the test environment. */
const storageArea = (initial = {}) => {
  const data = { ...initial };
  return {
    get: jest.fn((keys, cb) => {
      const result = resolveKeys(keys, data);
      if (typeof cb === "function") {
        cb(result);
        return undefined;
      }
      return asPromise(result);
    }),
    set: jest.fn((items, cb) => {
      Object.assign(data, items);
      if (typeof cb === "function") cb();
      return Promise.resolve();
    }),
    remove: jest.fn((keys, cb) => {
      const list = Array.isArray(keys) ? keys : [keys];
      list.forEach((k) => delete data[k]);
      if (typeof cb === "function") cb();
      return Promise.resolve();
    }),
    onChanged: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  };
};

// Shared top-level onChanged event used by subscribeStorage.
const listeners = new Set();
const storageOnChanged = {
  addListener: jest.fn((cb) => listeners.add(cb)),
  removeListener: jest.fn((cb) => listeners.delete(cb)),
  // expose trigger for tests that want to simulate changes
  _trigger: (changes, areaName) => listeners.forEach((cb) => cb(changes, areaName))
};

global.chrome = {
  storage: {
    local: storageArea(),
    sync: storageArea({ "dq.theme": "light" }),
    onChanged: storageOnChanged
  },
  runtime: {
    onInstalled: { addListener: jest.fn() },
    onMessage: { addListener: jest.fn() },
    onConnect: { addListener: jest.fn() },
    sendMessage: jest.fn(),
    getURL: jest.fn((p) => p)
  },
  notifications: {
    create: jest.fn()
  },
  alarms: {
    create: jest.fn(),
    onAlarm: { addListener: jest.fn() }
  },
  contextMenus: {
    create: jest.fn(),
    removeAll: jest.fn((cb) => cb && cb()),
    onClicked: { addListener: jest.fn() }
  },
  commands: {
    onCommand: { addListener: jest.fn() }
  },
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn()
  },
  offscreen: {
    createDocument: jest.fn().mockResolvedValue()
  },
  tabs: {
    create: jest.fn()
  }
};

// Provide a minimal navigator.clipboard mock
if (!navigator.clipboard) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: jest.fn().mockResolvedValue(), readText: jest.fn().mockResolvedValue("") },
    configurable: true
  });
}

// Mock requestAnimationFrame if missing
if (!global.requestAnimationFrame) {
  global.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
  global.cancelAnimationFrame = (id) => clearTimeout(id);
}

// Polyfill window.matchMedia (required by Framer Motion)
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  });
}

// Polyfill IntersectionObserver if missing
if (!window.IntersectionObserver) {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.IntersectionObserver = MockIntersectionObserver;
  global.IntersectionObserver = MockIntersectionObserver;
}
