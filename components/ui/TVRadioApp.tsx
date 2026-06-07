"use client";

import { useState, useRef, useEffect } from "react";

const STATIONS = [
  { id: "kexp",     name: "KEXP",          city: "Seattle · 90.3 FM", stream: "https://kexp-mp3-128.streamguys1.com/kexp128.mp3" },
  { id: "radiox",   name: "Radio X",       city: "London · 104.9 FM", stream: "https://media-ssl.musicradio.com/RadioXUK" },
  { id: "bbc6",     name: "BBC Radio 6",   city: "London · DAB",      stream: "http://as-hls-ww-live.akamaized.net/pool_81827798/live/ww/bbc_6music/bbc_6music.isml/bbc_6music-audio=320000.norewind.m3u8" },
  { id: "absolute", name: "Absolute Radio", city: "London · 105.8 FM", stream: "http://stream-ar.planetradio.co.uk/absoluteradiohigh.aac?direct=true&aw_0_1st.playerid=BMUK_Airable&aw_0_1st.skey=6778249992&aw_0_1st.bauer_loggedin=true" },
];

interface NowPlaying { artist: string; title: string; art?: string; }

export default function TVRadioApp() {
  const [active, setActive] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<Record<string, NowPlaying>>({});
  const [vol, setVol] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const load = () => fetch("/api/nowplaying").then(r => r.json()).then(setNowPlaying).catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  function play(stationId: string) {
    const station = STATIONS.find(s => s.id === stationId)!;
    if (active === stationId) { togglePause(); return; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    const audio = new Audio(station.stream);
    audio.volume = vol;
    audio.addEventListener("playing", () => setPlaying(true));
    audio.addEventListener("pause", () => setPlaying(false));
    audio.play().catch(() => {});
    audioRef.current = audio;
    setActive(stationId);
    setPlaying(true);
  }

  function togglePause() {
    if (!audioRef.current) return;
    if (audioRef.current.paused) { audioRef.current.play(); setPlaying(true); }
    else { audioRef.current.pause(); setPlaying(false); }
  }

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const np = active ? nowPlaying[active] : null;
  const activeStation = STATIONS.find(s => s.id === active);

  return (
    <div style={{ width: "100%", height: "100%", background: "#0f0f0f", color: "#fff", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", padding: "40px 60px", gap: 32 }}>

      {/* Now playing */}
      <div style={{ display: "flex", alignItems: "center", gap: 32, background: "#1a1a1a", borderRadius: 12, padding: 32 }}>
        {np?.art ? (
          <img src={np.art} style={{ width: 100, height: 100, borderRadius: 8, objectFit: "cover", filter: "grayscale(20%)", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 100, height: 100, background: "#333", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, flexShrink: 0 }}>📻</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {activeStation ? (
            <>
              <div style={{ fontSize: 14, color: "#888", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
                {playing ? "● EN DIRECTO" : "⏸ PAUSADO"} — {activeStation.name}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {np?.title || activeStation.name}
              </div>
              <div style={{ fontSize: 20, color: "#aaa" }}>{np?.artist || activeStation.city}</div>
            </>
          ) : (
            <div style={{ fontSize: 24, color: "#555" }}>Selecciona una emisora</div>
          )}
        </div>
        {/* Play/pause */}
        {active && (
          <button onClick={togglePause} style={{
            width: 72, height: 72, borderRadius: "50%",
            background: playing ? "#fff" : "#333",
            border: "none", cursor: "pointer",
            fontSize: 28, color: playing ? "#000" : "#fff",
            flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          }}>{playing ? "⏸" : "▶"}</button>
        )}
      </div>

      {/* Stations */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, flex: 1 }}>
        {STATIONS.map(s => (
          <button key={s.id} onClick={() => play(s.id)} style={{
            background: active === s.id ? "#fff" : "#1a1a1a",
            color: active === s.id ? "#000" : "#fff",
            border: active === s.id ? "none" : "1px solid #333",
            borderRadius: 12, padding: "28px 32px",
            cursor: "pointer", textAlign: "left",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{s.name}</div>
            <div style={{ fontSize: 16, opacity: 0.6 }}>{s.city}</div>
          </button>
        ))}
      </div>

      {/* Volume */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 16, color: "#555" }}>🔈</span>
        <input type="range" min={0} max={1} step={0.05} value={vol}
          onChange={e => { const v = parseFloat(e.target.value); setVol(v); if (audioRef.current) audioRef.current.volume = v; }}
          style={{ flex: 1, accentColor: "#fff", height: 6, cursor: "pointer" }} />
        <span style={{ fontSize: 16, color: "#555" }}>🔊</span>
      </div>
    </div>
  );
}
