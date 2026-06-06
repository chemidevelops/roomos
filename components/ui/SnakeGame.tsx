"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const W = 20, H = 20, CELL = 14;
type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Pos = { x: number; y: number };

function rand(): Pos {
  return { x: Math.floor(Math.random() * W), y: Math.floor(Math.random() * H) };
}

export default function SnakeGame() {
  const [snake, setSnake] = useState<Pos[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Pos>({ x: 5, y: 5 });
  const [dir, setDir] = useState<Dir>("RIGHT");
  const [running, setRunning] = useState(false);
  const [dead, setDead] = useState(false);
  const [score, setScore] = useState(0);
  const dirRef = useRef<Dir>("RIGHT");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const reset = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 5, y: 5 });
    setDir("RIGHT");
    dirRef.current = "RIGHT";
    setScore(0);
    setDead(false);
    setRunning(true);
  };

  const changeDir = useCallback((d: Dir) => {
    const opp: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
    if (opp[d] !== dirRef.current) {
      dirRef.current = d;
      setDir(d);
    }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = { ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT" };
      if (map[e.key]) { e.preventDefault(); changeDir(map[e.key]); }
      if (e.key === " " || e.key === "Enter") running ? setRunning(false) : dead ? reset() : setRunning(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [running, dead, changeDir]);

  useEffect(() => {
    if (!running) return;
    const tick = setInterval(() => {
      setSnake(prev => {
        const d = dirRef.current;
        const head = prev[0];
        const next = {
          x: (head.x + (d === "RIGHT" ? 1 : d === "LEFT" ? -1 : 0) + W) % W,
          y: (head.y + (d === "DOWN" ? 1 : d === "UP" ? -1 : 0) + H) % H,
        };
        if (prev.some(s => s.x === next.x && s.y === next.y)) {
          setRunning(false); setDead(true); return prev;
        }
        setFood(f => {
          if (next.x === f.x && next.y === f.y) {
            setScore(s => s + 10);
            let nf = rand();
            while (prev.some(s => s.x === nf.x && s.y === nf.y)) nf = rand();
            return nf;
          }
          return f;
        });
        const ate = next.x === food.x && next.y === food.y;
        return ate ? [next, ...prev] : [next, ...prev.slice(0, -1)];
      });
    }, 120);
    return () => clearInterval(tick);
  }, [running, food]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, W * CELL, H * CELL);

    // Grid dots
    ctx.fillStyle = "#1a1a1a";
    for (let x = 0; x < W; x++)
      for (let y = 0; y < H; y++)
        ctx.fillRect(x * CELL + CELL / 2 - 1, y * CELL + CELL / 2 - 1, 2, 2);

    // Food
    ctx.fillStyle = "#fff";
    ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);

    // Snake
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? "#fff" : "#aaa";
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, [snake, food]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "center", gap: 12, background: "#111", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", width: W * CELL, fontFamily: "monospace", fontSize: 11, color: "#888" }}>
        <span>SCORE: {score}</span>
        <span>{running ? "▶" : dead ? "GAME OVER" : "PAUSED"}</span>
      </div>

      <canvas ref={canvasRef} width={W * CELL} height={H * CELL}
        style={{ border: "1px solid #333", display: "block" }} />

      {/* D-pad for mobile */}
      <div style={{ display: "grid", gridTemplateColumns: "44px 44px 44px", gridTemplateRows: "44px 44px 44px", gap: 4 }}>
        {[
          [null, "UP", null],
          ["LEFT", "●", "RIGHT"],
          [null, "DOWN", null],
        ].map((row, ri) => row.map((cell, ci) => (
          <button key={`${ri}-${ci}`} onPointerDown={() => {
            if (!cell) return;
            if (cell === "●") running ? setRunning(false) : dead ? reset() : setRunning(true);
            else changeDir(cell as Dir);
          }} style={{
            background: cell ? "#1a1a1a" : "transparent",
            border: cell ? "1px solid #333" : "none",
            color: "#fff", fontSize: cell === "●" ? 16 : 12,
            cursor: cell ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "monospace",
          }}>
            {cell === "UP" ? "▲" : cell === "DOWN" ? "▼" : cell === "LEFT" ? "◀" : cell === "RIGHT" ? "▶" : cell === "●" ? (dead ? "↺" : running ? "⏸" : "▶") : ""}
          </button>
        )))}
      </div>

      <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", textAlign: "center" }}>
        {dead ? "TAP ● TO RESTART" : running ? "TAP ● TO PAUSE" : "TAP ● TO START"}
      </div>
    </div>
  );
}
