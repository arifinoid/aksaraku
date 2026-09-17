type Wave = OscillatorType;

let context: AudioContext | null = null;

const getContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (context) return context;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  context = new Ctor();
  return context;
};

export const unlockAudio = (): void => {
  const ctx = getContext();
  if (ctx && ctx.state === "suspended") void ctx.resume();
};

const tone = (
  ctx: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  wave: Wave,
  peak: number,
): void => {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.05);
};

export const playPop = (enabled: boolean): void => {
  if (!enabled) return;
  const ctx = getContext();
  if (!ctx) return;
  tone(ctx, 880, ctx.currentTime, 0.12, "sine", 0.12);
};

export const playStrokeComplete = (enabled: boolean): void => {
  if (!enabled) return;
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, 659.25, now, 0.14, "triangle", 0.14);
  tone(ctx, 987.77, now + 0.08, 0.16, "triangle", 0.12);
};

export const playSuccess = (enabled: boolean): void => {
  if (!enabled) return;
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    tone(ctx, frequency, now + index * 0.09, 0.2, "triangle", 0.16);
  });
};

export const playOffTrack = (enabled: boolean): void => {
  if (!enabled) return;
  const ctx = getContext();
  if (!ctx) return;
  tone(ctx, 180, ctx.currentTime, 0.14, "sawtooth", 0.06);
};
