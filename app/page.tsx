"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import FocusTimer from "@/components/ui/FocusTimer";
import OSWindow from "@/components/ui/OSWindow";
import DesktopIconItem from "@/components/ui/DesktopIconItem";
import OSTaskbar from "@/components/ui/OSTaskbar";
import NotesApp from "@/components/ui/NotesApp";
import BacklogApp from "@/components/ui/BacklogApp";
import ScheduleApp from "@/components/ui/ScheduleApp";
import SettingsApp from "@/components/ui/SettingsApp";
import SolitaireApp from "@/components/ui/SolitaireApp";
import { WALLPAPER_STYLES, STORAGE_KEY, type WallpaperKey } from "@/components/ui/SettingsApp";

/* ─────────────────────────────────────────────────────────────
   Types
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
   Icon definitions
───────────────────────────────────────────────────────────── */
const APP_ICONS = [
  { id: "home",     icon: "🏠", label: "Home" },
  { id: "now",      icon: "📺", label: "Now" },
  { id: "focus",    icon: "⏱", label: "Focus" },
  { id: "backlog",  icon: "📋", label: "Backlog" },
  { id: "notes",    icon: "📓", label: "Notes" },
  { id: "calendar", icon: "📅", label: "Schedule" },
  { id: "settings", icon: "⚙️",  label: "Settings" },
  { id: "solitaire", icon: "🃏", label: "Solitaire" },
];

/* ─────────────────────────────────────────────────────────────
   Window initial state factory — adapts to viewport
───────────────────────────────────────────────────────────── */
function makeWindows(vw: number): WindowState[] {
  const mobile = vw < 768;
  const W = mobile ? Math.min(vw - 16, 420) : undefined;

  return [
    {
      id: "now",
      title: "NOW",
      icon: "📺",
      open: true,
      minimized: false,
      focused: true,
      zIndex: 11,
      position: mobile ? { x: 8, y: 48 } : { x: 160, y: 40 },
      width: W ?? 400,
      height: "auto",
    },
    {
      id: "focus",
      title: "Focus Timer",
      icon: "⏱",
      open: !mobile,
      minimized: false,
      focused: false,
      zIndex: 10,
      position: mobile ? { x: 8, y: 80 } : { x: 580, y: 40 },
      width: W ?? 340,
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
      position: mobile ? { x: 8, y: 60 } : { x: 220, y: 80 },
      width: W ?? 440,
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
      position: mobile ? { x: 8, y: 60 } : { x: 300, y: 100 },
      width: W ?? 520,
      height: "auto",
    },
    {
      id: "notes",
      title: "Notes",
      icon: "📓",
      open: false,
      minimized: false,
      focused: false,
      zIndex: 7,
      position: mobile ? { x: 8, y: 60 } : { x: 260, y: 120 },
      width: W ?? 560,
      height: "auto",
    },
    {
      id: "calendar",
      title: "Schedule",
      icon: "📅",
      open: false,
      minimized: false,
      focused: false,
      zIndex: 6,
      position: mobile ? { x: 8, y: 60 } : { x: 320, y: 60 },
      width: W ?? 480,
      height: "auto",
    },
    {
      id: "settings",
      title: "Settings",
      icon: "⚙️",
      open: false,
      minimized: false,
      focused: false,
      zIndex: 5,
      position: mobile ? { x: 8, y: 60 } : { x: 280, y: 90 },
      width: W ?? 420,
      height: "auto",
    },
    {
      id: "solitaire",
      title: "Solitaire",
      icon: "🃏",
      open: false,
      minimized: false,
      focused: false,
      zIndex: 4,
      position: mobile ? { x: 8, y: 60 } : { x: 200, y: 60 },
      width: mobile ? (W ?? 360) : 560,
      height: "auto",
    },
  ];
}

/* ─────────────────────────────────────────────────────────────
   Window content: NOW — fetches from schedule API
───────────────────────────────────────────────────────────── */
interface ScheduleEntry {
  id: string;
  item_title?: string;
  category?: string;
  color?: string;
  start_min: number;
  end_min: number;
}

