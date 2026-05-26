"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface WidgetProps {
  children: ReactNode;
  className?: string;
  glow?: "blue" | "gold" | "none";
  size?: "sm" | "lg";
  layoutId?: string;
  expandedContent?: ReactNode;
  onClick?: () => void;
}

const glowStyles = {
  blue: {
    boxShadow:
      "0 0 30px rgba(74,158,255,0.12), 0 0 60px rgba(74,158,255,0.05), inset 0 1px 0 rgba(74,158,255,0.08)",
  },
  gold: {
    boxShadow:
      "0 0 30px rgba(200,169,110,0.10), 0 0 60px rgba(200,169,110,0.04), inset 0 1px 0 rgba(200,169,110,0.08)",
  },
  none: {
    boxShadow:
      "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
  },
};

const glowHover = {
  blue: "0 0 40px rgba(74,158,255,0.2), 0 0 80px rgba(74,158,255,0.08)",
  gold: "0 0 40px rgba(200,169,110,0.18), 0 0 80px rgba(200,169,110,0.07)",
  none: "0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
};

export default function Widget({
  children,
  className = "",
  glow = "none",
  size = "sm",
  layoutId,
  expandedContent,
  onClick,
}: WidgetProps) {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (expandedContent) setExpanded(true);
    onClick?.();
  };

  const id = layoutId ?? `widget-${glow}-${size}`;

  return (
    <>
      <motion.div
        layoutId={id}
        className={`relative overflow-hidden ${size === "lg" ? "col-span-2" : "col-span-1"} ${className}`}
        style={{
          background: "rgba(15,15,26,0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "18px",
          padding: "16px",
          cursor: expandedContent || onClick ? "pointer" : "default",
          ...glowStyles[glow],
        }}
        whileHover={
          expandedContent || onClick
            ? { scale: 1.02, boxShadow: glowHover[glow] }
            : { scale: 1.01, boxShadow: glowHover[glow] }
        }
        whileTap={expandedContent || onClick ? { scale: 0.98 } : {}}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={handleClick}
      >
        {/* Subtle inner highlight */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)",
            borderRadius: "18px",
          }}
        />
        {children}
      </motion.div>

      {/* Expanded fullscreen overlay */}
      <AnimatePresence>
        {expanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setExpanded(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(4,4,12,0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                zIndex: 200,
              }}
            />

            {/* Expanded widget */}
            <motion.div
              layoutId={id}
              style={{
                position: "fixed",
                inset: "16px",
                background: "rgba(12,12,22,0.95)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "24px",
                padding: "24px",
                zIndex: 201,
                overflow: "auto",
                ...glowStyles[glow],
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setExpanded(false)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  outline: "none",
                  lineHeight: 1,
                }}
              >
                ×
              </button>

              {/* Inner highlight */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)",
                  borderRadius: "24px",
                }}
              />

              {expandedContent ?? children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
