"use client";

import { useState, useRef, useEffect } from "react";

const STATIONS = [
  {
    id: "kexp",
    name: "KEXP",
    city: "Seattle, WA",
    desc: "90.3 FM — Independent music",
    stream: "https://live-aacplus-64.kexp.org/kexp64.aac",
    freq: "90.3",
  },
  {
    id: "radiox",
    name: "Radio X",
    city: "London, UK",
    desc: "Rock & Alternative",
    stream: "https://media-ssl.musicradio.com/RadioXUK",
    freq: "104.9",
  },
];

export default function RadioApp() {
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [vol, setVol] = useState(0.8);
  const [tick, setTick] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // animación de onda
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 400);
    return () => clearInterval(id);
  }, []);

  function play(stationId: string) {
    const station = STATIONS.find(s => s.id === stationId)!;
    if (active === stationId) {
      audioRef.current?.pause();
      setActive(null);
      return;
    }
    setLoading(true);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    const audio = new Audio(station.stream);
    audio.volume = vol;
    audio.play().then(() => setLoading(false)).catch(() => setLoading(false));
    audioRef.current = audio;
    setActive(stationId);
  }

  function handleVol(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVol(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const bars = [3, 5, 8, 6, 4, 7, 5, 3, 6, 4];

  return (
    <div style={{ padding: "16px", fontFamily: "monospace", fontSize: 12, height: "100%" }}>

      {/* Header */}
      <div style={{ borderBottom: "2px solid #1a1a1a", paddingBottom: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 2 }}>
          ◈ RADIO
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.05em" }}>
          {active ? STATIONS.find(s => s.id === active)!.name : "— — —"}
        </div>
        {active && (
          <div style={{ fontSize: 8, color: "#888", marginTop: 2, letterSpacing: "0.1em" }}>
            {loading ? "CONNECTING..." : "● ON AIR"}
          </div>
        )}
      </div>

      {/* Waveform */}
      <div style={{ height: 32, display: "flex", alignItems: "flex-end", gap: 2, marginBottom: 16 }}>
        {bars.map((h, i) => (
          <div key={i} style={{
            width: 6,
            height: active && !loading ? `${((h + (tick + i) % 4) / 12) * 100}%` : 3,
            background: active ? "#1a1a1a" : "#ddd",
            transition: "height 0.3s ease",
          }} />
        ))}
        <div style={{ flex: 1, borderBottom: "1px solid #ddd", marginBottom: 1 }} />
      </div>

      {/* Stations */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {STATIONS.map(s => (
          <button
            key={s.id}
            onClick={() => play(s.id)}
            style={{
              background: active === s.id ? "#1a1a1a" : "transparent",
              color: active === s.id ? "#fff" : "#1a1a1a",
              border: "1.5px solid #1a1a1a",
              padding: "10px 12px",
              cursor: "pointer",
              fontFamily: "monospace",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.05em" }}>{s.name}</div>
              <div style={{ fontSize: 9, opacity: 0.6, marginTop: 2, letterSpacing: "0.1em" }}>
                {s.city} · {s.desc}
              </div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, opacity: 0.3, letterSpacing: "-1px" }}>
              {s.freq}
            </div>
          </button>
        ))}
      </div>

      {/* Volumen */}
      <div style={{ borderTop: "1px solid #ddd", paddingTop: 12 }}>
        <div style={{ fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase", color: "#888", marginBottom: 6 }}>
          VOL
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10 }}>▁</span>
          <input
            type="range" min="0" max="1" step="0.05" value={vol}
            onChange={handleVol}
            style={{ flex: 1, accentColor: "#1a1a1a", cursor: "pointer" }}
          />
          <span style={{ fontSize: 10 }}>█</span>
        </div>
      </div>
    </div>
  );
}
