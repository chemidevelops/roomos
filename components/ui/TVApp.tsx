"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const CHANNELS = [
  {
    id: "games",
    label: "GAMES",
    sources: [
      { id: "UC2vUKoTGIwNYq4LO0YWKPIg", name: "HappyConsoleGamer" },
      { id: "UCdB41UXrNAU_J7A7OnU4KSQ", name: "Japan Gemu" },
      { id: "UCoDEcuE22DENRU493EJeCEA", name: "sergiño" },
      { id: "UC-Y4Z-8quogo45x8vY2V8Aw", name: "Perspectivas Pixeladas" },
      { id: "UCiqwLswhzwJZeWwfocewNbg", name: "hazylevels" },
      { id: "UC0fDG3byEcMtbOqPMymDNbw", name: "/noclip" },
    ],
  },
];

interface Video {
  id: string;
  title: string;
  channelName: string;
  published: string;
  thumb: string;
}

type Mode = "tv" | "rss";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const INVIDIOUS = "https://inv.nadeko.net";

export default function TVApp() {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);
  const [mode, setMode] = useState<Mode>("tv");
  const [videos, setVideos] = useState<Video[]>([]);
  const [queue, setQueue] = useState<Video[]>([]);
  const [current, setCurrent] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [rssVideos, setRssVideos] = useState<Video[]>([]);

  // Cargar videos de todos los canales
  useEffect(() => {
    setLoading(true);
    Promise.all(
      activeChannel.sources.map(s =>
        fetch(`/api/youtube?channelId=${s.id}`)
          .then(r => r.json())
          .then(d => d.videos as Video[])
          .catch(() => [] as Video[])
      )
    ).then(results => {
      const all = results.flat();
      const sorted = [...all].sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
      setRssVideos(sorted);
      const shuffled = shuffle(all);
      setVideos(shuffled);
      setQueue(shuffled);
      setCurrent(shuffled[0] ?? null);
      setLoading(false);
    });
  }, [activeChannel]);

  // Siguiente video
  function next() {
    setQueue(q => {
      const rest = q.slice(1);
      const newQ = rest.length > 0 ? rest : shuffle(videos);
      setCurrent(newQ[0] ?? null);
      return newQ;
    });
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

  const embedUrl = current
    ? `${INVIDIOUS}/embed/${current.id}?autoplay=1&modestbranding=1`
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "monospace", fontSize: 12, background: "#0a0a0a", color: "#fff" }}>

      {/* Channel bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, borderBottom: "1px solid #333", flexShrink: 0 }}>
        {CHANNELS.map(ch => (
          <button key={ch.id} onClick={() => setActiveChannel(ch)} style={{
            background: activeChannel.id === ch.id ? "#fff" : "transparent",
            color: activeChannel.id === ch.id ? "#000" : "#888",
            border: "none", padding: "6px 14px",
            cursor: "pointer", fontFamily: "monospace",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
          }}>{ch.label}</button>
        ))}
        <div style={{ flex: 1 }} />
        {/* Mode toggle */}
        <button onClick={() => setMode("tv")} style={{
          background: mode === "tv" ? "#fff" : "transparent",
          color: mode === "tv" ? "#000" : "#888",
          border: "none", padding: "6px 12px",
          cursor: "pointer", fontFamily: "monospace", fontSize: 10, fontWeight: 700,
        }}>▶ TV</button>
        <button onClick={() => setMode("rss")} style={{
          background: mode === "rss" ? "#fff" : "transparent",
          color: mode === "rss" ? "#000" : "#888",
          border: "none", padding: "6px 12px",
          cursor: "pointer", fontFamily: "monospace", fontSize: 10, fontWeight: 700,
        }}>≡ FEED</button>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#555" }}>
          Loading...
        </div>
      ) : mode === "tv" ? (
        /* ── TV MODE ── */
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Video */}
          <div style={{ flex: 1, background: "#000", position: "relative" }}>
            {embedUrl && (
              <iframe
                key={current?.id}
                src={embedUrl}
                style={{ width: "100%", height: "100%", border: "none" }}
                allow="autoplay; fullscreen"
                allowFullScreen
                onLoad={() => {}}
              />
            )}
          </div>
          {/* Info bar */}
          <div style={{ padding: "8px 12px", background: "#111", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3, color: "#fff", maxWidth: "80%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {current?.title}
              </div>
              <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>
                {current?.channelName} · {current ? formatDate(current.published) : ""}
              </div>
            </div>
            <button onClick={next} style={{
              background: "transparent", border: "1px solid #444",
              color: "#fff", padding: "4px 10px", cursor: "pointer",
              fontFamily: "monospace", fontSize: 10, flexShrink: 0,
            }}>⏭ NEXT</button>
          </div>
        </div>
      ) : (
        /* ── RSS/FEED MODE ── */
        <div style={{ flex: 1, overflowY: "auto" }}>
          {rssVideos.map((v, i) => (
            <div key={i} onClick={() => { setCurrent(v); setMode("tv"); }}
              style={{ display: "flex", gap: 10, padding: "8px 10px", borderBottom: "1px solid #1a1a1a", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#111")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <img src={v.thumb} style={{ width: 80, height: 45, objectFit: "cover", flexShrink: 0, filter: "grayscale(30%)" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3, color: "#ddd", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {v.title}
                </div>
                <div style={{ fontSize: 9, color: "#555", marginTop: 3 }}>
                  {v.channelName} · {formatDate(v.published)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
