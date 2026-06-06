"use client";

import { useState, useEffect, useCallback } from "react";

interface UsageRow { type: string; label: string; total: number; count: number; last: string; }
interface DayRow { date: string; type: string; total: number; }

function fmtTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const TYPE_ICON: Record<string, string> = { radio: "📻", podcast: "🎙️", tv: "📺" };

// Win3.1 styles
const W = {
  bg: "#c0c0c0",
  raised: { border: "2px solid", borderColor: "#ffffff #808080 #808080 #ffffff" },
  sunken: { border: "2px solid", borderColor: "#808080 #ffffff #ffffff #808080" },
  cell: { background: "#ffffff", border: "1px solid #808080" },
  font: { fontFamily: "Arial, sans-serif", fontSize: 11 },
  blue: { background: "#000080", color: "#ffffff", fontFamily: "Arial, sans-serif", fontSize: 11, fontWeight: 700 },
};

function Win3Btn({ children, onClick, active }: { children: React.ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} style={{
      ...W.font,
      background: "#c0c0c0",
      border: "2px solid",
      borderColor: active ? "#808080 #ffffff #ffffff #808080" : "#ffffff #808080 #808080 #ffffff",
      padding: "2px 10px",
      cursor: "pointer",
      minWidth: 40,
    }}>{children}</button>
  );
}

