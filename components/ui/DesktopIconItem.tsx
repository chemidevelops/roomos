"use client";

import { motion } from "framer-motion";

export interface DesktopIconItemProps {
  icon: string;
  label: string;
  onDoubleClick: () => void;
  selected: boolean;
  onSelect: () => void;
}

export default function DesktopIconItem({
  icon,
  label,
  onDoubleClick,
  selected,
  onSelect,
}: DesktopIconItemProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      style={{
        width: "72px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
        cursor: "default",
        userSelect: "none",
        padding: "6px 4px",
      }}
    >
      {/* Icon */}
      <div
        style={{
          fontSize: "36px",
          lineHeight: 1,
          filter: selected ? "drop-shadow(0 0 0 #1d4ed8)" : "none",
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
          fontSize: "11px",
          fontWeight: 600,
          color: selected ? "#ffffff" : "#1a1a1a",
          background: selected ? "#1d4ed8" : "transparent",
          padding: selected ? "1px 4px" : "1px 4px",
          textAlign: "center",
          lineHeight: 1.3,
          maxWidth: "70px",
          wordBreak: "break-word",
          // Text shadow for readability on dot pattern
          textShadow: selected ? "none" : "0 1px 3px rgba(250,247,242,0.9), 0 -1px 3px rgba(250,247,242,0.9)",
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}
