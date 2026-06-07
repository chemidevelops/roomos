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
import TerminalApp from "@/components/ui/TerminalApp";
import CalculatorApp from "@/components/ui/CalculatorApp";
import StatsApp from "@/components/ui/StatsApp";
import AlarmApp from "@/components/ui/AlarmApp";
import RSSApp from "@/components/ui/RSSApp";
import CalendarApp from "@/components/ui/CalendarApp";
import PodcastApp from "@/components/ui/PodcastApp";
import RadioApp from "@/components/ui/RadioApp";
import TVApp from "@/components/ui/TVApp";
import StickyLayer, { addStickyRef } from "@/components/ui/StickyLayer";
import { WALLPAPER_STYLES, STORAGE_KEY, THEME_KEY, type WallpaperKey, type ThemeKey } from "@/components/ui/SettingsApp";
import NewsTicker from "@/components/ui/NewsTicker";
import TVLayout from "@/components/ui/TVLayout";
import MobileOS from "@/components/ui/MobileOS";

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
   Icon grid constants
───────────────────────────────────────────────────────────── */
const GRID_COL = 88;
const GRID_ROW = 96;
const ICON_W = 80;

/* ─────────────────────────────────────────────────────────────
   Icon definitions
───────────────────────────────────────────────────────────── */
const APP_ICONS = [
  { id: "calendar",   icon: "📅", label: "Agenda" },
  { id: "notes",      icon: "📓", label: "Notes" },
  { id: "settings",   icon: "⚙️",  label: "Settings" },
  { id: "solitaire",  icon: "🃏", label: "Solitaire" },
  { id: "terminal",   icon: "💻", label: "Terminal" },
  { id: "calculator", icon: "🧮", label: "Calc" },
  { id: "stats",      icon: "📊", label: "Stats" },
  { id: "rss",        icon: "📡", label: "RSS" },
  { id: "podcasts",   icon: "🎙️", label: "Podcasts" },
  { id: "radio",      icon: "📻", label: "Radio" },
  { id: "tv",         icon: "📺", label: "TV" },
];

