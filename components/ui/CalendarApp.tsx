"use client";

import { useState, useEffect } from "react";

interface CalEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  notes: string;
}

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export default function CalendarApp() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(toYMD(today));
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", time: "", notes: "" });

  const monthKey = `${year}-${String(month+1).padStart(2,"0")}`;

  useEffect(() => {
    fetch(`/api/calendar?month=${monthKey}`)
      .then(r => r.json())
      .then(setEvents)
      .catch(() => {});
  }, [monthKey]);

  // Calendar grid
  const firstDay = new Date(year, month, 1);
  const startDow = (firstDay.getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function eventsForDate(d: number) {
    const key = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return events.filter(e => e.date === key);
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  async function addEvent() {
    if (!form.title.trim()) return;
    const res = await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, date: selected }),
    });
    const ev = await res.json();
    setEvents(prev => [...prev, ev].sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)));
    setForm({ title: "", time: "", notes: "" });
    setAdding(false);
  }

  async function deleteEvent(id: string) {
    await fetch(`/api/calendar?id=${id}`, { method: "DELETE" });
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  const selectedEvents = events.filter(e => e.date === selected);
  const selectedDate = new Date(selected + "T12:00:00");

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: "monospace", fontSize: 12 }}>

      {/* Calendar */}
      <div style={{ width: 220, borderRight: "1px solid #ddd", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderBottom: "1px solid #eee" }}>
          <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>‹</button>
          <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>›</button>
        </div>

        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "4px 6px 0" }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 9, color: "#aaa", padding: "2px 0", fontWeight: 700 }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "0 6px", flex: 1 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const key = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const isToday = key === toYMD(today);
            const isSel = key === selected;
            const hasEv = eventsForDate(d).length > 0;
            return (
              <button key={i} onClick={() => setSelected(key)} style={{
                background: isSel ? "#1a1a1a" : "none",
                color: isSel ? "#fff" : isToday ? "#000" : "#333",
                border: isToday && !isSel ? "1px solid #1a1a1a" : "none",
                fontWeight: isToday ? 700 : 400,
                cursor: "pointer", fontSize: 11,
                padding: "5px 0", textAlign: "center",
                fontFamily: "monospace",
                position: "relative",
              }}>
                {d}
                {hasEv && <span style={{ position: "absolute", bottom: 1, left: "50%", transform: "translateX(-50%)", width: 3, height: 3, background: isSel ? "#fff" : "#1a1a1a", borderRadius: "50%", display: "block" }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day view */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "8px 12px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>
              {selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            <div style={{ fontSize: 10, color: "#aaa", marginTop: 1 }}>{selectedEvents.length} evento{selectedEvents.length !== 1 ? "s" : ""}</div>
          </div>
          <button onClick={() => { setAdding(true); setForm({ title: "", time: "", notes: "" }); }} style={{
            background: "#1a1a1a", color: "#fff", border: "none",
            padding: "4px 10px", cursor: "pointer", fontFamily: "monospace", fontSize: 11,
          }}>+ Añadir</button>
        </div>

        {/* Events */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          {adding && (
            <div style={{ border: "1px solid #1a1a1a", padding: 10, marginBottom: 10 }}>
              <input placeholder="Título *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                style={{ width: "100%", fontFamily: "monospace", fontSize: 12, border: "none", borderBottom: "1px solid #ddd", padding: "4px 0", marginBottom: 6, outline: "none" }} />
              <input placeholder="Hora (ej: 10:30)" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                style={{ width: "100%", fontFamily: "monospace", fontSize: 12, border: "none", borderBottom: "1px solid #ddd", padding: "4px 0", marginBottom: 6, outline: "none" }} />
              <input placeholder="Notas" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                style={{ width: "100%", fontFamily: "monospace", fontSize: 12, border: "none", borderBottom: "1px solid #ddd", padding: "4px 0", marginBottom: 8, outline: "none" }} />
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={addEvent} style={{ flex: 1, background: "#1a1a1a", color: "#fff", border: "none", padding: "5px", cursor: "pointer", fontFamily: "monospace", fontSize: 11 }}>Guardar</button>
                <button onClick={() => setAdding(false)} style={{ flex: 1, background: "none", border: "1px solid #ddd", padding: "5px", cursor: "pointer", fontFamily: "monospace", fontSize: 11 }}>Cancelar</button>
              </div>
            </div>
          )}

          {selectedEvents.length === 0 && !adding && (
            <div style={{ color: "#bbb", paddingTop: 20, textAlign: "center", fontSize: 11 }}>Sin eventos</div>
          )}

          {selectedEvents.sort((a,b) => a.time.localeCompare(b.time)).map(ev => (
            <div key={ev.id} style={{ borderLeft: "2px solid #1a1a1a", paddingLeft: 10, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  {ev.time && <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>{ev.time}</div>}
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{ev.title}</div>
                  {ev.notes && <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{ev.notes}</div>}
                </div>
                <button onClick={() => deleteEvent(ev.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 14, padding: "0 0 0 8px" }}>×</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
