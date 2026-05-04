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

// ---------- lane labels ----------
const LANE_LABELS: Record<number, string> = {
  0: "PRODUCTION",
  1: "staging",
  2: "build stream",
  3: "build stream",
  4: "build stream",
  5: "QA",
  6: "incident zone",
  7: "incident zone",
  8: "incident zone",
  9: "dev",
};

// ---------- draw ----------
function draw(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (let row = 0; row < ROWS; row++) {
    const y = row * TILE;

    // production row
    if (row === ROW_GOAL) {
      ctx.fillStyle = "#0d2136";
      ctx.fillRect(0, y, CANVAS_WIDTH, TILE);
      for (let col = 0; col < COLS; col++) {
        const gx = col * TILE;
        if (GOAL_PAD_COLS.includes(col)) {
          const filled = state.filledGoals.has(col);
          ctx.fillStyle = filled ? "#1a7f37" : "#1f6feb";
          ctx.fillRect(gx + 5, y + 5, TILE - 10, TILE - 10);
          ctx.font = `${TILE * 0.55}px serif`;
          ctx.textAlign = "center";
          ctx.fillText(filled ? "✅" : "🖥️", gx + TILE / 2, y + TILE / 2 + 6);
        }
      }

    // safe / pipeline safe zones
    } else if (row === ROW_START || row === 5 || row === 1) {
      ctx.fillStyle = row === ROW_START ? "#0d1f12" : "#111820";
      ctx.fillRect(0, y, CANVAS_WIDTH, TILE);
      // dashed separator
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = "#30363d88";
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
      ctx.setLineDash([]);

    // build stream (was river)
    } else if (row >= ROW_RIVER_START && row <= ROW_RIVER_END) {
      ctx.fillStyle = "#0c1a2e";
      ctx.fillRect(0, y, CANVAS_WIDTH, TILE);
      // scrolling data lines
      ctx.strokeStyle = "rgba(88,166,255,0.07)";
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + TILE);
        ctx.stroke();
      }

    // incident zone (was road)
    } else {
      ctx.fillStyle = "#1a0d0d";
      ctx.fillRect(0, y, CANVAS_WIDTH, TILE);
      // lane markings
      ctx.strokeStyle = "#f85149" + "22";
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(0, y + TILE / 2);
      ctx.lineTo(CANVAS_WIDTH, y + TILE / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // lane label (right-aligned, subtle)
    ctx.fillStyle = "#ffffff18";
    ctx.font = "7px monospace";
    ctx.textAlign = "right";
    ctx.fillText(LANE_LABELS[row] ?? "", CANVAS_WIDTH - 4, y + TILE - 5);
  }

  // build artifacts (was logs) — blue container shapes with box emoji
  for (const l of state.logs) {
    ctx.fillStyle = "#1f3d6e";
    ctx.fillRect(l.x, l.y, l.w, l.h);
    ctx.strokeStyle = "#58a6ff55";
    ctx.lineWidth = 1;
    ctx.strokeRect(l.x + 0.5, l.y + 0.5, l.w, l.h);
    ctx.font = `${l.h * 0.65}px serif`;
    ctx.textAlign = "left";
    ctx.fillText("📦", l.x + 4, l.y + l.h * 0.78);
  }

  // incidents (was cars) — red bug obstacles with 🐛 emoji
  for (const c of state.cars) {
    ctx.fillStyle = "#3d0f0f";
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = "#f85149aa";
    ctx.lineWidth = 1;
    ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.w, c.h);
    ctx.font = `${c.h * 0.72}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("🐛", c.x + c.w / 2, c.y + c.h * 0.8);
  }

  // player — frog emoji (greyed out when dead)
  const fr = frogHitbox(state);
  ctx.globalAlpha = state.gameOver ? 0.35 : 1;
  ctx.font = `${fr.h * 0.9}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("🐸", fr.x + fr.w / 2, fr.y + fr.h * 0.88);
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
        <span>Deploys {ui.score}</span>
        <span className="hud-controls">↑ ↓ ← → to move</span>
        <span>{"🚀".repeat(Math.max(0, ui.lives))}</span>
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
          <p>All environments deployed! 🚀</p>
          <p className="hint">Press Space to play again.</p>
        </div>
      ) : null}
      {ui.gameOver ? (
        <div className="overlay lose">
          <p>Deployment failed.</p>
          <p className="hint">Press Space to retry.</p>
        </div>
      ) : null}
    </div>
  );
}
