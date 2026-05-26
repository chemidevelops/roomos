"use client";

import { useState, useEffect } from "react";

export type WallpaperKey = "gradient-dark" | "win95" | "grid" | "mac7" | "amiga";

interface Swatch {
  id: WallpaperKey;
  label: string;
  preview: string; // inline CSS background for swatch preview
}

const SWATCHES: Swatch[] = [
  {
    id: "gradient-dark",
    label: "Deep Blue",
    preview: "linear-gradient(135deg, #1a1a2e 0%, #16213e 35%, #0f3460 65%, #1a1a2e 100%)",
  },
  {
    id: "win95",
    label: "Win95 Teal",
    preview: "#008080",
  },
  {
    id: "grid",
    label: "Grid",
    preview: "#111",
  },
  {
    id: "mac7",
    label: "Mac7 Stripes",
    preview: "repeating-linear-gradient(45deg, #2a2a2a 0px, #2a2a2a 8px, #3a3a3a 8px, #3a3a3a 16px)",
  },
  {
    id: "amiga",
    label: "Amiga",
    preview: "linear-gradient(to bottom, #0055aa 50%, #ff8800 50%)",
  },
];

export const WALLPAPER_STYLES: Record<WallpaperKey, string> = {
  "gradient-dark": "linear-gradient(135deg, #1a1a2e 0%, #16213e 35%, #0f3460 65%, #1a1a2e 100%)",
  "win95": "#008080",
  "grid": "#111",
  "mac7": "repeating-linear-gradient(45deg, #2a2a2a 0px, #2a2a2a 8px, #3a3a3a 8px, #3a3a3a 16px)",
  "amiga": "linear-gradient(to bottom, #0055aa 50%, #ff8800 50%)",
};

export const STORAGE_KEY = "roomos-wallpaper";

export default function SettingsApp() {
  const [current, setCurrent] = useState<WallpaperKey>("gradient-dark");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as WallpaperKey | null;
    if (saved) setCurrent(saved);
  }, []);

  const select = (id: WallpaperKey) => {
    setCurrent(id);
    localStorage.setItem(STORAGE_KEY, id);
    // Dispatch storage event so Desktop can pick it up
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: id }));
  };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b6560", marginBottom: "12px" }}>
          Wallpaper
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {SWATCHES.map((sw) => (
            <button
              key={sw.id}
              onClick={() => select(sw.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "48px",
                  background: sw.preview,
                  border: current === sw.id ? "3px solid #f5c800" : "2px solid #1a1a1a",
                  boxShadow: current === sw.id ? "3px 3px 0 #1a1a1a" : "2px 2px 0 #1a1a1a",
                  borderRadius: "2px",
                }}
              />
              <span style={{ fontSize: "10px", fontWeight: current === sw.id ? 700 : 500, color: "#1a1a1a", fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                {sw.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
