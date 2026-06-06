"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Line {
  type: "output" | "input";
  text: string;
}

interface TerminalAppProps {
  onOpenApp?: (id: string) => void;
}

const BOOT_LINES: Line[] = [
  { type: "output", text: "roomOS Terminal [Version 0.1.0]" },
  { type: "output", text: "(C) 2026 roomOS. All rights reserved." },
  { type: "output", text: "" },
];

const APP_MAP: Record<string, string> = {
  solitaire: "solitaire",
  notas: "notes",
  notes: "notes",
  backlog: "backlog",
  schedule: "calendar",
  calendario: "calendar",
  settings: "settings",
  calc: "calculator",
  calculadora: "calculator",
  focus: "focus",
  timer: "focus",
};

const VALID_CATEGORIES = ["videojuegos", "series", "anime", "manga", "libros", "revistas", "podcasts"];

function randomMatrixLine(): string {
  const len = 60 + Math.floor(Math.random() * 20);
  let line = "";
  for (let i = 0; i < len; i++) {
    line += Math.random() > 0.5 ? "1" : "0";
  }
  return line;
}

function processCommand(cmd: string): string[] {
  const trimmed = cmd.trim();
  const lower = trimmed.toLowerCase();
  const parts = trimmed.split(/\s+/);
  const verb = parts[0]?.toLowerCase() ?? "";

  if (lower === "help") {
    return [
      "Available commands:",
      "  help                    — list available commands",
      "  date                    — current date and time",
      "  time                    — current time HH:MM:SS",
      "  cls/clear               — clear the screen",
      "  echo                    — print text",
      "  whoami                  — print current user",
      "  ver                     — OS version",
      "  matrix                  — ???",
      "  open <app>              — open an app",
      '  add <cat> "<title>"     — add item to backlog',
      '  note "<text>"           — save a quick note',
      "  today                   — show today's schedule",
      "  streak                  — show habit streak",
      "  done                    — count done activities today",
      "",
      "  — SERVER —",
      "  top                     — running processes",
      "  ps                      — process list by CPU",
      "  df                      — disk usage",
      "  free                    — memory usage",
      "  pm2                     — service status",
      "  logs                    — nginx access log (last 30)",
    ];
  }

  if (lower === "date") {
    return [new Date().toLocaleString()];
  }

  if (lower === "time") {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    const ss = now.getSeconds().toString().padStart(2, "0");
    return [`${hh}:${mm}:${ss}`];
  }

  if (lower === "cls" || lower === "clear") {
    return ["__CLEAR__"];
  }

  if (verb === "echo") {
    return [parts.slice(1).join(" ")];
  }

  if (lower === "whoami") {
    return ["jose"];
  }

  if (lower === "sysinfo") {
    return [
      "System Information",
      "  OS:   roomOS v0.1",
      "  CPU:  ARM Cortex-A55 4x",
      "  RAM:  4GB",
      "  DISK: 40GB",
    ];
  }

  if (lower === "ls" || lower === "dir") {
    return [
      " Volume in drive C is ROOMOS",
      " Directory of C:\\ROOMOS",
      "",
      "05/27/2026  10:00 AM    <DIR>   notes/",
      "05/27/2026  10:00 AM      4096  backlog.db",
      "05/27/2026  10:00 AM      8192  schedule.db",
      "05/27/2026  10:00 AM     16384  solitaire.exe",
      "05/27/2026  10:00 AM     12288  calculator.exe",
      "               3 File(s)   40,960 bytes",
      "               1 Dir(s)",
    ];
  }

  if (lower === "ver") {
    return ["roomOS [Version 0.1.0]"];
  }

  if (lower === "matrix") {
    return ["__MATRIX__"];
  }

  if (["top", "ps", "df", "free", "pm2", "logs", "pixel"].includes(lower)) {
    return [`__SERVER__:${lower}`];
  }

  if (verb === "open") {
    const appName = parts.slice(1).join(" ").toLowerCase();
    if (!appName) return ["Usage: open <app>"];
    const id = APP_MAP[appName];
    if (id) {
      return [`__OPEN__:${id}:Opening ${appName}...`];
    }
    return [`Unknown app: ${appName}`];
  }

  if (verb === "add") {
    // add <category> "<title>"
    const rest = trimmed.slice(verb.length).trim();
    const catMatch = rest.match(/^(\S+)\s+"(.+)"$/);
    if (!catMatch) return ['Usage: add <category> "<title>"'];
    const category = catMatch[1].toLowerCase();
    const title = catMatch[2];
    if (!VALID_CATEGORIES.includes(category)) {
      return [`Unknown category: ${category}`, `Valid: ${VALID_CATEGORIES.join(", ")}`];
    }
    return [`__ADD__:${category}:${title}`];
  }

  if (verb === "note") {
    const noteMatch = trimmed.slice(verb.length).trim().match(/^"(.+)"$/);
    if (!noteMatch) return ['Usage: note "<text>"'];
    return [`__NOTE__:${noteMatch[1]}`];
  }

  if (lower === "today") {
    return ["__TODAY__"];
  }

  if (lower === "streak") {
    return ["Streak: checking...", "Feature coming soon."];
  }

  if (lower === "done") {
    return ["__DONE__"];
  }

  if (trimmed === "") {
    return [];
  }

  return [`'${parts[0]}' is not recognized as an internal or external command,`, "operable program or batch file."];
}

