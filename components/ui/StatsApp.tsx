"use client";

import { useState, useEffect } from "react";

interface BacklogItem {
  id: string;
  title: string;
  category: string;
  color?: string;
  status: string;
}

interface ScheduleEntry {
  id: string;
  item_title?: string;
  category?: string;
  start_min: number;
  end_min: number;
}

interface CategoryStats {
  category: string;
  count: number;
  hours: number;
}

const CELL: React.CSSProperties = {
  border: "1px solid #808080",
  padding: "3px 8px",
  fontFamily: "var(--font-jetbrains-mono), monospace",
  fontSize: "12px",
  color: "#1a1a1a",
  whiteSpace: "nowrap",
};

const HEADER_CELL: React.CSSProperties = {
  ...CELL,
  background: "#000080",
  color: "#ffffff",
  fontWeight: 700,
};

function last7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export default function StatsApp() {
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [totalBacklog, setTotalBacklog] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch backlog
        const backlogRes = await fetch("/api/backlog");
        const backlogItems: BacklogItem[] = await backlogRes.json();

        const catMap: Record<string, CategoryStats> = {};
        for (const item of backlogItems) {
          const cat = item.category || "Uncategorized";
          if (!catMap[cat]) catMap[cat] = { category: cat, count: 0, hours: 0 };
          catMap[cat].count++;
        }
        setTotalBacklog(backlogItems.length);

        // Fetch schedule for last 7 days
        const days = last7Days();
        const today = days[days.length - 1];

        for (const day of days) {
          try {
            const schedRes = await fetch(`/api/schedule?date=${day}`);
            const entries: ScheduleEntry[] = await schedRes.json();

            if (day === today) setTodayCount(entries.length);

            for (const entry of entries) {
              const cat = entry.category || "Uncategorized";
              if (!catMap[cat]) catMap[cat] = { category: cat, count: 0, hours: 0 };
              catMap[cat].hours += (entry.end_min - entry.start_min) / 60;
            }
          } catch {}
        }

        setCategoryStats(Object.values(catMap).sort((a, b) => b.count - a.count));
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const maxHours = Math.max(...categoryStats.map((c) => c.hours), 1);

  function asciiBar(hours: number) {
    const len = Math.round((hours / maxHours) * 20);
    return "█".repeat(len) || "░";
  }

  return (
    <div
      style={{
        background: "#c0c0c0",
        minHeight: "100%",
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: "12px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Excel-style header */}
      <div
        style={{
          background: "#000080",
          color: "#ffffff",
          padding: "4px 10px",
          fontWeight: 700,
          fontSize: "12px",
          letterSpacing: "0.05em",
          borderBottom: "2px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span>📊</span>
        <span>roomOS Stats [Book1]</span>
        <span style={{ marginLeft: "auto", fontWeight: 400, fontSize: "11px", opacity: 0.8 }}>
          Microsoft Excel 95
        </span>
      </div>

      {/* Formula bar */}
      <div
        style={{
          background: "#c0c0c0",
          borderBottom: "1px solid #808080",
          padding: "2px 8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "11px",
        }}
      >
        <span style={{ background: "#ffffff", border: "1px solid #808080", padding: "1px 6px", minWidth: "40px", textAlign: "center" }}>A1</span>
        <span style={{ color: "#808080" }}>fx</span>
        <span style={{ background: "#ffffff", border: "1px solid #808080", flex: 1, padding: "1px 6px" }}>
          =COUNTIF(backlog_items,&quot;*&quot;)
        </span>
      </div>

      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "16px", overflow: "auto" }}>
        {loading ? (
          <div style={{ color: "#808080", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
            Loading...
          </div>
        ) : (
          <>
            {/* Section 1: Backlog by category */}
            <div>
              <div style={{ fontWeight: 700, color: "#000080", marginBottom: "4px", fontSize: "11px", letterSpacing: "0.05em" }}>
                SHEET1: BACKLOG BY CATEGORY
              </div>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={HEADER_CELL}>Category</th>
                    <th style={{ ...HEADER_CELL, textAlign: "right" }}>Count</th>
                    <th style={{ ...HEADER_CELL, textAlign: "right" }}>% Total</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryStats.map((row, i) => (
                    <tr key={row.category}>
                      <td style={{ ...CELL, background: i % 2 === 0 ? "#ffffff" : "#e8e8e8" }}>{row.category}</td>
                      <td style={{ ...CELL, background: i % 2 === 0 ? "#ffffff" : "#e8e8e8", textAlign: "right" }}>{row.count}</td>
                      <td style={{ ...CELL, background: i % 2 === 0 ? "#ffffff" : "#e8e8e8", textAlign: "right" }}>
                        {totalBacklog > 0 ? ((row.count / totalBacklog) * 100).toFixed(1) : "0.0"}%
                      </td>
                    </tr>
                  ))}
                  {/* Summary row */}
                  <tr>
                    <td style={{ ...CELL, background: "#ffff99", fontWeight: 700 }}>TOTAL ITEMS IN BACKLOG</td>
                    <td style={{ ...CELL, background: "#ffff99", fontWeight: 700, textAlign: "right" }}>{totalBacklog}</td>
                    <td style={{ ...CELL, background: "#ffff99", fontWeight: 700, textAlign: "right" }}>100.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 2: Weekly activity ASCII bar chart */}
            <div>
              <div style={{ fontWeight: 700, color: "#000080", marginBottom: "4px", fontSize: "11px", letterSpacing: "0.05em" }}>
                SHEET2: WEEKLY ACTIVITY (LAST 7 DAYS)
              </div>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={HEADER_CELL}>Category</th>
                    <th style={{ ...HEADER_CELL, textAlign: "right" }}>Hours</th>
                    <th style={HEADER_CELL}>Chart</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryStats.filter((c) => c.hours > 0).map((row, i) => (
                    <tr key={row.category}>
                      <td style={{ ...CELL, background: i % 2 === 0 ? "#ffffff" : "#e8e8e8" }}>{row.category}</td>
                      <td style={{ ...CELL, background: i % 2 === 0 ? "#ffffff" : "#e8e8e8", textAlign: "right" }}>{row.hours.toFixed(1)}</td>
                      <td style={{ ...CELL, background: i % 2 === 0 ? "#ffffff" : "#e8e8e8", color: "#000080", letterSpacing: "1px" }}>
                        {asciiBar(row.hours)}
                      </td>
                    </tr>
                  ))}
                  {categoryStats.filter((c) => c.hours > 0).length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ ...CELL, background: "#ffffff", color: "#808080", textAlign: "center" }}>
                        No schedule data for last 7 days
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div style={{ background: "#ffffcc", border: "1px solid #808080", padding: "6px 10px", fontSize: "12px" }}>
              <div style={{ fontWeight: 700, color: "#000080" }}>SUMMARY</div>
              <div>Today&apos;s schedule entries: <strong>{todayCount}</strong></div>
              <div>Total backlog items: <strong>{totalBacklog}</strong></div>
              <div>Categories tracked: <strong>{categoryStats.length}</strong></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
