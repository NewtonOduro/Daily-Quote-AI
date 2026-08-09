/**
 * static/offscreen.js
 * ------------------------------------------------------------------
 * Offscreen document handler (bundled via Plasmo's `static/` folder).
 * Receives PLAY_SOUND messages from the background service worker and
 * plays them using the Web Audio API so sounds work when the popup is
 * closed. This is a self-contained copy (no module imports) so it can
 * be loaded directly in the offscreen document.
 */
const SOUND_PATTERNS = {
  favorite: [
    [523.25, 0.12, 0.18],
    [659.25, 0.12, 0.16]
  ],
  share: [
    [392.0, 0.1, 0.16],
    [440.0, 0.1, 0.14],
    [523.25, 0.16, 0.16]
  ],
  copy: [
    [329.63, 0.08, 0.14],
    [392.0, 0.08, 0.14]
  ],
  success: [
    [261.63, 0.1, 0.12],
    [329.63, 0.1, 0.12],
    [392.0, 0.1, 0.12],
    [523.25, 0.2, 0.2]
  ],
  error: [
    [329.63, 0.15, 0.14],
    [293.66, 0.15, 0.14],
    [261.63, 0.2, 0.16]
  ],
  tick: [[440.0, 0.05, 0.08]],
  levelUp: [
    [523.25, 0.1, 0.14],
    [659.25, 0.1, 0.14],
    [783.99, 0.1, 0.14],
    [523.25, 0.24, 0.2]
  ]
};

let audioCtx = null;

/** Lazily create the AudioContext. */
function getContext() {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

/** Play a single oscillator tone. */
function tone(ctx, freq, start, duration, volume, type) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
}

/** Play a named sound. */
async function playSound(name, options) {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") await ctx.resume();
  const pattern = SOUND_PATTERNS[name] || SOUND_PATTERNS.tick;
  let t = 0;
  const vol = (options && options.volume) || 1;
  pattern.forEach(([freq, dur, v]) => {
    tone(ctx, freq, t, dur, vol * v, "sine");
    t += dur * 0.85;
  });
}

/** Handle runtime messages from the background worker. */
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === "PLAY_SOUND") {
      playSound(msg.payload && msg.payload.name, msg.payload && msg.payload.options);
      sendResponse && sendResponse({ ok: true });
    }
    return true;
  });
}

self.addEventListener("message", (event) => {
  const msg = event && event.data;
  if (msg && msg.type === "PLAY_SOUND") {
    playSound(msg.payload && msg.payload.name, msg.payload && msg.payload.options);
  }
});
