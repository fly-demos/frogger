# Frogger

A browser Frogger clone — React + Vite + TypeScript, containerised with Docker, deployed on [Render](https://render.com) via GitHub Actions.

Built as a demo for [JFrog Fly](https://jfrog.com/fly/).

## Play

Live at **https://frogger.fly-demos.com** _(add your Render URL here)_

Arrow keys to move. Reach all five lily pads to win. Avoid cars; ride logs across the river.

## Stack

| Layer | Technology |
|-------|-----------|
| App | React 19, Vite, TypeScript |
| Container | Docker (multi-stage, `linux/amd64`) |
| Registry | GitHub Container Registry (GHCR) |
| Hosting | Render (Existing Image) |
| CI/CD | GitHub Actions |

## CI/CD pipeline

- **Pull request** — install, lint, test, Docker build (no push).
- **Merge to `main`** — build + push `ghcr.io/fly-demos/frogger:sha-<short>` to GHCR, then POST the Render deploy hook so production updates to that exact image.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run test
npm run build
docker build -t frogger:local .
docker run --rm -p 8080:8080 -e PORT=8080 frogger:local
```

## Secrets (repo Settings → Secrets → Actions)

| Secret | Value |
|--------|-------|
| `RENDER_DEPLOY_HOOK_URL` | Deploy hook URL from the Render service Settings tab |

GHCR push uses the built-in `GITHUB_TOKEN` — no extra credentials required.

## JFrog Fly

When Fly is connected, the pipeline will also push to a JFrog private registry and Render will pull from there — no application code changes needed.

## License

MIT
