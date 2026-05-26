"use client";

import { useState, useEffect } from "react";

interface BacklogItem {
  id: string;
  title: string;
  category: string;
  color: string;
}

interface ScheduleEntry {
  id: string;
  item_id: string;
  item_title?: string;
  category?: string;
  color?: string;
  date: string;
  start_min: number;
  end_min: number;
  notes: string;
}

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function minToTime(min: number) {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 07 to 23

export default function ScheduleApp() {
  const [date, setDate] = useState(toDateStr(new Date()));
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [backlog, setBacklog] = useState<BacklogItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formItem, setFormItem] = useState("");
  const [formStart, setFormStart] = useState("09:00");
  const [formEnd, setFormEnd] = useState("10:00");
  const [formNotes, setFormNotes] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/backlog").then((r) => r.json()).then((data: BacklogItem[]) => {
      setBacklog(data);
      if (data.length > 0) setFormItem(data[0].id);
    });
  }, []);

  useEffect(() => {
    fetch(`/api/schedule?date=${date}`)
      .then((r) => r.json())
      .then(setEntries);
    setSelectedEntry(null);
  }, [date]);

  const changeDate = (delta: number) => {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + delta);
    setDate(toDateStr(d));
  };

  const addEntry = async () => {
    if (!formItem) return;
    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: formItem, date, start_min: timeToMin(formStart), end_min: timeToMin(formEnd), notes: formNotes }),
    });
    const entry: ScheduleEntry = await res.json();
    // Fetch fresh to get joined data
    fetch(`/api/schedule?date=${date}`).then((r) => r.json()).then(setEntries);
    setShowForm(false);
    setFormNotes("");
  };

  const deleteEntry = async (id: string) => {
    await fetch(`/api/schedule/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSelectedEntry(null);
  };

  const CELL_HEIGHT = 48; // px per hour

  const displayDate = new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "520px", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: "2px solid #1a1a1a", gap: "10px", flexShrink: 0 }}>
        <button onClick={() => changeDate(-1)} style={{ padding: "4px 10px", border: "2px solid #1a1a1a", background: "transparent", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>←</button>
        <div style={{ flex: 1, textAlign: "center", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-space-grotesk), sans-serif", color: "#1a1a1a" }}>{displayDate}</div>
        <button onClick={() => changeDate(1)} style={{ padding: "4px 10px", border: "2px solid #1a1a1a", background: "transparent", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>→</button>
        <button onClick={() => setDate(toDateStr(new Date()))} style={{ padding: "4px 10px", border: "2px solid #1a1a1a", background: "#f5c800", cursor: "pointer", fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-space-grotesk), sans-serif" }}>Today</button>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-brutal"
          style={{ padding: "4px 10px", border: "2px solid #1a1a1a", background: "#1a1a1a", color: "#f5c800", cursor: "pointer", fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-space-grotesk), sans-serif" }}
        >
          + Add
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ padding: "12px 14px", borderBottom: "2px solid #1a1a1a", background: "#faf7f2", display: "flex", gap: "8px", alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
          <select
            value={formItem}
            onChange={(e) => setFormItem(e.target.value)}
            style={{ flex: 1, minWidth: "120px", padding: "6px 8px", border: "2px solid #1a1a1a", background: "#fff", fontSize: "12px", fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            {backlog.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
            {backlog.length === 0 && <option value="">No backlog items</option>}
          </select>
          <input type="time" value={formStart} onChange={(e) => setFormStart(e.target.value)} style={{ padding: "6px 8px", border: "2px solid #1a1a1a", background: "#fff", fontSize: "12px", fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <span style={{ fontSize: "12px", color: "#6b6560" }}>→</span>
          <input type="time" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} style={{ padding: "6px 8px", border: "2px solid #1a1a1a", background: "#fff", fontSize: "12px", fontFamily: "var(--font-jetbrains-mono), monospace" }} />
          <input value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Notes (opt.)" style={{ flex: 1, minWidth: "80px", padding: "6px 8px", border: "2px solid #1a1a1a", background: "#fff", fontSize: "12px", fontFamily: "var(--font-space-grotesk), sans-serif" }} />
          <button onClick={addEntry} className="btn-brutal" style={{ padding: "6px 12px", background: "#f5c800", border: "2px solid #1a1a1a", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>Save</button>
          <button onClick={() => setShowForm(false)} style={{ padding: "6px 10px", background: "transparent", border: "1.5px solid #1a1a1a", cursor: "pointer", fontSize: "12px" }}>✕</button>
        </div>
      )}

      {/* Timeline */}
      <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        <div style={{ position: "relative", minHeight: `${HOURS.length * CELL_HEIGHT}px` }}>
          {/* Hour rows */}
          {HOURS.map((h) => (
            <div
              key={h}
              style={{ position: "absolute", top: `${(h - 7) * CELL_HEIGHT}px`, left: 0, right: 0, height: `${CELL_HEIGHT}px`, borderBottom: "1px solid #e8e2d5", display: "flex", alignItems: "flex-start", paddingTop: "4px" }}
            >
              <span style={{ width: "46px", fontSize: "10px", fontFamily: "var(--font-jetbrains-mono), monospace", color: "#6b6560", paddingLeft: "10px", flexShrink: 0 }}>
                {String(h).padStart(2, "0")}:00
              </span>
            </div>
          ))}

          {/* Entries */}
          {entries.map((entry) => {
            const top = (entry.start_min / 60 - 7) * CELL_HEIGHT;
            const height = Math.max(((entry.end_min - entry.start_min) / 60) * CELL_HEIGHT, 24);
            const color = entry.color ?? "#6b6560";
            const isSelected = selectedEntry === entry.id;
            return (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(isSelected ? null : entry.id)}
                style={{
                  position: "absolute",
                  top: `${top}px`,
                  left: "56px",
                  right: "10px",
                  height: `${height}px`,
                  background: color,
                  border: `2px solid #1a1a1a`,
                  boxShadow: isSelected ? "3px 3px 0 #1a1a1a" : "2px 2px 0 #1a1a1a",
                  cursor: "pointer",
                  padding: "3px 8px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                    {entry.item_title ?? "Unknown"}
                  </div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                    {minToTime(entry.start_min)}–{minToTime(entry.end_min)}
                  </div>
                </div>
                {isSelected && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", cursor: "pointer", borderRadius: "2px", padding: "1px 6px", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
