"use client";

import { useState, useEffect, useRef } from "react";

const DEFAULT_FEEDS = [
  { name: "Mesón Sol", url: "https://feeds.acast.com/public/shows/meson-sol" },
];

interface Episode {
  title: string;
  description: string;
  pubDate: string;
  duration: string;
  audioUrl: string;
  guid: string;
}

interface Feed {
  title: string;
  image: string;
  episodes: Episode[];
}

const scrollbar: React.CSSProperties = { overflowY: "auto", scrollbarWidth: "thin" };

function formatDuration(d: string) {
  if (!d) return "";
  if (d.includes(":")) return d;
  const s = parseInt(d);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim();
}

export default function PodcastApp() {
  const [feeds, setFeeds] = useState(DEFAULT_FEEDS);
  const [activeFeed, setActiveFeed] = useState(0);
  const [feedData, setFeedData] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Episode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [addingFeed, setAddingFeed] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setLoading(true);
    setFeedData(null);
    fetch(`/api/podcast?url=${encodeURIComponent(feeds[activeFeed].url)}`)
      .then(r => r.json())
      .then(setFeedData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeFeed, feeds]);

  function playEpisode(ep: Episode) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    const audio = new Audio(ep.audioUrl);
    audio.playbackRate = speed;
    audio.play().catch(() => {});
    audio.ontimeupdate = () => setProgress(audio.currentTime);
    audio.ondurationchange = () => setDuration(audio.duration);
    audio.onended = () => setPlaying(false);
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

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setProgress(t);
  }

  function changeSpeed() {
    const speeds = [1, 1.25, 1.5, 1.75, 2];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }

  async function addFeed() {
    if (!newUrl.trim()) return;
    const res = await fetch(`/api/podcast?url=${encodeURIComponent(newUrl)}`);
    const data = await res.json();
    if (data.title) {
      setFeeds(f => [...f, { name: data.title, url: newUrl }]);
      setActiveFeed(feeds.length);
    }
    setNewUrl("");
    setAddingFeed(false);
  }

  function formatTime(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0
      ? `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`
      : `${m}:${String(sec).padStart(2,"0")}`;
  }

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "monospace", fontSize: 12 }}>

      {/* ── Player bar ── */}
      {selected && (
        <div style={{ background: "#1a1a1a", color: "#fff", padding: "8px 12px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Play/pause */}
            <button onClick={togglePlay} style={{
              background: "none", border: "1px solid #555", color: "#fff",
              width: 32, height: 32, cursor: "pointer", fontSize: 14, flexShrink: 0,
            }}>{playing ? "⏸" : "▶"}</button>

            {/* Info + progress */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>
                {selected.title}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 9, color: "#888", flexShrink: 0 }}>{formatTime(progress)}</span>
                <input type="range" min={0} max={duration || 1} step={1} value={progress}
                  onChange={seek} style={{ flex: 1, accentColor: "#fff", cursor: "pointer" }} />
                <span style={{ fontSize: 9, color: "#888", flexShrink: 0 }}>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Speed */}
            <button onClick={changeSpeed} style={{
              background: "none", border: "1px solid #555", color: "#fff",
              padding: "2px 6px", cursor: "pointer", fontSize: 10, flexShrink: 0,
            }}>{speed}×</button>
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Sidebar: podcasts */}
        <div style={{ width: 140, borderRight: "1px solid #eee", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "6px 10px", fontSize: 9, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}>
            Podcasts
          </div>
          <div style={{ flex: 1, ...scrollbar }}>
            {feeds.map((f, i) => (
              <button key={i} onClick={() => setActiveFeed(i)} style={{
                background: activeFeed === i ? "#1a1a1a" : "transparent",
                color: activeFeed === i ? "#fff" : "#333",
                border: "none", padding: "7px 10px", textAlign: "left",
                cursor: "pointer", fontFamily: "monospace", fontSize: 11,
                width: "100%", display: "block",
              }}>{f.name}</button>
            ))}
          </div>
          {addingFeed ? (
            <div style={{ padding: 8, borderTop: "1px solid #eee" }}>
              <input
                placeholder="URL del RSS" value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addFeed()}
                style={{ width: "100%", fontSize: 10, fontFamily: "monospace", border: "1px solid #ddd", padding: "3px 5px", marginBottom: 4, boxSizing: "border-box" }}
                autoFocus
              />
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={addFeed} style={{ flex: 1, fontSize: 9, background: "#1a1a1a", color: "#fff", border: "none", padding: "3px", cursor: "pointer", fontFamily: "monospace" }}>OK</button>
                <button onClick={() => setAddingFeed(false)} style={{ flex: 1, fontSize: 9, background: "none", border: "1px solid #ddd", padding: "3px", cursor: "pointer", fontFamily: "monospace" }}>✕</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingFeed(true)} style={{
              background: "none", border: "none", borderTop: "1px solid #eee",
              padding: "6px 10px", cursor: "pointer", fontSize: 10,
              color: "#999", fontFamily: "monospace", textAlign: "left", width: "100%",
            }}>+ Añadir</button>
          )}
        </div>

        {/* Episode list */}
        <div style={{ flex: 1, ...scrollbar }}>
          {loading && <div style={{ padding: 16, color: "#aaa" }}>Cargando...</div>}
          {!loading && feedData && (
            <>
              {/* Podcast header */}
              <div style={{ padding: "10px 12px", borderBottom: "1px solid #eee", display: "flex", gap: 10, alignItems: "center" }}>
                {feedData.image && (
                  <img src={feedData.image} style={{ width: 48, height: 48, objectFit: "cover", flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{feedData.title}</div>
                  <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{feedData.episodes.length} episodios</div>
                </div>
              </div>

              {/* Episodes */}
              {feedData.episodes.map((ep, i) => (
                <div key={ep.guid} onClick={() => playEpisode(ep)} style={{
                  padding: "9px 12px", borderBottom: "1px solid #f0f0f0", cursor: "pointer",
                  background: selected?.guid === ep.guid ? "#f8f8f8" : "transparent",
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8f8f8")}
                  onMouseLeave={e => (e.currentTarget.style.background = selected?.guid === ep.guid ? "#f8f8f8" : "transparent")}
                >
                  <div style={{ flexShrink: 0, width: 24, height: 24, background: selected?.guid === ep.guid && playing ? "#1a1a1a" : "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: selected?.guid === ep.guid && playing ? "#fff" : "#666", marginTop: 2 }}>
                    {selected?.guid === ep.guid && playing ? "▶" : String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, lineHeight: 1.3, marginBottom: 2 }}>{ep.title}</div>
                    <div style={{ fontSize: 10, color: "#999" }}>
                      {ep.pubDate ? formatDate(ep.pubDate) : ""}
                      {ep.duration ? ` · ${formatDuration(ep.duration)}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
