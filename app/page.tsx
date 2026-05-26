"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Clock from "@/components/ui/Clock";
import Widget from "@/components/ui/Widget";
import AmbientBar from "@/components/ui/AmbientBar";
import XMBDock from "@/components/ui/XMBDock";
import BootSequence from "@/components/ui/BootSequence";
import AmbientBackground from "@/components/ui/AmbientBackground";

/* ── helpers ── */
function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay },
  };
}

/* ── Circular arc (Focus widget) ── */
function CircularProgress({
  value,
  max,
  size = 72,
  label,
  status,
}: {
  value: number;
  max: number;
  size?: number;
  label: string;
  status: string;
}) {
  const stroke = 2.5;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / max) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
      <span
        style={{
          fontFamily: "var(--font-space-grotesk)",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#7878a0",
          alignSelf: "flex-start",
        }}
      >
        Focus
      </span>

      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(74,158,255,0.1)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#4a9eff"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ filter: "drop-shadow(0 0 4px rgba(74,158,255,0.7))" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "14px",
              fontWeight: 400,
              color: "#e8e8f2",
              letterSpacing: "-0.02em",
              textShadow: "0 0 12px rgba(74,158,255,0.5)",
            }}
          >
            {label}
          </div>
        </div>
      </div>

      <span
        style={{
          fontFamily: "var(--font-space-grotesk)",
          fontSize: "10px",
          color: "#7878a0",
          textAlign: "center",
        }}
      >
        {status}
      </span>
    </div>
  );
}

/* ── Status bar live clock ── */
function StatusClock() {
  const [label, setLabel] = useState("--:--");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setLabel(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      style={{
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: "11px",
        color: "rgba(255,255,255,0.3)",
        letterSpacing: "0.06em",
        fontWeight: 400,
      }}
    >
      {label}
    </span>
  );
}

