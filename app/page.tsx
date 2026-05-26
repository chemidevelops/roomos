"use client";

import { useState, useCallback } from "react";
import FocusTimer from "@/components/ui/FocusTimer";
import OSWindow from "@/components/ui/OSWindow";
import DesktopIconItem from "@/components/ui/DesktopIconItem";
import OSTaskbar from "@/components/ui/OSTaskbar";

/* ─────────────────────────────────────────────────────────────
   Window state types
───────────────────────────────────────────────────────────── */
interface WindowState {
  id: string;
  title: string;
  icon: string;
  open: boolean;
  minimized: boolean;
  focused: boolean;
  zIndex: number;
  position: { x: number; y: number };
  width: number;
  height?: number | "auto";
}

/* ─────────────────────────────────────────────────────────────
   Desktop icon definitions
───────────────────────────────────────────────────────────── */
const DESKTOP_ICONS = [
  { id: "home",     icon: "🏠", label: "Home" },
  { id: "focus",    icon: "⏱", label: "Focus" },
  { id: "backlog",  icon: "📋", label: "Backlog" },
  { id: "journal",  icon: "📓", label: "Journal" },
  { id: "settings", icon: "⚙️",  label: "Settings" },
];

/* ─────────────────────────────────────────────────────────────
   Window content: NOW
───────────────────────────────────────────────────────────── */
const QUEUE = [
  { title: "Shetland S02E04", category: "Series", color: "#1d4ed8" },
  { title: "Patlabor Vol. 2",  category: "Manga",  color: "#dc2626" },
  { title: "Hokuto no Ken",    category: "Anime",  color: "#0d9488" },
];

function NowWindowContent() {
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* NOW label */}
      <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b6560" }}>
        Now
      </div>

      {/* Title */}
      <div>
        <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "24px", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.1 }}>
          Final Fantasy X
        </div>
        <div style={{ fontSize: "13px", color: "#1a1a1a", opacity: 0.65, marginTop: "4px" }}>
          🎮 Videojuegos · 90 min
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ height: "10px", background: "rgba(26,26,26,0.12)", border: "1.5px solid #1a1a1a", borderRadius: "2px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "40%", background: "#f5c800", borderRadius: "1px" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: "var(--font-jetbrains-mono), monospace", color: "#1a1a1a", opacity: 0.55, marginTop: "4px" }}>
          <span>36:00</span>
          <span>90:00</span>
        </div>
      </div>

      {/* Start button */}
      <button
        className="btn-brutal"
        style={{
          width: "100%",
          padding: "10px 0",
          background: "#f5c800",
          color: "#1a1a1a",
          fontSize: "13px",
          fontWeight: 700,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          borderRadius: "2px",
          border: "2px solid #1a1a1a",
          cursor: "pointer",
        }}
      >
        Start session →
      </button>

      {/* Divider */}
      <div style={{ height: "1px", background: "#e8e2d5" }} />

      {/* Queue preview */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6560" }}>Up next</div>
        {QUEUE.map((item) => (
          <div key={item.title} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: "#f0ebe0", border: "1.5px solid #1a1a1a", borderRadius: "2px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: "13px", fontWeight: 500, color: "#1a1a1a", flex: 1 }}>{item.title}</span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#faf7f2", background: item.color, padding: "2px 7px", borderRadius: "2px", letterSpacing: "0.04em" }}>{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Window content: HOME
───────────────────────────────────────────────────────────── */
function HomeWindowContent({ onOpenWindow }: { onOpenWindow: (id: string) => void }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "26px", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.1 }}>
          {greeting}, Jose
        </div>
        <div style={{ fontSize: "13px", color: "#6b6560", marginTop: "5px" }}>{today}</div>
      </div>

      {/* Mini stats */}
      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ flex: 1, padding: "12px", background: "#f0ebe0", border: "2px solid #1a1a1a", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "28px", fontWeight: 700, color: "#1a1a1a", lineHeight: 1 }}>12</div>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6560", marginTop: "4px" }}>Day streak</div>
        </div>
        <div style={{ flex: 1, padding: "12px", background: "#f5c800", border: "2px solid #1a1a1a", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "28px", fontWeight: 700, color: "#1a1a1a", lineHeight: 1 }}>3/5</div>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1a1a", marginTop: "4px" }}>Done today</div>
        </div>
      </div>

      {/* Quick launch */}
      <div>
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6560", marginBottom: "8px" }}>Quick launch</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            { id: "now", label: "📺 NOW — Final Fantasy X", desc: "Current activity" },
            { id: "focus", label: "⏱ Focus Timer", desc: "Pomodoro session" },
            { id: "backlog", label: "📋 Backlog", desc: "Manage your queue" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onOpenWindow(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 12px",
                background: "transparent",
                border: "1.5px solid #1a1a1a",
                borderRadius: "2px",
                cursor: "pointer",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                textAlign: "left",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f0ebe0")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
            >
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>{item.label}</span>
              <span style={{ fontSize: "11px", color: "#6b6560" }}>{item.desc} →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Window content: PLACEHOLDER
───────────────────────────────────────────────────────────── */
function PlaceholderWindowContent({ name }: { name: string }) {
  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "120px", gap: "8px" }}>
      <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "18px", fontWeight: 700, color: "#1a1a1a" }}>{name}</div>
      <div style={{ fontSize: "13px", color: "#6b6560" }}>Coming soon.</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MOBILE — home screen with icons + full-screen windows
