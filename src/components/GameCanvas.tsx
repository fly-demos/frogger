import { useCallback, useEffect, useRef, useState } from "react";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLS,
  GOAL_PAD_COLS,
  ROW_GOAL,
  ROW_RIVER_END,
  ROW_RIVER_START,
  ROW_START,
  ROWS,
  TILE,
} from "../game/constants";
import {
  createInitialState,
  frogHitbox,
  moveFrog,
  stepPhysics,
  type GameState,
} from "../game/engine";
import "./GameCanvas.css";

// ---------- draw ----------
function draw(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (let row = 0; row < ROWS; row++) {
    const y = row * TILE;

    if (row === ROW_GOAL) {
      ctx.fillStyle = "#063366";
      ctx.fillRect(0, y, CANVAS_WIDTH, TILE);
      for (let col = 0; col < COLS; col++) {
        const gx = col * TILE;
        if (GOAL_PAD_COLS.includes(col)) {
          const filled = state.filledGoals.has(col);
          ctx.fillStyle = filled ? "#238636" : "#2ea043";
          ctx.fillRect(gx + 4, y + 6, TILE - 8, TILE - 12);
          ctx.font = `${TILE * 0.6}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(filled ? "🐸" : "🪰", gx + TILE / 2, y + TILE / 2);
          ctx.textBaseline = "alphabetic";
        }
      }
    } else if (row === ROW_START || row === 5 || row === 1) {
      ctx.fillStyle = "#14532d";
      ctx.fillRect(0, y, CANVAS_WIDTH, TILE);
      for (let x = 0; x < CANVAS_WIDTH; x += TILE) {
        ctx.strokeStyle = "#166534";
        ctx.strokeRect(x + 0.5, y + 0.5, TILE, TILE);
      }
    } else if (row >= ROW_RIVER_START && row <= ROW_RIVER_END) {
      ctx.fillStyle = "#0a3069";
      ctx.fillRect(0, y, CANVAS_WIDTH, TILE);
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      for (let x = 0; x < CANVAS_WIDTH; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 12, y + TILE);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = "#21262d";
      ctx.fillRect(0, y, CANVAS_WIDTH, TILE);
      ctx.strokeStyle = "#f0f6fc22";
      for (let x = 0; x < CANVAS_WIDTH; x += TILE) {
        ctx.strokeRect(x + 0.5, y + TILE * 0.65, TILE, 2);
      }
    }
  }

  // logs — brown wood planks
  for (const l of state.logs) {
    ctx.fillStyle = "#8b5a2b";
    ctx.fillRect(l.x, l.y, l.w, l.h);
    ctx.strokeStyle = "#5c3d1e";
    ctx.lineWidth = 1;
    ctx.strokeRect(l.x + 0.5, l.y + 0.5, l.w, l.h);
  }

  // cars — coloured vehicles
  for (const c of state.cars) {
    const hue = ((c.id.charCodeAt(2) || 0) * 47) % 360;
    ctx.fillStyle = `hsl(${hue} 55% 45%)`;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = "#f0f6fc33";
    ctx.fillRect(c.x + 6, c.y + 4, c.w - 20, c.h - 14);
  }

  // player — 🐸 frog emoji, drawn at full tile size centered on the tile
  const fr = frogHitbox(state);
  // fr is the collision box (TILE/2 square); tile centre is fr.x + fr.w/2, fr.y + fr.h/2
  const px = fr.x + fr.w / 2;
  const py = fr.y + fr.h / 2;
  ctx.globalAlpha = state.gameOver ? 0.35 : 1;
  ctx.font = `${TILE * 0.82}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🐸", px, py);
  ctx.textBaseline = "alphabetic";
  ctx.globalAlpha = 1;
}

// ---------- component ----------
export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const lastRef = useRef<number>(0);
  const [ui, setUi] = useState(() => ({
    lives: stateRef.current.lives,
    score: stateRef.current.score,
    won: stateRef.current.won,
    gameOver: stateRef.current.gameOver,
  }));

  const syncUi = useCallback((s: GameState) => {
    setUi((prev) => {
      if (
        prev.lives === s.lives &&
        prev.score === s.score &&
        prev.won === s.won &&
        prev.gameOver === s.gameOver
      ) {
        return prev;
      }
      return { lives: s.lives, score: s.score, won: s.won, gameOver: s.gameOver };
    });
  }, []);

  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => {
      const last = lastRef.current || t;
      const dt = Math.min(0.05, (t - last) / 1000);
      lastRef.current = t;
      const s = stepPhysics(stateRef.current, dt);
      stateRef.current = s;
      syncUi(s);
      const c = canvasRef.current?.getContext("2d");
      if (c) draw(c, s);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [syncUi]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      if (stateRef.current.won || stateRef.current.gameOver) {
        if (e.key === " " || e.key === "Enter") {
          stateRef.current = createInitialState();
          syncUi(stateRef.current);
        }
        return;
      }
      let dCol = 0;
      let dRow = 0;
      if (e.key === "ArrowUp") dRow = -1;
      if (e.key === "ArrowDown") dRow = 1;
      if (e.key === "ArrowLeft") dCol = -1;
      if (e.key === "ArrowRight") dCol = 1;
      if (dCol !== 0 || dRow !== 0) {
        stateRef.current = moveFrog(stateRef.current, dCol, dRow);
        syncUi(stateRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [syncUi]);

  return (
    <div className="game-wrap">
      <div className="hud">
        <span>Score {ui.score}</span>
        <span className="hud-controls">↑ ↓ ← → to move</span>
        <span>{"🐸".repeat(Math.max(0, ui.lives))}</span>
      </div>
      <canvas
        ref={canvasRef}
        className="game-canvas"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        role="img"
        aria-label="Fly delivery game"
      />
      {ui.won ? (
        <div className="overlay win">
          <p>You caught every fly! 🪰</p>
          <p className="hint">Press Space to play again.</p>
        </div>
      ) : null}
      {ui.gameOver ? (
        <div className="overlay lose">
          <p>Game over 🐸</p>
          <p className="hint">Press Space to retry.</p>
        </div>
      ) : null}
    </div>
  );
}
