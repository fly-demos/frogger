# Frogger — SDLC Demo

A Frogger-style game that doubles as a live demo of a containerised delivery pipeline.
The running app displays the exact image reference, Git SHA, and build timestamp — every deploy is fully traceable back to its commit and CI run.

---

## Pipeline

```
PR opened       →  CI: lint · test · Docker build check
Merge to main   →  Build image → push to GHCR → auto-deploy to Northflank staging
Promote to prod →  Manual: GitHub Actions UI or push to production branch
```

---

## Environments

| Environment | URL | Trigger |
|---|---|---|
| Staging | https://p01--staging--8x4cp6jdkxqb.code.run | Auto on merge to `main` |
| Production | Northflank `code.run` subdomain | Manual via GitHub Actions |

---

## Set up your own demo

### 1. Fork the repo

Fork [fly-demos/frogger](https://github.com/fly-demos/frogger) into a GitHub org or account you control.

### 2. Create two services in Northflank

1. Create a free account at [northflank.com](https://northflank.com).
2. Create a project (e.g. `frogger-demo`).
3. Create two **Deployment** services inside it: `staging` and `production`.
4. For each service:
   - Source: **External Docker image** → `ghcr.io/<your-github-org>/frogger:latest`
   - Registry credentials: add a GitHub PAT with `read:packages` scope
   - Port: `10000` / HTTP / public
5. Note the **Project ID** and each **Service ID** from the Northflank dashboard URL.

### 3. Create a Northflank API token

Northflank → Account settings → **API tokens → Create token**.

### 4. Add secrets and variables to GitHub

**Settings → Secrets and variables → Actions**

| Type | Name | Value |
|---|---|---|
| Secret | `NORTHFLANK_API_TOKEN` | Northflank API token |
| Variable | `NORTHFLANK_TEAM_ID` | Northflank team slug (e.g. `my-team`) — omit if personal account |
| Variable | `NORTHFLANK_PROJECT_ID` | Northflank project ID |
| Variable | `NORTHFLANK_STAGING_SERVICE_ID` | Staging service ID |
| Variable | `NORTHFLANK_PRODUCTION_SERVICE_ID` | Production service ID |
| Variable | `NORTHFLANK_REGISTRY_CREDENTIAL_ID` | ID of the saved GHCR credential in Northflank |

> `GITHUB_TOKEN` is provided automatically for pushing to GHCR — no extra secret needed.

> **One-time org setting:** Go to your org → **Settings → Actions → General → Workflow permissions** → set to **Read and write**.

### 5. Push to main

```bash
git commit --allow-empty -m "trigger first deploy" && git push
```

GitHub Actions will build the image, push to GHCR, and deploy to Northflank staging automatically.

### 6. Promote to production

**Option A — GitHub UI:**
Actions → **Promote to Production** → Run workflow → optionally specify an image tag.

**Option B — Git:**
```bash
git checkout production && git merge main && git push origin production
```

---

## Run locally

```bash
npm install && npm run dev
```

Or with Docker:

```bash
docker build -t frogger:local . && docker run --rm -p 10000:10000 frogger:local
```

---

## Stack

| | |
|---|---|
| App | React 19 + Vite + TypeScript |
| Container | Docker multi-stage → `linux/amd64` |
| Registry | GitHub Container Registry (GHCR) |
| Hosting | Northflank (staging + production) |
| CI/CD | GitHub Actions |

---

## License

MIT
