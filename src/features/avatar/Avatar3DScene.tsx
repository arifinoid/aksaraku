import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CatmullRomCurve3,
  CanvasTexture,
  type Group,
  type Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  Quaternion,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { ResolvedAvatar } from "../../domain";
import {
  catchlightPosition,
  CHEEK_RADIUS,
  CHEEK_Z_SCALE,
  cheekPosition,
  EYE_RADIUS,
  EYE_Z_SCALE,
  eyePosition,
  glassesBridgePosition,
  glassesPosition,
  headNormal as headNormalAt,
  HEAD_RADIUS,
  HEAD_SCALE,
  HEAD_Y,
  HEAD_Z,
  MOUTH_TUBE_RADIUS,
  mouthPoint,
} from "./avatarGeometry";

const FALLBACK_COLOR = "#ff7a45";
const INK = "#3d2b1f";
const CHEEK = "#ff9e9e";

const BODY_Y = -0.42;
const BODY_RADIUS = 0.5;

/**
 * The outward normal of the head at a given (x, y).
 *
 * Face pieces are rotated to this normal so they sit flush on the curved
 * surface instead of being flat discs pasted onto a sphere.
 */
const headNormal = (x: number, y: number): Vector3 => {
  const [nx, ny, nz] = headNormalAt(x, y);
  return new Vector3(nx, ny, nz);
};

/**
 * A rotation that turns the +Z axis onto the head normal at (x, y).
 *
 * The result is applied to each eye so its flat face points outwards and its
 * "up" stays up.
 */
const faceQuaternion = (x: number, y: number): Quaternion =>
  new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), headNormal(x, y));

interface EarsProps {
  readonly kind: string;
  readonly color: string;
}

