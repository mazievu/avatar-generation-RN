// utils/colors.ts
import { AVATAR_COLOR_PALETTE } from "../core/constants";

export function hexFromColorName(name?: string): string | null {
  if (!name) return null;
  const c = AVATAR_COLOR_PALETTE.find(x => x.name === name);
  return c?.previewBackground ?? null; // kỳ vọng "#RRGGBB" hoặc "rgb(...)/hsl(...)"
}
