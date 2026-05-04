export const COLS = 13;
export const ROWS = 10;
export const TILE = 40;
export const CANVAS_WIDTH = COLS * TILE;
export const CANVAS_HEIGHT = ROWS * TILE;

/** Goal pads (column index 0..COLS-1) */
export const GOAL_PAD_COLS = [2, 4, 6, 8, 10];

/** Row index from top (0) for lane types */
export const ROW_GOAL = 0;
export const ROW_SAFE_AFTER_GOAL = 1;
export const ROW_RIVER_START = 2;
export const ROW_RIVER_END = 4;
export const ROW_SAFE_MID = 5;
export const ROW_ROAD_START = 6;
export const ROW_ROAD_END = 8;
export const ROW_START = 9;
