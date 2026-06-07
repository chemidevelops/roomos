"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import TVRadioApp from "./TVRadioApp";
import TVPodcastApp from "./TVPodcastApp";
import { RETRO_ICON_URLS } from "./RetroIcons";
const TVApp = dynamic(() => import("./TVApp"), { ssr: false });

type AppId = "tv" | "radio" | "podcasts" | null;

const APPS: { id: AppId; label: string }[] = [
  { id: "tv",       label: "TV" },
  { id: "radio",    label: "Radio" },
  { id: "podcasts", label: "Podcasts" },
];

function AppContent({ id }: { id: AppId }) {
  if (id === "tv")       return <TVApp />;
  if (id === "radio")    return <TVRadioApp />;
  if (id === "podcasts") return <TVPodcastApp />;
  return null;
}

function Ticker() {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/ticker").then(r => r.json()).then(d => setItems(d.items ?? [])).catch(() => {});
  }, []);
  if (!items.length) return null;
  const text = items.join("   ·   ") + "   ·   ";
  const duration = Math.max(60, items.length * 6);
  return (
    <div style={{ height: 44, background: "#1a1a1a", borderTop: "2px solid #333", display: "flex", alignItems: "center", overflow: "hidden", flexShrink: 0 }}>
      <style>{`@keyframes tv-ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } } .tv-ticker { display:inline-block; white-space:nowrap; animation: tv-ticker ${duration}s linear infinite; font-size:18px; color:#ddd; font-family:monospace; letter-spacing:0.05em; } `}</style>
      <div style={{ flexShrink: 0, padding: "0 16px", borderRight: "1px solid #444", fontSize: 11, fontWeight: 700, color: "#FF6600", fontFamily: "monospace", letterSpacing: "0.15em", whiteSpace: "nowrap" }}>EUROGAMER.ES</div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <span className="tv-ticker">{text}{text}</span>
      </div>
    </div>
  );
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

  const openApp = (id: AppId) => setOpen(id);

  if (open) {
    return (
      <div style={{ width: "100vw", height: "100vh", background: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{
          height: 56, background: "repeating-linear-gradient(to bottom, #aaa 0px, #aaa 1px, #ccc 1px, #ccc 2px)",
          display: "flex", alignItems: "center", padding: "0 32px",
          borderBottom: "2px solid #888", flexShrink: 0,
        }}>
          <button
            onClick={() => setOpen(null)}
            onTouchEnd={(e) => { e.preventDefault(); setOpen(null); }}
            style={{
              background: "#fff", border: "1.5px solid #555",
              padding: "6px 18px", cursor: "pointer",
              fontFamily: "Chicago, 'Helvetica Neue', sans-serif", fontSize: 16,
              marginRight: 24, borderRadius: 0,
            }}>← Inicio</button>
          <span style={{ fontFamily: "Chicago, 'Helvetica Neue', sans-serif", fontSize: 18, fontWeight: 700, color: "#000" }}>
            {APPS.find(a => a.id === open)?.label}
          </span>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <AppContent id={open} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "#6b8fa8",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "32px 60px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ fontFamily: "Chicago, 'Helvetica Neue', Arial, sans-serif" }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>roomOS</div>
          <div style={{ fontSize: 64, fontWeight: 700, color: "#fff", lineHeight: 1, letterSpacing: "-2px", textShadow: "1px 1px 0 rgba(0,0,0,0.3)" }}>{time}</div>
        </div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", fontFamily: "Chicago, 'Helvetica Neue', sans-serif", textAlign: "right" }}>
          {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
        </div>
      </div>

      {/* App grid */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 24,
        padding: "16px 60px 24px",
        alignContent: "center",
      }}>
        {APPS.map(app => {
          const iconUrl = RETRO_ICON_URLS[app.id ?? ""] ?? null;
          return (
            <button
              key={app.id}
              onClick={() => openApp(app.id)}
              onTouchEnd={(e) => { e.preventDefault(); openApp(app.id); }}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                borderRadius: 4,
                padding: "32px 20px 24px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                backdropFilter: "blur(4px)",
                boxShadow: "2px 2px 0 rgba(0,0,0,0.2)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.3)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)";
              }}
            >
              {iconUrl ? (
                <img src={iconUrl} width={72} height={72} style={{ imageRendering: "pixelated", display: "block" }} />
              ) : (
                <div style={{ width: 72, height: 72, background: "rgba(255,255,255,0.3)", borderRadius: 4 }} />
              )}
              <span style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "Chicago, 'Helvetica Neue', Arial, sans-serif",
                textShadow: "1px 1px 0 rgba(0,0,0,0.4)",
                letterSpacing: "0.02em",
              }}>{app.label}</span>
            </button>
          );
        })}
      </div>

      {/* Ticker */}
      <Ticker />
    </div>
  );
}
