"use client";

import { motion } from "framer-motion";

interface AmbientBarProps {
  artist?: string;
  track?: string;
}

export default function AmbientBar({
  artist = "Bonobo",
  track = "Kong",
}: AmbientBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      style={{
        background: "rgba(15,15,26,0.65)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(200,169,110,0.1)",
        borderRadius: "14px",
        padding: "10px 16px",
        boxShadow: "0 0 24px rgba(200,169,110,0.06), 0 4px 20px rgba(0,0,0,0.3)",
      }}
      className="flex items-center gap-3 w-full"
    >
      {/* Animated pulse dot */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className="pulse-dot"
          style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#c8a96e",
            boxShadow: "0 0 8px rgba(200,169,110,0.8)",
          }}
        />
      </div>

      {/* Track info */}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <span
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: "11px",
            color: "#7878a0",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          Now Playing
        </span>
        <span style={{ color: "#404060", fontSize: "11px", margin: "0 2px" }}>—</span>
        <span
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: "12px",
            color: "#c8a96e",
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {artist}
        </span>
        <span
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: "12px",
            color: "#7878a0",
            whiteSpace: "nowrap",
          }}
        >
          · {track}
        </span>
      </div>

      {/* Waveform visualization */}
      <div className="flex items-end gap-0.5 shrink-0 h-4">
        {[3, 7, 5, 10, 6, 4, 8].map((h, i) => (
          <motion.div
            key={i}
            style={{
              width: "2px",
              background: "rgba(200,169,110,0.5)",
              borderRadius: "1px",
              height: `${h}px`,
            }}
            animate={{ height: [`${h}px`, `${Math.max(2, h * 0.4)}px`, `${h}px`] }}
            transition={{
              duration: 0.8 + i * 0.15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
