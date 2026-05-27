"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Line {
  type: "output" | "input";
  text: string;
}

const BOOT_LINES: Line[] = [
  { type: "output", text: "roomOS Terminal [Version 0.1.0]" },
  { type: "output", text: "(C) 2026 roomOS. All rights reserved." },
  { type: "output", text: "" },
];

function processCommand(cmd: string): string[] {
  const trimmed = cmd.trim();
  const lower = trimmed.toLowerCase();
  const parts = trimmed.split(/\s+/);
  const verb = parts[0]?.toLowerCase() ?? "";

  if (lower === "help") {
    return [
      "Available commands:",
      "  help      — list available commands",
      "  date      — current date and time",
      "  time      — current time HH:MM:SS",
      "  cls/clear — clear the screen",
      "  echo      — print text",
      "  whoami    — print current user",
      "  sysinfo   — system information",
      "  ls/dir    — directory listing",
      "  ver       — OS version",
      "  matrix    — ???",
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

  if (trimmed === "") {
    return [];
  }

  return [`'${parts[0]}' is not recognized as an internal or external command,`, "operable program or batch file."];
}

function randomMatrixLine(): string {
  const len = 60 + Math.floor(Math.random() * 20);
  let line = "";
  for (let i = 0; i < len; i++) {
    line += Math.random() > 0.5 ? "1" : "0";
  }
  return line;
}

export default function TerminalApp() {
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

    const outputLines: Line[] = result.map((t) => ({ type: "output" as const, text: t }));
    setLines((prev) => [...prev, inputLine, ...outputLines]);
    setInput("");
  }, [input, matrixRunning, runMatrix]);

  return (
    <div
      onClick={handleContainerClick}
      style={{
        background: "#0a0a0a",
        color: "#00ff41",
        fontFamily: "var(--font-jetbrains-mono), monospace",
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
          padding: "12px 14px 4px",
          lineHeight: "1.6",
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              color: line.type === "input" ? "#00ff41" : "#00cc33",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {line.text || " "}
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
          padding: "4px 14px 12px",
          borderTop: "1px solid #1a3a1a",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ color: "#00ff41", whiteSpace: "nowrap", marginRight: "4px" }}>
          C:\ROOMOS&gt;&nbsp;
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
            color: "#00ff41",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "13px",
            caretColor: "#00ff41",
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
