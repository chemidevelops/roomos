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
  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  useEffect(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((data: Note[]) => {
        setNotes(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
          setTitle(data[0].title);
          setContent(data[0].content);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback(
    async (t: string, c: string, id: string) => {
      setSaving(true);
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title: t, content: c }),
      });
      const updated: Note = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setSaving(false);
    },
    []
  );

  const schedSave = useCallback(
    (t: string, c: string, id: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => save(t, c, id), 1000);
    },
    [save]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (selectedId) schedSave(e.target.value, content, selectedId);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (selectedId) schedSave(title, e.target.value, selectedId);
  };

  const handleBlur = () => {
    if (selectedId) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      save(title, content, selectedId);
    }
  };

  const createNote = async () => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled", content: "" }),
    });
    const note: Note = await res.json();
    setNotes((prev) => [note, ...prev]);
    setSelectedId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  const deleteNote = async () => {
    if (!selectedId) return;
    await fetch(`/api/notes/${selectedId}`, { method: "DELETE" });
    const remaining = notes.filter((n) => n.id !== selectedId);
    setNotes(remaining);
    if (remaining.length > 0) {
      setSelectedId(remaining[0].id);
      setTitle(remaining[0].title);
      setContent(remaining[0].content);
    } else {
      setSelectedId(null);
      setTitle("");
      setContent("");
    }
  };

  return (
    <div style={{ display: "flex", height: "460px", overflow: "hidden" }}>
      {/* Left panel */}
      <div style={{ width: "180px", borderRight: "2px solid #1a1a1a", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <button
          onClick={createNote}
          className="btn-brutal"
          style={{ margin: "10px", padding: "8px 0", background: "#f5c800", color: "#1a1a1a", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", border: "2px solid #1a1a1a", cursor: "pointer", fontFamily: "var(--font-space-grotesk), sans-serif" }}
        >
          + New note
        </button>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {notes.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedId(n.id)}
              style={{
                display: "block", width: "100%", textAlign: "left", padding: "10px 12px",
                background: n.id === selectedId ? "#f5c800" : "transparent",
                border: "none",
                borderBottom: "1.5px solid #e8e2d5",
                cursor: "pointer",
                fontFamily: "var(--font-space-grotesk), sans-serif",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {n.title || "Untitled"}
              </div>
              <div style={{ fontSize: "10px", color: "#6b6560", marginTop: "2px" }}>{formatDate(n.updated_at)}</div>
            </button>
          ))}
          {notes.length === 0 && (
            <div style={{ padding: "16px 12px", fontSize: "12px", color: "#6b6560" }}>No notes yet.</div>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selectedId ? (
          <>
            <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: "1.5px solid #e8e2d5", gap: "8px" }}>
              <input
                value={title}
                onChange={handleTitleChange}
                onBlur={handleBlur}
                placeholder="Title"
                style={{ flex: 1, fontSize: "15px", fontWeight: 700, border: "none", background: "transparent", color: "#1a1a1a", fontFamily: "var(--font-space-grotesk), sans-serif", outline: "none" }}
              />
              {saving && <span style={{ fontSize: "10px", color: "#6b6560" }}>Saving…</span>}
              <button
                onClick={deleteNote}
                style={{ fontSize: "11px", color: "#dc2626", background: "transparent", border: "1.5px solid #dc2626", padding: "3px 8px", cursor: "pointer", borderRadius: "2px", fontWeight: 600, fontFamily: "var(--font-space-grotesk), sans-serif" }}
              >
                Delete
              </button>
            </div>
            <textarea
              value={content}
              onChange={handleContentChange}
              onBlur={handleBlur}
              placeholder="Start writing…"
              style={{ flex: 1, padding: "14px", border: "none", background: "transparent", resize: "none", fontSize: "13px", color: "#1a1a1a", fontFamily: "var(--font-space-grotesk), sans-serif", lineHeight: 1.6, outline: "none" }}
            />
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6560", fontSize: "13px" }}>
            Select a note or create one.
          </div>
        )}
      </div>
    </div>
  );
}