export default function StatsApp() {
  const [data, setData] = useState<{ byType: UsageRow[]; byDay: DayRow[] } | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/usage?days=${days}`)
      .then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [days]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const id = setInterval(load, 30000); return () => clearInterval(id); }, [load]);

  const totals: Record<string, number> = {};
  data?.byType.forEach(r => { totals[r.type] = (totals[r.type] ?? 0) + r.total; });
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  const filtered = activeType ? (data?.byType ?? []).filter(r => r.type === activeType) : (data?.byType ?? []);
  const last7 = [...new Set(data?.byDay.map(r => r.date) ?? [])].slice(0, 7).reverse();
  const maxDay = Math.max(...last7.map(d => (data?.byDay ?? []).filter(r => r.date === d).reduce((a, r) => a + r.total, 0)), 1);

  return (
    <div style={{ background: W.bg, height: "100%", overflowY: "auto", padding: 8, ...W.font }}>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
        <div style={{ ...W.blue, padding: "2px 8px", marginRight: 4 }}>Período:</div>
        {[7, 30, 90].map(d => <Win3Btn key={d} onClick={() => setDays(d)} active={days === d}>{d}d</Win3Btn>)}
        <div style={{ marginLeft: "auto" }}>
          <Win3Btn onClick={load}>↻ Actualizar</Win3Btn>
        </div>
      </div>

      {loading && <div style={{ padding: 16, textAlign: "center" }}>Calculando...</div>}

      {!loading && (!data || data.byType.length === 0) && (
        <div style={{ ...W.sunken, padding: 24, textAlign: "center", background: "#fff" }}>
          Sin datos. Escucha radio, podcasts o mira TV.
        </div>
      )}

      {!loading && data && data.byType.length > 0 && (<>

        {/* Resumen — tabla estilo Excel */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ ...W.blue, padding: "2px 6px", marginBottom: 2 }}>RESUMEN — Últimos {days} días</div>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr style={{ background: "#000080", color: "#fff" }}>
                <th style={{ padding: "2px 6px", textAlign: "left", border: "1px solid #808080", fontWeight: 700 }}>Tipo</th>
                <th style={{ padding: "2px 6px", textAlign: "right", border: "1px solid #808080", fontWeight: 700 }}>Tiempo</th>
                <th style={{ padding: "2px 6px", textAlign: "right", border: "1px solid #808080", fontWeight: 700 }}>%</th>
                <th style={{ padding: "2px 6px", textAlign: "right", border: "1px solid #808080", fontWeight: 700 }}>Sesiones</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(totals).map(([type, total], i) => (
                <tr key={type}
                  onClick={() => setActiveType(activeType === type ? null : type)}
                  style={{ background: activeType === type ? "#000080" : i % 2 === 0 ? "#fff" : "#f0f0f0", color: activeType === type ? "#fff" : "#000", cursor: "pointer" }}>
                  <td style={{ padding: "2px 6px", border: "1px solid #c0c0c0" }}>
                    {TYPE_ICON[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
                  </td>
                  <td style={{ padding: "2px 6px", border: "1px solid #c0c0c0", textAlign: "right", fontFamily: "Courier New, monospace" }}>{fmtTime(total)}</td>
                  <td style={{ padding: "2px 6px", border: "1px solid #c0c0c0", textAlign: "right" }}>{Math.round(total / grandTotal * 100)}%</td>
                  <td style={{ padding: "2px 6px", border: "1px solid #c0c0c0", textAlign: "right" }}>
                    {data.byType.filter(r => r.type === type).reduce((a, r) => a + r.count, 0)}
                  </td>
                </tr>
              ))}
              <tr style={{ background: "#c0c0c0", fontWeight: 700 }}>
                <td style={{ padding: "2px 6px", border: "1px solid #808080" }}>TOTAL</td>
                <td style={{ padding: "2px 6px", border: "1px solid #808080", textAlign: "right", fontFamily: "Courier New, monospace" }}>{fmtTime(grandTotal)}</td>
                <td style={{ padding: "2px 6px", border: "1px solid #808080", textAlign: "right" }}>100%</td>
                <td style={{ padding: "2px 6px", border: "1px solid #808080", textAlign: "right" }}>
                  {data.byType.reduce((a, r) => a + r.count, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Gráfico últimos 7 días */}
        {last7.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ ...W.blue, padding: "2px 6px", marginBottom: 2 }}>GRÁFICO — Últimos 7 días</div>
            <div style={{ ...W.sunken, background: "#fff", padding: "4px 6px", display: "flex", alignItems: "flex-end", gap: 4, height: 70, overflow: "hidden" }}>
              {last7.map(date => {
                const dayTotal = (data.byDay ?? []).filter(r => r.date === date).reduce((a, r) => a + r.total, 0);
                const h = Math.max(2, Math.round((dayTotal / maxDay) * 44));
                return (
                  <div key={date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, justifyContent: "flex-end" }}>
                    <div style={{ width: "100%", height: h, background: "#4472C4", border: "1px solid #2255aa" }} title={fmtTime(dayTotal)} />
                    <div style={{ fontSize: 9, color: "#444" }}>{date.slice(8)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detalle */}
        <div>
          <div style={{ ...W.blue, padding: "2px 6px", marginBottom: 2, display: "flex", justifyContent: "space-between" }}>
            <span>DETALLE — {activeType ? activeType.toUpperCase() : "TODO"}</span>
            {activeType && <span onClick={() => setActiveType(null)} style={{ cursor: "pointer" }}>✕</span>}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr style={{ background: "#000080", color: "#fff" }}>
                <th style={{ padding: "2px 6px", textAlign: "left", border: "1px solid #808080" }}>{activeType ? "Nombre" : "Tipo / Nombre"}</th>
                <th style={{ padding: "2px 6px", textAlign: "right", border: "1px solid #808080" }}>Tiempo</th>
                <th style={{ padding: "2px 6px", textAlign: "right", border: "1px solid #808080" }}>Sesiones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 20).map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f0f0f0" }}>
                  <td style={{ padding: "2px 6px", border: "1px solid #c0c0c0" }}>
                    {!activeType && <span style={{ marginRight: 4 }}>{TYPE_ICON[row.type]}</span>}
                    {row.label}
                  </td>
                  <td style={{ padding: "2px 6px", border: "1px solid #c0c0c0", textAlign: "right", fontFamily: "Courier New, monospace" }}>{fmtTime(row.total)}</td>
                  <td style={{ padding: "2px 6px", border: "1px solid #c0c0c0", textAlign: "right" }}>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </>)}
    </div>
  );
}
