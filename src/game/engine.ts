import {
  CANVAS_WIDTH,
  COLS,
  ROWS,
  GOAL_PAD_COLS,
  ROW_GOAL,
  ROW_RIVER_END,
  ROW_RIVER_START,
  ROW_ROAD_END,
  ROW_ROAD_START,
  ROW_START,
  TILE,
} from "./constants";
import { overlap, type Rect } from "./geometry";

export type Mover = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
};

export type GameState = {
  frogCol: number;
  frogRow: number;
  /** When on a river row, horizontal offset in px from lane scroll (for riding logs) */
  frogOffsetX: number;
  cars: Mover[];
  logs: Mover[];
  lives: number;
  score: number;
  won: boolean;
  gameOver: boolean;
  /** Goal slots filled (column index) */
  filledGoals: Set<number>;
};

let carId = 0;
let logId = 0;

function nextCarId() {
  return `c-${++carId}`;
}

function nextLogId() {
  return `l-${++logId}`;
}


export function createInitialState(): GameState {
  carId = 0;
  logId = 0;
  return {
    frogCol: Math.floor(COLS / 2),
    frogRow: ROW_START,
    frogOffsetX: 0,
    cars: spawnInitialCars(),
    logs: spawnInitialLogs(),
    lives: 3,
    score: 0,
    won: false,
    gameOver: false,
    filledGoals: new Set(),
  };
}

function spawnInitialCars(): Mover[] {
  const cars: Mover[] = [];
  for (let row = ROW_ROAD_START; row <= ROW_ROAD_END; row++) {
    const dir = row % 2 === 0 ? 1 : -1;
    const speed = 60 + row * 15;
    for (let i = 0; i < 4; i++) {
      cars.push({
        id: nextCarId(),
        x: (i * (CANVAS_WIDTH / 3.5) + (row * 37)) % (CANVAS_WIDTH + 80) - 40,
        y: row * TILE + 6,
        w: TILE - 6,
        h: TILE - 12,
        vx: dir * speed,
      });
    }
  }
  return cars;
}

function spawnInitialLogs(): Mover[] {
  const logs: Mover[] = [];
  for (let row = ROW_RIVER_START; row <= ROW_RIVER_END; row++) {
    const dir = row % 2 === 0 ? -1 : 1;
    const speed = 45 + row * 10;
    for (let i = 0; i < 3; i++) {
      logs.push({
        id: nextLogId(),
        x: (i * 180 + row * 50) % (CANVAS_WIDTH + 120) - 60,
        y: row * TILE + 10,
        w: TILE * 2 - 8,
        h: TILE - 20,
        vx: dir * speed,
      });
    }
  }
  return logs;
}

function frogRect(state: GameState): Rect {
  const x =
    state.frogCol * TILE +
    TILE / 4 +
    (state.frogRow >= ROW_RIVER_START && state.frogRow <= ROW_RIVER_END ? state.frogOffsetX : 0);
  const y = state.frogRow * TILE + TILE / 4;
  return { x, y, w: TILE / 2, h: TILE / 2 };
}

function onGoalPad(col: number): boolean {
  return GOAL_PAD_COLS.includes(col);
}

export function moveFrog(state: GameState, dCol: number, dRow: number): GameState {
  if (state.won || state.gameOver) return state;
  const nextCol = Math.max(0, Math.min(COLS - 1, state.frogCol + dCol));
  const nextRow = Math.max(0, Math.min(ROWS - 1, state.frogRow + dRow));
  let next = {
    ...state,
    frogCol: nextCol,
    frogRow: nextRow,
    frogOffsetX: 0,
  };
  if (nextRow === ROW_GOAL) {
    if (onGoalPad(nextCol)) {
      if (state.filledGoals.has(nextCol)) {
        next = die({ ...next, frogCol: nextCol, frogRow: nextRow });
      } else {
        const filled = new Set(state.filledGoals);
        filled.add(nextCol);
        const score = state.score + 150;
        const won = filled.size >= GOAL_PAD_COLS.length;
        next = {
          ...next,
          filledGoals: filled,
          score,
          won,
          frogCol: Math.floor(COLS / 2),
          frogRow: ROW_START,
          frogOffsetX: 0,
        };
      }
    } else {
      next = die({ ...next, frogCol: nextCol, frogRow: nextRow });
    }
  }
  return next;
}

function die(state: GameState): GameState {
  const lives = state.lives - 1;
  if (lives <= 0) {
    return {
      ...state,
      lives: 0,
      gameOver: true,
      frogCol: Math.floor(COLS / 2),
      frogRow: ROW_START,
      frogOffsetX: 0,
    };
  }
  return {
    ...state,
    lives,
    frogCol: Math.floor(COLS / 2),
    frogRow: ROW_START,
    frogOffsetX: 0,
  };
}

function updateMovers(movers: Mover[], dt: number): Mover[] {
  return movers.map((m) => {
    let x = m.x + m.vx * dt;
    const margin = m.w + 20;
    if (m.vx > 0 && x > CANVAS_WIDTH + margin) x = -margin;
    if (m.vx < 0 && x + m.w < -margin) x = CANVAS_WIDTH + margin - m.w;
    return { ...m, x };
  });
}

export function stepPhysics(state: GameState, dt: number): GameState {
  if (state.won || state.gameOver) return state;
  let next: GameState = {
    ...state,
    cars: updateMovers(state.cars, dt),
    logs: updateMovers(state.logs, dt),
  };

  const fr = frogRect(next);
  if (next.frogRow >= ROW_ROAD_START && next.frogRow <= ROW_ROAD_END) {
    for (const c of next.cars) {
      if (overlap(fr, c)) {
        next = die(next);
        break;
      }
    }
  }

  if (next.frogRow >= ROW_RIVER_START && next.frogRow <= ROW_RIVER_END && !next.gameOver) {
    const logsInRow = next.logs.filter(
      (l) => Math.floor((l.y + l.h / 2) / TILE) === next.frogRow,
    );
    let onLog = false;
    let carryVx = 0;
    for (const l of logsInRow) {
      if (overlap(fr, l)) {
        onLog = true;
        carryVx = l.vx;
        break;
      }
    }
    if (!onLog) {
      next = die(next);
    } else {
      next = {
        ...next,
        frogOffsetX: next.frogOffsetX + carryVx * dt,
      };
      const frogCenterX = next.frogCol * TILE + TILE / 2 + next.frogOffsetX;
      if (frogCenterX < -TILE / 2 || frogCenterX > CANVAS_WIDTH + TILE / 2) {
        next = die(next);
      }
    }
  }

  return next;
}

export function frogHitbox(state: GameState): Rect {
  return frogRect(state);
}
