"use client";

import { useState, useCallback } from "react";

type CalcState = {
  display: string;
  pending: number | null;
  operator: string | null;
  justOp: boolean;
  justEq: boolean;
};

const INITIAL: CalcState = {
  display: "0",
  pending: null,
  operator: null,
  justOp: false,
  justEq: false,
};

function applyOp(a: number, op: string, b: number): number {
  switch (op) {
    case "÷": return b === 0 ? NaN : a / b;
    case "×": return a * b;
    case "−": return a - b;
    case "+": return a + b;
    default: return b;
  }
}

function formatDisplay(val: string): string {
  // Limit display length
  if (val.length > 12) return parseFloat(val).toPrecision(8);
  return val;
}

export default function CalculatorApp() {
  const [calc, setCalc] = useState<CalcState>(INITIAL);

  const pressDigit = useCallback((d: string) => {
    setCalc((prev) => {
      if (prev.display === "Error") return { ...INITIAL, display: d };
      if (prev.justOp || prev.justEq) {
        return { ...prev, display: d, justOp: false, justEq: false };
      }
      if (prev.display === "0" && d !== ".") {
        return { ...prev, display: d };
      }
      if (d === "." && prev.display.includes(".")) return prev;
      return { ...prev, display: prev.display + d };
    });
  }, []);

  const pressAC = useCallback(() => {
    setCalc(INITIAL);
  }, []);

  const pressPlusMinus = useCallback(() => {
    setCalc((prev) => {
      if (prev.display === "0" || prev.display === "Error") return prev;
      const val = parseFloat(prev.display) * -1;
      return { ...prev, display: String(val) };
    });
  }, []);

  const pressPercent = useCallback(() => {
    setCalc((prev) => {
      if (prev.display === "Error") return prev;
      const val = parseFloat(prev.display) / 100;
      return { ...prev, display: String(val) };
    });
  }, []);

  const pressOp = useCallback((op: string) => {
    setCalc((prev) => {
      if (prev.display === "Error") return prev;
      const current = parseFloat(prev.display);
      if (prev.operator && !prev.justOp && !prev.justEq) {
        const result = applyOp(prev.pending!, prev.operator, current);
        if (isNaN(result)) return { ...INITIAL, display: "Error" };
        return { display: String(result), pending: result, operator: op, justOp: true, justEq: false };
      }
      return { ...prev, pending: current, operator: op, justOp: true, justEq: false };
    });
  }, []);

  const pressEquals = useCallback(() => {
    setCalc((prev) => {
      if (!prev.operator || prev.pending === null) return prev;
      if (prev.display === "Error") return prev;
      const current = parseFloat(prev.display);
      const result = applyOp(prev.pending, prev.operator, current);
      if (isNaN(result)) return { ...INITIAL, display: "Error" };
      return { display: String(result), pending: null, operator: null, justOp: false, justEq: true };
    });
  }, []);

  const btnBase: React.CSSProperties = {
    height: "56px",
    fontSize: "18px",
    fontWeight: 700,
    fontFamily: "var(--font-space-grotesk), sans-serif",
    cursor: "pointer",
    border: "2px solid #1a1a1a",
    boxShadow: "2px 2px 0px #1a1a1a",
    transition: "transform 0.05s, box-shadow 0.05s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
  };

  const numStyle: React.CSSProperties = { ...btnBase, background: "#faf7f2" };
  const opStyle: React.CSSProperties = { ...btnBase, background: "#f5c800" };
  const eqStyle: React.CSSProperties = { ...btnBase, background: "#1a1a1a", color: "#f5c800" };
  const utilStyle: React.CSSProperties = { ...btnBase, background: "#e8e2d5" };

  function Btn({
    label,
    style,
    onClick,
    span2,
  }: {
    label: string;
    style: React.CSSProperties;
    onClick: () => void;
    span2?: boolean;
  }) {
    return (
      <button
        style={{ ...style, gridColumn: span2 ? "span 2" : undefined }}
        onClick={onClick}
        onMouseDown={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translate(2px, 2px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        }}
        onMouseUp={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "2px 2px 0px #1a1a1a";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "2px 2px 0px #1a1a1a";
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      style={{
        background: "#faf7f2",
        padding: "12px",
        width: "fit-content",
        minWidth: "260px",
        userSelect: "none",
      }}
    >
      {/* Display */}
      <div
        style={{
          textAlign: "right",
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: "32px",
          fontWeight: 700,
          color: "#1a1a1a",
          minHeight: "52px",
          borderBottom: "2px solid #1a1a1a",
          padding: "8px 12px",
          background: "transparent",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: "52px",
          marginBottom: "12px",
        }}
      >
        {formatDisplay(calc.display)}
      </div>

      {/* Button grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "8px",
        }}
      >
        <Btn label="AC"  style={utilStyle} onClick={pressAC} />
        <Btn label="+/-" style={utilStyle} onClick={pressPlusMinus} />
        <Btn label="%"   style={utilStyle} onClick={pressPercent} />
        <Btn label="÷"   style={opStyle}   onClick={() => pressOp("÷")} />

        <Btn label="7" style={numStyle} onClick={() => pressDigit("7")} />
        <Btn label="8" style={numStyle} onClick={() => pressDigit("8")} />
        <Btn label="9" style={numStyle} onClick={() => pressDigit("9")} />
        <Btn label="×" style={opStyle}  onClick={() => pressOp("×")} />

        <Btn label="4" style={numStyle} onClick={() => pressDigit("4")} />
        <Btn label="5" style={numStyle} onClick={() => pressDigit("5")} />
        <Btn label="6" style={numStyle} onClick={() => pressDigit("6")} />
        <Btn label="−" style={opStyle}  onClick={() => pressOp("−")} />

        <Btn label="1" style={numStyle} onClick={() => pressDigit("1")} />
        <Btn label="2" style={numStyle} onClick={() => pressDigit("2")} />
        <Btn label="3" style={numStyle} onClick={() => pressDigit("3")} />
        <Btn label="+" style={opStyle}  onClick={() => pressOp("+")} />

        <Btn label="0" style={numStyle} onClick={() => pressDigit("0")} span2 />
        <Btn label="." style={numStyle} onClick={() => pressDigit(".")} />
        <Btn label="=" style={eqStyle}  onClick={pressEquals} />
      </div>
    </div>
  );
}
