export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;

export const STACK_ROWS = 8;
export const ROW_HEIGHT = 48;
export const STACK_AREA_HEIGHT = STACK_ROWS * ROW_HEIGHT;
export const STACK_TOP_Y = GAME_HEIGHT - STACK_AREA_HEIGHT;

export const HUD_HEIGHT = 140;
export const FALL_START_Y = HUD_HEIGHT;

export const FALL_SPEED_PX_PER_SEC = 90;

export const POINTS_PER_CORRECT = 10;
export const CORRECT_STREAK_FOR_ROW_CLEAR = 3;

// Blocks size themselves to fit each song title, between these bounds.
export const BLOCK_MIN_WIDTH = 130;
export const BLOCK_MAX_WIDTH = GAME_WIDTH - 40;
export const BLOCK_MIN_HEIGHT = 56;

// Vertical gap kept between staggered falling blocks, expressed as a pixel distance
// (converted to a spawn-delay in ms using the fall speed) so it stays intuitive to tune.
export const ANSWER_ROW_GAP_PX = 90;
export const ANSWER_STAGGER_MS = (ANSWER_ROW_GAP_PX / FALL_SPEED_PX_PER_SEC) * 1000;
