import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import type { ResolvedAvatar } from "../../domain";

const FALLBACK_COLOR = "#ff7a45";
const INK = "#3d2b1f";

interface EarsProps {
  readonly kind: string;
  readonly color: string;
}

function Ears({ kind, color }: EarsProps) {
  if (kind === "horn") {
    return (
      <mesh position={[0, 1.0, 0]}>
        <coneGeometry args={[0.14, 0.36, 16]} />
        <meshStandardMaterial color="#ffd166" />
      </mesh>
    );
  }

  if (kind === "pointy") {
    return (
      <>
        <mesh position={[-0.28, 0.9, 0]} rotation={[0, 0, 0.25]}>
          <coneGeometry args={[0.14, 0.36, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.28, 0.9, 0]} rotation={[0, 0, -0.25]}>
          <coneGeometry args={[0.14, 0.36, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </>
    );
  }

  if (kind === "floppy") {
    return (
      <>
        <mesh position={[-0.44, 0.7, 0]} rotation={[0, 0, 0.9]}>
          <capsuleGeometry args={[0.11, 0.24, 8, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.44, 0.7, 0]} rotation={[0, 0, -0.9]}>
          <capsuleGeometry args={[0.11, 0.24, 8, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </>
    );
  }

  return (
    <>
      <mesh position={[-0.34, 0.86, 0]}>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.34, 0.86, 0]}>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </>
  );
}

function Eyes({ kind }: { readonly kind: string }) {
  const sparkle = kind === "sparkle";
  const radius = kind === "dot" ? 0.07 : 0.088;

  return (
    <>
      <mesh position={[-0.16, 0.5, 0.46]}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshStandardMaterial
          color={sparkle ? "#ffffff" : INK}
          emissive={sparkle ? "#4cc9f0" : "#000000"}
          emissiveIntensity={sparkle ? 0.9 : 0}
        />
      </mesh>
      <mesh position={[0.16, 0.5, 0.46]}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshStandardMaterial
          color={sparkle ? "#ffffff" : INK}
          emissive={sparkle ? "#4cc9f0" : "#000000"}
          emissiveIntensity={sparkle ? 0.9 : 0}
        />
      </mesh>
      {kind === "happy" ? (
        <mesh position={[0, 0.32, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.09, 0.02, 8, 20, Math.PI]} />
          <meshStandardMaterial color={INK} />
        </mesh>
      ) : null}
    </>
  );
}

function Accessory({ kind }: { readonly kind: string }) {
  if (kind === "hat") {
    return (
      <>
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.3, 24]} />
          <meshStandardMaterial color="#4cc9f0" />
        </mesh>
        <mesh position={[0, 0.88, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 0.05, 24]} />
          <meshStandardMaterial color="#4cc9f0" />
        </mesh>
      </>
    );
  }

  if (kind === "bow") {
    return (
      <mesh position={[0.3, 0.84, 0.3]} rotation={[0, 0, 0.4]}>
        <torusGeometry args={[0.12, 0.05, 12, 24]} />
        <meshStandardMaterial color="#f15bb5" />
      </mesh>
    );
  }

  if (kind === "glasses") {
    return (
      <>
        <mesh position={[-0.16, 0.5, 0.5]}>
          <torusGeometry args={[0.13, 0.022, 10, 24]} />
          <meshStandardMaterial color={INK} />
        </mesh>
        <mesh position={[0.16, 0.5, 0.5]}>
          <torusGeometry args={[0.13, 0.022, 10, 24]} />
          <meshStandardMaterial color={INK} />
        </mesh>
      </>
    );
  }

  if (kind === "crown") {
    return (
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.26, 0.32, 0.22, 6]} />
        <meshStandardMaterial color="#ffd166" metalness={0.4} roughness={0.3} />
      </mesh>
    );
  }

  return null;
}

function Character({
  avatar,
  spin,
}: {
  readonly avatar: ResolvedAvatar;
  readonly spin: boolean;
}) {
  const group = useRef<Group>(null);
  const color = avatar.color?.value ?? FALLBACK_COLOR;

  useFrame((_, delta) => {
    const node = group.current;
    if (!node || !spin) return;
    node.rotation.y += delta * 0.5;
  });

  return (
    <group ref={group}>
      <mesh position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.52, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <Ears kind={avatar.ears?.value ?? "round"} color={color} />
      <Eyes kind={avatar.eyes?.value ?? "dot"} />
      <Accessory kind={avatar.accessory?.value ?? "none"} />
    </group>
  );
}

export default function Avatar3DScene({
  avatar,
  reduceMotion = false,
}: {
  readonly avatar: ResolvedAvatar;
  readonly reduceMotion?: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.35, 3.1], fov: 45 }}
      dpr={[1, 1.5]}
      frameloop={reduceMotion ? "demand" : "always"}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[2.5, 3, 4]} intensity={1.3} />
      <Character avatar={avatar} spin={!reduceMotion} />
    </Canvas>
  );
}