export default function TerminalApp({ onOpenApp = () => {} }: TerminalAppProps) {
  const [lines, setLines] = useState<Line[]>(BOOT_LINES);
  const [input, setInput] = useState("");
  const [matrixRunning, setMatrixRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const matrixTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const runMatrix = useCallback(() => {
    setMatrixRunning(true);
    let count = 0;
    const total = 40;
    matrixTimerRef.current = setInterval(() => {
      setLines((prev) => [...prev, { type: "output", text: randomMatrixLine() }]);
      count++;
      if (count >= total) {
        if (matrixTimerRef.current) clearInterval(matrixTimerRef.current);
        setLines((prev) => [...prev, { type: "output", text: "" }, { type: "output", text: "ACCESS GRANTED" }]);
        setMatrixRunning(false);
      }
    }, 50);
  }, []);

  const appendLines = useCallback((newLines: string[]) => {
    setLines((prev) => [...prev, ...newLines.map((t) => ({ type: "output" as const, text: t }))]);
  }, []);

  const handleAsyncCommand = useCallback(async (result: string[], inputLine: Line) => {
    const first = result[0];

    // Open app
    if (first?.startsWith("__OPEN__:")) {
      const [, id, msg] = first.split(":") as [string, string, string];
      setLines((prev) => [...prev, inputLine, { type: "output", text: msg }]);
      onOpenApp(id);
      return;
    }

    // Add to backlog
    if (first?.startsWith("__ADD__:")) {
      const parts = first.split(":");
      const category = parts[1];
      const title = parts.slice(2).join(":");
      setLines((prev) => [...prev, inputLine, { type: "output", text: `Adding '${title}' to ${category}...` }]);
      try {
        const res = await fetch("/api/backlog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, category }),
        });
        if (res.ok) {
          appendLines([`Added '${title}' to ${category}.`]);
        } else {
          const err = await res.json().catch(() => ({}));
          appendLines([`Error: ${err?.error ?? res.statusText}`]);
        }
      } catch {
        appendLines(["Error: network failure."]);
      }
      return;
    }

    // Save note
    if (first?.startsWith("__NOTE__:")) {
      const text = first.slice("__NOTE__:".length);
      setLines((prev) => [...prev, inputLine, { type: "output", text: "Saving note..." }]);
      try {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: text.slice(0, 40), content: text }),
        });
        if (res.ok) {
          appendLines(["Note saved."]);
        } else {
          const err = await res.json().catch(() => ({}));
          appendLines([`Error: ${err?.error ?? res.statusText}`]);
        }
      } catch {
        appendLines(["Error: network failure."]);
      }
      return;
    }

    // Today's schedule
    if (first === "__TODAY__") {
      setLines((prev) => [...prev, inputLine]);
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await fetch(`/api/schedule?date=${today}`);
        if (res.ok) {
          const data = await res.json();
          const entries: Array<{ start_min: number; end_min: number; title: string; category?: string }> =
            Array.isArray(data) ? data : (data.entries ?? []);
          if (entries.length === 0) {
            appendLines(["No activities scheduled today."]);
          } else {
            const formatted = entries.map((e) => {
              const sh = Math.floor(e.start_min / 60).toString().padStart(2, "0");
              const sm = (e.start_min % 60).toString().padStart(2, "0");
              const eh = Math.floor(e.end_min / 60).toString().padStart(2, "0");
              const em = (e.end_min % 60).toString().padStart(2, "0");
              const cat = e.category ? ` [${e.category}]` : "";
              return `${sh}:${sm}-${eh}:${em}  ${e.title}${cat}`;
            });
            appendLines(formatted);
          }
        } else {
          appendLines(["Error fetching schedule."]);
        }
      } catch {
        appendLines(["Error: network failure."]);
      }
      return;
    }

    // Done count
    if (first === "__DONE__") {
      setLines((prev) => [...prev, inputLine]);
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await fetch(`/api/schedule?date=${today}`);
        if (res.ok) {
          const data = await res.json();
          const entries: Array<{ end_min: number }> = Array.isArray(data) ? data : (data.entries ?? []);
          const now = new Date();
          const currentMinute = now.getHours() * 60 + now.getMinutes();
          const doneCount = entries.filter((e) => e.end_min < currentMinute).length;
          appendLines([`Done today: ${doneCount} activities.`]);
        } else {
          appendLines(["Error fetching schedule."]);
        }
      } catch {
        appendLines(["Error: network failure."]);
      }
      return;
    }

    // Server commands
    const SERVER_CMDS = ["top", "ps", "df", "free", "pm2", "logs", "pixel"];
    const cmdName = result[0]?.replace("__SERVER__:", "") ?? "";
    if (result[0]?.startsWith("__SERVER__:")) {
      setLines((prev) => [...prev, inputLine, { type: "output", text: "Loading..." }]);
      try {
        const res = await fetch(`/api/terminal?cmd=${cmdName}`);
        const data = await res.json();
        const out = (data.output || data.error || "").split("\n").map((t: string) => ({ type: "output" as const, text: t }));
        setLines((prev) => [...prev.slice(0, -1), ...out]);
      } catch {
        setLines((prev) => [...prev.slice(0, -1), { type: "output", text: "Error connecting to server." }]);
      }
      return;
    }

    // Default sync output
    const outputLines: Line[] = result.map((t) => ({ type: "output" as const, text: t }));
    setLines((prev) => [...prev, inputLine, ...outputLines]);
  }, [onOpenApp, appendLines]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (matrixRunning) return;

    const cmd = input.trim();
    const inputLine: Line = { type: "input", text: `C:\\ROOMOS> ${cmd}` };

    const result = processCommand(cmd);

    if (result[0] === "__CLEAR__") {
      setLines([]);
      setInput("");
      return;
    }

    if (result[0] === "__MATRIX__") {
      setLines((prev) => [...prev, inputLine]);
      setInput("");
      runMatrix();
      return;
    }

    setInput("");
    handleAsyncCommand(result, inputLine);
  }, [input, matrixRunning, runMatrix, handleAsyncCommand]);

  return (
    <div
      onClick={handleContainerClick}
      style={{
        background: "#1e1e1e",
        color: "#f0f0f0",
        fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', 'Fira Code', monospace",
        fontSize: "13px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "340px",
        cursor: "text",
        userSelect: "none",
      }}
    >
      {/* Scrollable output */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 16px 4px",
          lineHeight: "1.65",
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              color: line.type === "input" ? "#f0f0f0" : "#aaaaaa",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {line.type === "input" ? (
              <>
                <span style={{ color: "#5af78e" }}>roomos</span>
                <span style={{ color: "#888" }}>:</span>
                <span style={{ color: "#57c7ff" }}>~</span>
                <span style={{ color: "#888" }}> $ </span>
                <span>{line.text.replace(/^C:\\ROOMOS>\s*/, "")}</span>
              </>
            ) : line.text || " "}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input line */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "4px 16px 12px",
          borderTop: "1px solid #333",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ whiteSpace: "nowrap", marginRight: "4px" }}>
          <span style={{ color: "#5af78e" }}>roomos</span>
          <span style={{ color: "#888" }}>:</span>
          <span style={{ color: "#57c7ff" }}>~</span>
          <span style={{ color: "#888" }}> $ </span>
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={matrixRunning}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#f0f0f0",
            fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
            fontSize: "13px",
            caretColor: "#f0f0f0",
          }}
        />
      </form>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
