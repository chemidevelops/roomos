"use client";

import { useState, useEffect, useRef } from "react";

const FEEDS = [{ name: "Mesón Sol", url: "https://feeds.acast.com/public/shows/meson-sol" }];

interface Episode { title: string; description: string; pubDate: string; duration: string; audioUrl: string; guid: string; }
interface Feed { title: string; image: string; episodes: Episode[]; }

function fmtDuration(d: string) {
  if (!d) return "";
  if (d.includes(":")) return d;
  const s = parseInt(d);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  return h > 0 ? `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}` : `${m}:${String(sec).padStart(2,"0")}`;
}

export default function TVPodcastApp() {
  const [feedData, setFeedData] = useState<Feed | null>(null);
  const [selected, setSelected] = useState<Episode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch(`/api/podcast?url=${encodeURIComponent(FEEDS[0].url)}`).then(r => r.json()).then(setFeedData).catch(() => {});
  }, []);

  function playEpisode(ep: Episode) {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    const audio = new Audio(ep.audioUrl);
    audio.ontimeupdate = () => setProgress(audio.currentTime);
    audio.ondurationchange = () => setDuration(audio.duration);
    audio.onended = () => setPlaying(false);
    audio.play().catch(() => {});
    audioRef.current = audio;
    setSelected(ep);
    setPlaying(true);
    setProgress(0);
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (audioRef.current.paused) { audioRef.current.play(); setPlaying(true); }
    else { audioRef.current.pause(); setPlaying(false); }
  }

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  return (
    <div style={{ width: "100%", height: "100%", background: "#0f0f0f", color: "#fff", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Player */}
      {selected && (
        <div style={{ padding: "24px 48px", background: "#111", borderBottom: "1px solid #222", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <button onClick={togglePlay} style={{
              width: 64, height: 64, borderRadius: "50%", background: "#fff",
              border: "none", cursor: "pointer", fontSize: 24, color: "#000", flexShrink: 0,
            }}>{playing ? "⏸" : "▶"}</button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selected.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 14, color: "#888", flexShrink: 0 }}>{fmtTime(progress)}</span>
                <input type="range" min={0} max={duration || 1} step={1} value={progress}
                  onChange={e => { const t = parseFloat(e.target.value); if (audioRef.current) audioRef.current.currentTime = t; setProgress(t); }}
                  style={{ flex: 1, accentColor: "#fff", cursor: "pointer" }} />
                <span style={{ fontSize: 14, color: "#888", flexShrink: 0 }}>{fmtTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Episode list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 48px" }}>
        {!feedData && <div style={{ padding: 40, color: "#555", fontSize: 20 }}>Cargando...</div>}
        {feedData?.episodes.map((ep, i) => (
          <div key={ep.guid} onClick={() => playEpisode(ep)} style={{
            padding: "20px 0", borderBottom: "1px solid #1a1a1a", cursor: "pointer",
            display: "flex", gap: 24, alignItems: "center",
            background: selected?.guid === ep.guid ? "rgba(255,255,255,0.05)" : "transparent",
          }}>
            <div style={{
              width: 48, height: 48, background: selected?.guid === ep.guid && playing ? "#fff" : "#222",
              color: selected?.guid === ep.guid && playing ? "#000" : "#888",
              borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700, flexShrink: 0,
            }}>
              {selected?.guid === ep.guid && playing ? "▶" : i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.3, marginBottom: 6 }}>{ep.title}</div>
              <div style={{ fontSize: 15, color: "#666" }}>
                {ep.pubDate ? fmtDate(ep.pubDate) : ""}
                {ep.duration ? ` · ${fmtDuration(ep.duration)}` : ""}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
