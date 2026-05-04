# Frogger — JFrog Fly demo

**Live:** https://frogger-ef2h.onrender.com

A Frogger game used to demonstrate a containerised delivery pipeline — from Git commit to a running production service — as a foundation for [JFrog Fly](https://jfrog.com/fly/).

## Pipeline

```
git push → CI (lint · test · build) → Docker image → GHCR → Render
```

The running app shows the image reference, Git SHA, and build timestamp of the exact artifact in production. Every deploy is traceable back to its commit and CI run.

## Stack

| | |
|-|-|
| App | React 19 + Vite + TypeScript |
| Container | Docker multi-stage → `linux/amd64` |
| Registry | GitHub Container Registry (GHCR) |
| Hosting | Render (Existing Image) |
| CI/CD | GitHub Actions |

## Run locally

```bash
npm install && npm run dev
```

```bash
docker build -t frogger:local . && docker run --rm -p 8080:8080 -e PORT=8080 frogger:local
```

## Secrets

| Secret | Where |
|--------|-------|
| `RENDER_DEPLOY_HOOK_URL` | GitHub → repo → Settings → Secrets → Actions |
| `read:packages` GitHub PAT | Render → Workspace → Container Registry Credentials |

## JFrog Fly

To connect Fly: add a second `docker push` to your JFrog registry in the deploy workflow and update the Render pull credential. No application code changes needed.

## License

MIT
