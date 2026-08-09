/**
 * soundEngine.js
 * ------------------------------------------------------------------
 * Web Audio API sound engine. Generates pleasant, short synthesized
 * tones for UI feedback (favorite, share, copy, success, error, tick,
 * levelUp). Designed to be lightweight and dependency-free.
 *
 * When the popup is closed, the background service worker can use the
 * offscreen document to play sounds via message passing (see
 * offscreen/offscreen.js). This module also exposes a pure tone
 * generator usable in both contexts.
 */
import { SOUNDS } from "./constants";

/** Shared AudioContext (lazy). */
let audioCtx = null;

/**
 * Lazily create and return the shared AudioContext.
 * @returns {AudioContext|null} null when AudioContext unsupported
 */
const getContext = () => {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
};

/**
 * Play a single oscillator tone.
 * @param {AudioContext} ctx
 * @param {number} freq frequency in Hz
 * @param {number} start relative start time (s)
 * @param {number} duration (s)
 * @param {number} volume 0..1
 * @param {string} type oscillator type
 */
const tone = (ctx, freq, start, duration, volume = 0.2, type = "sine") => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
};

/** Note frequencies for a small pentatonic set (C major vibe). */
const NOTE = Object.freeze({
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392.0,
  A4: 440.0,
  C5: 523.25,
  E5: 659.25,
  A5: 880.0
});

/**
 * Signature mapping from SOUNDS constants to tone sequences.
 * @type {Record<string, Array<[number, number, number]>>} freq, dur, vol
 */
const PATTERNS = Object.freeze({
  [SOUNDS.FAVORITE]: [
    [NOTE.C5, 0.12, 0.18],
    [NOTE.E5, 0.12, 0.16]
  ],
  [SOUNDS.SHARE]: [
    [NOTE.G4, 0.1, 0.16],
    [NOTE.A4, 0.1, 0.14],
    [NOTE.C5, 0.16, 0.16]
  ],
  [SOUNDS.COPY]: [
    [NOTE.E4, 0.08, 0.14],
    [NOTE.G4, 0.08, 0.14]
  ],
  [SOUNDS.SUCCESS]: [
    [NOTE.C4, 0.1, 0.12],
    [NOTE.E4, 0.1, 0.12],
    [NOTE.G4, 0.1, 0.12],
    [NOTE.C5, 0.2, 0.2]
  ],
  [SOUNDS.ERROR]: [
    [NOTE.E4, 0.15, 0.14],
    [NOTE.D4, 0.15, 0.14],
    [NOTE.C4, 0.2, 0.16]
  ],
  [SOUNDS.TICK]: [[NOTE.A4, 0.05, 0.08]],
  [SOUNDS.LEVEL_UP]: [
    [NOTE.C5, 0.1, 0.14],
    [NOTE.E5, 0.1, 0.14],
    [NOTE.G5 > 0 ? 783.99 : 783.99, 0.1, 0.14],
    [NOTE.C5, 0.24, 0.2]
  ]
});

/**
 * Play a named sound effect using the Web Audio API.
 * @param {string} name one of SOUNDS values
 * @param {object} [options] {volume}
 * @returns {Promise<void>}
 */
export const playSound = async (name, options = {}) => {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") await ctx.resume();
  const pattern = PATTERNS[name] || PATTERNS[SOUNDS.TICK];
  let t = 0;
  pattern.forEach(([freq, dur, vol]) => {
    tone(ctx, freq, t, dur, (options.volume ?? 1) * vol, "sine");
    t += dur * 0.85;
  });
};

/**
 * Forward a sound request to the offscreen document (used when the
 * popup is closed). Sends a message; offscreen plays the sound.
 * @param {string} name
 * @param {object} [options]
 * @returns {Promise<void>}
 */
export const playSoundInBackground = async (name, options = {}) => {
  if (typeof chrome === "undefined" || !chrome?.runtime?.sendMessage) return;
  try {
    await chrome.runtime.sendMessage({ type: "PLAY_SOUND", payload: { name, options } });
  } catch (e) {
    /* message failure is non-fatal */
  }
};

/**
 * Play the default success chime.
 * @returns {Promise<void>}
 */
export const playSuccess = () => playSound(SOUNDS.SUCCESS);

/**
 * Play the default error buzz.
 * @returns {Promise<void>}
 */
export const playError = () => playSound(SOUNDS.ERROR);

export default { playSound, playSoundInBackground, playSuccess, playError, SOUNDS };
