"use client";

import { useState, useEffect, useRef } from "react";

const PRESETS = [15, 25, 45, 60];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

interface FocusTimerProps {
  compact?: boolean;
}

export default function FocusTimer({ compact = false }: FocusTimerProps) {
  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            setDone(true);
            setSessions((s) => s + 1);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const handlePreset = (min: number) => {
    setRunning(false);
    setDone(false);
    setDuration(min);
    setRemaining(min * 60);
  };

  const handleStartPause = () => {
    if (done) {
      setDone(false);
      setRemaining(duration * 60);
      return;
    }
    setRunning((r) => !r);
  };

  const handleReset = () => {
    setRunning(false);
    setDone(false);
    setRemaining(duration * 60);
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? "12px" : "20px",
        fontFamily: "var(--font-space-grotesk), sans-serif",
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#6b6560",
        }}
      >
        Focus
      </div>

      {/* Timer display */}
      {done ? (
        <div
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: compact ? "24px" : "48px",
            fontWeight: 700,
            color: "#16a34a",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          SESSION COMPLETE
        </div>
      ) : (
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
            fontSize: compact ? "36px" : "72px",
            fontWeight: 500,
            color: "#1a1a1a",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {pad(mins)}:{pad(secs)}
        </div>
      )}

      {/* Presets */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => handlePreset(p)}
            className="btn-brutal"
            style={{
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              background: duration === p && !running && !done ? "#1a1a1a" : "#faf7f2",
              color: duration === p && !running && !done ? "#faf7f2" : "#1a1a1a",
              borderRadius: "2px",
            }}
          >
            {p}m
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={handleStartPause}
          className="btn-brutal"
          style={{
            flex: 1,
            padding: compact ? "8px 0" : "12px 0",
            fontSize: compact ? "13px" : "15px",
            fontWeight: 700,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            background: "#f5c800",
            color: "#1a1a1a",
            borderRadius: "2px",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {done ? "New Session" : running ? "Pause" : "Start"}
        </button>

        <button
          onClick={handleReset}
          className="btn-brutal"
          style={{
            padding: compact ? "8px 14px" : "12px 18px",
            fontSize: compact ? "13px" : "15px",
            fontWeight: 700,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            background: "#e8e2d5",
            color: "#1a1a1a",
            borderRadius: "2px",
          }}
        >
          Reset
        </button>
      </div>

      {/* Session counter */}
      {sessions > 0 && (
        <div style={{ fontSize: "12px", color: "#6b6560", fontWeight: 500 }}>
          Session {sessions} complete today
        </div>
      )}
    </div>
  );
}