/* ── Page ── */
export default function Home() {
  const [booting, setBooting] = useState(true);
  const [ready, setReady] = useState(false);

  const handleBootComplete = useCallback(() => {
    setBooting(false);
    setReady(true);
  }, []);

  return (
    <>
      {/* Boot sequence */}
      {booting && <BootSequence onComplete={handleBootComplete} />}

      {/* Main OS */}
      {ready && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grain"
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflowY: "auto",
            overflowX: "hidden",
            position: "relative",
          }}
        >
          {/* Ambient background */}
          <AmbientBackground />

          {/* STATUS BAR */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              height: "44px",
              zIndex: 10,
              background: "rgba(8,8,16,0.7)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: "10px",
                fontWeight: 500,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.25)",
              }}
            >
              roomOS
            </span>
            <StatusClock />
          </div>

          {/* Scrollable content */}
          <main
            style={{
              width: "100%",
              maxWidth: "390px",
              minHeight: "100dvh",
              display: "flex",
              flexDirection: "column",
              padding: "80px 16px 120px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* HERO CLOCK */}
            <motion.div
              {...fadeUp(0)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: "16px",
                paddingBottom: "40px",
              }}
            >
              <Clock />
            </motion.div>

            {/* AMBIENT NOW PLAYING */}
            <motion.div {...fadeUp(0.15)} style={{ marginBottom: "20px" }}>
              <AmbientBar artist="Bonobo" track="Kong" />
            </motion.div>

            {/* WIDGET GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {/* WIDGET 1: Now — full width */}
              <motion.div {...fadeUp(0.25)} style={{ gridColumn: "1 / -1" }}>
                <Widget
                  glow="blue"
                  size="lg"
                  layoutId="widget-now"
                  expandedContent={
                    <div style={{ padding: "8px 0" }}>
                      <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7878a0", marginBottom: "20px" }}>
                        Ahora
                      </div>
                      <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "28px", fontWeight: 300, color: "#e8e8f2" }}>
                        Final Fantasy X
                      </div>
                      <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "14px", color: "#7878a0", marginTop: "8px" }}>
                        Videojuegos · 90 min restantes
                      </div>
                      <div style={{ marginTop: "32px", height: "2px", background: "rgba(74,158,255,0.1)", borderRadius: "1px", position: "relative" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "60%", background: "#4a9eff", borderRadius: "1px", boxShadow: "0 0 8px rgba(74,158,255,0.6)" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                        <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "10px", color: "#404060" }}>54:00</span>
                        <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "10px", color: "#404060" }}>90:00</span>
                      </div>
                    </div>
                  }
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <span style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7878a0" }}>
                      Ahora
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      {/* Activity icon */}
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "14px",
                          background: "rgba(74,158,255,0.1)",
                          border: "1px solid rgba(74,158,255,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                          flexShrink: 0,
                          boxShadow: "0 0 20px rgba(74,158,255,0.15)",
                        }}
                      >
                        🎮
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-space-grotesk)",
                            fontSize: "16px",
                            fontWeight: 500,
                            color: "#e8e8f2",
                            lineHeight: 1.2,
                            textShadow: "0 0 20px rgba(74,158,255,0.2)",
                          }}
                        >
                          Final Fantasy X
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-space-grotesk)",
                            fontSize: "12px",
                            color: "#7878a0",
                            marginTop: "3px",
                          }}
                        >
                          Videojuegos · 90 min restantes
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div
                      style={{
                        height: "2px",
                        background: "rgba(74,158,255,0.1)",
                        borderRadius: "1px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          height: "100%",
                          width: "60%",
                          background: "#4a9eff",
                          borderRadius: "1px",
                          boxShadow: "0 0 6px rgba(74,158,255,0.7)",
                        }}
                      />
                    </div>
                  </div>
                </Widget>
              </motion.div>

              {/* WIDGET 2: Focus — half width */}
              <motion.div {...fadeUp(0.35)}>
                <Widget glow="blue" size="sm" layoutId="widget-focus">
                  <CircularProgress value={0} max={25} size={72} label="25:00" status="Ready" />
                </Widget>
              </motion.div>

              {/* WIDGET 3: Streak — half width */}
              <motion.div {...fadeUp(0.4)}>
                <Widget glow="gold" size="sm" layoutId="widget-streak">
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7878a0" }}>
                      Streak
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "24px", lineHeight: 1 }}>🔥</span>
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-space-grotesk)",
                            fontSize: "32px",
                            fontWeight: 600,
                            color: "#c8a96e",
                            lineHeight: 1,
                            letterSpacing: "-0.03em",
                            textShadow: "0 0 20px rgba(200,169,110,0.4)",
                          }}
                        >
                          12
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-space-grotesk)",
                            fontSize: "10px",
                            color: "#7878a0",
                            marginTop: "2px",
                          }}
                        >
                          días seguidos
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "3px" }}>
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: "3px",
                            borderRadius: "2px",
                            background: i < 5 ? "#c8a96e" : "rgba(200,169,110,0.12)",
                            boxShadow: i < 5 ? "0 0 5px rgba(200,169,110,0.5)" : "none",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </Widget>
              </motion.div>

              {/* WIDGET 4: Media — full width */}
              <motion.div {...fadeUp(0.45)} style={{ gridColumn: "1 / -1" }}>
                <Widget glow="none" size="lg" layoutId="widget-media">
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <span style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7878a0" }}>
                      Media
                    </span>

                    <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
                      {/* Series pill */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: "12px",
                          padding: "8px 12px",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "#4a9eff",
                            boxShadow: "0 0 6px rgba(74,158,255,0.8)",
                          }}
                        />
                        <div>
                          <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "12px", fontWeight: 500, color: "#e8e8f2" }}>
                            Shetland
                          </div>
                          <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "10px", color: "#7878a0" }}>
                            S02E04 · Serie
                          </div>
                        </div>
                      </div>

                      {/* Manga pill */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: "12px",
                          padding: "8px 12px",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "#c8a96e",
                            boxShadow: "0 0 6px rgba(200,169,110,0.8)",
                          }}
                        />
                        <div>
                          <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "12px", fontWeight: 500, color: "#e8e8f2" }}>
                            Patlabor Vol.2
                          </div>
                          <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "10px", color: "#7878a0" }}>
                            Manga
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Widget>
              </motion.div>
            </div>
          </main>

          {/* XMB DOCK */}
          <XMBDock />
        </motion.div>
      )}
    </>
  );
}