function minToTime(min: number) {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function NowWindowContent() {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/schedule?date=${today}`)
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {});
    const tick = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(tick);
  }, []);

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const current = entries.find((e) => e.start_min <= nowMin && e.end_min > nowMin);
  const upcoming = entries.filter((e) => e.start_min > nowMin).slice(0, 3);

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b6560" }}>
        Now
      </div>
      {current ? (
        <div>
          <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "24px", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.1 }}>
            {current.item_title}
          </div>
          <div style={{ fontSize: "13px", color: "#1a1a1a", opacity: 0.65, marginTop: "4px" }}>
            {current.category} · {minToTime(current.start_min)}–{minToTime(current.end_min)}
          </div>
          <div style={{ marginTop: "10px", height: "10px", background: "rgba(26,26,26,0.12)", border: "1.5px solid #1a1a1a", borderRadius: "2px", position: "relative", overflow: "hidden" }}>
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%",
              width: `${Math.min(100, ((nowMin - current.start_min) / (current.end_min - current.start_min)) * 100)}%`,
              background: current.color ?? "#f5c800", borderRadius: "1px",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: "var(--font-jetbrains-mono), monospace", color: "#1a1a1a", opacity: 0.55, marginTop: "4px" }}>
            <span>{minToTime(current.start_min)}</span><span>{minToTime(current.end_min)}</span>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: "15px", color: "#6b6560", fontStyle: "italic" }}>Nothing scheduled right now.</div>
      )}

      {upcoming.length > 0 && (
        <>
          <div style={{ height: "1px", background: "#e8e2d5" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6560" }}>Up next</div>
            {upcoming.map((entry) => (
              <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: "#f0ebe0", border: "1.5px solid #1a1a1a", borderRadius: "2px" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: entry.color ?? "#6b6560", flexShrink: 0 }} />
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#1a1a1a", flex: 1 }}>{entry.item_title}</span>
                <span style={{ fontSize: "10px", fontFamily: "var(--font-jetbrains-mono), monospace", color: "#6b6560" }}>{minToTime(entry.start_min)}</span>
                {entry.category && (
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff", background: entry.color ?? "#6b6560", padding: "2px 7px", borderRadius: "2px", letterSpacing: "0.04em" }}>{entry.category}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
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
      <div>
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6560", marginBottom: "8px" }}>Quick launch</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            { id: "now",      label: "📺 NOW",         desc: "Current activity" },
            { id: "focus",    label: "⏱ Focus Timer",  desc: "Pomodoro session" },
            { id: "backlog",  label: "📋 Backlog",      desc: "Manage your queue" },
            { id: "notes",    label: "📓 Notes",        desc: "Quick notes" },
            { id: "calendar", label: "📅 Schedule",     desc: "Today's plan" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onOpenWindow(item.id)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "transparent", border: "1.5px solid #1a1a1a", borderRadius: "2px", cursor: "pointer", fontFamily: "var(--font-space-grotesk), sans-serif", textAlign: "left", transition: "background 0.1s" }}
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
   Window content router
───────────────────────────────────────────────────────────── */
function WindowContent({ id, onOpenWindow }: { id: string; onOpenWindow: (id: string) => void }) {
  switch (id) {
    case "now":      return <NowWindowContent />;
    case "focus":    return <div style={{ padding: "16px" }}><FocusTimer compact={false} /></div>;
    case "home":     return <HomeWindowContent onOpenWindow={onOpenWindow} />;
    case "backlog":  return <BacklogApp />;
    case "notes":    return <NotesApp />;
    case "calendar": return <ScheduleApp />;
    case "settings":  return <SettingsApp />;
    case "solitaire": return <SolitaireApp />;
    default:          return <div style={{ padding: "24px", textAlign: "center", color: "#6b6560" }}>{id}</div>;
  }
}

/* ─────────────────────────────────────────────────────────────
   Mobile icon grid (home screen, shown behind windows)
───────────────────────────────────────────────────────────── */
function MobileIconGrid({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div style={{ padding: "28px 20px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px 8px" }}>
      {APP_ICONS.map((item) => (
        <button
          key={item.id}
          onPointerDown={() => onOpen(item.id)}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", background: "transparent", border: "none", cursor: "pointer", padding: "4px", WebkitTapHighlightColor: "transparent" }}
        >
          <div style={{ fontSize: "36px", lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
            {item.icon}
          </div>
          <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "10px", fontWeight: 600, color: "#fff", background: "rgba(0,0,0,0.45)", padding: "1px 5px", borderRadius: "2px", letterSpacing: "0.02em", backdropFilter: "blur(4px)" }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Wallpaper helpers
───────────────────────────────────────────────────────────── */
function getWallpaperStyle(key: WallpaperKey): React.CSSProperties {
  const style = WALLPAPER_STYLES[key];
  // Determine if it's a color or gradient/image
  if (style.startsWith("#") || style.startsWith("rgb")) {
    return { backgroundColor: style };
  }
  return { backgroundImage: style };
}

/* ─────────────────────────────────────────────────────────────
   Unified Desktop — works on all screen sizes
───────────────────────────────────────────────────────────── */
function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>(() => makeWindows(
    typeof window !== "undefined" ? window.innerWidth : 1280
  ));
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [maxZ, setMaxZ] = useState(11);
  const [wallpaper, setWallpaper] = useState<WallpaperKey>("gradient-dark");
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isMobileRef = useRef(isMobile);

  useEffect(() => {
    const vw = window.innerWidth;
    isMobileRef.current = vw < 768;
    setWindows(makeWindows(vw));

    // Load wallpaper
    const saved = localStorage.getItem(STORAGE_KEY) as WallpaperKey | null;
    if (saved && WALLPAPER_STYLES[saved]) setWallpaper(saved);

    // Listen for wallpaper changes from SettingsApp
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && WALLPAPER_STYLES[e.newValue as WallpaperKey]) {
        setWallpaper(e.newValue as WallpaperKey);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const focusWindow = useCallback((id: string) => {
    setMaxZ((prev) => {
      const nextZ = prev + 1;
      setWindows((ws) =>
        ws.map((w) => ({ ...w, focused: w.id === id, zIndex: w.id === id ? nextZ : w.zIndex }))
      );
      return nextZ;
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, open: false, focused: false } : w)));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true, focused: false } : w)));
  }, []);

  const openWindow = useCallback((id: string) => {
    setWindows((ws) => {
      return ws.map((w) =>
        w.id === id
          ? { ...w, open: true, minimized: false, focused: true, zIndex: maxZ + 1 }
          : { ...w, focused: false }
      );
    });
    setMaxZ((z) => z + 1);
  }, [maxZ]);

  const handleTaskbarClick = useCallback((id: string) => {
    const w = windows.find((win) => win.id === id);
    if (!w) return;
    if (w.focused && !w.minimized) minimizeWindow(id);
    else { openWindow(id); focusWindow(id); }
  }, [windows, minimizeWindow, openWindow, focusWindow]);

  const handleIconActivate = useCallback((id: string) => {
    openWindow(id);
    focusWindow(id);
    setSelectedIcon(null);
  }, [openWindow, focusWindow]);

  const mobile = isMobileRef.current;
  const bgStyle = getWallpaperStyle(wallpaper);

  // For grid wallpaper, add grid lines via additional style
  const gridOverlay = wallpaper === "grid" ? {
    backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
  } : {};

  return (
    <div
      style={{
        position: "fixed", inset: 0, overflow: "hidden", paddingBottom: "36px",
        ...bgStyle,
        ...gridOverlay,
      }}
      onClick={() => setSelectedIcon(null)}
    >
      {/* Icons — column on desktop, grid on mobile */}
      <div
        style={mobile ? { position: "absolute", top: 0, left: 0, right: 0, zIndex: 5 } : {
          position: "absolute", top: "20px", left: "20px",
          display: "flex", flexDirection: "column", gap: "6px", zIndex: 5,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {mobile ? (
          <MobileIconGrid onOpen={handleIconActivate} />
        ) : (
          APP_ICONS.map((di) => (
            <DesktopIconItem
              key={di.id}
              icon={di.icon}
              label={di.label}
              selected={selectedIcon === di.id}
              onSelect={() => setSelectedIcon(di.id)}
              onDoubleClick={() => handleIconActivate(di.id)}
            />
          ))
        )}
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
        onLauncherClick={() => { openWindow("home"); focusWindow("home"); }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */
export default function Home() {
  return <Desktop />;
}
