import type { ModuleItemId } from "../types";

export interface ColoringSticker {
  readonly id: string;
  readonly emoji: string;
  readonly x: number;
  readonly y: number;
}

export interface ColoringState {
  readonly itemId: ModuleItemId;
  readonly fills: Readonly<Record<number, string>>;
  readonly stickers: readonly ColoringSticker[];
}

export const createColoringState = (itemId: ModuleItemId): ColoringState => ({
  itemId,
  fills: {},
  stickers: [],
});

export const paintStroke = (
  state: ColoringState,
  strokeIndex: number,
  color: string,
): ColoringState => ({
  ...state,
  fills: { ...state.fills, [strokeIndex]: color },
});

export const addSticker = (
  state: ColoringState,
  sticker: ColoringSticker,
): ColoringState => ({ ...state, stickers: [...state.stickers, sticker] });

export const removeLastSticker = (state: ColoringState): ColoringState => ({
  ...state,
  stickers: state.stickers.slice(0, -1),
});

export const clearColoring = (state: ColoringState): ColoringState =>
  createColoringState(state.itemId);

export const coloredStrokeCount = (state: ColoringState): number =>
  Object.keys(state.fills).length;

export const coloringScore = (
  state: ColoringState,
  strokeCount: number,
): number => {
  if (strokeCount === 0) return 0;
  const painted = Math.min(coloredStrokeCount(state), strokeCount) / strokeCount;
  const stickerBonus = state.stickers.length > 0 ? 0.2 : 0;
  return Math.min(1, painted + stickerBonus);
};
