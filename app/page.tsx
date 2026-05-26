"use client";

import { useState } from "react";
import TopBar from "@/components/ui/TopBar";
import Sidebar from "@/components/ui/Sidebar";
import Card from "@/components/ui/Card";
import FocusTimer from "@/components/ui/FocusTimer";

/* ── HOME view ── */
function HomeView() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const QUEUE = [
    { title: "Shetland S02E04", category: "Series", color: "#1d4ed8" },
    { title: "Patlabor Vol. 2", category: "Manga", color: "#dc2626" },
    { title: "Hokuto no Ken", category: "Anime", color: "#0d9488" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* Greeting */}
      <div>
        <h1
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: "clamp(24px, 4vw, 32px)",
            fontWeight: 700,
            color: "#1a1a1a",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {greeting}, Jose
        </h1>
        <p
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: "14px",
            color: "#6b6560",
            margin: "6px 0 0",
          }}
        >
          {today}
        </p>
      </div>

      {/* 3-column grid (desktop), 1-col (mobile) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {/* CARD 1: NOW — full width */}
        <Card
          color="#f5c800"
          style={{ gridColumn: "1 / -1" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#1a1a1a",
              }}
            >
              Now
            </div>
            <div
              style={{
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 700,
                color: "#1a1a1a",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                lineHeight: 1.1,
              }}
            >
              Final Fantasy X
            </div>
            <div style={{ fontSize: "14px", color: "#1a1a1a", opacity: 0.7 }}>
              Videojuegos · 90 min
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: "8px",
                background: "rgba(26,26,26,0.15)",
                border: "1.5px solid #1a1a1a",
                borderRadius: "2px",
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
                  background: "#1a1a1a",
                  borderRadius: "1px",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                color: "#1a1a1a",
                opacity: 0.6,
              }}
            >
              <span>54:00</span>
              <span>90:00</span>
            </div>

            {/* Button */}
            <button
              className="btn-brutal"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 20px",
                background: "#1a1a1a",
                color: "#f5c800",
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "var(--font-space-grotesk), sans-serif",
                borderRadius: "2px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                width: "fit-content",
              }}
            >
              Start session →
            </button>
          </div>
        </Card>

        {/* CARD 2: FOCUS TIMER — half width */}
        <Card>
          <FocusTimer compact />
        </Card>

        {/* CARD 3: STREAK — half width */}
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#6b6560",
              }}
            >
              Streak
            </div>
            <div
              style={{
                fontSize: "72px",
                fontWeight: 700,
                color: "#1a1a1a",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                fontFamily: "var(--font-space-grotesk), sans-serif",
              }}
            >
              12
            </div>
            <div style={{ fontSize: "14px", color: "#6b6560", fontWeight: 500 }}>
              days
            </div>

            {/* Week dots */}
            <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  title={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                  style={{
                    flex: 1,
                    height: "10px",
                    borderRadius: "2px",
                    background: i < 5 ? "#1a1a1a" : "#e8e2d5",
                    border: "1.5px solid #1a1a1a",
                  }}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* CARD 4: QUEUE — full width */}
        <Card style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#6b6560",
                }}
              >
                Queue
              </div>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  padding: 0,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                View all →
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {QUEUE.map((item) => (
                <div
                  key={item.title}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    background: "#f0ebe0",
                    border: "1.5px solid #1a1a1a",
                    borderRadius: "2px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#1a1a1a",
                      flex: 1,
                    }}
                  >
                    {item.title}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#faf7f2",
                      background: item.color,
                      padding: "2px 8px",
                      borderRadius: "2px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── FOCUS view ── */
function FocusView() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
        }}
      >
        <Card color="#faf7f2">
          <FocusTimer compact={false} />
        </Card>
      </div>
    </div>
  );
}

/* ── PLACEHOLDER view ── */
function PlaceholderView({ name }: { name: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: "28px",
          fontWeight: 700,
          color: "#1a1a1a",
          margin: 0,
        }}
      >
        {name}
      </h2>
      <Card>
        <p style={{ color: "#6b6560", fontWeight: 500, margin: 0 }}>
          {name} view coming soon.
        </p>
      </Card>
    </div>
  );
}

/* ── MOBILE bottom tab bar ── */
const TABS = [
  { id: "home",    icon: "⌂",  label: "Home" },
  { id: "focus",   icon: "◎",  label: "Focus" },
  { id: "backlog", icon: "≡",  label: "Backlog" },
  { id: "journal", icon: "✎",  label: "Journal" },
  { id: "music",   icon: "♪",  label: "Music" },
];

function BottomTabBar({ activeView, onSelect }: { activeView: string; onSelect: (v: string) => void }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "56px",
        background: "#faf7f2",
        borderTop: "2px solid #1a1a1a",
        display: "flex",
        zIndex: 90,
      }}
      className="bottom-tabs-mobile"
    >
      {TABS.map((tab) => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              background: isActive ? "#f5c800" : "transparent",
              border: "none",
              borderTop: isActive ? "3px solid #1a1a1a" : "3px solid transparent",
              cursor: "pointer",
              fontFamily: "var(--font-space-grotesk), sans-serif",
            }}
          >
            <span style={{ fontSize: "18px", lineHeight: 1 }}>{tab.icon}</span>
            <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#1a1a1a" }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── PAGE ── */
export default function Home() {
  const [activeView, setActiveView] = useState("home");

  function renderView() {
    switch (activeView) {
      case "home":    return <HomeView />;
      case "focus":   return <FocusView />;
      case "backlog": return <PlaceholderView name="Backlog" />;
      case "journal": return <PlaceholderView name="Journal" />;
      case "music":   return <PlaceholderView name="Music" />;
      case "settings":return <PlaceholderView name="Settings" />;
      default:        return <HomeView />;
    }
  }

  return (
    <div
      className="desktop-pattern"
      style={{
        minHeight: "100dvh",
        background: "#f0ebe0",
        position: "relative",
      }}
    >
      {/* Top bar — always visible */}
      <TopBar activeView={activeView} />

      {/* Sidebar — desktop only */}
      <Sidebar activeView={activeView} onSelect={setActiveView} />

      {/* Main content */}
      <main
        style={{
          marginTop: "36px",
          marginLeft: 0,
          minHeight: "calc(100dvh - 36px)",
          overflowY: "auto",
          padding: "24px 20px 80px",
        }}
        /* Tailwind can't handle this dynamic, so we use a style tag approach inline */
      >
        {/* Spacer for sidebar on desktop */}
        <div
          style={{
            maxWidth: "960px",
          }}
          className="main-inner"
        >
          {renderView()}
        </div>
      </main>

      {/* Mobile bottom tabs */}
      <BottomTabBar activeView={activeView} onSelect={setActiveView} />

      {/* Inline responsive styles */}
      <style>{`
        @media (min-width: 768px) {
          main {
            margin-left: 200px !important;
            padding-bottom: 24px !important;
          }
          .bottom-tabs-mobile {
            display: none !important;
          }
          .sidebar-desktop {
            display: flex !important;
          }
        }
        @media (max-width: 767px) {
          .sidebar-desktop {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
