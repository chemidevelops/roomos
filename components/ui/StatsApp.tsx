"use client";

import { useState, useEffect } from "react";

interface UsageRow {
  type: string;
  label: string;
  total: number;
  count: number;
  last: string;
}

interface DayRow {
  date: string;
  type: string;
  total: number;
}

function fmtTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const TYPE_LABELS: Record<string, string> = {
  radio: "📻 Radio",
  podcast: "🎙️ Podcast",
  tv: "📺 TV",
};

const TYPE_COLORS: Record<string, string> = {
  radio: "#1a1a1a",
  podcast: "#555",
  tv: "#888",
};

export default function StatsApp() {
  const [data, setData] = useState<{ byType: UsageRow[]; byDay: DayRow[] } | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/usage?days=${days}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return <div style={{ padding: 24, fontFamily: "monospace", color: "#aaa" }}>Cargando...</div>;

  if (!data || data.byType.length === 0) return (
    <div style={{ padding: 24, fontFamily: "monospace", fontSize: 12, color: "#aaa", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
      Sin datos todavía.<br />
      <span style={{ fontSize: 11 }}>Escucha radio, podcasts o mira TV y vuelve.</span>
    </div>
  );

  const totals: Record<string, number> = {};
  data.byType.forEach(r => { totals[r.type] = (totals[r.type] ?? 0) + r.total; });
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  const filtered = activeType ? data.byType.filter(r => r.type === activeType) : data.byType;

  const last7 = [...new Set(data.byDay.map(r => r.date))].slice(0, 7).reverse();
  const maxDay = Math.max(...last7.map(d =>
    data.byDay.filter(r => r.date === d).reduce((a, r) => a + r.total, 0)
  ), 1);

  return (
    <div style={{ padding: "16px 20px", fontFamily: "monospace", fontSize: 12, overflowY: "auto", height: "100%" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Stats</div>
        <div style={{ display: "flex", gap: 4 }}>
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)} style={{
              background: days === d ? "#1a1a1a" : "transparent",
              color: days === d ? "#fff" : "#aaa",
              border: "1px solid #ddd", padding: "2px 8px",
              cursor: "pointer", fontFamily: "monospace", fontSize: 10,
            }}>{d}d</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "#aaa", marginBottom: 4, letterSpacing: "0.1em" }}>TOTAL ÚLTIMOS {days} DÍAS</div>
        <div style={{ fontSize: 28, fontWeight: 700 }}>{fmtTime(grandTotal)}</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {Object.entries(totals).map(([type, total]) => (
          <button key={type} onClick={() => setActiveType(activeType === type ? null : type)} style={{
            flex: 1, padding: "10px 8px",
            border: `1px solid ${activeType === type ? "#1a1a1a" : "#eee"}`,
            background: activeType === type ? "#1a1a1a" : "transparent",
            color: activeType === type ? "#fff" : "#333",
            cursor: "pointer", fontFamily: "monospace", textAlign: "center",
          }}>
            <div style={{ fontSize: 16 }}>{TYPE_LABELS[type]?.split(" ")[0]}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{fmtTime(total)}</div>
            <div style={{ fontSize: 9, color: activeType === type ? "#aaa" : "#bbb", marginTop: 2 }}>
              {Math.round(total / grandTotal * 100)}%
            </div>
          </button>
        ))}
      </div>

      {last7.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: "#aaa", marginBottom: 8, letterSpacing: "0.1em" }}>ÚLTIMOS 7 DÍAS</div>
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 48 }}>
            {last7.map(date => {
              const dayTotal = data.byDay.filter(r => r.date === date).reduce((a, r) => a + r.total, 0);
              const h = Math.max(2, Math.round((dayTotal / maxDay) * 48));
              return (
                <div key={date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{ width: "100%", height: h, background: "#1a1a1a" }} />
                  <div style={{ fontSize: 8, color: "#bbb" }}>{date.slice(8)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 10, color: "#aaa", marginBottom: 8, letterSpacing: "0.1em" }}>
          {activeType ? TYPE_LABELS[activeType].toUpperCase() : "TODO"}
          {activeType && (
            <button onClick={() => setActiveType(null)} style={{ marginLeft: 8, background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: 10 }}>✕</button>
          )}
        </div>
        {filtered.slice(0, 20).map((row, i) => {
          const pct = Math.round((row.total / grandTotal) * 100);
          return (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>
                  {!activeType && <span style={{ color: "#bbb", marginRight: 6 }}>{TYPE_LABELS[row.type]?.split(" ")[0]}</span>}
                  {row.label}
                </span>
                <span style={{ fontSize: 11, color: "#666", flexShrink: 0 }}>{fmtTime(row.total)}</span>
              </div>
              <div style={{ height: 3, background: "#f0f0f0" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: TYPE_COLORS[row.type] ?? "#1a1a1a" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
