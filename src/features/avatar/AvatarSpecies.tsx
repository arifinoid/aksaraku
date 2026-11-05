import { useEffect, useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import type { SpeciesLook } from "../../data/species";
import {
  BODY_Y,
  EYE_RADIUS,
  MUZZLE_RADIUS,
  MUZZLE_Y,
  NOSE_RADIUS,
  TAIL_Z,
  WIDE_MOUTH_BASE_Y,
  WIDE_MOUTH_DIP,
  WIDE_MOUTH_HALF_WIDTH,
  eyePosition,
  headSurfaceZ,
  muzzlePosition,
  nosePosition,
} from "./avatarGeometry";
import { faceQuaternion } from "./faceOrientation";
import { buildMouth } from "./mouthTube";

/**
 * The parts that make the character look like its species rather than like a
 * plain round blob. They are drawn under the eyes and over the head, so the
 * child's chosen eye and accessory parts still sit on top.
 */

/**
 * A panda's eye patch: a flat oval around each eye, a little larger than the
 * eye and a few millimetres behind it, so the eye still reads on top.
 */
function PandaPatches({ color }: { readonly color: string }) {
  return (
    <>
      {[-1, 1].map((side) => {
        const [x, y, z] = eyePosition(side);
        return (
          <mesh
            key={side}
            position={[x, y, z + 0.002]}
            quaternion={faceQuaternion(x, y)}
            scale={[1.7, 1.45, 0.35]}
          >
            <sphereGeometry args={[EYE_RADIUS, 24, 24]} />
            <meshStandardMaterial color={color} roughness={0.62} />
          </mesh>
        );
      })}
    </>
  );
}

/**
 * The lighter patch around the mouth. It is a sphere whose front pokes a few
 * millimetres out of the head, which is enough to read as a snout without
 * turning the character into a dog.
 */
function Muzzle({ color }: { readonly color: string }) {
  const [x, y, z] = muzzlePosition();
  return (
    <mesh position={[x, y, z]} castShadow>
      <sphereGeometry args={[MUZZLE_RADIUS, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.62} />
    </mesh>
  );
}

function Nose({
  color,
  onMuzzle,
}: {
  readonly color: string;
  readonly onMuzzle: boolean;
}) {
  const [x, y, z] = nosePosition(onMuzzle);
  return (
    <mesh position={[x, y, z]} scale={[1.25, 0.9, 0.8]}>
      <sphereGeometry args={[NOSE_RADIUS, 20, 20]} />
      <meshStandardMaterial color={color} roughness={0.35} />
    </mesh>
  );
}

/**
 * A cat's whiskers: three thin bars per cheek, laid along the face normal so
 * they sit on the curve instead of floating in front of it.
 */
const WHISKER_ROWS = [0.045, 0, -0.045];

function Whiskers() {
  return (
    <>
      {[-1, 1].map((side) =>
        WHISKER_ROWS.map((dy, index) => {
          const y = MUZZLE_Y + dy;
          const x = side * (0.24 + index * 0.008);
          const quaternion = faceQuaternion(x, y).multiply(
            new Quaternion().setFromAxisAngle(
              new Vector3(0, 0, 1),
              side * 0.16,
            ),
          );
          return (
            <mesh
              key={`${side}-${index}`}
              position={[x, y, headSurfaceZ(x, y) + 0.014]}
              quaternion={quaternion}
            >
              <boxGeometry args={[0.18, 0.012, 0.012]} />
              <meshStandardMaterial color="#3d2b1f" roughness={0.5} />
            </mesh>
          );
        }),
      )}
    </>
  );
}

/**
 * A frog's wide mouth. It reuses the smile tube with a flatter, wider curve.
 */
function WideMouth({ color }: { readonly color: string }) {
  const { geometry, center } = useMemo(
    () =>
      buildMouth(
        WIDE_MOUTH_HALF_WIDTH,
        WIDE_MOUTH_BASE_Y,
        WIDE_MOUTH_DIP,
        0.018,
      ),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} position={center}>
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
  );
}

/**
 * The tail hangs behind and to the side, so it breaks the silhouette on the
 * right without poking through the body.
 */
function Tail({
  kind,
  color,
  tip,
}: {
  readonly kind: SpeciesLook["tail"];
  readonly color: string;
  readonly tip: string;
}) {
  if (kind === "none") return null;

  if (kind === "bushy") {
    return (
      <group position={[0.36, BODY_Y + 0.02, TAIL_Z + 0.06]} rotation={[0, 0, -0.5]}>
        <mesh scale={[0.85, 1.3, 0.85]}>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial color={color} roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.26, 0]} scale={[0.7, 0.8, 0.7]}>
          <sphereGeometry args={[0.2, 20, 20]} />
          <meshStandardMaterial color={tip} roughness={0.65} />
        </mesh>
      </group>
    );
  }

  const radius = kind === "puff" ? 0.16 : 0.15;
  return (
    <mesh position={[0.36, BODY_Y - 0.12, TAIL_Z + 0.06]}>
      <sphereGeometry args={[radius, 24, 24]} />
      <meshStandardMaterial
        color={kind === "puff" ? tip : color}
        roughness={0.65}
      />
    </mesh>
  );
}

export interface SpeciesFeaturesProps {
  readonly look: SpeciesLook;
  readonly fur: string;
}

export function SpeciesFeatures({ look, fur }: SpeciesFeaturesProps) {
  return (
    <>
      <Tail kind={look.tail} color={fur} tip={look.tailTip} />
      {/* The patches share the nose ink: a panda is black in both places. */}
      {look.marking === "panda" ? <PandaPatches color={look.nose} /> : null}
      {look.marking === "muzzle" ? <Muzzle color={look.muzzle} /> : null}
      {look.whiskers ? <Whiskers /> : null}
      <Nose color={look.nose} onMuzzle={look.marking === "muzzle"} />
      {look.mouth === "wide" ? <WideMouth color={look.nose} /> : null}
    </>
  );
}
