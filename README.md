# Fly Delivery — JFrog Fly demo

A Frogger-style game that doubles as a live demo of a containerised delivery pipeline.
The game UI shows the exact image reference, Git SHA, and build timestamp running in production — every deploy is traceable back to its commit and CI run.

**Reference deployment:** https://frogger-ef2h.onrender.com

---

## What this demos

| JFrog Fly capability | How it shows up here |
|---|---|
| See all builds + contexts | GitHub Actions runs — one per commit to `main` |
| Explore produced artifacts | Docker image pushed to GHCR, tagged with `sha-<short>` |
| See runtime environment | App UI displays the registry URL and Git SHA baked into the running container |

---

## Pipeline

```
git push → GitHub Actions (lint · test · build) → Docker image → GHCR → Render
```

---

## Set up your own demo in 4 steps

### 1. Fork the repo

Fork [fly-demos/frogger](https://github.com/fly-demos/frogger) into a GitHub org or account you control.

### 2. Set up a Render service

1. Create a free account at [render.com](https://render.com).
2. **New → Web Service → Deploy an existing image.**
3. Image URL: `ghcr.io/<your-github-org>/frogger:sha-<any-7-char-sha>` (you can use a placeholder — you'll update it via deploy hook after the first CI run).
4. Name the service something clean (e.g. `frogger`) — this becomes your subdomain.
5. Set **PORT** environment variable → `10000`.
6. Copy the **Deploy Hook URL** from the service's Settings tab.

> **Private GHCR image?** Go to Render → Workspace → Container Registry Credentials and add a GitHub PAT with `read:packages` scope. Point the service at that credential.

### 3. Add secrets to GitHub

In your forked repo: **Settings → Secrets and variables → Actions**

| Secret | Value |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | The deploy hook URL from Render |

No other secrets are needed — `GITHUB_TOKEN` is provided automatically by GitHub Actions for pushing to GHCR.

> **One-time org setting:** GitHub org defaults sometimes restrict `GITHUB_TOKEN` to read-only. If the first deploy fails on the GHCR push step, go to your org → **Settings → Actions → General → Workflow permissions** and set it to **Read and write**.

### 4. Push to main

```bash
git commit --allow-empty -m "trigger first deploy" && git push
```

GitHub Actions will:
1. Lint, test, and build the app.
2. Build a Docker image tagged `sha-<short-sha>` and push it to `ghcr.io/<org>/frogger`.
3. Call the Render deploy hook — Render pulls the new image and restarts the service.

Your live app will show the image reference and Git SHA of that exact deploy.

---

## Run locally

```bash
npm install && npm run dev
```

Or with Docker:

```bash
docker build -t frogger:local . && docker run --rm -p 8080:8080 -e PORT=8080 frogger:local
```

---

## Stack

| | |
|---|---|
| App | React 19 + Vite + TypeScript |
| Container | Docker multi-stage → `linux/amd64` |
| Registry | GitHub Container Registry (GHCR) |
| Hosting | Render (Existing Image) |
| CI/CD | GitHub Actions |

---

## Connecting JFrog Fly (next step)

Once your baseline demo is running, plugging in Fly requires no application code changes:

1. Add a second `docker push` in `.github/workflows/deploy.yml` targeting your JFrog registry.
2. Update the Render pull credential to use the JFrog registry URL.
3. Fly will then surface all builds, artifact metadata, and the runtime pull in its dashboard.

---

## License

MIT
