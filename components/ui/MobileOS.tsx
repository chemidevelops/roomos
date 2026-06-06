"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import RadioApp from "./RadioApp";
import RSSApp from "./RSSApp";
import NotesApp from "./NotesApp";
import CalendarApp from "./CalendarApp";
import SnakeGame from "./SnakeGame";
const TVApp = dynamic(() => import("./TVApp"), { ssr: false });

type AppId = "radio" | "tv" | "rss" | "notes" | "calendar" | "snake" | null;

const APPS: { id: AppId; icon: string; label: string }[] = [
  { id: "calendar", icon: "📅", label: "AGENDA" },
  { id: "radio",    icon: "📻", label: "RADIO" },
  { id: "tv",       icon: "📺", label: "TV" },
  { id: "rss",      icon: "📡", label: "FEEDS" },
  { id: "notes",    icon: "📓", label: "NOTAS" },
  { id: "snake",    icon: "🐍", label: "SNAKE" },
];

function AppComponent({ id }: { id: AppId }) {
  if (id === "radio")    return <RadioApp />;
  if (id === "tv")       return <TVApp />;
  if (id === "rss")      return <RSSApp />;
  if (id === "notes")    return <NotesApp />;
  if (id === "calendar") return <CalendarApp />;
  if (id === "snake")    return <SnakeGame />;
  return null;
}

export default function MobileOS() {
  const [open, setOpen] = useState<AppId>(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      width: "100vw", height: "100dvh",
      background: "#0f0f0f",
      display: "flex", flexDirection: "column",
      fontFamily: "monospace",
      overflow: "hidden",
      color: "#fff",
    }}>
      {open ? (
        /* ── App view ── */
        <>
          {/* App bar */}
          <div style={{
            height: 44, minHeight: 44,
            background: "#1a1a1a",
            display: "flex", alignItems: "center",
            padding: "0 12px",
            borderBottom: "1px solid #333",
            flexShrink: 0,
          }}>
            <button onClick={() => setOpen(null)} style={{
              background: "none", border: "none", color: "#fff",
              fontSize: 18, cursor: "pointer", padding: "0 8px 0 0",
              fontFamily: "monospace",
            }}>←</button>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {APPS.find(a => a.id === open)?.icon} {APPS.find(a => a.id === open)?.label}
            </span>
          </div>
          {/* App content */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <AppComponent id={open} />
          </div>
        </>
      ) : (
        /* ── Home screen ── */
        <>
          {/* Status bar */}
          <div style={{
            padding: "8px 16px 4px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.15em" }}>roomOS</span>
            <span style={{ fontSize: 10, color: "#555" }}>●●●●○</span>
          </div>

          {/* Clock */}
          <div style={{ textAlign: "center", padding: "20px 0 8px", flexShrink: 0 }}>
            <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: "-2px", lineHeight: 1, color: "#fff" }}>
              {time}
            </div>
            <div style={{ fontSize: 11, color: "#444", marginTop: 6, letterSpacing: "0.1em" }}>
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#1a1a1a", margin: "12px 16px", flexShrink: 0 }} />

          {/* App grid */}
          <div style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 2,
            padding: "0 8px 16px",
            alignContent: "start",
            overflowY: "auto",
          }}>
            {APPS.map(app => (
              <button key={app.id} onClick={() => setOpen(app.id)} style={{
                background: "none", border: "none",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "14px 8px",
                cursor: "pointer",
                gap: 6,
                borderRadius: 0,
                color: "#fff",
              }}
                onPointerDown={e => (e.currentTarget.style.background = "#1a1a1a")}
                onPointerUp={e => (e.currentTarget.style.background = "none")}
                onPointerLeave={e => (e.currentTarget.style.background = "none")}
              >
                <span style={{ fontSize: 28 }}>{app.icon}</span>
                <span style={{ fontSize: 9, letterSpacing: "0.12em", color: "#888" }}>{app.label}</span>
              </button>
            ))}
          </div>

          {/* Bottom soft keys */}
          <div style={{
            height: 44,
            display: "flex",
            borderTop: "1px solid #1a1a1a",
            flexShrink: 0,
          }}>
            <button style={{ flex: 1, background: "none", border: "none", color: "#555", fontSize: 10, letterSpacing: "0.1em", cursor: "default", fontFamily: "monospace" }}>
              MENU
            </button>
            <div style={{ width: 1, background: "#1a1a1a" }} />
            <button style={{ flex: 1, background: "none", border: "none", color: "#555", fontSize: 10, letterSpacing: "0.1em", cursor: "default", fontFamily: "monospace" }}>
              roomOS
            </button>
          </div>
        </>
      )}
    </div>
  );
}
