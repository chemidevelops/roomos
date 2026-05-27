"use client";

import { motion } from "framer-motion";

export type StickyColor = "yellow" | "pink" | "green" | "blue";

export interface StickyData {
  id: string;
  content: string;
  color: StickyColor;
  x: number;
  y: number;
  title?: string;
}

const COLOR_MAP: Record<StickyColor, { bg: string; tint: string; name: string }> = {
  yellow: { bg: "#f5c800", tint: "rgba(245,200,0,0.15)", name: "Yellow" },
  pink:   { bg: "#f9a8d4", tint: "rgba(249,168,212,0.15)", name: "Pink" },
  green:  { bg: "#bbf7d0", tint: "rgba(187,247,208,0.15)", name: "Green" },
  blue:   { bg: "#bfdbfe", tint: "rgba(191,219,254,0.15)", name: "Blue" },
};

interface StickyNoteProps {
  data: StickyData;
  onClose: (id: string) => void;
  onChange: (id: string, content: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

export default function StickyNote({ data, onClose, onChange, onDragEnd }: StickyNoteProps) {
  const c = COLOR_MAP[data.color];

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      initial={{ x: data.x, y: data.y }}
      onDragEnd={(_e, info) => {
        onDragEnd(data.id, info.point.x - 100, info.point.y - 14);
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "200px",
        height: "180px",
        zIndex: 500,
        display: "flex",
        flexDirection: "column",
        border: "2px solid #1a1a1a",
        boxShadow: "4px 4px 0px #1a1a1a",
        fontFamily: "var(--font-space-grotesk), sans-serif",
        cursor: "default",
        x: data.x,
        y: data.y,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: "28px",
          background: c.bg,
          borderBottom: "2px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          gap: "6px",
          cursor: "grab",
          flexShrink: 0,
        }}
      >
        <span style={{ flex: 1, fontSize: "11px", fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {data.title || c.name}
        </span>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onClose(data.id)}
          style={{
            width: "16px",
            height: "16px",
            background: "#1a1a1a",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            color: c.bg,
            fontWeight: 700,
            flexShrink: 0,
            padding: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Body */}
      <textarea
        value={data.content}
        onChange={(e) => onChange(data.id, e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Write something..."
        style={{
          flex: 1,
          background: c.tint,
          border: "none",
          outline: "none",
          resize: "none",
          padding: "8px",
          fontSize: "13px",
          fontFamily: "var(--font-space-grotesk), sans-serif",
          color: "#1a1a1a",
          lineHeight: 1.5,
        }}
      />
    </motion.div>
  );
}
