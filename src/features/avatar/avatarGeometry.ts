/**
 * The head is not a plain sphere: it is squashed, so the radii of the
 * ellipsoid differ per axis. Every face piece is placed by solving against
 * this ellipsoid — a feature at a fixed z would be buried inside the head
 * near the edges and float off it in the middle.
 *
 * This module is separate from the scene so the geometry can be tested
 * without a WebGL context.
 */
export const HEAD_Y = 0.52;
export const HEAD_RADIUS = 0.5;
export const HEAD_SCALE: readonly [number, number, number] = [1, 0.94, 0.96];
export const HEAD_RADII: readonly [number, number, number] = [
  HEAD_RADIUS * HEAD_SCALE[0],
  HEAD_RADIUS * HEAD_SCALE[1],
  HEAD_RADIUS * HEAD_SCALE[2],
];
export const HEAD_Z = 0.04;

/** The radius of the mouth tube. */
export const MOUTH_TUBE_RADIUS = 0.022;

/**
 * The z of the head surface at a given (x, y), in world space.
 *
 * Returns the front surface of the ellipsoid. A point off the front of the
 * head has no surface, so this returns 0 there and the caller can treat the
 * feature as unreachable.
 */
export const headSurfaceZ = (x: number, y: number): number => {
  const nx = x / HEAD_RADII[0];
  const ny = (y - HEAD_Y) / HEAD_RADII[1];
  const inside = 1 - nx * nx - ny * ny;
  if (inside <= 0) return 0;
  return HEAD_Z + HEAD_RADII[2] * Math.sqrt(inside);
};

/** Where the eyes sit, in world space. */
export const EYE_X = 0.17;
export const EYE_Y = HEAD_Y + 0.03;
export const EYE_RADIUS = 0.075;
/** The eyes are scaled flat, so they do not stick out like a bug's. */
export const EYE_Z_SCALE = 0.55;
/** How deep the eye sinks into the head. */
export const EYE_INSET = 0.02;

/** Where the cheeks sit, in world space. */
export const CHEEK_X = 0.27;
export const CHEEK_Y = HEAD_Y - 0.09;
export const CHEEK_RADIUS = 0.1;
export const CHEEK_Z_SCALE = 0.3;

/** The mouth: a half-width and the dip that makes it a smile. */
export const MOUTH_HALF_WIDTH = 0.115;
export const MOUTH_BASE_Y = HEAD_Y - 0.12;
export const MOUTH_DIP = 0.05;
/** How far the mouth tube floats off the head surface. */
export const MOUTH_OFFSET = 0.008;

/**
 * The point on the mouth curve for a parameter in [-1, 1].
 *
 * The corners sit higher than the middle: that is the difference between a
 * smile and a frown.
 */
export const mouthPoint = (
  t: number,
): readonly [x: number, y: number, z: number] => {
  const x = t * MOUTH_HALF_WIDTH;
  const y = MOUTH_BASE_Y - (1 - t * t) * MOUTH_DIP;
  return [x, y, headSurfaceZ(x, y) + MOUTH_OFFSET];
};

/**
 * Where a face piece sits, in world space.
 *
 * These are the single source of truth for the face. The scene must place
 * its pieces with them: a piece at a hand-written depth would be buried
 * inside the head near the edges and float off it in the middle.
 */
export type FacePoint = readonly [x: number, y: number, z: number];

/**
 * The outward normal of the head at a given (x, y), as a unit vector.
 *
 * A face piece is turned to this normal so it lies flush on the curved
 * surface rather than as a flat disc pasted onto it.
 */
export const headNormal = (x: number, y: number): FacePoint => {
  const z = headSurfaceZ(x, y) - HEAD_Z;
  const nx = x / (HEAD_RADII[0] * HEAD_RADII[0]);
  const ny = (y - HEAD_Y) / (HEAD_RADII[1] * HEAD_RADII[1]);
  const nz = z / (HEAD_RADII[2] * HEAD_RADII[2]);
  const length = Math.hypot(nx, ny, nz);
  if (length === 0) return [0, 0, 1];
  return [nx / length, ny / length, nz / length];
};

/** The centre of an eye, sunk slightly into the head. */
export const eyePosition = (side: number): FacePoint => {
  const x = side * EYE_X;
  return [x, EYE_Y, headSurfaceZ(x, EYE_Y) - EYE_INSET];
};

/** The catchlight in the upper corner of an eye. */
export const catchlightPosition = (side: number): FacePoint => {
  const x = side * (EYE_X - 0.025);
  return [x, EYE_Y + 0.025, headSurfaceZ(x, EYE_Y + 0.025) + 0.02];
};

/** The centre of a cheek. */
export const cheekPosition = (side: number): FacePoint => {
  const x = side * CHEEK_X;
  return [x, CHEEK_Y, headSurfaceZ(x, CHEEK_Y) + 0.004];
};

/** The centre of a spectacle lens. */
export const glassesPosition = (side: number): FacePoint => {
  const x = side * EYE_X;
  return [x, EYE_Y, headSurfaceZ(x, EYE_Y) + 0.03];
};

/** The bridge between a pair of spectacles. */
export const glassesBridgePosition = (): FacePoint => [
  0,
  EYE_Y,
  headSurfaceZ(0, EYE_Y) + 0.03,
];
