/**
 * BackgroundEffects.jsx
 * ------------------------------------------------------------------
 * Ambient animated background using lightweight floating gradient
 * orbs with Framer Motion. GPU-friendly transforms only. Renders
 * behind content in both popup and options windows.
 */
import { memo } from "react";
import { motion } from "framer-motion";
import { EASINGS, DURATIONS } from "../styles/motion";
import styles from "./BackgroundEffects.module.css";

/** Orb configs: size, position, color, drift. */
const ORBS = [
  { top: "-10%", left: "-10%", size: 260, drift: 40, color: "var(--color-accent)" },
  { top: "40%", right: "-15%", size: 200, drift: 30, color: "var(--color-accent-strong)" },
  { bottom: "-15%", left: "20%", size: 240, drift: 50, color: "var(--color-info)" }
];

/**
 * BackgroundEffects component.
 * @param {object} [props]
 * @param {boolean} [props.reduced] - render a static subtle background
 */
const BackgroundEffects = memo(function BackgroundEffects({ reduced = false }) {
  return (
    <div className={styles.root} aria-hidden="true">
      {ORBS.map((orb, i) => {
        const style = {
          top: orb.top,
          left: orb.left,
          right: orb.right,
          bottom: orb.bottom,
          width: orb.size,
          height: orb.size,
          background: orb.color
        };
        return (
          <motion.div
            key={i}
            className={styles.orb}
            style={style}
            animate={
              reduced
                ? undefined
                : {
                    x: [0, orb.drift, -orb.drift, 0],
                    y: [0, -orb.drift * 0.6, orb.drift * 0.6, 0]
                  }
            }
            transition={{
              duration: 14 + i * 4,
              repeat: Infinity,
              ease: EASINGS.EASE_IN_OUT,
              delay: i * 1.5
            }}
          />
        );
      })}
      <div className={styles.gradient} />
    </div>
  );
});

export default BackgroundEffects;
