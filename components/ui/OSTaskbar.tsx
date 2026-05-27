"use client";

import { useState, useEffect } from "react";

export interface TaskbarWindow {
  id: string;
  title: string;
  icon?: string;
  focused: boolean;
  minimized: boolean;
  open: boolean;
}

interface OSTaskbarProps {
  windows: TaskbarWindow[];
  onWindowClick: (id: string) => void;
  onLauncherClick: () => void;
  onNewSticky?: () => void;
}

function TaskbarClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, "0");
      const m = now.getMinutes().toString().padStart(2, "0");
      setTime(`${h}:${m}`);
    }
    update();
    const id = setInterval(update, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      style={{
        fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
        fontSize: "13px",
        fontWeight: 500,
        color: "#ffffff",
        letterSpacing: "0.05em",
        minWidth: "42px",
        textAlign: "right",
      }}
    >
      {time}
    </span>
  );
}

export default function OSTaskbar({
  windows,
  onWindowClick,
  onLauncherClick,
  onNewSticky,
}: OSTaskbarProps) {
  const openWindows = windows.filter((w) => w.open);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "36px",
        background: "#1a1a1a",
        borderTop: "2px solid #333333",
        display: "flex",
        alignItems: "center",
        padding: "0 10px",
        gap: "8px",
        zIndex: 200,
        fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
      }}
    >
      {/* rOS logo / launcher button */}
      <button
        onClick={onLauncherClick}
        style={{
          width: "36px",
          height: "26px",
          background: "#f5c800",
          border: "2px solid #f5c800",
          boxShadow: "2px 2px 0px rgba(255,255,255,0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: "10px",
          fontWeight: 800,
          color: "#1a1a1a",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          borderRadius: 0,
          transition: "box-shadow 0.1s, transform 0.1s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          (e.currentTarget as HTMLButtonElement).style.transform = "translate(2px,2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "2px 2px 0px rgba(255,255,255,0.2)";
          (e.currentTarget as HTMLButtonElement).style.transform = "none";
        }}
      >
        rOS
      </button>



      {/* Sticky button */}
      {onNewSticky && (
        <button
          onClick={onNewSticky}
          title="New sticky note"
          style={{
            width: "26px",
            height: "26px",
            background: "transparent",
            border: "1.5px solid #444444",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            flexShrink: 0,
            borderRadius: 0,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2d2d2d"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          📌
        </button>
      )}

      {/* Divider */}
      <div
        style={{
          width: "1px",
          height: "22px",
          background: "#444444",
          flexShrink: 0,
        }}
      />

      {/* Open window pills */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          overflow: "hidden",
        }}
      >
        {openWindows.map((w) => (
          <button
            key={w.id}
            onClick={() => onWindowClick(w.id)}
            title={w.title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "0 10px",
              height: "26px",
              background: w.focused ? "#f5c800" : "#2d2d2d",
              border: `1.5px solid ${w.focused ? "#f5c800" : "#555555"}`,
              borderRadius: 0,
              cursor: "pointer",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "12px",
              fontWeight: w.focused ? 700 : 500,
              color: w.focused ? "#1a1a1a" : "#dddddd",
              whiteSpace: "nowrap",
              maxWidth: "160px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flexShrink: 0,
              transition: "background 0.1s",
              opacity: w.minimized ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!w.focused) {
                (e.currentTarget as HTMLButtonElement).style.background = "#3d3d3d";
              }
            }}
            onMouseLeave={(e) => {
              if (!w.focused) {
                (e.currentTarget as HTMLButtonElement).style.background = "#2d2d2d";
              }
            }}
          >
            {w.icon && (
              <span style={{ fontSize: "12px", lineHeight: 1 }}>{w.icon}</span>
            )}
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {w.title}
            </span>
          </button>
        ))}
      </div>

      {/* Clock */}
      <TaskbarClock />
    </div>
  );
}
