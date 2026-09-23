import type { Vec2 } from "../types";

export const DESIGN_SIZE = 100;

export interface Viewport {
  readonly width: number;
  readonly height: number;
}

export interface ClientRect extends Viewport {
  readonly left: number;
  readonly top: number;
}

export interface DesignTransform {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

export const designTransform = (viewport: Viewport): DesignTransform => {
  const scale = Math.min(viewport.width, viewport.height) / DESIGN_SIZE;
  return {
    scale,
    offsetX: (viewport.width - DESIGN_SIZE * scale) / 2,
    offsetY: (viewport.height - DESIGN_SIZE * scale) / 2,
  };
};

export const toDesignSpace = (client: Vec2, rect: ClientRect): Vec2 => {
  const transform = designTransform(rect);
  return {
    x: (client.x - rect.left - transform.offsetX) / transform.scale,
    y: (client.y - rect.top - transform.offsetY) / transform.scale,
  };
};

export const toScreenSpace = (design: Vec2, transform: DesignTransform): Vec2 => ({
  x: transform.offsetX + design.x * transform.scale,
  y: transform.offsetY + design.y * transform.scale,
});

/**
 * Design units covered by one screen pixel. Multiply a pixel value by this to
 * express it in design space (see `StrokePath.tolerance`).
 */
export const designPerPx = (transform: DesignTransform): number =>
  transform.scale > 0 ? 1 / transform.scale : 1;
