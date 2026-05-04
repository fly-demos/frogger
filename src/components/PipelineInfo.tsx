import "./PipelineInfo.css";

const sha = import.meta.env.VITE_GIT_SHA || "local";
const imageRef = import.meta.env.VITE_IMAGE_REF || "local";
const npmRegistry = import.meta.env.VITE_NPM_REGISTRY || "https://registry.npmjs.org/";
const shortSha = sha === "local" ? "local" : sha.slice(0, 7);
const isLive = sha !== "local";

const STEPS: { label: string; detail: string; href?: string; linkLabel?: string }[] = [
  {
    label: "Code merged to main",
    detail: `Commit ${shortSha}`,
    href: isLive ? `https://github.com/fly-demos/frogger/commit/${sha}` : undefined,
    linkLabel: "View commit",
  },
  {
    label: "CI passes",
    detail: `Lint · tests · Docker build · npm from ${npmRegistry}`,
    href: isLive ? `https://github.com/fly-demos/frogger/commit/${sha}/checks` : undefined,
    linkLabel: "View workflow run",
  },
  {
    label: "Image pushed to registry",
    detail: isLive ? imageRef : "local build",
    href: isLive ? "https://github.com/fly-demos/frogger/pkgs/container/frogger" : undefined,
    linkLabel: "View in GHCR",
  },
  {
    label: "Production updated",
    detail: "Render pulls the new image and redeploys",
    href: "https://dashboard.render.com",
    linkLabel: "Render dashboard",
  },
  {
    label: "Live app",
    detail: typeof window !== "undefined" ? window.location.origin : "",
    href: typeof window !== "undefined" ? window.location.origin : undefined,
    linkLabel: "Open",
  },
];

export function PipelineInfo() {
  return (
    <section className="pipeline" aria-label="SDLC pipeline">
      <h2 className="pipeline-title">How this got here</h2>
      <ol className="pipeline-steps">
        {STEPS.map((s, i) => (
          <li key={i} className="pipeline-step">
            <span className="step-num">{i + 1}</span>
            <div className="step-body">
              <strong>{s.label}</strong>
              <span className="step-detail">{s.detail}</span>
              {s.href && (
                <a href={s.href} target="_blank" rel="noreferrer" className="step-link">
                  {s.linkLabel} ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
