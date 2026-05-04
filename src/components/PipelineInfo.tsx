import "./PipelineInfo.css";

const sha = import.meta.env.VITE_GIT_SHA || "local";
const imageRef = import.meta.env.VITE_IMAGE_REF || "local";
const shortSha = sha === "local" ? "local" : sha.slice(0, 7);

const STEPS = [
  {
    icon: "✏️",
    label: "Code",
    detail: "Feature branch → Pull Request → merge to main",
  },
  {
    icon: "⚙️",
    label: "CI",
    detail: "GitHub Actions: lint, type-check, unit tests, Docker build validation",
  },
  {
    icon: "📦",
    label: "Image",
    detail: `Docker image built for linux/amd64 and pushed to GHCR as an immutable artifact tagged sha-${shortSha}`,
  },
  {
    icon: "🗂️",
    label: "Registry",
    detail: `ghcr.io/fly-demos/frogger — stores every immutable image per commit. JFrog Fly connects here for artifact exploration and promotion.`,
  },
  {
    icon: "🚀",
    label: "Deploy",
    detail: "Render deploy hook fires automatically. Render pulls the exact tagged image from the registry — no source code transferred.",
  },
  {
    icon: "🌐",
    label: "Runtime",
    detail: "Render serves the container over HTTPS. The image ref and SHA visible above prove which exact artifact is live.",
  },
];

export function PipelineInfo() {
  return (
    <section className="pipeline" aria-label="SDLC pipeline">
      <h2 className="pipeline-title">How this app is delivered</h2>
      <p className="pipeline-subtitle">
        Every field in the header above is traceable back through this pipeline.
      </p>

      <ol className="pipeline-steps">
        {STEPS.map((s, i) => (
          <li key={i} className="pipeline-step">
            <span className="step-icon" aria-hidden="true">{s.icon}</span>
            <div className="step-body">
              <strong className="step-label">{s.label}</strong>
              <p className="step-detail">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="pipeline-trace">
        <h3>Trace this deployment</h3>
        <dl>
          <div>
            <dt>Image in registry</dt>
            <dd>
              {imageRef === "local" ? (
                <em>local build</em>
              ) : (
                <a
                  href={`https://github.com/orgs/fly-demos/packages/container/frogger`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {imageRef}
                </a>
              )}
            </dd>
          </div>
          <div>
            <dt>GitHub Actions run</dt>
            <dd>
              {sha === "local" ? (
                <em>local build</em>
              ) : (
                <a
                  href={`https://github.com/fly-demos/frogger/commits/${sha}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {shortSha} → view commit
                </a>
              )}
            </dd>
          </div>
          <div>
            <dt>JFrog Fly (coming soon)</dt>
            <dd>Will surface build context, artifact promotion, and runtime env visibility from this same image ref.</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