───────────────────────────────────────────────────────────── */
const MOBILE_ICONS = [
  { id: "home",     icon: "🏠", label: "Home" },
  { id: "now",      icon: "📺", label: "Now" },
  { id: "focus",    icon: "⏱", label: "Focus" },
  { id: "backlog",  icon: "📋", label: "Backlog" },
  { id: "journal",  icon: "📓", label: "Journal" },
  { id: "settings", icon: "⚙️",  label: "Settings" },
];

function MobileWindow({
  id, title, icon, onClose, onOpenWindow,
}: { id: string; title: string; icon: string; onClose: () => void; onOpenWindow: (id: string) => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", flexDirection: "column",
      background: "#f0ebe0",
      animation: "slideUp 0.22s cubic-bezier(0.32,0.72,0,1)",
    }}>
      {/* Title bar */}
      <div style={{
        height: "44px", flexShrink: 0,
        background: "#1a1a1a",
        display: "flex", alignItems: "center",
        padding: "0 12px", gap: "10px",
      }}>
        <button
          onClick={onClose}
          style={{
            width: "28px", height: "28px",
            borderRadius: "2px", border: "2px solid #333",
            background: "#dc2626", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", color: "#fff", fontWeight: 700, flexShrink: 0,
          }}
        >×</button>
        <span style={{ fontSize: "16px" }}>{icon}</span>
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: "14px", fontWeight: 700,
          color: "#faf7f2", letterSpacing: "0.04em",
          flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{title}</span>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <WindowContent id={id} onOpenWindow={onOpenWindow} />
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function MobileView() {
  const [openApp, setOpenApp] = useState<string | null>(null);

  const activeIcon = openApp ? MOBILE_ICONS.find(i => i.id === openApp) : null;

  return (
    <div className="desktop-pattern" style={{ minHeight: "100dvh", background: "#f0ebe0", position: "relative" }}>
      {/* Status bar */}
      <div style={{
        height: "36px", background: "#1a1a1a",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
      }}>
        <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "13px", fontWeight: 800, letterSpacing: "0.1em", color: "#f5c800" }}>rOS</span>
        <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
          {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
        </span>
      </div>

      {/* Icon grid */}
      <div style={{
        padding: "32px 24px",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "24px 16px",
      }}>
        {MOBILE_ICONS.map((item) => (
          <button
            key={item.id}
            onClick={() => setOpenApp(item.id)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
              background: "transparent", border: "none", cursor: "pointer", padding: "4px",
            }}
          >
            <div style={{
              width: "64px", height: "64px",
              background: "#faf7f2",
              border: "2px solid #1a1a1a",
              boxShadow: "3px 3px 0px #1a1a1a",
              borderRadius: "4px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px",
            }}>
              {item.icon}
            </div>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "11px", fontWeight: 700,
              color: "#1a1a1a", letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Full-screen window */}
      {openApp && activeIcon && (
        <MobileWindow
          id={openApp}
          title={activeIcon.label}
          icon={activeIcon.icon}
          onClose={() => setOpenApp(null)}
          onOpenWindow={(id) => setOpenApp(id)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Initial window definitions
───────────────────────────────────────────────────────────── */
const INITIAL_WINDOWS: WindowState[] = [
  {
    id: "now",
    title: "NOW",
    icon: "📺",
    open: true,
    minimized: false,
    focused: true,
    zIndex: 11,
    position: { x: 160, y: 40 },
    width: 400,
    height: "auto",
  },
  {
    id: "focus",
    title: "Focus Timer",
    icon: "⏱",
    open: true,
    minimized: false,
    focused: false,
    zIndex: 10,
    position: { x: 580, y: 40 },
    width: 340,
    height: "auto",
  },
  {
    id: "home",
    title: "Home",
    icon: "🏠",
    open: false,
    minimized: false,
    focused: false,
    zIndex: 9,
    position: { x: 220, y: 80 },
    width: 440,
    height: "auto",
  },
  {
    id: "backlog",
    title: "Backlog",
    icon: "📋",
    open: false,
    minimized: false,
    focused: false,
    zIndex: 8,
    position: { x: 300, y: 100 },
    width: 480,
    height: "auto",
  },
  {
    id: "journal",
    title: "Journal",
    icon: "📓",
    open: false,
    minimized: false,
    focused: false,
    zIndex: 7,
    position: { x: 260, y: 120 },
    width: 460,
    height: "auto",
  },
  {
    id: "settings",
    title: "Settings",
    icon: "⚙️",
    open: false,
    minimized: false,
    focused: false,
    zIndex: 6,
    position: { x: 280, y: 90 },
    width: 420,
    height: "auto",
  },
];

/* ─────────────────────────────────────────────────────────────
   Desktop environment — renders window content by id
───────────────────────────────────────────────────────────── */
function WindowContent({ id, onOpenWindow }: { id: string; onOpenWindow: (id: string) => void }) {
  switch (id) {
    case "now":      return <NowWindowContent />;
    case "focus":    return <div style={{ padding: "16px" }}><FocusTimer compact={false} /></div>;
    case "home":     return <HomeWindowContent onOpenWindow={onOpenWindow} />;
    case "backlog":  return <PlaceholderWindowContent name="Backlog" />;
    case "journal":  return <PlaceholderWindowContent name="Journal" />;
    case "settings": return <PlaceholderWindowContent name="Settings" />;
    default:         return <PlaceholderWindowContent name={id} />;
  }
}

/* ─────────────────────────────────────────────────────────────
   Desktop — main OS environment
───────────────────────────────────────────────────────────── */
function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [maxZ, setMaxZ] = useState(11);

  const focusWindow = useCallback((id: string) => {
    setMaxZ((prev) => {
      const nextZ = prev + 1;
      setWindows((ws) =>
        ws.map((w) => ({
          ...w,
          focused: w.id === id,
          zIndex: w.id === id ? nextZ : w.zIndex,
        }))
      );
      return nextZ;
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, open: false, focused: false } : w)));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((ws) =>
      ws.map((w) => (w.id === id ? { ...w, minimized: true, focused: false } : w))
    );
  }, []);

  const openWindow = useCallback(
    (id: string) => {
      setWindows((ws) => {
        const exists = ws.find((w) => w.id === id);
        if (exists) {
          return ws.map((w) =>
            w.id === id
              ? { ...w, open: true, minimized: false, focused: true, zIndex: maxZ + 1 }
              : { ...w, focused: false }
          );
        }
        // Shouldn't happen with our pre-defined list, but just in case
        return ws;
      });
      setMaxZ((z) => z + 1);
    },
    [maxZ]
  );

  const handleTaskbarClick = useCallback(
    (id: string) => {
      const w = windows.find((win) => win.id === id);
      if (!w) return;
      if (w.focused && !w.minimized) {
        minimizeWindow(id);
      } else {
        openWindow(id);
        focusWindow(id);
      }
    },
    [windows, minimizeWindow, openWindow, focusWindow]
  );

  const handleIconDoubleClick = useCallback(
    (id: string) => {
      openWindow(id);
      focusWindow(id);
      setSelectedIcon(null);
    },
    [openWindow, focusWindow]
  );

  return (
    <div
      className="desktop-pattern"
      style={{
        position: "fixed",
        inset: 0,
        background: "#f0ebe0",
        overflow: "hidden",
        paddingBottom: "36px",
      }}
      onClick={() => setSelectedIcon(null)}
    >
      {/* Desktop icons column — left side */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          zIndex: 5,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {DESKTOP_ICONS.map((di) => (
          <DesktopIconItem
            key={di.id}
            icon={di.icon}
            label={di.label}
            selected={selectedIcon === di.id}
            onSelect={() => setSelectedIcon(di.id)}
            onDoubleClick={() => handleIconDoubleClick(di.id)}
          />
        ))}
      </div>

      {/* Windows */}
      {windows
        .filter((w) => w.open)
        .map((w) => (
          <OSWindow
            key={w.id}
            id={w.id}
            title={w.title}
            icon={w.icon}
            defaultPosition={w.position}
            width={w.width}
            height={w.height}
            focused={w.focused}
            onFocus={() => focusWindow(w.id)}
            onClose={() => closeWindow(w.id)}
            onMinimize={() => minimizeWindow(w.id)}
            minimized={w.minimized}
            zIndex={w.zIndex}
          >
            <WindowContent id={w.id} onOpenWindow={openWindow} />
          </OSWindow>
        ))}

      {/* Taskbar */}
      <OSTaskbar
        windows={windows}
        onWindowClick={handleTaskbarClick}
        onLauncherClick={() => {
          // Open home window as a simple launcher action
          openWindow("home");
          focusWindow("home");
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGE — switches between desktop and mobile layout
───────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      {/* Desktop OS — hidden on mobile */}
      <div className="desktop-os-layer">
        <Desktop />
      </div>

      {/* Mobile layout — hidden on desktop */}
      <div className="mobile-os-layer">
        <MobileView />
      </div>

      <style>{`
        .desktop-os-layer {
          display: block;
        }
        .mobile-os-layer {
          display: none;
        }
        @media (max-width: 767px) {
          .desktop-os-layer {
            display: none;
          }
          .mobile-os-layer {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
