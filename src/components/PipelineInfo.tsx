import "./PipelineInfo.css";

const sha = import.meta.env.VITE_GIT_SHA || "local";
const imageRef = import.meta.env.VITE_IMAGE_REF || "local";
const shortSha = sha === "local" ? "local" : sha.slice(0, 7);

const STEPS = [
  { label: "Code merged to main", detail: "GitHub Actions triggered" },
  { label: "CI passes", detail: "Lint · tests · Docker build" },
  { label: "Image pushed to registry", detail: imageRef === "local" ? "local build" : imageRef },
  { label: "Production updated", detail: "Render pulls the new image and redeploys" },
  { label: "This page served", detail: `Running image sha-${shortSha}` },
];

export function PipelineInfo() {
  return (
    <section className="pipeline" aria-label="SDLC pipeline">
      <h2 className="pipeline-title">How this got here</h2>
      <ol className="pipeline-steps">
        {STEPS.map((s, i) => (
          <li key={i} className="pipeline-step">
            <span className="step-num">{i + 1}</span>
            <div>
              <strong>{s.label}</strong>
              <p>{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="pipeline-links">
        {sha !== "local" && (
          <>
            <a href={`https://github.com/fly-demos/frogger/commit/${sha}`} target="_blank" rel="noreferrer">
              Commit {shortSha}
            </a>
            <span>·</span>
            <a href="https://github.com/fly-demos/frogger/pkgs/container/frogger" target="_blank" rel="noreferrer">
              Image in registry
            </a>
            <span>·</span>
            <a href="https://github.com/fly-demos/frogger/actions" target="_blank" rel="noreferrer">
              CI runs
            </a>
          </>
        )}
      </div>
    </section>
  );
}
