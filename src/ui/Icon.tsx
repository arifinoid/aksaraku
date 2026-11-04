import type { LucideIcon } from "lucide-react";

export interface IconProps {
  /** A lucide icon component, e.g. `import { Pencil } from "lucide-react"`. */
  readonly glyph: LucideIcon;
  readonly size?: number;
  readonly strokeWidth?: number;
  readonly className?: string;
}

/**
 * One place for line-icon sizing.
 *
 * The revamp replaced emoji with lucide line icons. They are decorative
 * everywhere they are used — the label next to them carries the meaning —
 * so they stay out of the accessibility tree.
 */
export function Icon({
  glyph: Glyph,
  size = 18,
  strokeWidth = 2,
  className,
}: IconProps) {
  return (
    <Glyph
      aria-hidden="true"
      focusable="false"
      size={size}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}
