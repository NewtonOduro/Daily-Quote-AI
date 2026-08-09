/**
 * useAudioEffects.js
 * ------------------------------------------------------------------
 * Audio effects hook. Provides a play() wrapper that respects the
 * user's "sounds enabled" preference and delegates to the sound engine.
 */
import { useCallback, useEffect, useState } from "react";
import { playSound } from "../utils/soundEngine";
import { getSyncValue, setSync } from "../utils/chromeStorage";
import { STORAGE_KEYS } from "../utils/constants";

/** Storage key for sounds enabled. */
const KEY = STORAGE_KEYS.SYNC_SOUNDS;

/**
 * Audio effects hook.
 * @returns {{ soundsEnabled: boolean, setSoundsEnabled: Function, play: Function }}
 */
export const useAudioEffects = () => {
  const [soundsEnabled, setEnabled] = useState(true);

  /** Load preference on mount. */
  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await getSyncValue(KEY, true);
      if (mounted) setEnabled(stored !== false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Play a sound effect if sounds are enabled.
   * @param {string} name
   * @param {object} [options]
   * @returns {Promise<void>}
   */
  const play = useCallback(
    async (name, options = {}) => {
      if (!soundsEnabled) return;
      await playSound(name, options);
    },
    [soundsEnabled]
  );

  /**
   * Update the sounds-enabled preference.
   * @param {boolean} value
   */
  const setSoundsEnabled = useCallback(async (value) => {
    setEnabled(value);
    await setSync({ [KEY]: value });
  }, []);

  return { soundsEnabled, setSoundsEnabled, play };
};

export default useAudioEffects;
