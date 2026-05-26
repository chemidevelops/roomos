"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
}: OSWindowProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);

  // We render into a portal-like fixed wrapper — just position absolute on the desktop
  if (minimized) return null;

  const titleBarBg = focused ? "#1a1a1a" : "#8a8480";

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.12 }}
        onMouseDown={onFocus}
        style={{
          position: "absolute",
          top: defaultPosition.y,
          left: defaultPosition.x,
          width: width,
          height: height === "auto" ? undefined : height,
          border: "2px solid #1a1a1a",
          boxShadow: focused ? "6px 6px 0px #1a1a1a" : "4px 4px 0px #1a1a1a",
          background: "var(--room-paper, #faf7f2)",
          borderRadius: 0,
          zIndex: zIndex,
          userSelect: "none",
          display: "flex",
          flexDirection: "column",
          transition: "box-shadow 0.1s",
        }}
      >
        {/* Title bar — drag handle */}
        <div
          style={{
            height: "32px",
            minHeight: "32px",
            background: titleBarBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 0 0 10px",
            cursor: "move",
            flexShrink: 0,
          }}
        >
          {/* Left: icon + title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              overflow: "hidden",
            }}
          >
            {icon && (
              <span style={{ fontSize: "14px", lineHeight: 1, flexShrink: 0 }}>
                {icon}
              </span>
            )}
            <span
              style={{
                fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                fontSize: "12px",
                fontWeight: 700,
                color: "#ffffff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                letterSpacing: "0.02em",
              }}
            >
              {title}
            </span>
          </div>

          {/* Right: window control buttons */}
          <div style={{ display: "flex", alignItems: "stretch", height: "100%", flexShrink: 0 }}>
            {/* Minimize */}
            <WindowButton
              label="_"
              hoverBg="#f5c800"
              hoverColor="#1a1a1a"
              onClick={(e) => {
                e.stopPropagation();
                onMinimize();
              }}
            />
            {/* Maximize (no-op visual) */}
            <WindowButton
              label="□"
              hoverBg="#1d4ed8"
              hoverColor="#ffffff"
              onClick={(e) => e.stopPropagation()}
            />
            {/* Close */}
            <WindowButton
              label="×"
              hoverBg="#dc2626"
              hoverColor="#ffffff"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            background: "var(--room-paper, #faf7f2)",
            userSelect: "text",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function WindowButton({
  label,
  hoverBg,
  hoverColor,
  onClick,
}: {
  label: string;
  hoverBg: string;
  hoverColor: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "24px",
        background: "transparent",
        border: "none",
        borderLeft: "1px solid rgba(255,255,255,0.2)",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "var(--font-space-grotesk), sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: 0,
        lineHeight: 1,
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
