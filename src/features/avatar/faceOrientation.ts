import { Quaternion, Vector3 } from "three";
import { headNormal as headNormalAt } from "./avatarGeometry";

/**
 * The outward normal of the head at (x, y) as a three.js vector.
 *
 * Face pieces are turned to this normal so they sit flush on the curved
 * surface instead of being flat discs pasted onto a sphere.
 */
export const headNormal = (x: number, y: number): Vector3 => {
  const [nx, ny, nz] = headNormalAt(x, y);
  return new Vector3(nx, ny, nz);
};

/**
 * A rotation that turns +Z onto the head normal at (x, y), so a flat face
 * piece points outwards while its "up" stays up.
 */
export const faceQuaternion = (x: number, y: number): Quaternion =>
  new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), headNormal(x, y));
