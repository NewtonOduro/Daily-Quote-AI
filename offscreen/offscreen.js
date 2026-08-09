/**
 * offscreen.js
 * ------------------------------------------------------------------
 * Offscreen document handler. Receives PLAY_SOUND messages from the
 * background service worker and plays them using the Web Audio API so
 * sounds still work when the popup is closed.
 */
import { playSound } from "../utils/soundEngine";

/**
 * Handle messages forwarded from the background worker.
 * @param {MessageEvent} event
 */
const onMessage = (event) => {
  const msg = event?.data;
  if (!msg || msg.type !== "PLAY_SOUND") return;
  const { name, options } = msg.payload || {};
  playSound(name, options);
};

// Offscreen documents use runtime.onMessage (they are extension contexts).
if (typeof chrome !== "undefined" && chrome?.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === "PLAY_SOUND") {
      playSound(msg.payload?.name, msg.payload?.options);
      sendResponse && sendResponse({ ok: true });
    }
    return true;
  });
}

// Fallback for window message when used as a plain document.
window.addEventListener("message", onMessage);

export { onMessage };
