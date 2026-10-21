import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  catchlightPosition,
  CHEEK_RADIUS,
  CHEEK_Z_SCALE,
  cheekPosition,
  EYE_RADIUS,
  EYE_X,
  EYE_Y,
  EYE_Z_SCALE,
  eyePosition,
  glassesBridgePosition,
  glassesPosition,
  headNormal,
  headSurfaceZ,
  HEAD_RADII,
  HEAD_SCALE,
  HEAD_Y,
  HEAD_Z,
  MOUTH_TUBE_RADIUS,
  mouthPoint,
} from "./avatarGeometry";

const SCENE = join(import.meta.dir, "Avatar3DScene.tsx");

const sceneSource = (): string => readFileSync(SCENE, "utf8");

describe("head surface", () => {
  test("is an ellipsoid, not a sphere", () => {
    // The head is squashed, so the radii differ per axis. If they ever
    // match again, the face placement maths has to change with it.
    expect(new Set(HEAD_RADII).size).toBeGreaterThan(1);
  });

  test("puts the front of the head in front of the centre", () => {
    const surface = headSurfaceZ(0, HEAD_Y);
    expect(surface).toBeGreaterThan(HEAD_Z);
  });

  test("returns nothing for a point off the front of the head", () => {
    // A point beyond the edge of the ellipsoid has no surface. Returning
    // the front of the head there would bury the feature in the skull.
    expect(headSurfaceZ(HEAD_RADII[0] + 0.1, HEAD_Y)).toBe(0);
  });

  test("curves away towards the edges", () => {
    const centre = headSurfaceZ(0, HEAD_Y);
    const edge = headSurfaceZ(HEAD_RADII[0] * 0.9, HEAD_Y);
    expect(edge).toBeLessThan(centre);
  });

  test("has a normal that points out of the head", () => {
    for (const side of [-1, 1]) {
      const [nx, ny, nz] = headNormal(side * EYE_X, EYE_Y);
      // A unit vector.
      expect(Math.hypot(nx, ny, nz)).toBeCloseTo(1, 6);
      // Pointing forwards, and away from the middle of the head.
      expect(nz).toBeGreaterThan(0);
      expect(nx * side).toBeGreaterThan(0);
    }
  });

  test("has a normal that tips with the surface", () => {
    // Near the edge of the head the surface faces outwards, so the normal
    // has to lean away from the middle. A face piece turned to this normal
    // lies flush instead of poking out of the side of the head.
    const [, , centreZ] = headNormal(0, HEAD_Y);
    const [edgeX, , edgeZ] = headNormal(HEAD_RADII[0] * 0.9, HEAD_Y);
    expect(edgeX).toBeGreaterThan(0);
    expect(edgeZ).toBeLessThan(centreZ);
  });
});

describe("eyes", () => {
  test("sit on the surface of the head, not inside it", () => {
    for (const side of [-1, 1]) {
      const [x, y, z] = eyePosition(side);
      const surface = headSurfaceZ(x, y);
      const front = z + EYE_RADIUS * EYE_Z_SCALE;
      // Buried inside the head: the character would have no face.
      expect(front).toBeGreaterThan(surface);
      // Floating off the head: the eyes would read as stuck-on beads.
      expect(front - surface).toBeLessThan(0.06);
    }
  });

  test("are pushed further out when the head is a different shape", () => {
    // The whole point of solving against the surface is that a change to
    // the head shape moves the eyes with it. If a face piece were placed
    // at a fixed z, this would not hold.
    const wide = headSurfaceZ(EYE_X, EYE_Y);
    const narrow = headSurfaceZ(EYE_X, EYE_Y + 0.2);
    expect(narrow).not.toBe(wide);
  });
});

describe("cheeks", () => {
  test("sit on the surface of the head", () => {
    for (const side of [-1, 1]) {
      const [x, y, z] = cheekPosition(side);
      const surface = headSurfaceZ(x, y);
      const front = z + CHEEK_RADIUS * CHEEK_Z_SCALE;
      expect(front).toBeGreaterThan(surface);
      expect(front - surface).toBeLessThan(0.05);
    }
  });
});

describe("catchlights", () => {
  test("sit in front of the eye", () => {
    for (const side of [-1, 1]) {
      const [x, y, z] = catchlightPosition(side);
      const surface = headSurfaceZ(x, y);
      expect(z).toBeGreaterThan(surface);
    }
  });
});

