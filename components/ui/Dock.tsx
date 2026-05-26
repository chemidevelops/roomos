"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS = [
  { id: "home",    icon: "⌂",  label: "Home"    },
  { id: "library", icon: "◫",  label: "Library" },
  { id: "music",   icon: "♪",  label: "Music"   },
  { id: "games",   icon: "◈",  label: "Games"   },
  { id: "settings",icon: "⊙", label: "Settings" },
];

export default function Dock() {
  const [active, setActive] = useState("home");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
      className="fixed bottom-0 left-0 right-0 flex justify-center"
      style={{ zIndex: 100, paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
    >
      <div
        style={{
          background: "rgba(10,10,20,0.85)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "28px",
          padding: "10px 8px",
          boxShadow: "0 -2px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)",
          display: "flex",
          gap: "4px",
          margin: "0 16px 16px",
          width: "calc(100% - 32px)",
          maxWidth: "340px",
        }}
      >
        {ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => setActive(item.id)}
              className="relative flex flex-col items-center justify-center"
              style={{
                flex: 1,
                padding: "6px 4px 10px",
                background: "none",
                border: "none",
                cursor: "pointer",
                borderRadius: "18px",
                outline: "none",
              }}
              whileTap={{ scale: 0.88 }}
              transition={{ duration: 0.15 }}
            >
              {/* Active background */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="dock-active-bg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "18px",
                      background: "rgba(74,158,255,0.1)",
                      boxShadow: "inset 0 0 12px rgba(74,158,255,0.08)",
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                )}
              </AnimatePresence>

              {/* Icon */}
              <span
                style={{
                  fontSize: "20px",
                  lineHeight: 1,
                  color: isActive ? "#e8e8f2" : "#404060",
                  transition: "color 0.3s ease",
                  filter: isActive ? "drop-shadow(0 0 8px rgba(74,158,255,0.6))" : "none",
                  fontFamily: "system-ui",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {item.icon}
              </span>

              {/* Active dot */}
              <div
                style={{
                  position: "absolute",
                  bottom: "6px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: isActive ? "#4a9eff" : "transparent",
                  boxShadow: isActive ? "0 0 8px rgba(74,158,255,0.9)" : "none",
                  transition: "all 0.3s ease",
                }}
              />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
