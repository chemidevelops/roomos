"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const TRACKS = [
  { artist: "BONOBO", title: "KONG" },
  { artist: "BOARDS OF CANADA", title: "ROYGBIV" },
  { artist: "MASSIVE ATTACK", title: "TEARDROP" },
  { artist: "BURIAL", title: "ARCHANGEL" },
];

const BAR_COUNT = 16;

function SpectrumBar({ index, playing }: { index: number; playing: boolean }) {
  const duration = 0.3 + Math.random() * 0.5;
  const delay = index * 0.04;
  const maxH = 20 + Math.floor(Math.random() * 20);

  return (
    <motion.div
      style={{
        width: "100%",
        background: "var(--room-green)",
        borderRadius: "1px 1px 0 0",
        transformOrigin: "bottom",
        boxShadow: "0 0 4px rgba(78,203,113,0.5)",
      }}
      animate={playing
        ? {
            scaleY: [0.1, 1, 0.2, 0.8, 0.15, 0.9, 0.1],
            height: [4, maxH, 6, maxH * 0.7, 4, maxH * 0.85, 4],
          }
        : { scaleY: 0.1, height: 4 }
      }
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function WinampWidget() {
  const [playing, setPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [volume, setVolume] = useState(80);
  const [scrollOffset, setScrollOffset] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const track = TRACKS[trackIndex];
  const totalSeconds = 210; // 3:30 fake
  const pct = Math.min(seconds / totalSeconds, 1);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= totalSeconds) {
            setTrackIndex((i) => (i + 1) % TRACKS.length);
            return 0;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  // Scrolling track title
  const trackLabel = `${track.artist} - ${track.title}`;
  useEffect(() => {
    const id = setInterval(() => {
      setScrollOffset((o) => (o + 1) % (trackLabel.length + 8));
    }, 150);
    return () => clearInterval(id);
  }, [trackLabel]);

  const scrolled = (trackLabel + "        ").substring(scrollOffset) + (trackLabel + "        ").substring(0, scrollOffset);
  const displayLabel = scrolled.substring(0, 28);

  const prev = () => { setTrackIndex((i) => (i - 1 + TRACKS.length) % TRACKS.length); setSeconds(0); };
  const next = () => { setTrackIndex((i) => (i + 1) % TRACKS.length); setSeconds(0); };
  const stop = () => { setPlaying(false); setSeconds(0); };

  const ctrlBtn = (label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      style={{
        background: "#050508",
        border: "1px solid #1a1a2e",
        color: "var(--room-green)",
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        padding: "3px 6px",
        cursor: "pointer",
        letterSpacing: "0.02em",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -1px 0 rgba(0,0,0,0.5)",
        borderRadius: "1px",
        transition: "background 0.1s",
        lineHeight: 1,
        minWidth: "24px",
        textAlign: "center",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#0a0a15")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#050508")}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      background: "#080810",
      padding: "10px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      minHeight: "0",
    }}>
      {/* Track display */}
      <div style={{
        background: "#020206",
        border: "1px solid #1a1a30",
        padding: "6px 8px",
        borderRadius: "2px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--room-green)",
          letterSpacing: "0.08em",
          textShadow: "0 0 8px rgba(78,203,113,0.6)",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}>
          {displayLabel}
        </div>

        {/* Time */}
        <div style={{
          display: "flex",
          alignItems: "baseline",
          gap: "6px",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "22px",
            fontWeight: 500,
            color: "var(--room-green)",
            letterSpacing: "0.05em",
            textShadow: "0 0 12px rgba(78,203,113,0.7)",
            lineHeight: 1,
          }}>
            {fmt(seconds)}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "rgba(78,203,113,0.4)",
          }}>
            / {fmt(totalSeconds)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: "6px",
          background: "#0a0a1a",
          border: "1px solid #1a1a30",
          borderRadius: "1px",
          position: "relative",
          cursor: "pointer",
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const p = (e.clientX - rect.left) / rect.width;
          setSeconds(Math.round(p * totalSeconds));
        }}
      >
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `${pct * 100}%`,
          background: "var(--room-green)",
          borderRadius: "1px",
          boxShadow: "0 0 6px rgba(78,203,113,0.6)",
          transition: "width 0.9s linear",
        }} />
        {/* Scrubber head */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: `${pct * 100}%`,
          transform: "translate(-50%, -50%)",
          width: "8px",
          height: "10px",
          background: "var(--room-green)",
          borderRadius: "1px",
          boxShadow: "0 0 6px rgba(78,203,113,0.8)",
        }} />
      </div>

      {/* Spectrum visualizer */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "2px",
        height: "32px",
        padding: "0 2px",
        background: "#020206",
        border: "1px solid #1a1a30",
        borderRadius: "2px",
        paddingBottom: "2px",
      }}>
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <div key={i} style={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
            <SpectrumBar index={i} playing={playing} />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
        {ctrlBtn("◀◀", prev)}
        <button
          onClick={() => setPlaying((p) => !p)}
          style={{
            background: playing ? "rgba(78,203,113,0.15)" : "#050508",
            border: `1px solid ${playing ? "rgba(78,203,113,0.4)" : "#1a1a2e"}`,
            color: "var(--room-green)",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            padding: "3px 10px",
            cursor: "pointer",
            letterSpacing: "0.02em",
            boxShadow: playing
              ? "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 8px rgba(78,203,113,0.2)"
              : "inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -1px 0 rgba(0,0,0,0.5)",
            borderRadius: "1px",
            textShadow: "0 0 6px rgba(78,203,113,0.6)",
            minWidth: "32px",
            textAlign: "center",
          }}
        >
          {playing ? "▐▐" : "▶"}
        </button>
        {ctrlBtn("■", stop)}
        {ctrlBtn("▶▶", next)}

        {/* Volume */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "5px", marginLeft: "4px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(78,203,113,0.5)", flexShrink: 0 }}>VOL</span>
          <div
            style={{
              flex: 1,
              height: "5px",
              background: "#0a0a1a",
              border: "1px solid #1a1a30",
              borderRadius: "1px",
              position: "relative",
              cursor: "pointer",
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setVolume(Math.round(((e.clientX - rect.left) / rect.width) * 100));
            }}
          >
            <div style={{
              position: "absolute",
              left: 0, top: 0, bottom: 0,
              width: `${volume}%`,
              background: "var(--room-green)",
              opacity: 0.7,
              borderRadius: "1px",
            }} />
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(78,203,113,0.5)", flexShrink: 0, minWidth: "24px" }}>{volume}%</span>
        </div>
      </div>
    </div>
  );
}
