export const supportsHaptics = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

export const vibrate = (
  pattern: number | readonly number[],
  enabled = true,
): boolean => {
  if (!enabled || !supportsHaptics()) return false;
  return navigator.vibrate(pattern as number | number[]);
};

export const HAPTIC = {
  tap: 10,
  success: [12, 40, 12],
  offTrack: 24,
} as const;
