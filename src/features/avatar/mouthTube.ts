import { CatmullRomCurve3, TubeGeometry, Vector3 } from "three";
import { MOUTH_TUBE_RADIUS, mouthPointAt } from "./avatarGeometry";

export interface MouthTube {
  readonly geometry: TubeGeometry;
  readonly center: Vector3;
}

/**
 * A mouth as a tube along a curve that follows the head surface.
 *
 * A plain torus arc is wrong twice over: it cannot follow the curve of the
 * head, and the arc bulges upwards, which reads as a frown. This samples the
 * surface directly and dips in the middle.
 *
 * The tube is built around the origin and the mesh carries the offset, so the
 * caller gets the centre back with the geometry.
 */
export const buildMouth = (
  halfWidth: number,
  baseY: number,
  dip: number,
  radius: number = MOUTH_TUBE_RADIUS,
): MouthTube => {
  const world: Vector3[] = [];
  for (let index = 0; index <= 8; index += 1) {
    const [x, y, z] = mouthPointAt((index / 8) * 2 - 1, halfWidth, baseY, dip);
    world.push(new Vector3(x, y, z));
  }
  const origin = world[4]!;
  const curve = new CatmullRomCurve3(
    world.map((point) => point.clone().sub(origin)),
  );
  return {
    geometry: new TubeGeometry(curve, 24, radius, 8, false),
    center: origin,
  };
};