function Ears({ kind, color }: EarsProps) {
  if (kind === "horn") {
    return (
      <>
        <mesh position={[-0.19, 1.02, 0]} rotation={[0, 0, 0.28]}>
          <coneGeometry args={[0.13, 0.34, 20]} />
          <meshStandardMaterial color="#ffd166" roughness={0.5} />
        </mesh>
        <mesh position={[0.19, 1.02, 0]} rotation={[0, 0, -0.28]}>
          <coneGeometry args={[0.13, 0.34, 20]} />
          <meshStandardMaterial color="#ffd166" roughness={0.5} />
        </mesh>
      </>
    );
  }

  if (kind === "pointy") {
    return (
      <>
        <mesh position={[-0.32, 0.92, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.15, 0.4, 20]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        <mesh position={[0.32, 0.92, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.15, 0.4, 20]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      </>
    );
  }

  if (kind === "floppy") {
    return (
      <>
        <mesh position={[-0.44, 0.62, 0]} rotation={[0, 0, 0.95]}>
          <capsuleGeometry args={[0.13, 0.3, 8, 20]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        <mesh position={[0.44, 0.62, 0]} rotation={[0, 0, -0.95]}>
          <capsuleGeometry args={[0.13, 0.3, 8, 20]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      </>
    );
  }

  return (
    <>
      <mesh position={[-0.42, 0.78, 0]}>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0.42, 0.78, 0]}>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </>
  );
}

interface EyesProps {
  readonly kind: string;
}

/**
 * The eyes sit slightly inside the head sphere and are scaled flat, so they
 * read as a face on the front of the head rather than as two balls stuck
 * to the front of it.
 *
 * Each eye is placed on the head surface and turned to match its normal,
 * which is what makes them read as a face rather than as a flat mask.
 */
function Eyes({ kind }: EyesProps) {
  const sparkle = kind === "sparkle";
  const radius = kind === "dot" ? EYE_RADIUS : 0.09;

  return (
    <>
      {[-1, 1].map((side) => {
        const [x, y, z] = eyePosition(side);
        return (
          <mesh
            key={side}
            position={[x, y, z]}
            quaternion={faceQuaternion(x, y)}
            scale={[1, 1.15, EYE_Z_SCALE]}
          >
            <sphereGeometry args={[radius, 24, 24]} />
            <meshStandardMaterial
              color={sparkle ? "#ffffff" : INK}
              emissive={sparkle ? "#4cc9f0" : "#000000"}
              emissiveIntensity={sparkle ? 0.9 : 0}
              roughness={0.25}
            />
          </mesh>
        );
      })}
      {/*
        A catchlight: a tiny white sphere in the upper corner of each eye.
        It is the single cheapest trick that makes eyes look alive.
      */}
      {[-1, 1].map((side) => (
        <mesh key={`glint-${side}`} position={catchlightPosition(side)}>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {kind === "happy" ? <Smile /> : null}
    </>
  );
}

/**
 * A smile, drawn as a tube along a curve that follows the head surface.
 *
 * A plain torus arc is wrong twice over: it cannot follow the curve of the
 * head, and the arc bulges upwards, which reads as a frown. This samples
 * the surface directly and dips in the middle.
 */
function Smile() {
  const { geometry, center } = useMemo(() => {
    const world: Vector3[] = [];
    for (let index = 0; index <= 8; index += 1) {
      const [x, y, z] = mouthPoint((index / 8) * 2 - 1);
      world.push(new Vector3(x, y, z));
    }
    // The tube is built around the origin and the mesh carries the offset.
    // Building the curve from world-space points *and* positioning the mesh
    // at the centre would apply the offset twice, throwing the mouth off
    // the face.
    const origin = world[4]!;
    const curve = new CatmullRomCurve3(
      world.map((point) => point.clone().sub(origin)),
    );
    return {
      geometry: new TubeGeometry(curve, 24, MOUTH_TUBE_RADIUS, 8, false),
      center: origin,
    };
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} position={center}>
      <meshStandardMaterial color={INK} roughness={0.4} />
    </mesh>
  );
}

/** Soft pink cheeks. They are what makes the face read as friendly. */
function Cheeks() {
  return (
    <>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={cheekPosition(side)}
          scale={[1, 0.72, CHEEK_Z_SCALE]}
        >
          <sphereGeometry args={[CHEEK_RADIUS, 20, 20]} />
          <meshBasicMaterial color={CHEEK} transparent opacity={0.55} />
        </mesh>
      ))}
    </>
  );
}

function Accessory({ kind }: { readonly kind: string }) {
  if (kind === "hat") {
    return (
      <>
        <mesh position={[0, 0.98, 0]}>
          <cylinderGeometry args={[0.28, 0.3, 0.26, 28]} />
          <meshStandardMaterial color="#4cc9f0" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.86, 0]}>
          <cylinderGeometry args={[0.44, 0.44, 0.05, 28]} />
          <meshStandardMaterial color="#4cc9f0" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.72, 0.44]}>
          <boxGeometry args={[0.3, 0.16, 0.04]} />
          <meshStandardMaterial color="#ffd166" roughness={0.7} />
        </mesh>
      </>
    );
  }

  if (kind === "bow") {
    return (
      <group position={[0.3, 0.86, 0.28]} rotation={[0, 0, 0.4]}>
        <mesh>
          <torusGeometry args={[0.12, 0.05, 14, 28]} />
          <meshStandardMaterial color="#f15bb5" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <sphereGeometry args={[0.045, 14, 14]} />
          <meshStandardMaterial color="#f15bb5" roughness={0.5} />
        </mesh>
      </group>
    );
  }

  if (kind === "glasses") {
    // The lenses sit on the head surface, like the eyes behind them, so
    // they frame the face instead of floating in front of it.
    return (
      <>
        {[-1, 1].map((side) => {
          const [x, y, z] = glassesPosition(side);
          return (
            <mesh
              key={side}
              position={[x, y, z]}
              quaternion={faceQuaternion(x, y)}
            >
              <torusGeometry args={[0.13, 0.022, 12, 28]} />
              <meshStandardMaterial color={INK} roughness={0.4} />
            </mesh>
          );
        })}
        <mesh position={glassesBridgePosition()}>
          <boxGeometry args={[0.1, 0.018, 0.018]} />
          <meshStandardMaterial color={INK} roughness={0.4} />
        </mesh>
      </>
    );
  }

  if (kind === "crown") {
    // The crown is the one metal part. Without an environment map, metal
    // reads as flat grey — the scene below supplies one.
    return (
      <group position={[0, 0.98, 0]}>
        <mesh>
          <cylinderGeometry args={[0.26, 0.3, 0.22, 8]} />
          <meshStandardMaterial
            color="#ffd166"
            metalness={0.75}
            roughness={0.22}
          />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.15, 0.16, 0]}>
            <coneGeometry args={[0.06, 0.12, 8]} />
            <meshStandardMaterial
              color="#ffd166"
              metalness={0.75}
              roughness={0.22}
            />
          </mesh>
        ))}
        <mesh position={[0, 0.13, 0.24]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color="#ef476f"
            metalness={0.2}
            roughness={0.15}
          />
        </mesh>
      </group>
    );
  }

  return null;
}

