"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BootSequenceProps {
  onComplete: () => void;
}

const LINES = [
  "initializing modules...",
  "loading ambient engine...",
  "ready.",
];

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState<"in" | "lines" | "out">("in");
  const [visibleLines, setVisibleLines] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Wordmark appears at t=0 (duration 0.8s)
    // Lines start staggering at t=0.8s, 0.3s each
    // Total lines done at 0.8 + 0.9 = 1.7s
    // Pause 0.5s → exit at 2.2s, fade 0.6s → complete at 2.8s

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase("lines"), 800));

    LINES.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleLines(i + 1), 800 + 300 + i * 300)
      );
    });

    // After all lines + 0.5s pause → start exit
    timers.push(
      setTimeout(() => {
        setExiting(true);
      }, 800 + 300 + (LINES.length - 1) * 300 + 500)
    );

    // After exit fade (0.6s) → call onComplete
    timers.push(
      setTimeout(() => {
        onComplete();
      }, 800 + 300 + (LINES.length - 1) * 300 + 500 + 600)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            background: "#080810",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9000,
          }}
        >
          {/* roomOS wordmark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontWeight: 300,
              fontSize: "22px",
              letterSpacing: "0.3em",
              color: "#4a9eff",
              textShadow: "0 0 30px rgba(74,158,255,0.6), 0 0 60px rgba(74,158,255,0.3)",
              marginBottom: "32px",
              userSelect: "none",
            }}
          >
            roomOS
          </motion.div>

          {/* Boot lines */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              alignItems: "center",
            }}
          >
            {LINES.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={visibleLines > i ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: "11px",
                  color: line === "ready." ? "rgba(74,158,255,0.7)" : "rgba(255,255,255,0.25)",
                  letterSpacing: "0.05em",
                  fontWeight: 400,
                }}
              >
                {line}
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="boot-exit"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            background: "#080810",
            zIndex: 9000,
            pointerEvents: "none",
          }}
        />
      )}
    </AnimatePresence>
  );
}
