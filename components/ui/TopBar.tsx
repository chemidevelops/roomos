"use client";

import Clock from "./Clock";

interface TopBarProps {
  activeView: string;
}

const viewLabels: Record<string, string> = {
  home: "Home",
  focus: "Focus",
  backlog: "Backlog",
  journal: "Journal",
  music: "Music",
  settings: "Settings",
};

export default function TopBar({ activeView }: TopBarProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "36px",
        background: "#faf7f2",
        borderBottom: "2px solid #1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        zIndex: 100,
        fontFamily: "var(--font-space-grotesk), sans-serif",
      }}
    >
      {/* Left: logo */}
      <span
        style={{
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#1a1a1a",
        }}
      >
        roomOS
      </span>

      {/* Center: breadcrumb */}
      <span
        style={{
          fontSize: "12px",
          fontWeight: 500,
          color: "#6b6560",
          letterSpacing: "0.04em",
        }}
      >
        {viewLabels[activeView] ?? activeView} · {today}
      </span>

      {/* Right: clock */}
      <Clock />
    </div>
  );
}
