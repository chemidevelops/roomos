"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) {
    return (
      <div
        className="select-none"
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: "clamp(64px, 18vw, 96px)",
          fontWeight: 300,
          color: "#e8e8f2",
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        --:--
      </div>
    );
  }

  const hours = pad(time.getHours());
  const minutes = pad(time.getMinutes());

  const dateStr = time.toLocaleDateString("es-ES", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  // Capitalize first letter
  const dateLabel =
    dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  return (
    <motion.div
      className="flex flex-col items-center"
      style={{ gap: "8px" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Clock digits */}
      <div
        className="select-none"
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: "clamp(64px, 18vw, 96px)",
          fontWeight: 300,
          letterSpacing: "-0.04em",
          color: "white",
          lineHeight: 1,
          textShadow: "0 0 40px rgba(74,158,255,0.3)",
        }}
      >
        {hours}
        <motion.span
          animate={{ opacity: [1, 0.15, 1] }}
          transition={{ duration: 1, ease: "easeInOut", repeat: Infinity }}
          style={{ color: "#4a9eff" }}
        >
          :
        </motion.span>
        {minutes}
      </div>

      {/* Date */}
      <p
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          color: "rgba(255,255,255,0.35)",
          fontSize: "14px",
          letterSpacing: "0.08em",
          fontWeight: 300,
          margin: 0,
        }}
      >
        {dateLabel}
      </p>
    </motion.div>
  );
}
