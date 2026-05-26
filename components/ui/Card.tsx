import { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  color?: string;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

export default function Card({ children, color, className = "", onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`brutal-border brutal-shadow ${className}`}
      style={{
        background: color ?? "var(--room-paper)",
        borderRadius: "4px",
        padding: "16px",
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
