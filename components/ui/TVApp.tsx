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
      { id: "UCcaesp6l2FQFdcw5e-Pzgtg", name: "Marc Rollan" },
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
  {
    id: "retro",
    label: "RETRO",
    type: "playlist" as const,
    playlists: [
      "PLg9cBZGseLNsV5NTxxFuaSwjZuDGUwo0T",
      "PLH4SfqNVbXjNDUq-XgO9NTBUwN_cOzw4T",
    ],
    sources: [],
    crt: true,
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

type YouTubePlayerInstance = {
  playVideo: () => void;
  mute: () => void;
  unMute: () => void;
  loadVideoById: (videoId: string) => void;
  destroy: () => void;
};

type YouTubeNamespace = {
  Player: new (
    element: HTMLDivElement,
    options: {
      videoId: string;
      playerVars: Record<string, number>;
      events: {
        onReady: (event: { target: YouTubePlayerInstance }) => void;
        onStateChange: (event: { data: number }) => void;
        onError?: (event: { data: number }) => void;
      };
    },
  ) => YouTubePlayerInstance;
  PlayerState: { ENDED: number };
};

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubeNamespace> | null = null;

function loadYouTubeApi(): Promise<YouTubeNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise(resolve => {
    window.onYouTubeIframeAPIReady = () => {
      if (window.YT) resolve(window.YT);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

function YouTubeFallback({ video, onEnded }: { video: Video; onEnded: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const onEndedRef = useRef(onEnded);
  const videoIdRef = useRef(video.id);
  const readyRef = useRef(false);

  useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);
  useEffect(() => {
    videoIdRef.current = video.id;
    if (readyRef.current) playerRef.current?.loadVideoById(video.id);
  }, [video.id]);

  useEffect(() => {
    let cancelled = false;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    loadYouTubeApi().then(YT => {
      if (cancelled || !containerRef.current) return;
      playerRef.current = new YT.Player(containerRef.current, {
        videoId: videoIdRef.current,
        playerVars: { autoplay: 1, controls: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: event => {
            readyRef.current = true;
            if (isMobile) {
              event.target.mute();
            }
            event.target.playVideo();
          },
          onStateChange: event => {
            if (event.data === YT.PlayerState.ENDED) onEndedRef.current();
          },
          onError: (event: { data: number }) => {
            if ([100, 101, 150].includes(event.data)) {
              setTimeout(() => onEndedRef.current(), 500);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      readyRef.current = false;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}


export default function TVApp() {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);
  const [mode, setMode] = useState<Mode>("tv");
  const [videos, setVideos] = useState<Video[]>([]);
  const [queue, setQueue] = useState<Video[]>([]);
  const [current, setCurrent] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
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

    if (activeChannel.type === "search") {
      const queries = shuffle(activeChannel.queries ?? []).slice(0, 12);
      Promise.all(
        queries.map(query =>
          fetch(`/api/ytsearch?q=${encodeURIComponent(query)}&n=3`)
            .then(r => r.json())
            .then(d => (d.ids as string[]).map(id => ({
              id,
              title: query.replace(" live", "").replace(" concert", ""),
              channelName: "Live Music",
              published: "",
              thumb: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
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
      return;
    }

    if (activeChannel.type === "playlist") {
      Promise.all(
        (activeChannel.playlists ?? []).map(pid =>
          fetch(`/api/youtube?playlistId=${pid}`)
            .then(r => r.json())
            .then(d => d.videos as Video[])
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
      return;
    }

    Promise.all(
      activeChannel.sources.map(source =>
        fetch(`/api/youtube?channelId=${source.id}`)
          .then(r => r.json())
          .then(d => d.videos as Video[])
          .catch(() => [] as Video[])
      )
    ).then(results => {
      const all = results.flat();
      const sorted = [...all].sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
      const shuffled = shuffle(all);
      setRssVideos(sorted);
      setVideos(shuffled);
      setQueue(shuffled);
      setCurrent(shuffled[0] ?? null);
      setLoading(false);
    });
  }, [activeChannel]);

  // Log uso del video anterior al cambiar
  useEffect(() => {
    if (trackingRef.current) logUsage(trackingRef.current.label, trackingRef.current.start);
    if (current) trackingRef.current = { label: current.title, start: Date.now() };
  }, [current]);

  // Guardar progreso cada 2 minutos mientras reproduce
  useEffect(() => {
    const id = setInterval(() => {
      if (trackingRef.current && current) {
        logUsage(trackingRef.current.label, trackingRef.current.start);
        trackingRef.current = { label: trackingRef.current.label, start: Date.now() };
      }
    }, 2 * 60 * 1000);
    return () => clearInterval(id);
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

  const advanceOnce = useCallback(() => {
    if (nextCalledRef.current) return;
    nextCalledRef.current = true;
    nextRef.current();
  }, []);

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "monospace", fontSize: 12, background: "#0a0a0a", color: "#fff" }}>

      {/* Channel bar */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 0, borderBottom: "1px solid #333", flexShrink: 0 }}>
        {CHANNELS.map(ch => (
          <button key={ch.id} onClick={() => setActiveChannel(ch)} style={{
            background: activeChannel.id === ch.id ? "#fff" : "transparent",
            color: activeChannel.id === ch.id ? "#000" : "#888",
            border: "none", padding: "10px 14px",
            cursor: "pointer", fontFamily: "monospace",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            display: "flex", alignItems: "center",
          }}>{ch.label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setMode("tv")} style={{
          background: mode === "tv" ? "#f5c800" : "transparent",
          color: mode === "tv" ? "#000" : "#888",
          border: "none", padding: "10px 16px",
          cursor: "pointer", fontFamily: "monospace", fontSize: 12, fontWeight: 700,
        }}>▶ TV</button>
        <button onClick={() => setMode("rss")} style={{
          background: mode === "rss" ? "#f5c800" : "transparent",
          color: mode === "rss" ? "#000" : "#888",
          border: "none", padding: "10px 16px",
          cursor: "pointer", fontFamily: "monospace", fontSize: 12, fontWeight: 700,
        }}>≡ FEED</button>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#555" }}>
          Loading...
        </div>
      ) : (
        <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
          {/* TV stays mounted so playback continues in feed mode. */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            visibility: mode === "tv" ? "visible" : "hidden",
            pointerEvents: mode === "tv" ? "auto" : "none",
          }}>
          {/* Video */}
          <div style={{ flex: 1, background: "#000", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {current && <YouTubeFallback video={current} onEnded={advanceOnce} />}
            {/* CRT overlay for retro channel */}
            {(activeChannel as any).crt && (
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10,
                background: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.25) 3px, rgba(0,0,0,0.25) 4px)",
                mixBlendMode: "multiply",
              }} />
            )}
          </div>
          {/* Info bar — bigger for TV */}
          <div style={{ padding: "12px 16px", background: "#111", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {current?.title}
              </div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 3 }}>
                {current?.channelName} {current?.published ? `· ${formatDate(current.published)}` : ""}
              </div>
            </div>
            <button onClick={next} style={{
              background: "#222", border: "1px solid #444",
              color: "#fff", padding: "10px 20px", cursor: "pointer",
              fontFamily: "monospace", fontSize: 14, fontWeight: 700, flexShrink: 0,
            }}>Siguiente →</button>
          </div>
        </div>

          {/* ── RSS/FEED MODE ── */}
          <div style={{
            position: "absolute", inset: 0, overflowY: "auto",
            background: "#0a0a0a",
            visibility: mode === "rss" ? "visible" : "hidden",
            pointerEvents: mode === "rss" ? "auto" : "none",
          }}>
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
        </div>
      )}
    </div>
  );
}
