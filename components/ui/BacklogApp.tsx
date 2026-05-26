"use client";

import { useState, useEffect } from "react";
import { CATEGORIES } from "@/lib/categories";

interface BacklogItem {
  id: string;
  title: string;
  category: string;
  color: string;
  status: string;
  created_at: number;
}

export default function BacklogApp() {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [newTitle, setNewTitle] = useState("");
  const [newCat, setNewCat] = useState(CATEGORIES[0].id);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/backlog")
      .then((r) => r.json())
      .then(setItems);
  }, []);

  const addItem = async () => {
    if (!newTitle.trim()) return;
    const cat = CATEGORIES.find((c) => c.id === newCat)!;
    const res = await fetch("/api/backlog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), category: cat.id, color: cat.color }),
    });
    const item: BacklogItem = await res.json();
    setItems((prev) => [item, ...prev]);
    setNewTitle("");
  };

  const deleteItem = async (id: string) => {
    await fetch(`/api/backlog/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const visibleItems = filter === "all" ? items : items.filter((i) => i.category === filter);
  const grouped = CATEGORIES.map((cat) => ({
    cat,
    items: visibleItems.filter((i) => i.category === cat.id),
  })).filter((g) => g.items.length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "500px", overflow: "hidden" }}>
      {/* Add form */}
      <div style={{ padding: "12px 14px", borderBottom: "2px solid #1a1a1a", display: "flex", gap: "8px", flexShrink: 0 }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Add item…"
          style={{ flex: 1, padding: "7px 10px", border: "2px solid #1a1a1a", background: "#faf7f2", fontSize: "13px", fontFamily: "var(--font-space-grotesk), sans-serif", color: "#1a1a1a", outline: "none" }}
        />
        <select
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          style={{ padding: "7px 8px", border: "2px solid #1a1a1a", background: "#faf7f2", fontSize: "12px", fontFamily: "var(--font-space-grotesk), sans-serif", color: "#1a1a1a", cursor: "pointer" }}
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <button
          onClick={addItem}
          className="btn-brutal"
          style={{ padding: "7px 14px", background: "#f5c800", border: "2px solid #1a1a1a", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-space-grotesk), sans-serif" }}
        >
          Add
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0", borderBottom: "2px solid #1a1a1a", overflowX: "auto", flexShrink: 0 }}>
        {[{ id: "all", label: "All" }, ...CATEGORIES].map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            style={{
              padding: "7px 12px",
              background: filter === c.id ? "#f5c800" : "transparent",
              border: "none",
              borderRight: "1.5px solid #e8e2d5",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              color: "#1a1a1a",
              whiteSpace: "nowrap",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Items grouped by category */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {grouped.length === 0 && (
          <div style={{ textAlign: "center", color: "#6b6560", fontSize: "13px", marginTop: "24px" }}>No items yet.</div>
        )}
        {grouped.map(({ cat, items: catItems }) => (
          <div key={cat.id}>
            <button
              onClick={() => setCollapsed((prev) => ({ ...prev, [cat.id]: !prev[cat.id] }))}
              style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", background: "transparent", border: "none", cursor: "pointer", padding: "4px 0", fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: cat.color, border: "1.5px solid #1a1a1a", flexShrink: 0 }} />
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1a1a" }}>{cat.label}</span>
              <span style={{ fontSize: "11px", color: "#6b6560" }}>({catItems.length})</span>
              <span style={{ marginLeft: "auto", fontSize: "11px", color: "#6b6560" }}>{collapsed[cat.id] ? "▶" : "▼"}</span>
            </button>
            {!collapsed[cat.id] && (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: "#faf7f2", border: "1.5px solid #1a1a1a" }}
                  >
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: "13px", color: "#1a1a1a", fontFamily: "var(--font-space-grotesk), sans-serif" }}>{item.title}</span>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff", background: item.color, padding: "2px 7px", borderRadius: "2px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      {item.category}
                    </span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b6560", fontSize: "14px", padding: "0 4px", lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
