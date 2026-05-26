"use client";

import { motion } from "framer-motion";

export interface WindowProps {
  id: string;
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { w: number | string; h: number | string };
  onClose?: () => void;
  onMinimize?: () => void;
  focused?: boolean;
  onFocus?: () => void;
  className?: string;
  draggable?: boolean;
}

// Windows 3.1 bevel — light top/left, dark bottom/right
const BEVEL_RAISED = `
  inset 1px 1px 0px #ffffff,
  inset -1px -1px 0px #808080,
  inset 2px 2px 0px #dfdfdf,
  inset -2px -2px 0px #404040
`.trim();

const BEVEL_SUNKEN = `
  inset 1px 1px 0px #808080,
  inset -1px -1px 0px #ffffff,
  inset 2px 2px 0px #404040,
  inset -2px -2px 0px #dfdfdf
`.trim();

const WIN31_GRAY = "#c0c0c0";
const WIN31_DARK = "#808080";
const WIN31_WHITE = "#ffffff";
const WIN31_NEAR_BLACK = "#000000";

export default function Window({
  title,
  icon,
  children,
  defaultPosition = { x: 40, y: 40 },
  defaultSize = { w: 320, h: "auto" },
  onClose,
  onMinimize,
  focused = false,
  onFocus,
  className = "",
  draggable = true,
}: WindowProps) {

  // Outer window frame — Windows 3.1 raised bevel
  const windowStyle: React.CSSProperties = {
    width: typeof defaultSize.w === "number" ? `${defaultSize.w}px` : defaultSize.w,
    height: typeof defaultSize.h === "number" ? `${defaultSize.h}px` : defaultSize.h,
    background: WIN31_GRAY,
    boxShadow: BEVEL_RAISED,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  // Title bar — blue gradient when focused (classic Win 3.1), gray when not
  const titleBarStyle: React.CSSProperties = {
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "2px 3px 2px 4px",
    background: focused
      ? "linear-gradient(90deg, #000080 0%, #1084d0 100%)"  // classic Win 3.1 blue
      : "#808080",
    userSelect: "none",
    cursor: draggable ? "move" : "default",
    flexShrink: 0,
    gap: "4px",
  };

  // Control buttons — Win 3.1 style small square buttons
  const ctrlBtnStyle: React.CSSProperties = {
    width: "16px",
    height: "14px",
    background: WIN31_GRAY,
    boxShadow: BEVEL_RAISED,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    fontFamily: "var(--font-mono)",
    color: WIN31_NEAR_BLACK,
    flexShrink: 0,
    padding: 0,
    lineHeight: 1,
  };

  // Menu bar area (below title)
  const menuBarStyle: React.CSSProperties = {
    height: "20px",
    background: WIN31_GRAY,
    borderBottom: `1px solid ${WIN31_DARK}`,
    display: "flex",
    alignItems: "center",
    padding: "0 4px",
    gap: "0",
    flexShrink: 0,
  };

  const menuItemStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: "11px",
    color: WIN31_NEAR_BLACK,
    padding: "2px 8px",
    cursor: "pointer",
  };

  // Content area — sunken inset
  const contentAreaStyle: React.CSSProperties = {
    flex: 1,
    margin: "3px",
    background: WIN31_WHITE,
    boxShadow: BEVEL_SUNKEN,
    overflow: "auto",
  };

  const titleBarContent = (
    <>
      {/* Left: system menu button + title */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, minWidth: 0 }}>
        {/* System menu box */}
        <div style={{
          ...ctrlBtnStyle,
          background: focused ? WIN31_GRAY : "#aaaaaa",
          fontSize: "11px",
          letterSpacing: 0,
        }}>
          {icon || "─"}
        </div>
        <span style={{
          fontFamily: "var(--font-sans)",
          fontSize: "11px",
          fontWeight: 700,
          color: focused ? WIN31_WHITE : "#dfdfdf",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          letterSpacing: "0.01em",
        }}>
          {title}
        </span>
      </div>

      {/* Right: minimize + maximize */}
      <div style={{ display: "flex", gap: "2px" }}>
        <button
          style={ctrlBtnStyle}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onMinimize?.(); }}
        >
          ▼
        </button>
        <button
          style={ctrlBtnStyle}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onClose?.(); }}
        >
          ▲
        </button>
      </div>
    </>
  );

  const windowContent = (
    <>
      <div style={titleBarStyle}>
        {titleBarContent}
      </div>
      <div style={menuBarStyle}>
        <span style={menuItemStyle}>File</span>
        <span style={menuItemStyle}>Edit</span>
        <span style={menuItemStyle}>View</span>
        <span style={menuItemStyle}>Help</span>
      </div>
      <div style={contentAreaStyle}>
        {children}
      </div>
    </>
  );

  if (draggable) {
    return (
      <motion.div
        className={className}
        style={{
          ...windowStyle,
          position: "absolute",
          top: defaultPosition.y,
          left: defaultPosition.x,
          zIndex: focused ? 20 : 10,
        }}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.15 }}
        drag
        dragMomentum={false}
        dragElastic={0}
        dragListener={false}
        onPointerDown={onFocus}
      >
        <motion.div
          style={{ ...titleBarStyle, cursor: "move" }}
          onPointerDown={onFocus}
          drag
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={{ top: -9999, bottom: 9999, left: -9999, right: 9999 }}
        >
          {titleBarContent}
        </motion.div>
        <div style={menuBarStyle}>
          <span style={menuItemStyle}>File</span>
          <span style={menuItemStyle}>Edit</span>
          <span style={menuItemStyle}>View</span>
          <span style={menuItemStyle}>Help</span>
        </div>
        <div style={contentAreaStyle}>
          {children}
        </div>
      </motion.div>
    );
  }

  // Static (mobile)
  return (
    <motion.div
      className={className}
      style={{ ...windowStyle, width: "100%", position: "static" }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      onPointerDown={onFocus}
    >
      {windowContent}
    </motion.div>
  );
}
