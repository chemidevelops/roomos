"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: number;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((data: Note[]) => setNotes(data));
  }, []);

  const openNote = (note: Note) => {
    setSelectedId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  const save = useCallback(async (t: string, c: string, id: string) => {
    setSaving(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title: t, content: c }),
    });
    const updated: Note = await res.json();
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    setSaving(false);
  }, []);

  const schedSave = useCallback((t: string, c: string, id: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(t, c, id), 1000);
  }, [save]);

  const createNote = async () => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled", content: "" }),
    });
    const note: Note = await res.json();
    setNotes((prev) => [note, ...prev]);
    openNote(note);
  };

  const deleteNote = async () => {
    if (!selectedId) return;
    await fetch(`/api/notes/${selectedId}`, { method: "DELETE" });
    const remaining = notes.filter((n) => n.id !== selectedId);
    setNotes(remaining);
    setSelectedId(null);
    setTitle("");
    setContent("");
  };

  // Editor view
  if (selectedId) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: "320px" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", padding: "8px 12px", borderBottom: "1.5px solid #e8e2d5", gap: "8px", flexShrink: 0 }}>
          <button
            onClick={() => { if (selectedId) save(title, content, selectedId); setSelectedId(null); }}
            style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a", background: "transparent", border: "1.5px solid #1a1a1a", padding: "4px 10px", cursor: "pointer", borderRadius: "2px", fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            ← Back
          </button>
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (selectedId) schedSave(e.target.value, content, selectedId); }}
            onBlur={() => { if (selectedId) save(title, content, selectedId); }}
            placeholder="Title"
            style={{ flex: 1, fontSize: "14px", fontWeight: 700, border: "none", background: "transparent", color: "#1a1a1a", fontFamily: "var(--font-space-grotesk), sans-serif", outline: "none" }}
          />
          {saving && <span style={{ fontSize: "10px", color: "#6b6560", flexShrink: 0 }}>Saving…</span>}
          <button
            onClick={deleteNote}
            style={{ fontSize: "11px", color: "#dc2626", background: "transparent", border: "1.5px solid #dc2626", padding: "3px 8px", cursor: "pointer", borderRadius: "2px", fontWeight: 600, fontFamily: "var(--font-space-grotesk), sans-serif", flexShrink: 0 }}
          >
            Delete
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => { setContent(e.target.value); if (selectedId) schedSave(title, e.target.value, selectedId); }}
          onBlur={() => { if (selectedId) save(title, content, selectedId); }}
          placeholder="Start writing…"
          style={{ flex: 1, padding: "14px", border: "none", background: "transparent", resize: "none", fontSize: "13px", color: "#1a1a1a", fontFamily: "var(--font-space-grotesk), sans-serif", lineHeight: 1.6, outline: "none" }}
        />
      </div>
    );
  }

  // List view
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px 12px", borderBottom: "1.5px solid #e8e2d5" }}>
        <button
          onClick={createNote}
          className="btn-brutal"
          style={{ width: "100%", padding: "8px 0", background: "#f5c800", color: "#1a1a1a", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", border: "2px solid #1a1a1a", cursor: "pointer", fontFamily: "var(--font-space-grotesk), sans-serif" }}
        >
          + New note
        </button>
      </div>
      {notes.length === 0 ? (
        <div style={{ padding: "24px 16px", fontSize: "13px", color: "#6b6560", textAlign: "center" }}>No notes yet.</div>
      ) : (
        notes.map((n) => (
          <button
            key={n.id}
            onClick={() => openNote(n)}
            style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 14px", background: "transparent", border: "none", borderBottom: "1.5px solid #e8e2d5", cursor: "pointer", fontFamily: "var(--font-space-grotesk), sans-serif" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f0ebe0")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
          >
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {n.title || "Untitled"}
            </div>
            <div style={{ fontSize: "11px", color: "#6b6560", marginTop: "2px" }}>{formatDate(n.updated_at)}</div>
          </button>
        ))
      )}
    </div>
  );
}
