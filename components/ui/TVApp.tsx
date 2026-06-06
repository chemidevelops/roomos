"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const LIVE_MUSIC_ARTISTS = [
  "Oasis live concert", "Liam Gallagher live", "Noel Gallagher live",
  "Arctic Monkeys live concert", "Suede live concert", "Pulp live concert",
  "Stereophonics live", "Shame band live", "Fontaines DC live",
  "Ocean Colour Scene live", "Blur live concert", "The Smiths live",
  "Joy Division live", "Richard Ashcroft live", "Kaiser Chiefs live",
  "The Lathums live", "Kula Shaker live", "The Coral live",
  "Alex Turner live", "Babyshambles live", "The Libertines live",
  "Black Midi live", "Blossoms live", "Do Nothing band live",
  "Doves live concert", "Jake Bugg live", "Kasabian live",
  "The Kooks live", "Gerry Cinnamon live", "Miles Kane live",
  "Stone Roses live", "The Strokes live", "Paolo Nutini live",
  "Peter Doherty live", "Shed Seven live", "Wunderhorse live",
  "Maximo Park live", "The Murder Capital live", "Sports Team live",
  "Sundara Karma live", "Viva Brother live", "Palma Violets live",
  "The Reytons live", "The Royston Club live", "Andrew Cushin live",
  "The Last Shadow Puppets live", "The Sherlocks live", "Feet band live",
  "The Snuts live", "The K's band live", "The Amazons live",
  "Been Stellar live", "Flyte band live", "Gurriers live",
  "The Luka State live", "Mando Diao live", "The Seahorses live",
  "Sheafs live", "Sugarmen live", "Esmeralda Road live",
];