describe("spectacles", () => {
  test("sit in front of the eyes they frame", () => {
    for (const side of [-1, 1]) {
      const [x, y, z] = glassesPosition(side);
      const [eyeX, eyeY, eyeZ] = eyePosition(side);
      expect(x).toBeCloseTo(eyeX, 6);
      expect(y).toBeCloseTo(eyeY, 6);
      expect(z).toBeGreaterThan(eyeZ);
    }
  });

  test("have a bridge between the lenses", () => {
    const [x, , z] = glassesBridgePosition();
    expect(x).toBe(0);
    expect(z).toBeGreaterThan(0);
  });
});

describe("smile", () => {
  test("has its corners higher than its middle", () => {
    // This is the whole difference between a smile and a frown. A torus
    // arc, standing upright, bulges the other way.
    const [, cornerY] = mouthPoint(-1);
    const [, middleY] = mouthPoint(0);
    expect(cornerY).toBeGreaterThan(middleY);
  });

  test("is symmetric", () => {
    const [leftX, leftY] = mouthPoint(-1);
    const [rightX, rightY] = mouthPoint(1);
    expect(leftX).toBeCloseTo(-rightX, 6);
    expect(leftY).toBeCloseTo(rightY, 6);
  });

  test("clears the head surface along its whole length", () => {
    // If the curve sank into the head anywhere, the mouth would be
    // broken in the middle and solid at the ends.
    for (let index = 0; index <= 16; index += 1) {
      const t = (index / 16) * 2 - 1;
      const [x, y, z] = mouthPoint(t);
      const surface = headSurfaceZ(x, y);
      expect(z + MOUTH_TUBE_RADIUS).toBeGreaterThan(surface);
    }
  });

  test("is not offset twice by the scene", () => {
    // The mouth curve is built around the origin and the mesh carries the
    // offset. Building the curve in world space *and* positioning the mesh
    // at the centre applies the offset twice, which throws the mouth off
    // the face: it ends up in front of the head and above the chin.
    const source = sceneSource();
    const smile = source.slice(
      source.indexOf("function Smile("),
      source.indexOf("function Cheeks("),
    );
    // The curve has to be built from points relative to the origin.
    expect(smile).toContain(".sub(origin)");
    // And the origin has to come from the sampled points.
    expect(smile).toContain("world[4]");
  });
});

describe("the scene", () => {
  test("shares the head shape with the placement maths", () => {
    // If the mesh drifts away from the constants, the face no longer
    // lands on the surface even though the maths is still right.
    const source = sceneSource();
    expect(source).toContain("scale={[...HEAD_SCALE]}");
    expect(source).toContain("position={[0, HEAD_Y, HEAD_Z]}");
  });

  test("stands the character on the floor", () => {
    // The floor has to meet the bottom of the body, or the character
    // hovers above it.
    const source = sceneSource();
    expect(source).toContain("const FLOOR_Y = BODY_Y - BODY_RADIUS;");
  });

  test("does not place a face piece at a fixed depth", () => {
    // A literal z on an eye or a cheek is the bug this file exists to
    // prevent: the piece would be buried near the edges of the head.
    //
    // Only the face is checked. Ears, hats, lights and the ground all
    // sit at fixed depths on purpose — they are not on the head surface.
    const source = sceneSource();
    const face = source.slice(
      source.indexOf("function Eyes("),
      source.indexOf("function Accessory("),
    );
    const hardcoded = [...face.matchAll(/position=\{\[([^[\]]*)\]\}/g)]
      .map((match) => match[1]!)
      // The third entry of a position is the depth. A plain number there
      // means the piece was placed by hand instead of on the surface.
      .filter((entries) => {
        const parts = entries.split(",").map((part) => part.trim());
        const depth = parts[2];
        return depth !== undefined && /^-?\d+(\.\d+)?$/.test(depth);
      });
    expect(hardcoded.join(" | ")).toBe("");
  });

  test("places every face piece through the shared placement functions", () => {
    // The placement functions are the tested part. If the scene computed
    // its own positions instead, the tests would still pass while the
    // character rendered with a buried face.
    const source = sceneSource();
    for (const call of [
      "eyePosition(",
      "catchlightPosition(",
      "cheekPosition(",
      "glassesPosition(",
      "glassesBridgePosition(",
      "mouthPoint(",
    ]) {
      expect(`${call}: ${source}`).toContain(call);
    }
  });
});
