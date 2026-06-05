"use client";

import { useState, useEffect } from "react";

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  feed: string;
}

const FEEDS = [
  { name: "Applesfera", url: "https://www.applesfera.com/feedburner.xml" },
  { name: "Vida Extra", url: "https://www.vidaextra.com/feedburner.xml" },
];

const scrollbar: React.CSSProperties = { overflowY: "auto", scrollbarWidth: "thin" };

const strip = (html: string) => html
  .replace(/<[^>]*>/g, " ")
  .replace(/\{[^}]{0,300}\}/g, "")
  .replace(/https?:\/\/\S+/g, "")
  .replace(/\s{2,}/g, " ")
  .trim();

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short" });

export default function RSSApp() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<FeedItem | null>(null);
  const [activeFeed, setActiveFeed] = useState<string>("all");
  // mobile: "feeds" | "list" | "article"
  const [mobilePane, setMobilePane] = useState<"feeds" | "list" | "article">("list");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { fetchFeeds(); }, []);

  async function fetchFeeds() {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        FEEDS.map(async (feed) => {
          const res = await fetch(`/api/rss?url=${encodeURIComponent(feed.url)}`);
          if (!res.ok) throw new Error(`Error fetching ${feed.name}`);
          const data = await res.json();
          return (data.items as FeedItem[]).map((item) => ({ ...item, feed: feed.name }));
        })
      );
      const all = results.flat().sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      setItems(all);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = activeFeed === "all" ? items : items.filter(i => i.feed === activeFeed);

  function selectItem(item: FeedItem) {
    setSelected(item);
    if (isMobile) setMobilePane("article");
  }

  function selectFeed(name: string) {
    setActiveFeed(name);
    setSelected(null);
    if (isMobile) setMobilePane("list");
  }

  // ── Sidebar feeds ──────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "8px 0" }}>
      <div style={{ padding: "4px 10px", fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>Feeds</div>
      {[{ name: "all", label: "Todos" }, ...FEEDS.map(f => ({ name: f.name, label: f.name }))].map(f => (
        <button key={f.name} onClick={() => selectFeed(f.name)} style={{
          background: activeFeed === f.name ? "#1a1a1a" : "transparent",
          color: activeFeed === f.name ? "#fff" : "#1a1a1a",
          border: "none", padding: "6px 10px", textAlign: "left",
          cursor: "pointer", fontSize: 12, fontFamily: "monospace",
        }}>{f.label}</button>
      ))}
      <div style={{ flex: 1 }} />
      <button onClick={fetchFeeds} style={{
        margin: "8px", padding: "4px", background: "#f0f0f0",
        border: "1px solid #ccc", cursor: "pointer", fontSize: 11, fontFamily: "monospace",
      }}>↻ Actualizar</button>
    </div>
  );

  // ── Article list ───────────────────────────────────────────────────────────
  const ListContent = () => (
    <div style={{ height: "100%", ...scrollbar }}>
      {isMobile && (
        <div style={{ padding: "8px 10px", borderBottom: "1px solid #eee", display: "flex", gap: 8 }}>
          <button onClick={() => setMobilePane("feeds")} style={{ fontSize: 11, background: "none", border: "1px solid #ccc", padding: "2px 8px", cursor: "pointer", fontFamily: "monospace" }}>
            ☰ Feeds
          </button>
          <span style={{ fontSize: 11, color: "#888", alignSelf: "center" }}>{activeFeed === "all" ? "Todos" : activeFeed}</span>
        </div>
      )}
      {loading && <div style={{ padding: 12, color: "#888", fontSize: 12 }}>Cargando...</div>}
      {error && <div style={{ padding: 12, color: "red", fontSize: 11 }}>{error}</div>}
      {!loading && filtered.map((item, i) => (
        <div key={i} onClick={() => selectItem(item)} style={{
          padding: "9px 10px", borderBottom: "1px solid #eee", cursor: "pointer",
          background: selected === item ? "#1a1a1a" : "transparent",
          color: selected === item ? "#fff" : "#1a1a1a",
        }}>
          <div style={{ fontWeight: 600, fontSize: 12, lineHeight: 1.3, marginBottom: 2 }}>{item.title}</div>
          <div style={{ fontSize: 10, color: selected === item ? "#aaa" : "#888" }}>
            {item.feed} · {formatDate(item.pubDate)}
          </div>
        </div>
      ))}
    </div>
  );

  // ── Article view ───────────────────────────────────────────────────────────
  const ArticleContent = () => (
    <div style={{ flex: 1, padding: 16, ...scrollbar, height: "100%" }}>
      {isMobile && selected && (
        <button onClick={() => setMobilePane("list")} style={{
          fontSize: 11, background: "none", border: "1px solid #ccc", padding: "2px 8px",
          cursor: "pointer", fontFamily: "monospace", marginBottom: 12, display: "block",
        }}>← Volver</button>
      )}
      {selected ? (
        <>
          <div style={{ fontSize: 10, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {selected.feed} · {formatDate(selected.pubDate)}
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>{selected.title}</h2>
          <p style={{ lineHeight: 1.6, color: "#333", fontSize: 12 }}>{strip(selected.description)}</p>
          <a href={selected.link} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-block", marginTop: 16, fontSize: 11, color: "#888", textDecoration: "underline" }}>
            Ver en web →
          </a>
        </>
      ) : (
        <div style={{ color: "#aaa", paddingTop: 40, textAlign: "center", fontSize: 12 }}>Selecciona un artículo</div>
      )}
    </div>
  );

  // ── Mobile layout ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ height: "100%", fontFamily: "monospace", fontSize: 12 }}>
        {mobilePane === "feeds"   && <SidebarContent />}
        {mobilePane === "list"    && <ListContent />}
        {mobilePane === "article" && <ArticleContent />}
      </div>
    );
  }

  // ── Desktop layout ─────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100%", fontFamily: "monospace", fontSize: 13 }}>
      <div style={{ width: 130, borderRight: "1px solid #ccc", flexShrink: 0 }}><SidebarContent /></div>
      <div style={{ width: 220, borderRight: "1px solid #ccc", flexShrink: 0 }}><ListContent /></div>
      <ArticleContent />
    </div>
  );
}