/**
 * The soft blob the character stands on. It gives the scene a floor, and
 * it catches the shadow that stops the character looking like it is
 * floating in a void.
 *
 * The floor sits exactly at the bottom of the body sphere, so the character
 * stands on it rather than hovering above it.
 */
const FLOOR_Y = BODY_Y - BODY_RADIUS;

function Ground({ color }: { readonly color: string }) {
  return (
    <group position={[0, FLOOR_Y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.6, 48]} />
        <meshStandardMaterial color="#fff7e6" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 0.95, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

/**
 * A soft contact shadow under the character.
 *
 * A real shadow map needs a light that casts, and a receiving surface. The
 * scene has both, but a real shadow on a pale floor is nearly invisible, so
 * this is a painted shadow that always reads.
 *
 * `MeshBasicMaterial`, not a lit one: the shadow must look the same no
 * matter how the scene is lit, or it stops reading as a shadow.
 */
function ContactShadow() {
  const material = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 62);
      gradient.addColorStop(0, "rgba(61, 43, 31, 0.42)");
      gradient.addColorStop(0.55, "rgba(61, 43, 31, 0.16)");
      gradient.addColorStop(1, "rgba(61, 43, 31, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 128, 128);
    }
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return new MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  useEffect(
    () => () => {
      material.map?.dispose();
      material.dispose();
    },
    [material],
  );

  return (
    <mesh
      position={[0, FLOOR_Y + 0.002, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      renderOrder={-1}
    >
      <planeGeometry args={[1.5, 1.5]} />
    </mesh>
  );
}

interface CharacterProps {
  readonly avatar: ResolvedAvatar;
  /** Whether the frame loop is running at all (false = reduce motion). */
  readonly animated: boolean;
  /** Bumped whenever the avatar changes, to trigger the swap animation. */
  readonly version: number;
}

function Character({ avatar, animated, version }: CharacterProps) {
  const group = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const color = avatar.color?.value ?? FALLBACK_COLOR;

  // The scale that plays the swap animation, and the value it eases back
  // from. Both live in refs so the animation itself never triggers a
  // React render.
  const scale = useRef(1);
  const target = useRef(1);
  const lastVersion = useRef(version);

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;

    if (lastVersion.current !== version) {
      lastVersion.current = version;
      if (animated) {
        // Start small and let it spring back up, so a new part is visibly
        // acknowledged instead of the character silently changing shape.
        //
        // This only works while the frame loop is running. With
        // `frameloop="demand"` (the reduce-motion setting) a single
        // frame is rendered per invalidation, so the spring would never
        // advance and the character would stay stuck at 0.8.
        scale.current = 0.8;
        target.current = 1;
      } else {
        scale.current = 1;
        target.current = 1;
        node.scale.setScalar(1);
      }
    }

    if (animated) {
      // A slow, constant turn reads as mechanical. Nudging the speed with
      // the clock gives the same motion a hand-made wobble.
      node.rotation.y +=
        delta * (0.45 + Math.sin(state.clock.elapsedTime * 0.6) * 0.12);
    }

    if (scale.current !== target.current) {
      // Ease towards the target with a spring, so the swap overshoots
      // slightly the way a plush toy would.
      scale.current += (target.current - scale.current) * Math.min(1, delta * 9);
      node.scale.setScalar(scale.current);
    } else if (scale.current !== 1) {
      scale.current = 1;
      node.scale.setScalar(1);
    }

    if (animated && body.current) {
      // A gentle squash and stretch, like a plush toy settling.
      const beat = Math.sin(state.clock.elapsedTime * 1.6);
      const squash = 1 + beat * 0.035;
      body.current.scale.set(1 / squash, squash, 1 / squash);
      body.current.position.y = BODY_Y + Math.abs(beat) * 0.04;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={body} position={[0, BODY_Y, 0]} castShadow>
        <sphereGeometry args={[BODY_RADIUS, 40, 40]} />
        <meshStandardMaterial color={color} roughness={0.62} />
      </mesh>
      {/* The head is squashed a little so it reads as a character rather
          than a snowman: wider than tall, and set slightly forward. The
          scale and offset are shared with the face placement above, so
          the eyes and mouth cannot drift off the surface. */}
      <mesh
        position={[0, HEAD_Y, HEAD_Z]}
        scale={[...HEAD_SCALE]}
        castShadow
      >
        <sphereGeometry args={[HEAD_RADIUS, 40, 40]} />
        <meshStandardMaterial color={color} roughness={0.62} />
      </mesh>
      <Ears kind={avatar.ears?.value ?? "round"} color={color} />
      <Eyes kind={avatar.eyes?.value ?? "dot"} />
      <Cheeks />
      <Accessory kind={avatar.accessory?.value ?? "none"} />
    </group>
  );
}

/**
 * Supplies the scene with an environment map.
 *
 * Without one, a `metalness` material has nothing to reflect: the crown
 * rendered as flat grey. A pre-filtered room environment gives every
 * surface a soft, even sheen and lets the metal read as metal.
 */
function Environment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.85;

    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      room.dispose();
    };
  }, [gl, scene]);

  return null;
}

