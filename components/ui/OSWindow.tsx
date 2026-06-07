"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useDragControls, useMotionValue } from "framer-motion";

export interface OSWindowProps {
  id: string;
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultPosition: { x: number; y: number };
  width?: number;
  height?: number | "auto";
  focused: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  minimized: boolean;
  zIndex: number;
  retroMode?: boolean;
}

export default function OSWindow({
  title,
  icon,
  children,
  defaultPosition,
  width = 480,
  height = "auto",
  focused,
  onFocus,
  onClose,
  onMinimize,
  minimized,
  zIndex,
  retroMode,
}: OSWindowProps) {
  const dragControls = useDragControls();
  const containerRef = useRef<HTMLDivElement>(null);
  const [maximized, setMaximized] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const titleBarBg = focused ? "#1a1a1a" : "#8a8480";

  // Mac System 7/8 pinstripe style
  const retroStripe = focused
    ? "repeating-linear-gradient(to bottom, #aaa 0px, #aaa 1px, #ccc 1px, #ccc 2px)"
    : "repeating-linear-gradient(to bottom, #bbb 0px, #bbb 1px, #ddd 1px, #ddd 2px)";

  const maxStyle = maximized ? {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 9999,
  } : {
    position: "absolute" as const,
    top: defaultPosition.y,
    left: defaultPosition.x,
    width: width,
    height: height === "auto" ? undefined : height,
    zIndex: zIndex,
  };

  return (
    <AnimatePresence>
      <motion.div
        drag={!maximized}
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragElastic={0}
        style={{ x, y,
          border: retroMode ? "1.5px solid #000" : "2px solid #1a1a1a",
          boxShadow: retroMode
            ? (focused ? "2px 2px 0px #000" : "1px 1px 0px #555")
            : (focused ? "6px 6px 0px #1a1a1a" : "4px 4px 0px #1a1a1a"),
          background: retroMode ? "#ececec" : "var(--room-paper, #faf7f2)",
          borderRadius: 0,
          userSelect: "none",
          display: "flex",
          opacity: minimized ? 0 : 1,
          pointerEvents: minimized ? "none" : "auto",
          flexDirection: "column",
          transition: "width 0.25s ease, height 0.25s ease, box-shadow 0.1s",
          ...maxStyle,
          ...(minimized ? {
            position: "fixed" as const,
            top: -100000,
            left: -100000,
            zIndex: -1,
          } : {}),
        }}
      >
        {/* Title bar */}
        {retroMode ? (
          // ── Mac System 7/8 style ──
          <div
            onPointerDown={(e) => { if (!maximized) dragControls.start(e); }}
            onDoubleClick={() => { if (!maximized) { x.set(0); y.set(0); } setMaximized(m => !m); }}
            style={{
              height: "20px", minHeight: "20px",
              background: retroStripe,
              display: "flex", alignItems: "center",
              padding: "0 4px",
              cursor: maximized ? "default" : "move",
              flexShrink: 0, touchAction: "none",
              borderBottom: "1px solid #999",
              position: "relative",
            }}
          >
            {/* Close box - Mac style square */}
            <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
              <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{
                width: 11, height: 11, border: "1px solid #555",
                background: "#fff", cursor: "pointer", padding: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8, color: "#333",
              }}>×</button>
              <button onClick={(e) => { e.stopPropagation(); if (!maximized) { x.set(0); y.set(0); } setMaximized(m => !m); }} style={{
                width: 11, height: 11, border: "1px solid #555",
                background: "#fff", cursor: "pointer", padding: 0,
              }} />
            </div>
            {/* Title centered */}
            <div style={{
              position: "absolute", left: 0, right: 0,
              display: "flex", justifyContent: "center", alignItems: "center",
              pointerEvents: "none",
            }}>
              <span style={{
                fontFamily: "Chicago, 'Helvetica Neue', Arial, sans-serif",
                fontSize: "11px", fontWeight: 700, color: "#000",
                background: retroStripe,
                padding: "0 6px",
                whiteSpace: "nowrap",
              }}>{title}</span>
            </div>
          </div>
        ) : (
          // ── Default style ──
          <div
            onPointerDown={(e) => { if (!maximized) dragControls.start(e); }}
            onDoubleClick={() => { if (!maximized) { x.set(0); y.set(0); } setMaximized(m => !m); }}
            style={{
              height: "32px", minHeight: "32px",
              background: titleBarBg,
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              padding: "0 0 0 10px",
              cursor: maximized ? "default" : "move",
              flexShrink: 0, touchAction: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
              {icon && <span style={{ fontSize: "14px", lineHeight: 1, flexShrink: 0 }}>{icon}</span>}
              <span style={{
                fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                fontSize: "12px", fontWeight: 700, color: "#ffffff",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                letterSpacing: "0.02em",
              }}>{title}</span>
            </div>
            <div style={{ display: "flex", alignItems: "stretch", height: "100%", flexShrink: 0 }}>
              <WindowButton label="_" hoverBg="#f5c800" hoverColor="#1a1a1a"
                onClick={(e) => { e.stopPropagation(); onMinimize(); }} />
              <WindowButton label={maximized ? "❐" : "□"} hoverBg="#1d4ed8" hoverColor="#ffffff"
                onClick={(e) => { e.stopPropagation(); if (!maximized) { x.set(0); y.set(0); } setMaximized(m => !m); }} />
              <WindowButton label="×" hoverBg="#dc2626" hoverColor="#ffffff"
                onClick={(e) => { e.stopPropagation(); onClose(); }} />
            </div>
          </div>
        )}

        {/* Content */}
        <div
          style={{ flex: 1, overflow: "auto", background: retroMode ? "#fff" : "var(--room-paper, #faf7f2)", userSelect: "text" }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function WindowButton({ label, hoverBg, hoverColor, onClick }: {
  label: string; hoverBg: string; hoverColor: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button onClick={onClick} style={{
      width: "24px", background: "transparent", border: "none",
      borderLeft: "1px solid rgba(255,255,255,0.2)", color: "#ffffff",
      fontSize: "14px", fontWeight: 700, cursor: "pointer",
      fontFamily: "var(--font-space-grotesk), sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100%", padding: 0, lineHeight: 1,
      transition: "background 0.1s, color 0.1s",
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = hoverBg;
        (e.currentTarget as HTMLButtonElement).style.color = hoverColor;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
      }}
    >
      {label}
    </button>
  );
}
