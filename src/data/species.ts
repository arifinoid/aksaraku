import {
  defaultAvatarConfig,
  type AvatarConfig,
  type AvatarPart,
} from "../domain";

/**
 * The creature behind each avatar emoji.
 *
 * The profile picker asks for an emoji, and the 3D character used to ignore
 * it: every child got the same round blob. This table is what makes the two
 * agree — the species supplies the fur colour, the ear shape, the face
 * marking and the tail, while the child still owns the colour, eye and
 * accessory slots on the Karakter screen.
 *
 * Geometry lives in the scene; this file is pure data so it can be tested
 * without a WebGL context.
 */
export interface SpeciesLook {
  /** Fur colour, used when the child has not picked one yet. */
  readonly fur: string;
  /** Ear part the species starts with, e.g. "ears-pointy". */
  readonly ears: string;
  /** Ear colour when it differs from the fur (a panda's ears are black). */
  readonly earColor: string | null;
  /** Colour of the inner ear; null for species with no visible ear canal. */
  readonly innerEar: string | null;
  /** The face marking that makes the species readable at a glance. */
  readonly marking: "none" | "muzzle" | "panda";
  /** Colour of the muzzle patch, used when marking is not "none". */
  readonly muzzle: string;
  readonly nose: string;
  /** A wide mouth is what makes a frog read as a frog. */
  readonly mouth: "none" | "wide";
  /** Whiskers separate a cat from a fox at the same fur colour. */
  readonly whiskers: boolean;
  readonly tail: "none" | "round" | "puff" | "bushy";
  readonly tailTip: string;
}

const LOOKS: Readonly<Record<string, SpeciesLook>> = {
  cat: {
    fur: "#ff7a45",
    ears: "ears-pointy",
    earColor: null,
    innerEar: null,
    marking: "muzzle",
    muzzle: "#fff1e6",
    nose: "#d96b7a",
    mouth: "none",
    whiskers: true,
    tail: "round",
    tailTip: "#ffb3c1",
  },
  bear: {
    fur: "#b07d4f",
    ears: "ears-round",
    earColor: null,
    innerEar: "#e0b98f",
    marking: "muzzle",
    muzzle: "#e8c9a8",
    nose: "#4b3323",
    mouth: "none",
    whiskers: false,
    tail: "puff",
    tailTip: "#e8c9a8",
  },
  rabbit: {
    fur: "#f6f1e8",
    ears: "ears-long",
    earColor: null,
    innerEar: "#ffb3c1",
    marking: "muzzle",
    muzzle: "#ffffff",
    nose: "#e88ba0",
    mouth: "none",
    whiskers: false,
    tail: "puff",
    tailTip: "#ffffff",
  },
  fox: {
    fur: "#ff7a45",
    ears: "ears-pointy",
    earColor: null,
    innerEar: null,
    marking: "muzzle",
    muzzle: "#fff4e8",
    nose: "#2f2a33",
    mouth: "none",
    whiskers: false,
    tail: "bushy",
    tailTip: "#fff4e8",
  },
  panda: {
    fur: "#f6f1e8",
    ears: "ears-round",
    earColor: "#2f2a33",
    innerEar: null,
    marking: "panda",
    muzzle: "#ffffff",
    nose: "#2f2a33",
    mouth: "none",
    whiskers: false,
    tail: "round",
    tailTip: "#2f2a33",
  },
  frog: {
    fur: "#57cc99",
    ears: "ears-none",
    earColor: null,
    innerEar: null,
    marking: "none",
    muzzle: "#d9f5e6",
    nose: "#2f7a52",
    mouth: "wide",
    whiskers: false,
    tail: "none",
    tailTip: "#d9f5e6",
  },
};

/** The cat is the fallback so an unknown id still renders a full character. */
export const DEFAULT_SPECIES = "cat";

export const speciesLook = (id: string): SpeciesLook =>
  LOOKS[id] ?? LOOKS[DEFAULT_SPECIES]!;

/**
 * The starting config for a species: its fur colour and its ear shape, with
 * every other slot at the generic default. A saved config always wins over
 * this, so a child who already picked blue stays blue when they change
 * species.
 */
export const defaultAvatarFor = (
  parts: readonly AvatarPart[],
  speciesId: string,
): AvatarConfig => {
  const look = speciesLook(speciesId);
  const base = defaultAvatarConfig(parts);
  const fur = look.fur.toLowerCase();
  const color = parts.find(
    (part) => part.slot === "color" && part.value.toLowerCase() === fur,
  );
  const ears = parts.find((part) => part.id === look.ears);
  return {
    ...base,
    color: color?.id ?? base.color,
    ears: ears?.id ?? base.ears,
  };
};
