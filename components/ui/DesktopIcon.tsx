"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export interface DesktopIconProps {
  icon: string;
  label: string;
  onOpen: () => void;
}

export default function DesktopIcon({ icon, label, onOpen }: DesktopIconProps) {
  const [selected, setSelected] = useState(false);
  const [lastClick, setLastClick] = useState(0);

  const handleClick = () => {
    const now = Date.now();
    if (now - lastClick < 400) {
      onOpen();
      setSelected(false);
    } else {
      setSelected(true);
    }
    setLastClick(now);
  };

  return (
    <motion.div
      onClick={handleClick}
      onBlur={() => setSelected(false)}
      tabIndex={0}
      style={{
        width: "64px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        cursor: "default",
        outline: "none",
        userSelect: "none",
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Icon */}
      <div style={{
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "28px",
        lineHeight: 1,
      }}>
        {icon}
      </div>

      {/* Label */}
      <div style={{
        background: selected ? "var(--room-blue-dim)" : "transparent",
        padding: "1px 4px",
        borderRadius: "2px",
        border: selected ? "1px dotted rgba(91,127,255,0.6)" : "1px solid transparent",
        maxWidth: "64px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        color: selected ? "white" : "var(--room-text)",
        textShadow: "0 1px 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.6)",
        textAlign: "center",
        letterSpacing: "0.02em",
      }}>
        {label}
      </div>
    </motion.div>
  );
}