/**
 * Tracks how many times the avatar has changed, so the character can play
 * a swap animation when the child picks a new part.
 */
function useAvatarVersion(avatar: ResolvedAvatar): number {
  const [version, setVersion] = useState(0);
  const previous = useRef(avatar);

  useEffect(() => {
    if (previous.current === avatar) return;
    previous.current = avatar;
    setVersion((value) => value + 1);
  }, [avatar]);

  return version;
}

export default function Avatar3DScene({
  avatar,
  reduceMotion = false,
}: {
  readonly avatar: ResolvedAvatar;
  readonly reduceMotion?: boolean;
}) {
  const color = avatar.color?.value ?? FALLBACK_COLOR;
  const version = useAvatarVersion(avatar);

  return (
    <Canvas
      camera={{ position: [0, 0.28, 3.2], fov: 42 }}
      dpr={[1, 1.5]}
      frameloop={reduceMotion ? "demand" : "always"}
      shadows
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Environment />
      {/* A warm key light from the front-left, a cool fill from the right,
          and a rim from behind to separate the character from the floor. */}
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[-2.4, 3.2, 3.4]}
        intensity={1.7}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0012}
      />
      <directionalLight position={[3, 1.4, 1.6]} intensity={0.5} color="#bfe4ff" />
      <directionalLight position={[0, 2.4, -3]} intensity={0.9} color="#ffd9b8" />
      <Character
        avatar={avatar}
        animated={!reduceMotion}
        version={version}
      />
      <Ground color={color} />
      <ContactShadow />
    </Canvas>
  );
}
