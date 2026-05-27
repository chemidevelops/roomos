"use client";

import { motion } from "framer-motion";

export interface DesktopIconItemProps {
  id: string;
  icon: string;
  label: string;
  x: number;
  y: number;
  selected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onDragEnd: (x: number, y: number) => void;
}

export default function DesktopIconItem({
  icon, label, x, y, selected, onSelect, onDoubleClick, onDragEnd,
}: DesktopIconItemProps) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onDragEnd={(_, info) => {
        onDragEnd(x + info.offset.x, y + info.offset.y);
      }}
      onPointerDown={(e) => { e.stopPropagation(); onSelect(); }}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "72px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
        cursor: "grab",
        userSelect: "none",
        padding: "6px 4px",
        touchAction: "none",
      }}
    >
      <div style={{
        fontSize: "40px",
        lineHeight: 1,
        filter: selected
          ? "drop-shadow(0 0 8px rgba(245,200,0,0.8))"
          : "drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
      }}>
        {icon}
      </div>
      <span style={{
        fontFamily: "var(--font-space-grotesk), sans-serif",
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
      }}>
        {label}
      </span>
    </motion.div>
  );
}
