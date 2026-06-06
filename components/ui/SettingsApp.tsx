"use client";

import { useState, useEffect } from "react";

export type WallpaperKey = "gradient-dark" | "win95" | "grid" | "mac7" | "amiga" | "retro-mac";
export type ThemeKey = "default" | "retro-mac";

interface Swatch {
  id: WallpaperKey;
  label: string;
  preview: string;
}

const WALLPAPER_SWATCHES: Swatch[] = [
  { id: "retro-mac",      label: "Mac Blue",    preview: "#6b8fa8" },
  { id: "win95",          label: "Win95 Teal",  preview: "#008080" },
  { id: "gradient-dark",  label: "Deep Blue",   preview: "linear-gradient(135deg, #1a1a2e 0%, #16213e 35%, #0f3460 65%, #1a1a2e 100%)" },
  { id: "grid",           label: "Grid",        preview: "#111" },
  { id: "mac7",           label: "Mac Stripes", preview: "repeating-linear-gradient(45deg, #2a2a2a 0px, #2a2a2a 8px, #3a3a3a 8px, #3a3a3a 16px)" },
  { id: "amiga",          label: "Amiga",       preview: "linear-gradient(to bottom, #0055aa 50%, #ff8800 50%)" },
];

export const WALLPAPER_STYLES: Record<WallpaperKey, string> = {
  "retro-mac":     "#6b8fa8",
  "gradient-dark": "linear-gradient(135deg, #1a1a2e 0%, #16213e 35%, #0f3460 65%, #1a1a2e 100%)",
  "win95":         "#008080",
  "grid":          "#111",
  "mac7":          "repeating-linear-gradient(45deg, #2a2a2a 0px, #2a2a2a 8px, #3a3a3a 8px, #3a3a3a 16px)",
  "amiga":         "linear-gradient(to bottom, #0055aa 50%, #ff8800 50%)",
};

export const STORAGE_KEY = "roomos-wallpaper";
export const THEME_KEY   = "roomos-theme";

export default function SettingsApp() {
  const [wallpaper, setWallpaper] = useState<WallpaperKey>("retro-mac");
  const [theme, setTheme] = useState<ThemeKey>("retro-mac");

  useEffect(() => {
    const w = localStorage.getItem(STORAGE_KEY) as WallpaperKey | null;
    const t = localStorage.getItem(THEME_KEY) as ThemeKey | null;
    if (w) setWallpaper(w);
    if (t) setTheme(t);
  }, []);

  const selectWallpaper = (id: WallpaperKey) => {
    setWallpaper(id);
    localStorage.setItem(STORAGE_KEY, id);
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: id }));
  };

  const selectTheme = (id: ThemeKey) => {
    setTheme(id);
    localStorage.setItem(THEME_KEY, id);
    window.dispatchEvent(new StorageEvent("storage", { key: THEME_KEY, newValue: id }));
  };

  const label = (text: string) => (
    <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b6560", marginBottom: "12px" }}>
      {text}
    </div>
  );

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* TEMA */}
      <div>
        {label("Tema (iconos)")}
        <div style={{ display: "flex", gap: "12px" }}>
          {([
            { id: "default" as ThemeKey,    label: "Default",    icon: "😀" },
            { id: "retro-mac" as ThemeKey,  label: "Retro Mac",  icon: "🖥️" },
          ]).map(t => (
            <button key={t.id} onClick={() => selectTheme(t.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
              background: "transparent", border: "none", cursor: "pointer", padding: 0,
            }}>
              <div style={{
                width: 72, height: 48,
                background: "#f0ebe0",
                border: theme === t.id ? "3px solid #f5c800" : "2px solid #1a1a1a",
                boxShadow: theme === t.id ? "3px 3px 0 #1a1a1a" : "2px 2px 0 #1a1a1a",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24,
              }}>{t.icon}</div>
              <span style={{ fontSize: "10px", fontWeight: theme === t.id ? 700 : 500, color: "#1a1a1a", fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* WALLPAPER */}
      <div>
        {label("Wallpaper")}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {WALLPAPER_SWATCHES.map(sw => (
            <button key={sw.id} onClick={() => selectWallpaper(sw.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
              background: "transparent", border: "none", cursor: "pointer", padding: 0,
            }}>
              <div style={{
                width: 72, height: 48,
                background: sw.preview,
                border: wallpaper === sw.id ? "3px solid #f5c800" : "2px solid #1a1a1a",
                boxShadow: wallpaper === sw.id ? "3px 3px 0 #1a1a1a" : "2px 2px 0 #1a1a1a",
                borderRadius: "2px",
              }}/>
              <span style={{ fontSize: "10px", fontWeight: wallpaper === sw.id ? 700 : 500, color: "#1a1a1a", fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                {sw.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* DESKTOP */}
      <div>
        {label("Desktop")}
        <button onClick={() => window.dispatchEvent(new Event("roomos-reset-icons"))}
          style={{ padding: "8px 16px", background: "#f0ebe0", border: "2px solid #1a1a1a", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-space-grotesk), sans-serif", boxShadow: "2px 2px 0 #1a1a1a" }}>
          Reset icon positions
        </button>
      </div>
    </div>
  );
}
