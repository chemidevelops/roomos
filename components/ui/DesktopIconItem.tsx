"use client";

import { motion } from "framer-motion";
import { RetroIcon } from "./RetroIcons";

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
  retroMode?: boolean;
}

export default function DesktopIconItem({
  id, icon, label, x, y, selected, onSelect, onDoubleClick, onDragEnd, retroMode,
}: DesktopIconItemProps) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onDragEnd={(_, info) => onDragEnd(x + info.offset.x, y + info.offset.y)}
      onPointerDown={(e) => { e.stopPropagation(); onSelect(); }}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
      onClick={(e) => { if (typeof window !== "undefined" && /AppleTV|TV Safari/.test(navigator.userAgent)) { e.stopPropagation(); onDoubleClick(); } }}
      style={{
        position: "absolute",
        top: 0, left: 0,
        width: "72px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        cursor: "grab",
        userSelect: "none",
        padding: "6px 4px",
        touchAction: "none",
      }}
    >
      {retroMode ? (
        <div style={{
          width: 40, height: 40,
          filter: selected ? "drop-shadow(0 0 4px rgba(0,0,0,0.8))" : "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
          opacity: selected ? 0.75 : 1,
        }}>
          <RetroIcon id={id} size={40} />
        </div>
      ) : (
        <div style={{
          fontSize: "40px",
          lineHeight: 1,
          filter: selected ? "drop-shadow(0 0 8px rgba(245,200,0,0.8))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
        }}>
          {icon}
        </div>
      )}

      <span style={{
        fontFamily: retroMode ? "Chicago, 'Helvetica Neue', Arial, sans-serif" : "var(--font-space-grotesk), sans-serif",
        fontSize: retroMode ? "10px" : "11px",
        fontWeight: retroMode ? 400 : 600,
        color: "#ffffff",
        background: selected
          ? (retroMode ? "#0000aa" : "rgba(245,200,0,0.85)")
          : (retroMode ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.45)"),
        padding: "1px 5px",
        borderRadius: retroMode ? 0 : "2px",
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
