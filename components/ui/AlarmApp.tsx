"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Alarm {
  id: string;
  label: string;
  time: string; // "HH:MM"
  enabled: boolean;
}

const STORAGE_KEY = "roomos-alarms";

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, 800);
  } catch {}
}

export default function AlarmApp() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [firing, setFiring] = useState<Alarm | null>(null);
  const firedRef = useRef<Set<string>>(new Set());
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setAlarms(JSON.parse(saved));
    } catch {}
  }, []);

  const persist = useCallback((next: Alarm[]) => {
    setAlarms(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const addAlarm = () => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    persist([...alarms, { id: crypto.randomUUID(), label: "Alarm", time: `${h}:${m}`, enabled: true }]);
  };

  const deleteAlarm = (id: string) => persist(alarms.filter((a) => a.id !== id));

  const updateAlarm = (id: string, patch: Partial<Alarm>) => {
    persist(alarms.map((a) => a.id === id ? { ...a, ...patch } : a));
  };

  const dismiss = () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setFiring(null);
  };

  // Check alarms every minute
  useEffect(() => {
    function check() {
      const now = new Date();
      const hhmm = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const key = `${hhmm}-${now.toDateString()}`;

      for (const alarm of alarms) {
        if (alarm.enabled && alarm.time === hhmm && !firedRef.current.has(key + alarm.id)) {
          firedRef.current.add(key + alarm.id);
          playBeep();
          setFiring(alarm);
          if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
          dismissTimerRef.current = setTimeout(() => setFiring(null), 10000);
        }
      }

      // Clean up old fired keys (keep only today)
      const today = now.toDateString();
      firedRef.current.forEach((k) => {
        if (!k.includes(today)) firedRef.current.delete(k);
      });
    }

    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [alarms]);

  const btnStyle: React.CSSProperties = {
    background: "#f5c800",
    border: "2px solid #1a1a1a",
    boxShadow: "2px 2px 0px #1a1a1a",
    padding: "4px 10px",
    fontFamily: "var(--font-space-grotesk), sans-serif",
    fontSize: "12px",
    fontWeight: 700,
    color: "#1a1a1a",
    cursor: "pointer",
  };

  return (
    <>
      {/* Alarm notification overlay */}
      {firing && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9500,
            background: "#f5c800",
            border: "2px solid #1a1a1a",
            boxShadow: "4px 4px 0px #1a1a1a",
            padding: "12px 20px",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "14px",
            fontWeight: 700,
            color: "#1a1a1a",
            minWidth: "280px",
          }}
        >
          <span>⏰ {firing.label}</span>
          <button onClick={dismiss} style={{ ...btnStyle, background: "#1a1a1a", color: "#f5c800", marginLeft: "auto" }}>
            DISMISS
          </button>
        </div>
      )}

      {/* App UI */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", fontFamily: "var(--font-space-grotesk), sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6560" }}>
            Alarms
          </span>
          <button onClick={addAlarm} style={btnStyle}>+ Add alarm</button>
        </div>

        {alarms.length === 0 && (
          <div style={{ fontSize: "13px", color: "#6b6560", fontStyle: "italic" }}>No alarms set.</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {alarms.map((alarm) => (
            <div
              key={alarm.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                background: "#f0ebe0",
                border: "2px solid #1a1a1a",
                boxShadow: "2px 2px 0px #1a1a1a",
              }}
            >
              {/* Toggle */}
              <button
                onClick={() => updateAlarm(alarm.id, { enabled: !alarm.enabled })}
                style={{
                  width: "36px",
                  height: "20px",
                  background: alarm.enabled ? "#f5c800" : "#c0c0c0",
                  border: "2px solid #1a1a1a",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "2px",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                <div style={{
                  width: "12px",
                  height: "12px",
                  background: "#1a1a1a",
                  transform: alarm.enabled ? "translateX(16px)" : "translateX(0)",
                  transition: "transform 0.15s",
                }} />
              </button>

              {/* Time input */}
              <input
                type="time"
                value={alarm.time}
                onChange={(e) => updateAlarm(alarm.id, { time: e.target.value })}
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  width: "90px",
                  flexShrink: 0,
                  opacity: alarm.enabled ? 1 : 0.5,
                }}
              />

              {/* Label */}
              <input
                type="text"
                value={alarm.label}
                onChange={(e) => updateAlarm(alarm.id, { label: e.target.value })}
                style={{
                  flex: 1,
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: "13px",
                  color: "#1a1a1a",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid #1a1a1a",
                  outline: "none",
                  padding: "2px 0",
                  opacity: alarm.enabled ? 1 : 0.5,
                }}
                placeholder="Label"
              />

              {/* Delete */}
              <button
                onClick={() => deleteAlarm(alarm.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#1a1a1a",
                  flexShrink: 0,
                  opacity: 0.6,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
