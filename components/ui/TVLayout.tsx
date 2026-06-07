"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import RadioApp from "./RadioApp";
import RSSApp from "./RSSApp";
import NotesApp from "./NotesApp";
import CalendarApp from "./CalendarApp";
import PodcastApp from "./PodcastApp";
import StatsApp from "./StatsApp";
const TVApp = dynamic(() => import("./TVApp"), { ssr: false });

type AppId = "tv" | "radio" | "rss" | "podcasts" | "calendar" | "notes" | "stats" | null;

const APPS: { id: AppId; icon: string; label: string; color: string }[] = [
  { id: "tv",       icon: "📺", label: "TV",       color: "#1a1a2e" },
  { id: "radio",    icon: "📻", label: "Radio",    color: "#1a2e1a" },
  { id: "rss",      icon: "📡", label: "Feeds",    color: "#2e1a1a" },
  { id: "podcasts", icon: "🎙️", label: "Podcasts", color: "#2e2a1a" },
  { id: "calendar", icon: "📅", label: "Agenda",   color: "#1a2a2e" },
  { id: "notes",    icon: "📓", label: "Notas",    color: "#2e1a2e" },
  { id: "stats",    icon: "📊", label: "Stats",    color: "#1a1a1a" },
];

function AppContent({ id }: { id: AppId }) {
  if (id === "tv")       return <TVApp />;
  if (id === "radio")    return <RadioApp />;
  if (id === "rss")      return <RSSApp />;
  if (id === "podcasts") return <PodcastApp />;
  if (id === "calendar") return <CalendarApp />;
  if (id === "notes")    return <NotesApp />;
  if (id === "stats")    return <StatsApp />;
  return null;
}

export default function TVLayout() {
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

  if (open) {
    return (
      <div style={{ width: "100vw", height: "100vh", background: "#000", display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{
          height: 60, background: "rgba(0,0,0,0.8)",
          display: "flex", alignItems: "center", padding: "0 40px",
          borderBottom: "1px solid #222", flexShrink: 0,
          backdropFilter: "blur(10px)",
        }}>
          <button onClick={() => setOpen(null)} style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff", padding: "8px 20px", cursor: "pointer",
            fontFamily: "system-ui", fontSize: 16, borderRadius: 6,
            marginRight: 20,
          }}>← Inicio</button>
          <span style={{ color: "#fff", fontSize: 18, fontWeight: 600, fontFamily: "system-ui" }}>
            {APPS.find(a => a.id === open)?.icon} {APPS.find(a => a.id === open)?.label}
          </span>
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <AppContent id={open} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d0d 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "system-ui, -apple-system, sans-serif",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "40px 60px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 13, color: "#555", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>roomOS</div>
          <div style={{ fontSize: 56, fontWeight: 700, color: "#fff", lineHeight: 1, letterSpacing: "-2px" }}>{time}</div>
        </div>
        <div style={{ fontSize: 14, color: "#444", textAlign: "right" }}>
          {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
        </div>
      </div>

      {/* App grid */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 20,
        padding: "20px 60px 60px",
        alignContent: "center",
      }}>
        {APPS.map(app => (
          <button
            key={app.id}
            onClick={() => setOpen(app.id)}
            style={{
              background: app.color,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: "40px 20px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              transition: "transform 0.1s, border-color 0.1s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <span style={{ fontSize: 52 }}>{app.icon}</span>
            <span style={{ color: "#fff", fontSize: 18, fontWeight: 600, letterSpacing: "0.02em" }}>{app.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
