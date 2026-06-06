"use client";

import { useState, useRef, useEffect } from "react";

const STATIONS = [
  {
    id: "kexp",
    name: "KEXP",
    city: "Seattle, WA",
    freq: "90.3",
    stream: "https://kexp-mp3-128.streamguys1.com/kexp128.mp3",
  },
  {
    id: "radiox",
    name: "Radio X",
    city: "London, UK",
    freq: "104.9",
    stream: "https://media-ssl.musicradio.com/RadioXUK",
  },
  {
    id: "bbc6",
    name: "BBC Radio 6",
    city: "London, UK",
    freq: "DAB",
    stream: "http://as-hls-ww-live.akamaized.net/pool_81827798/live/ww/bbc_6music/bbc_6music.isml/bbc_6music-audio=320000.norewind.m3u8",
  },
  {
    id: "absolute",
    name: "Absolute Radio",
    city: "London, UK",
    freq: "105.8",
    stream: "http://stream-ar.planetradio.co.uk/absoluteradiohigh.aac?direct=true&aw_0_1st.playerid=BMUK_Airable&aw_0_1st.skey=6778249992&aw_0_1st.bauer_loggedin=true",
  },
];

interface NowPlaying {
  artist: string;
  title: string;
  album?: string;
  art?: string;
}

export default function RadioApp() {
  const [active, setActive] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vol, setVol] = useState(0.8);
  const [tick, setTick] = useState(0);
  const [nowPlaying, setNowPlaying] = useState<Record<string, NowPlaying>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // animación de onda
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 500);
    return () => clearInterval(id);
  }, []);

  // now playing — poll cada 30s
  useEffect(() => {
    function fetchNP() {
      fetch("/api/nowplaying")
        .then(r => r.json())
        .then(setNowPlaying)
        .catch(() => {});
    }
    fetchNP();
    const id = setInterval(fetchNP, 30000);
    return () => clearInterval(id);
  }, []);

  function play(stationId: string) {
    const station = STATIONS.find(s => s.id === stationId)!;
    // misma emisora → solo toggle pause/play
    if (active === stationId) {
      togglePause();
      return;
    }
    // nueva emisora
    setLoading(true);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    const audio = new Audio(station.stream);
    audio.volume = vol;
    audio.play().then(() => { setLoading(false); setPlaying(true); }).catch(() => setLoading(false));
    audioRef.current = audio;
    setActive(stationId);
    setPlaying(true);
  }

  function togglePause() {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    } else {
      audioRef.current.pause();
      setPlaying(false);
    }
  }

  function handleVol(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVol(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const activeStation = STATIONS.find(s => s.id === active);
  const np = active ? nowPlaying[active] : null;
  const bars = [3, 6, 9, 7, 5, 8, 6, 4, 7, 5, 3, 6];

  return (
    <div style={{ height: "100%", display: "flex", justifyContent: "center", overflowY: "auto" }}>
    <div style={{ padding: "16px", fontFamily: "monospace", fontSize: 12, display: "flex", flexDirection: "column", width: "100%", maxWidth: 360, gap: 12 }}>

      {/* Now playing */}
      <div style={{ borderBottom: "2px solid #1a1a1a", paddingBottom: 12 }}>
        <div style={{ fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 4 }}>
          {!active ? "○ OFF" : loading ? "CONNECTING..." : playing ? "● ON AIR" : "⏸ PAUSED"}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          {/* Album art */}
          <div style={{
            width: 52, height: 52, flexShrink: 0,
            border: "1.5px solid #1a1a1a",
            background: "#f0ede8",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            {np?.art ? (
              <img src={np.art} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)" }} />
            ) : (
              <span style={{ fontSize: 22 }}>📻</span>
            )}
          </div>

          {/* Track info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {np ? (
              <>
                <div style={{ fontWeight: 700, fontSize: 12, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {np.title || "—"}
                </div>
                <div style={{ fontSize: 10, color: "#555", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {np.artist}
                </div>
                {np.album && <div style={{ fontSize: 9, color: "#888", marginTop: 1 }}>{np.album}</div>}
              </>
            ) : (
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {activeStation ? activeStation.name : "— — —"}
              </div>
            )}
            {activeStation && (
              <div style={{ fontSize: 9, color: "#888", marginTop: 4, letterSpacing: "0.1em" }}>
                {activeStation.city} · {activeStation.freq} FM
              </div>
            )}
          </div>
        </div>

        {/* Waveform */}
        <div style={{ height: 20, display: "flex", alignItems: "flex-end", gap: 2, marginTop: 10 }}>
          {bars.map((h, i) => (
            <div key={i} style={{
              flex: 1,
              height: active && playing && !loading ? `${Math.max(2, ((h + (tick + i) % 5) / 14) * 100)}%` : 2,
              background: active ? "#1a1a1a" : "#ddd",
              transition: "height 0.4s ease",
            }} />
          ))}
        </div>
      </div>

      {/* Stations */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {STATIONS.map(s => (
          <button key={s.id} onClick={() => play(s.id)} style={{
            background: active === s.id ? "#1a1a1a" : "transparent",
            color: active === s.id ? "#fff" : "#1a1a1a",
            border: "1.5px solid #1a1a1a",
            padding: "9px 12px",
            cursor: "pointer",
            fontFamily: "monospace",
            textAlign: "left",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: "0.05em" }}>{s.name}</div>
            <div style={{ fontSize: 9, opacity: 0.5, letterSpacing: "0.1em" }}>{s.freq} FM</div>
          </button>
        ))}
      </div>

      {/* Volumen + pausa */}
      <div style={{ marginTop: "auto", borderTop: "1px solid #ddd", paddingTop: 10 }}>
        <div style={{ fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase", color: "#888", marginBottom: 5 }}>VOL</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 9 }}>▁</span>
          <input type="range" min="0" max="1" step="0.05" value={vol} onChange={handleVol}
            style={{ flex: 1, accentColor: "#1a1a1a", cursor: "pointer" }} />
          <span style={{ fontSize: 9 }}>█</span>
          <button onClick={() => active && togglePause()} style={{
            background: "#1a1a1a", color: "#fff",
            border: "none", width: 28, height: 28,
            cursor: active ? "pointer" : "default",
            fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
            opacity: active ? 1 : 0.3, flexShrink: 0,
          }}>
            {playing ? "⏸" : "▶"}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
