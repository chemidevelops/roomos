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
  { id: "calendar", icon: "▦", label: "AGENDA" },
  { id: "radio",    icon: "◉", label: "RADIO" },
  { id: "tv",       icon: "▣", label: "TV" },
  { id: "rss",      icon: "◈", label: "FEEDS" },
  { id: "notes",    icon: "▤", label: "NOTES" },
  { id: "snake",    icon: "▶", label: "SNAKE" },
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

// Nokia pixel font via CSS
const SCREEN_BG = "#0d1a0d";
const SCREEN_FG = "#7ec850";
const SCREEN_DIM = "#3a6b28";
const PHONE_BG = "#1c1c1e";
const BTN_BG = "#2a2a2c";
const BTN_BORDER = "#3a3a3c";
const BTN_SHADOW = "#111";

export default function MobileOS() {
  const [open, setOpen] = useState<AppId>(null);
  const [selected, setSelected] = useState(0);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" }).toUpperCase());
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  function openApp(id: AppId) { setOpen(id); }
  function back() { setOpen(null); }
  function navUp() { setSelected(s => (s - 1 + APPS.length) % APPS.length); }
  function navDown() { setSelected(s => (s + 1) % APPS.length); }
  function navOk() { openApp(APPS[selected].id); }

  return (
    <div style={{
      width: "100vw", height: "100dvh",
      background: PHONE_BG,
      display: "flex", flexDirection: "column",
      fontFamily: "'Courier New', 'Lucida Console', monospace",
      overflow: "hidden",
      userSelect: "none",
    }}>

      {/* ── SCREEN ── */}
      <div style={{
        flex: 1,
        background: SCREEN_BG,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderBottom: `2px solid ${BTN_BORDER}`,
        position: "relative",
      }}>
        {open ? (
          /* App view */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* App title bar */}
            <div style={{
              padding: "4px 10px",
              background: SCREEN_FG,
              color: SCREEN_BG,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.15em",
              display: "flex",
              justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <span>{APPS.find(a => a.id === open)?.icon} {APPS.find(a => a.id === open)?.label}</span>
              <span style={{ opacity: 0.6 }}>roomOS</span>
            </div>
            <div style={{ flex: 1, overflow: "hidden", background: "#fff" }}>
              <AppComponent id={open} />
            </div>
          </div>
        ) : (
          /* Home screen */
          <>
            {/* Status bar */}
            <div style={{
              padding: "6px 10px 2px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: 9,
              color: SCREEN_DIM,
              letterSpacing: "0.1em",
              flexShrink: 0,
            }}>
              <span>roomOS</span>
              <span>▐▐▐▐</span>
            </div>

            {/* Clock */}
            <div style={{ textAlign: "center", padding: "16px 0 8px", flexShrink: 0 }}>
              <div style={{
                fontSize: 48,
                fontWeight: 700,
                color: SCREEN_FG,
                letterSpacing: "2px",
                lineHeight: 1,
                textShadow: `0 0 12px ${SCREEN_FG}44`,
              }}>
                {time}
              </div>
              <div style={{ fontSize: 10, color: SCREEN_DIM, marginTop: 6, letterSpacing: "0.15em" }}>
                {date}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: SCREEN_DIM, margin: "6px 14px", opacity: 0.4 }} />

            {/* Menu list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
              {APPS.map((app, i) => (
                <div
                  key={app.id}
                  onClick={() => openApp(app.id)}
                  onPointerDown={() => setSelected(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 16px",
                    background: selected === i ? SCREEN_FG : "transparent",
                    color: selected === i ? SCREEN_BG : SCREEN_FG,
                    cursor: "pointer",
                    transition: "background 0.05s",
                  }}
                >
                  <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{app.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em" }}>{app.label}</span>
                  {selected === i && <span style={{ marginLeft: "auto", fontSize: 10 }}>▶</span>}
                </div>
              ))}
            </div>

            {/* Bottom softkey labels */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "4px 16px",
              fontSize: 9, color: SCREEN_DIM,
              letterSpacing: "0.1em",
              flexShrink: 0,
            }}>
              <span>MENU</span>
              <span>OK</span>
              <span>EXIT</span>
            </div>
          </>
        )}
      </div>

      {/* ── BUTTONS ── */}
      <div style={{
        background: PHONE_BG,
        padding: "10px 12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        flexShrink: 0,
      }}>
        {/* Soft keys + D-pad row */}
        {open ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <PhoneBtn label="◀ BACK" onPress={back} wide />
            <PhoneBtn label="▲" onPress={navUp} />
            <PhoneBtn label="" onPress={() => {}} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <PhoneBtn label="MENU" onPress={() => {}} />
            <PhoneBtn label="▲" onPress={navUp} />
            <PhoneBtn label="C" onPress={() => {}} />
          </div>
        )}

        {/* Center nav */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <PhoneBtn label="◀" onPress={() => {}} />
          <PhoneBtn label={open ? "BACK" : "OK"} onPress={open ? back : navOk} accent />
          <PhoneBtn label="▶" onPress={() => {}} />
        </div>

        {/* Down row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <PhoneBtn label="" onPress={() => {}} />
          <PhoneBtn label="▼" onPress={navDown} />
          <PhoneBtn label="" onPress={() => {}} />
        </div>
      </div>
    </div>
  );
}

function PhoneBtn({ label, onPress, accent, wide }: {
  label: string; onPress: () => void; accent?: boolean; wide?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onPointerDown={() => { setPressed(true); onPress(); }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        background: pressed ? BTN_BORDER : (accent ? SCREEN_DIM : BTN_BG),
        color: accent ? SCREEN_FG : "#888",
        border: `1px solid ${BTN_BORDER}`,
        borderBottom: pressed ? `1px solid ${BTN_BORDER}` : `3px solid ${BTN_SHADOW}`,
        borderRadius: 6,
        padding: "10px 4px",
        fontSize: 11,
        fontFamily: "'Courier New', monospace",
        fontWeight: 700,
        letterSpacing: "0.05em",
        cursor: "pointer",
        gridColumn: wide ? "span 1" : undefined,
        transform: pressed ? "translateY(2px)" : "none",
        transition: "transform 0.05s",
        minHeight: 40,
      }}
    >
      {label}
    </button>
  );
}
