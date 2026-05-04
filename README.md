# Frogger — JFrog Fly demo

A browser Frogger clone used as a live demonstration of a containerised software delivery pipeline, end to end from a Git commit to a running production service.

**Live:** https://frogger.onrender.com *(update with your Render URL)*

## What it demonstrates

Every deployment of this app is fully traceable. The page itself shows:

- which **Docker image** is running (`ghcr.io/fly-demos/frogger:sha-<commit>`)
- the **Git SHA** that produced it
- the **build timestamp**
- a step-by-step pipeline trace with links to the commit, CI run, registry, and live app

When [JFrog Fly](https://jfrog.com/fly/) is connected, it adds artifact promotion, registry governance, and runtime environment visibility on top of the same pipeline — no application changes required.

## Pipeline

```
git push → GitHub Actions (lint · test · build) → Docker image → GHCR → Render deploy hook → live
```

On every merge to `main`:

1. GitHub Actions runs lint, type-check, tests, and a Docker build validation.
2. A `linux/amd64` image is built with the Git SHA baked in and pushed to GHCR.
3. The Render deploy hook fires — Render pulls the exact new image and redeploys.

## Stack

| Layer | Technology |
|-------|-----------|
| App | React 19, Vite, TypeScript |
| Container | Docker (multi-stage, nginx) |
| Registry | GitHub Container Registry (GHCR) |
| Hosting | Render (Existing Image) |
| CI/CD | GitHub Actions |

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run test
npm run build
```

```bash
docker build -t frogger:local .
docker run --rm -p 8080:8080 -e PORT=8080 frogger:local
# http://localhost:8080
```

## Secrets

One secret required in **GitHub → Settings → Secrets → Actions**:

| Secret | Value |
|--------|-------|
| `RENDER_DEPLOY_HOOK_URL` | Deploy hook URL from the Render service Settings tab |

GHCR push uses the built-in `GITHUB_TOKEN` — no additional credentials needed.

Render needs a **`read:packages`** GitHub PAT to pull the private GHCR image (add under Render → Workspace → Container Registry Credentials).

## JFrog Fly (next step)

Connecting Fly requires:
1. A second `docker push` in the deploy workflow targeting your JFrog Docker registry.
2. Registry pull credentials added to Render for the JFrog host.
3. No application code changes.

## License

MIT
