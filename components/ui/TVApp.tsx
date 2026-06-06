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
            {current && (
              <YouTubeFallback
                video={current}
                onEnded={advanceOnce}
              />
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
