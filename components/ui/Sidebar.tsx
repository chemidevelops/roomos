"use client";

interface SidebarProps {
  activeView: string;
  onSelect: (view: string) => void;
}

const NAV_ITEMS = [
  { id: "home",     icon: "⌂",  label: "Home" },
  { id: "focus",    icon: "◎",  label: "Focus" },
  { id: "backlog",  icon: "≡",  label: "Backlog" },
  { id: "journal",  icon: "✎",  label: "Journal" },
  { id: "music",    icon: "♪",  label: "Music" },
  { id: "settings", icon: "⚙",  label: "Settings" },
];

export default function Sidebar({ activeView, onSelect }: SidebarProps) {
  return (
    <aside
      style={{
        position: "fixed",
        top: "36px",
        left: 0,
        bottom: 0,
        width: "200px",
        background: "#faf7f2",
        borderRight: "2px solid #1a1a1a",
        display: "flex",
        flexDirection: "column",
        paddingTop: "16px",
        zIndex: 90,
        fontFamily: "var(--font-space-grotesk), sans-serif",
      }}
      className="sidebar-desktop"
    >
      {/* Nav label */}
      <div
        style={{
          padding: "0 16px 12px",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#6b6560",
          borderBottom: "1px solid #e8e2d5",
          marginBottom: "8px",
        }}
      >
        Navigation
      </div>

      {NAV_ITEMS.map((item) => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "9px 16px",
              background: isActive ? "#f5c800" : "transparent",
              border: "none",
              borderLeft: isActive ? "3px solid #1a1a1a" : "3px solid transparent",
              cursor: "pointer",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "14px",
              fontWeight: isActive ? 700 : 500,
              color: "#1a1a1a",
              textAlign: "left",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "#f0ebe0";
            }}
            onMouseLeave={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <span style={{ fontSize: "16px", lineHeight: 1, width: "20px", textAlign: "center" }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        );
      })}
    </aside>
  );
}
