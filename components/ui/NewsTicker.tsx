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
  const duration = Math.max(60, items.length * 7);

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
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-wrap {
          display: flex;
          white-space: nowrap;
          animation: ticker ${duration}s linear infinite;
          will-change: transform;
        }
        .ticker-item {
          font-size: 12px;
          color: #ccc;
          font-family: monospace;
          letter-spacing: 0.04em;
          padding-right: 0;
        }
      `}</style>

      {/* Label */}
      <div style={{
        flexShrink: 0,
        padding: "0 8px",
        borderRight: "1px solid #333",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.15em",
        color: "#FF6600",
        fontFamily: "monospace",
        whiteSpace: "nowrap",
        zIndex: 1,
        background: "#111",
      }}>
        EUROGAMER.ES
      </div>

      {/* Scrolling — duplicado para loop sin salto */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div className="ticker-wrap">
          <span className="ticker-item">{text}</span>
          <span className="ticker-item">{text}</span>
        </div>
      </div>
    </div>
  );
}
