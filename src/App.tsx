import "./App.css";
import { GameCanvas } from "./components/GameCanvas";
import { PipelineInfo } from "./components/PipelineInfo";

function detectMode() {
  if (typeof window === "undefined") return "local";
  const host = window.location.hostname;
  if (host.includes("staging")) return "staging";
  if (host.includes("production")) return "production";
  return "local";
}

const mode = detectMode();

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Frogger — SDLC Demo</h1>
        <p className="tagline">
          A live demo showing how a containerised app moves from a Git commit to a running production environment.
          Every deploy is traceable — the image reference and SHA below are baked in at build time.
        </p>
        <dl className="meta">
          <div>
            <dt>Environment</dt>
            <dd>{mode}</dd>
          </div>
          <div>
            <dt>Image</dt>
            <dd>{import.meta.env.VITE_IMAGE_REF || "local"}</dd>
          </div>
          <div>
            <dt>SHA</dt>
            <dd>{import.meta.env.VITE_GIT_SHA || "local"}</dd>
          </div>
          <div>
            <dt>Build time</dt>
            <dd>{__BUILD_TIME__}</dd>
          </div>
        </dl>
      </header>
      <GameCanvas />
      <PipelineInfo />
    </div>
  );
}
