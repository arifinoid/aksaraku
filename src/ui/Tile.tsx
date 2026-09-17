import type { ReactNode } from "react";
import "./screen.css";

export type TileTone = "primary" | "secondary" | "accent" | "success" | "plain";

export interface TileProps {
  readonly label: string;
  readonly icon: ReactNode;
  readonly onClick: () => void;
  readonly tone?: TileTone;
  readonly disabled?: boolean;
  readonly hint?: string;
}

export function Tile({
  label,
  icon,
  onClick,
  tone = "plain",
  disabled = false,
  hint,
}: TileProps) {
  const toneClass = tone === "plain" ? "" : ` tile--${tone}`;
  return (
    <button
      type="button"
      className={`tile${toneClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="tile__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="tile__label">{label}</span>
      {hint ? <span className="tile__hint">{hint}</span> : null}
    </button>
  );
}
