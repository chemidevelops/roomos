"use client";

import { useState, useEffect } from "react";

interface TaskbarWindow {
  id: string;
  title: string;
  focused: boolean;
  minimized?: boolean;
}

interface TaskbarProps {
  windows: TaskbarWindow[];
  onWindowClick: (id: string) => void;
}

function LiveClock() {
  const [time, setTime] = useState({ hm: "--:--", date: "" });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hm = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
      const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      setTime({ hm, date });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.2 }}>
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        fontWeight: 500,
        color: "var(--room-text)",
        letterSpacing: "0.06em",
        textShadow: "0 0 8px rgba(91,127,255,0.2)",
      }}>
        {time.hm}
      </span>
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        color: "var(--room-sec)",
        letterSpacing: "0.04em",
      }}>
        {time.date}
      </span>
    </div>
  );
}

export default function Taskbar({ windows, onWindowClick }: TaskbarProps) {
  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      height: "36px",
      background: "var(--room-chrome)",
      borderTop: "1px solid var(--room-border)",
      display: "flex",
      alignItems: "center",
      padding: "0 8px",
      gap: "6px",
      zIndex: 100,
      userSelect: "none",
    }}>
      {/* Logo / Start */}
      <button
        className="btn-classic"
        style={{
          height: "24px",
          padding: "0 10px",
          borderRadius: "2px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          flexShrink: 0,
        }}
      >
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--room-blue)",
          letterSpacing: "0.05em",
          textShadow: "0 0 8px rgba(91,127,255,0.5)",
        }}>
          rOS
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--room-sec)" }}>▾</span>
      </button>

      {/* Separator */}
      <div style={{ width: "1px", height: "20px", background: "var(--room-border)", flexShrink: 0 }} />

      {/* Window pills */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "4px", overflow: "hidden" }}>
        {windows.map((win) => (
          <button
            key={win.id}
            onClick={() => onWindowClick(win.id)}
            style={{
              height: "24px",
              padding: "0 10px",
              borderRadius: "2px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: win.focused ? "var(--room-text)" : "var(--room-sec)",
              background: win.focused ? "var(--room-border)" : "transparent",
              border: `1px solid ${win.focused ? "var(--room-border-light)" : "transparent"}`,
              boxShadow: win.focused
                ? "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)"
                : "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "140px",
              letterSpacing: "0.03em",
              transition: "all 0.1s",
            }}
          >
            {win.title}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div style={{ width: "1px", height: "20px", background: "var(--room-border)", flexShrink: 0 }} />

      {/* Clock */}
      <LiveClock />
    </div>
  );
}
