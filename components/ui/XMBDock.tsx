"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

const ITEMS = [
  { id: "home",     icon: "⌂",  label: "Home"     },
  { id: "apps",     icon: "◫",  label: "Apps"     },
  { id: "music",    icon: "♪",  label: "Music"    },
  { id: "media",    icon: "◈",  label: "Media"    },
  { id: "settings", icon: "⊙", label: "Settings"  },
];

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

export default function XMBDock() {
  const [activeIdx, setActiveIdx] = useState(0);

  // Touch/swipe handling
  const touchStartX = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) setActiveIdx((i) => Math.min(i + 1, ITEMS.length - 1));
      else        setActiveIdx((i) => Math.max(i - 1, 0));
    }
    touchStartX.current = null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex justify-center"
      style={{
        zIndex: 100,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        style={{
          width: "100%",
          height: "80px",
          background: "rgba(8,8,16,0.9)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 -1px 40px rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0px",
          padding: "0 8px",
          position: "relative",
        }}
      >
        {ITEMS.map((item, i) => {
          const dist = Math.abs(i - activeIdx);
          const isActive = dist === 0;
          const isAdjacent = dist === 1;

          const scale = isActive ? 1.15 : isAdjacent ? 0.92 : 0.8;
          const opacity = isActive ? 1 : isAdjacent ? 0.45 : 0.22;

          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveIdx(i)}
              animate={{ scale, opacity }}
              transition={spring}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                background: "none",
                border: "none",
                cursor: "pointer",
                outline: "none",
                position: "relative",
                height: "100%",
                paddingBottom: "8px",
              }}
              whileTap={{ scale: scale * 0.92 }}
            >
              {/* Glow under active icon */}
              {isActive && (
                <motion.div
                  layoutId="dock-glow"
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle at center, rgba(74,158,255,0.25) 0%, transparent 70%)",
                    filter: "blur(8px)",
                    pointerEvents: "none",
                  }}
                  transition={spring}
                />
              )}

              {/* Icon */}
              <span
                style={{
                  fontSize: "22px",
                  lineHeight: 1,
                  fontFamily: "system-ui",
                  color: isActive ? "#e8e8f2" : "#7878a0",
                  filter: isActive
                    ? "drop-shadow(0 0 10px rgba(74,158,255,0.7))"
                    : "none",
                  position: "relative",
                  zIndex: 1,
                  transition: "color 0.3s, filter 0.3s",
                }}
              >
                {item.icon}
              </span>

              {/* Label — only visible when active */}
              <motion.span
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: "9px",
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(74,158,255,0.8)",
                  position: "relative",
                  zIndex: 1,
                  userSelect: "none",
                }}
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
