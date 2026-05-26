"use client";

export default function AmbientBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        background: "#080810",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Blue orb — top left area */}
      <div
        className="orb-a"
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: "60vw",
          height: "60vw",
          maxWidth: "420px",
          maxHeight: "420px",
          background:
            "radial-gradient(circle at center, rgba(74,158,255,0.07) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* Gold orb — bottom right */}
      <div
        className="orb-b"
        style={{
          position: "absolute",
          bottom: "5%",
          right: "-10%",
          width: "50vw",
          height: "50vw",
          maxWidth: "360px",
          maxHeight: "360px",
          background:
            "radial-gradient(circle at center, rgba(200,169,110,0.05) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* Subtle center depth — very faint */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 100% 70% at 50% 0%, rgba(8,8,20,0.0) 0%, rgba(4,4,12,0.6) 100%)",
        }}
      />
    </div>
  );
}
