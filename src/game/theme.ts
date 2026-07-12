/** Shared palette + type constants, extracted from the reference mockup. */

export const BG_CREAM = 0xfdf3e7;
export const BG_GRADIENT_TOP = 0xfce0dc;
export const BG_GRADIENT_BOTTOM = 0xc9e3f5;

export const CORAL = 0xf4a09a;
export const SKY_BLUE = 0xa9cdea;
export const SOFT_YELLOW = 0xf6d671;
export const SOFT_GREEN = 0xa8d9b5;

/** The 4 falling-block colors, cycled across answers. */
export const BLOCK_COLORS = [CORAL, SKY_BLUE, SOFT_YELLOW, SOFT_GREEN];

export const TEXT_DARK = 0x3a342e;
export const TEXT_GRAY = 0x9c9186;
export const CARD_WHITE = 0xffffff;

export const STACK_FILL = 0xe8776e;
export const STACK_FLOOR_LINE = 0xd9c7b8;

export const FONT_FAMILY = "'Baloo 2', sans-serif";

/** Hex number -> CSS hex string, since Phaser Text color needs "#rrggbb" but Graphics needs 0xrrggbb. */
export function toCssHex(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}
