"use client";

import { useState, useEffect } from "react";

interface WikiData {
  title: string;
  extract: string;
  thumb: string | null;
  slot: number;
  slotLabel: string;
  nextAt: string;
  date: string;
  allTitles: string[];
}

function cleanExtract(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<table[\s\S]*?<\/table>/gi, "")
    .replace(/<sup[\s\S]*?<\/sup>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function splitParagraphs(text: string): string[] {
  return text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 40);
}

export default function WikiApp() {
  const [data, setData] = useState<WikiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const tz = -new Date().getTimezoneOffset();
    fetch(`/api/wiki?tz=${tz}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const SLOT_ICONS = ["🌅", "☀️", "🌙"];

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontFamily: "monospace", color: "#aaa" }}>
      Cargando...
    </div>
  );

  if (error || !data) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontFamily: "monospace", color: "#aaa" }}>
      Error cargando artículo.
    </div>
  );

  const paragraphs = splitParagraphs(cleanExtract(data.extract));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#faf9f6", fontFamily: "'Georgia', serif" }}>

      {/* Header */}
      <div style={{ background: "#1a1a1a", color: "#fff", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {[0, 1, 2].map(s => (
            <span key={s} style={{
              fontFamily: "monospace", fontSize: 11, letterSpacing: "0.1em",
              opacity: data.slot === s ? 1 : 0.35, fontWeight: data.slot === s ? 700 : 400,
              cursor: "default",
            }}>
              {SLOT_ICONS[s]} {["MAÑANA", "TARDE", "NOCHE"][s]}
              {data.slot === s && <span style={{ color: "#f5c800" }}> ←</span>}
            </span>
          ))}
        </div>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#666" }}>
          Cambia a las {data.nextAt}
        </span>
      </div>

      {/* Article */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", maxWidth: 680, margin: "0 auto", width: "100%" }}>

        {data.thumb && (
          <img src={data.thumb} alt={data.title}
            style={{ width: "100%", maxHeight: 220, objectFit: "cover", marginBottom: 20, filter: "grayscale(20%)" }} />
        )}

        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#999", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
          Wikipedia · Videojuegos
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.25, marginBottom: 16, color: "#111", fontFamily: "'Georgia', serif" }}>
          {data.title}
        </h1>

        <div style={{ height: 1, background: "#ddd", marginBottom: 20 }} />

        {paragraphs.map((p, i) => (
          <p key={i} style={{
            fontSize: 15, lineHeight: 1.8, color: "#222",
            marginBottom: 16,
            fontStyle: i === 0 ? "normal" : "normal",
          }}>{p}</p>
        ))}

        <a href={`https://es.wikipedia.org/wiki/${encodeURIComponent(data.title)}`}
          target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: "monospace", fontSize: 11, color: "#999", textDecoration: "underline", display: "inline-block", marginTop: 8 }}>
          Ver en Wikipedia →
        </a>
      </div>
    </div>
  );
}
