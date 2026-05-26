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
          fontSize: "40px",
          lineHeight: 1,
          filter: selected
            ? "drop-shadow(0 0 8px rgba(245,200,0,0.8))"
            : "drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
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
          color: "#ffffff",
          background: selected ? "rgba(245,200,0,0.85)" : "rgba(0,0,0,0.45)",
          padding: "1px 5px",
          borderRadius: "2px",
          textAlign: "center",
          lineHeight: 1.4,
          maxWidth: "70px",
          wordBreak: "break-word",
          backdropFilter: "blur(4px)",
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}