/* ─────────────────────────────────────────────────────────────
   Window initial state factory — adapts to viewport
───────────────────────────────────────────────────────────── */
function makeWindows(vw: number): WindowState[] {
  const mobile = vw < 768;
  const W = mobile ? Math.min(vw - 16, 420) : undefined;

  return [
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
    {
      id: "terminal",
      title: "Terminal",
      icon: "💻",
      open: false,
      minimized: false,
      focused: false,
      zIndex: 3,
      position: mobile ? { x: 8, y: 60 } : { x: 240, y: 80 },
      width: mobile ? (W ?? 520) : 520,
      height: 380,
    },
    {
      id: "calculator",
      title: "Calculator",
      icon: "🧮",
      open: false,
      minimized: false,
      focused: false,
      zIndex: 2,
      position: mobile ? { x: 8, y: 60 } : { x: 400, y: 120 },
      width: mobile ? (W ?? 280) : 280,
      height: "auto",
    },
    {
      id: "stats",
      title: "Stats",
      icon: "📊",
      open: false,
      minimized: false,
      focused: false,
      zIndex: 1,
      position: mobile ? { x: 8, y: 60 } : { x: 180, y: 60 },
      width: W ?? 480,
      height: "auto",
    },
    {
      id: "podcasts",
      title: "Podcasts",
      icon: "🎙️",
      open: false,
      minimized: false,
      focused: false,
      zIndex: 1,
      position: mobile ? { x: 8, y: 60 } : { x: 200, y: 80 },
      width: W ?? 620,
      height: 480,
    },
    {
      id: "rss",
      title: "RSS",
      icon: "📡",
      open: false,
      minimized: false,
      focused: false,
      zIndex: 1,
      position: mobile ? { x: 8, y: 60 } : { x: 180, y: 80 },
      width: W ?? 680,
      height: 480,
    },
    {
      id: "tv",
      title: "TV",
      icon: "📺",
      open: false,
      minimized: false,
      focused: false,
      zIndex: 1,
      position: mobile ? { x: 8, y: 60 } : { x: 160, y: 60 },
      width: W ?? 640,
      height: 420,
    },
    {
      id: "radio",
      title: "Radio",
      icon: "📻",
      open: false,
      minimized: false,
      focused: false,
      zIndex: 1,
      position: mobile ? { x: 8, y: 60 } : { x: 300, y: 120 },
      width: W ?? 280,
      height: 520,
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

    case "notes":    return <NotesApp />;
    case "calendar": return <ScheduleApp />;
    case "settings":  return <SettingsApp />;
    case "solitaire":   return <SolitaireApp />;
    case "terminal":    return <TerminalApp onOpenApp={(id) => onOpenWindow(id)} />;
    case "calculator":  return <CalculatorApp />;
    case "stats":       return <StatsApp />;
    case "alarms":      return <AlarmApp />;
    case "rss":         return <RSSApp />;
    case "calendar":    return <CalendarApp />;
    case "podcasts":    return <PodcastApp />;
    case "radio":       return <RadioApp />;
    case "tv":          return <TVApp />;
    default:            return <div style={{ padding: "24px", textAlign: "center", color: "#6b6560" }}>{id}</div>;
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
  return { background: WALLPAPER_STYLES[key] };
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
  const [wallpaper, setWallpaper] = useState<WallpaperKey>("retro-mac");
  const [theme, setTheme] = useState<ThemeKey>("retro-mac");
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isMobileRef = useRef(isMobile);
  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vw = window.innerWidth;
    isMobileRef.current = vw < 768;
    setWindows(makeWindows(vw));

    // Load wallpaper + theme
    const saved = localStorage.getItem(STORAGE_KEY) as WallpaperKey | null;
    if (saved && WALLPAPER_STYLES[saved]) setWallpaper(saved);
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemeKey | null;
    if (savedTheme) setTheme(savedTheme);

    // Listen for changes from SettingsApp
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && WALLPAPER_STYLES[e.newValue as WallpaperKey]) {
        setWallpaper(e.newValue as WallpaperKey);
      }
      if (e.key === THEME_KEY && e.newValue) {
        setTheme(e.newValue as ThemeKey);
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

  /* ── Icon positions ── */
  const ICON_STORAGE_KEY = "roomos-icon-positions";

  function defaultIconPositions(vw: number, vh: number): Record<string, { x: number; y: number }> {
    const mobile = vw < 768;
    const maxCols = mobile ? 4 : 2;
    const maxRows = Math.floor((vh - 36) / GRID_ROW);
    const positions: Record<string, { x: number; y: number }> = {};
    APP_ICONS.forEach((icon, i) => {
      const col = mobile ? (i % maxCols) : Math.floor(i / maxRows);
      const row = mobile ? Math.floor(i / maxCols) : (i % maxRows);
      positions[icon.id] = { x: col * GRID_COL, y: row * GRID_ROW };
    });
    return positions;
  }

  const ICON_STORAGE_VERSION = "v4";

  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    if (typeof window === "undefined") return {};
    const defaults = defaultIconPositions(window.innerWidth, window.innerHeight);
    try {
      const version = localStorage.getItem(ICON_STORAGE_KEY + "-version");
      if (version === ICON_STORAGE_VERSION) {
        const saved = localStorage.getItem(ICON_STORAGE_KEY);
        if (saved) return { ...defaults, ...JSON.parse(saved) };
      }
    } catch {}
    return defaults;
  });

  useEffect(() => {
    const version = localStorage.getItem(ICON_STORAGE_KEY + "-version");
    if (version !== ICON_STORAGE_VERSION) {
      const positions = defaultIconPositions(window.innerWidth, window.innerHeight);
      localStorage.setItem(ICON_STORAGE_KEY, JSON.stringify(positions));
      localStorage.setItem(ICON_STORAGE_KEY + "-version", ICON_STORAGE_VERSION);
      setIconPositions(positions);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onResetIcons = () => {
      const positions = defaultIconPositions(window.innerWidth, window.innerHeight);
      localStorage.setItem(ICON_STORAGE_KEY, JSON.stringify(positions));
      setIconPositions(positions);
    };
    window.addEventListener("roomos-reset-icons", onResetIcons);
    return () => window.removeEventListener("roomos-reset-icons", onResetIcons);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const snapToGrid = useCallback((id: string, rawX: number, rawY: number, current: Record<string, { x: number; y: number }>) => {
    const col = Math.round(rawX / GRID_COL);
    const row = Math.round(rawY / GRID_ROW);
    const snappedX = col * GRID_COL;
    const snappedY = row * GRID_ROW;
    // Check if another icon already occupies this slot
    const occupied = Object.entries(current).some(([oid, pos]) => {
      if (oid === id) return false;
      return Math.round(pos.x / GRID_COL) === col && Math.round(pos.y / GRID_ROW) === row;
    });
    if (occupied) return null; // reject — keep original position
    return { x: snappedX, y: snappedY };
  }, []);

  const updateIconPosition = useCallback((id: string, rawX: number, rawY: number) => {
    setIconPositions(prev => {
      const snapped = snapToGrid(id, rawX, rawY, prev);
      // If slot occupied and no prior position recorded, snap to nearest free slot
      if (!snapped && !prev[id]) {
        const defaults = defaultIconPositions(window.innerWidth, window.innerHeight);
        const pos = defaults[id] ?? { x: 0, y: 0 };
        const next = { ...prev, [id]: pos };
        localStorage.setItem(ICON_STORAGE_KEY, JSON.stringify(next));
        localStorage.setItem(ICON_STORAGE_KEY + "-version", ICON_STORAGE_VERSION);
        return next;
      }
      const pos = snapped ?? prev[id];
      if (!pos) return prev;
      const next = { ...prev, [id]: pos };
      localStorage.setItem(ICON_STORAGE_KEY, JSON.stringify(next));
      localStorage.setItem(ICON_STORAGE_KEY + "-version", ICON_STORAGE_VERSION);
      return next;
    });
  }, [snapToGrid]);

  const mobile = isMobileRef.current;
  const bgStyle = getWallpaperStyle(wallpaper);

  // For grid wallpaper, add grid lines via additional style
  const gridOverlay = wallpaper === "grid" ? {
    backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
  } : {};

  return (
    <div
      ref={desktopRef}
      style={{
        position: "fixed", inset: 0, overflow: "hidden", paddingBottom: "58px",
        ...bgStyle,
        ...gridOverlay,
      }}
      onClick={() => setSelectedIcon(null)}
    >
      {/* Icons — draggable, absolutely positioned */}
      <div style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none" }}>
        {APP_ICONS.map((di) => {
          const pos = iconPositions[di.id] ?? { x: 12, y: 12 };
          return (
            <div key={di.id} style={{ pointerEvents: "all" }}>
              <DesktopIconItem
                id={di.id}
                icon={di.icon}
                label={di.label}
                x={pos.x}
                y={pos.y}
                selected={selectedIcon === di.id}
                onSelect={() => setSelectedIcon(di.id)}
                onDoubleClick={() => handleIconActivate(di.id)}
                onDragEnd={(x, y) => updateIconPosition(di.id, x, y)}
                retroMode={theme === "retro-mac"}
              />
            </div>
          );
        })}
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
            retroMode={theme === "retro-mac"}
          >
            <WindowContent id={w.id} onOpenWindow={openWindow} />
          </OSWindow>
        ))}

      {/* Sticky notes layer */}
      <StickyLayer />

      {/* News ticker */}
      <NewsTicker />

      {/* Taskbar */}
      <OSTaskbar
        windows={windows}
        onWindowClick={handleTaskbarClick}
        onLauncherClick={() => { openWindow("home"); focusWindow("home"); }}
        onNewSticky={() => addStickyRef.current?.()}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */
export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTV, setIsTV] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    const tv = /AppleTV|TV Safari|TVOS|tvOS/i.test(ua) || window.innerWidth >= 1920 && window.innerHeight >= 1080 && /Safari/.test(ua) && !/iPhone|iPad|Mac/.test(ua);
    const mobile = !tv && window.innerWidth < 640;
    setIsTV(tv);
    setIsMobile(mobile);
  }, []);
  if (isTV) return <TVLayout />;
  if (isMobile) return <MobileOS />;
  return <Desktop />;
}
