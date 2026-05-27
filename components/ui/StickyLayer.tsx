"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import StickyNote, { type StickyData, type StickyColor } from "./StickyNote";

const STORAGE_KEY = "roomos-stickies";
const COLORS: StickyColor[] = ["yellow", "pink", "green", "blue"];

// Module-level ref so external components (e.g. taskbar) can call addSticky
export const addStickyRef: { current: (() => void) | null } = { current: null };

export default function StickyLayer() {
  const [stickies, setStickies] = useState<StickyData[]>([]);
  const colorIndexRef = useRef(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStickies(JSON.parse(saved));
    } catch {}
  }, []);

  const persist = useCallback((next: StickyData[]) => {
    setStickies(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const addSticky = useCallback(() => {
    const color = COLORS[colorIndexRef.current % COLORS.length];
    colorIndexRef.current++;
    const newSticky: StickyData = {
      id: crypto.randomUUID(),
      content: "",
      color,
      x: 200 + Math.random() * 300,
      y: 80 + Math.random() * 200,
    };
    setStickies((prev) => {
      const next = [...prev, newSticky];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // Register the addSticky function for external use
  useEffect(() => {
    addStickyRef.current = addSticky;
    return () => { addStickyRef.current = null; };
  }, [addSticky]);

  const handleClose = useCallback((id: string) => {
    setStickies((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const handleChange = useCallback((id: string, content: string) => {
    setStickies((prev) => {
      const next = prev.map((s) => s.id === id ? { ...s, content } : s);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    setStickies((prev) => {
      const next = prev.map((s) => s.id === id ? { ...s, x, y } : s);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 500 }}>
      {stickies.map((s) => (
        <div key={s.id} style={{ pointerEvents: "all" }}>
          <StickyNote
            data={s}
            onClose={handleClose}
            onChange={handleChange}
            onDragEnd={handleDragEnd}
          />
        </div>
      ))}
    </div>
  );
}
