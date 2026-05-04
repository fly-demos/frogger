import "./App.css";
import { GameCanvas } from "./components/GameCanvas";

const mode = import.meta.env.PROD ? "production" : "local";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Frogger</h1>
        <p className="tagline">
          Demo for <strong>JFrog Fly</strong> — React + Docker + Render + GitHub Actions
        </p>
        <dl className="meta">
          <div>
            <dt>Environment</dt>
            <dd>{mode}</dd>
          </div>
          <div>
            <dt>Build</dt>
            <dd>{__BUILD_TIME__}</dd>
          </div>
        </dl>
      </header>
      <GameCanvas />
      <footer className="footer">
        <p>
          Arrows to move · Reach the lily pads · Avoid cars · Ride logs on the river
        </p>
      </footer>
    </div>
  );
}