const CHANNELS = [
  {
    id: "games",
    label: "GAMES",
    type: "rss" as const,
    sources: [
      { id: "UC2vUKoTGIwNYq4LO0YWKPIg", name: "HappyConsoleGamer" },
      { id: "UCdB41UXrNAU_J7A7OnU4KSQ", name: "Japan Gemu" },
      { id: "UCoDEcuE22DENRU493EJeCEA", name: "sergiño" },
      { id: "UC-Y4Z-8quogo45x8vY2V8Aw", name: "Perspectivas Pixeladas" },
      { id: "UCiqwLswhzwJZeWwfocewNbg", name: "hazylevels" },
      { id: "UC0fDG3byEcMtbOqPMymDNbw", name: "/noclip" },
    ],
  },
  {
    id: "japan",
    label: "JAPAN",
    type: "rss" as const,
    sources: [
      { id: "UCAv5d8knSA-hRtD27lD_E_w", name: "Abao Ambience" },
      { id: "UCoXm66ArnAYGC0SCItOb2Tg", name: "4K JAPAN" },
    ],
  },
  {
    id: "music",
    label: "LIVE MUSIC",
    type: "search" as const,
    queries: LIVE_MUSIC_ARTISTS,
    sources: [],
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


export default function TVApp() {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);
  const [mode, setMode] = useState<Mode>("tv");
  const [videos, setVideos] = useState<Video[]>([]);
  const [queue, setQueue] = useState<Video[]>([]);
  const [current, setCurrent] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [rssVideos, setRssVideos] = useState<Video[]>([]);
  const trackingRef = useRef<{ label: string; start: number } | null>(null);
  const nextRef = useRef<() => void>(() => {});
  const videosRef = useRef<Video[]>([]);
  const queueRef = useRef<Video[]>([]);
  const nextCalledRef = useRef(false);

  function logUsage(label: string, start: number) {
    const seconds = Math.round((Date.now() - start) / 1000);
    if (seconds < 10) return;
    fetch("/api/usage", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "tv", label, seconds }) }).catch(() => {});
  }

  // Cargar videos del canal activo
  useEffect(() => {
    setLoading(true);
    setStreamUrl(null);

    if (activeChannel.type === "search") {
      // Elegir queries aleatorias para no repetir siempre lo mismo
      const qs = shuffle(activeChannel.queries ?? []).slice(0, 12);
      Promise.all(
        qs.map(q =>
          fetch(`/api/ytsearch?q=${encodeURIComponent(q)}&n=3`)
            .then(r => r.json())
            .then(d => (d.ids as string[]).map(id => ({
              id, title: q.replace(" live", "").replace(" concert", ""),
              channelName: "Live Music", published: "", thumb: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
            })))
            .catch(() => [] as Video[])
        )
      ).then(results => {
        const all = shuffle(results.flat());
        setRssVideos(all);
        setVideos(all);
        setQueue(all);
        setCurrent(all[0] ?? null);
        setLoading(false);
      });
    } else {
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
    }
  }, [activeChannel]);

  // Log uso del video anterior al cambiar
  useEffect(() => {
    if (trackingRef.current) logUsage(trackingRef.current.label, trackingRef.current.start);
    if (current) trackingRef.current = { label: current.title, start: Date.now() };
  }, [current]);

  // Guardar progreso cada 2 minutos mientras reproduce
  useEffect(() => {
    const id = setInterval(() => {
      if (trackingRef.current && streamUrl) {
        logUsage(trackingRef.current.label, trackingRef.current.start);
        trackingRef.current = { label: trackingRef.current.label, start: Date.now() };
      }
    }, 2 * 60 * 1000);
    return () => clearInterval(id);
  }, [streamUrl]);

  // El stream va directo al proxy (que llama yt-dlp internamente)
  useEffect(() => {
    if (!current) return;
    setStreamUrl(null);
    setStreamLoading(true);
    // HEAD para verificar que el stream está listo antes de ponerlo en el <video>
    fetch(`/api/stream?v=${current.id}`, { method: "HEAD" })
      .then(r => {
        if (r.ok) setStreamUrl(`/api/stream?v=${current.id}`);
        else setStreamUrl(null);
      })
      .catch(() => setStreamUrl(null))
      .finally(() => setStreamLoading(false));
  }, [current]);

  // Siguiente video — usa refs para evitar stale closures
  function next() {
    const q = queueRef.current;
    const rest = q.slice(1);
    const newQ = rest.length > 0 ? rest : shuffle(videosRef.current);
    queueRef.current = newQ;
    setQueue(newQ);
    setCurrent(newQ[0] ?? null);
  }

  // Mantener refs actualizados
  useEffect(() => { videosRef.current = videos; }, [videos]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { nextRef.current = next; });
  // Resetear guard al cambiar de video
  useEffect(() => { nextCalledRef.current = false; }, [current]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

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
          <div style={{ flex: 1, background: "#000", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {streamLoading && (
              <div style={{ color: "#555", fontSize: 12, fontFamily: "monospace" }}>Cargando stream...</div>
            )}
            {streamUrl && (
              <video
                key={streamUrl}
                src={streamUrl}
                controls
                playsInline
                autoPlay
                onEnded={() => { if (!nextCalledRef.current) { nextCalledRef.current = true; nextRef.current(); } }}
                onTimeUpdate={e => {
                  const v = e.currentTarget;
                  if (!nextCalledRef.current && v.duration && v.currentTime >= v.duration - 0.5) {
                    nextCalledRef.current = true;
                    nextRef.current();
                  }
                }}
                ref={el => {
                  if (!el) return;
                  el.muted = true;
                  el.setAttribute("muted", "");
                  const tryPlay = () => {
                    el.play().then(() => {
                      // Desmutear al primer toque
                      const unmute = () => { el.muted = false; };
                      document.addEventListener("click", unmute, { once: true });
                      document.addEventListener("touchstart", unmute, { once: true });
                    }).catch(() => {});
                  };
                  if (el.readyState >= 3) tryPlay();
                  else el.addEventListener("canplay", tryPlay, { once: true });
                }}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            )}
            {!streamLoading && !streamUrl && current && (
              <div style={{ color: "#555", fontSize: 11, fontFamily: "monospace", textAlign: "center", padding: 20 }}>
                Vídeo no disponible.<br/>
                <button onClick={() => nextRef.current()} style={{ marginTop: 8, background: "#333", color: "#fff", border: "none", padding: "4px 12px", cursor: "pointer", fontFamily: "monospace", fontSize: 10 }}>
                  Siguiente →
                </button>
              </div>
            )}
          </div>
          {/* Info bar */}
          <div style={{ padding: "8px 12px", background: "#111", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3, color: "#fff", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
