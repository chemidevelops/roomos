"use client";

import { useState, useEffect } from "react";

export default function NewsTicker() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/ticker")
      .then(r => r.json())
      .then(d => setItems(d.items ?? []))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  const text = items.join("   ·   ") + "   ·   ";

  return (
    <div style={{
      position: "fixed",
      bottom: 36,
      left: 0,
      right: 0,
      height: 28,
      background: "#111",
      borderTop: "1px solid #2a2a2a",
      borderBottom: "1px solid #2a2a2a",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      zIndex: 9998,
    }}>
      {/* Label */}
      <div style={{
        flexShrink: 0,
        padding: "0 8px",
        borderRight: "1px solid #333",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.15em",
        color: "#FF6600",
        fontFamily: "monospace",
        whiteSpace: "nowrap",
      }}>
        EUROGAMER.ES
      </div>

      {/* Scrolling text */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <style>{`
          @keyframes ticker {
            from { transform: translateX(100%); }
            to   { transform: translateX(-100%); }
          }
          .ticker-text {
            display: inline-block;
            white-space: nowrap;
            animation: ticker ${Math.max(60, items.length * 7)}s linear infinite;
            font-size: 12px;
            color: #ccc;
            font-family: monospace;
            letter-spacing: 0.04em;
          }
        `}</style>
        <span className="ticker-text">{text}</span>
      </div>
    </div>
  );
}
