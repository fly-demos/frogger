# Frogger — SDLC Demo

A Frogger-style game that doubles as a live demo of a containerised delivery pipeline.
The running app displays the exact image reference, Git SHA, and build timestamp — every deploy is fully traceable back to its commit and CI run.

## Live environments

| Environment | URL |
|---|---|
| Staging | https://p01--staging--8x4cp6jdkxqb.code.run |
| Production | https://p01--production--8x4cp6jdkxqb.code.run |

---

## Pipeline

```
PR opened       →  CI: lint · test · build · Docker smoke check
Merge to main   →  Build image → push to GHCR → auto-deploy to staging
Promote to prod →  Manual: GitHub Actions UI or push to production branch
```

### Workflows

| File | Trigger | What it does |
|---|---|---|
| `ci.yml` | Pull request to `main` | Lint, test, build, Docker smoke check |
| `deploy.yml` | Push to `main` | Build + push image to GHCR, deploy to Northflank staging |
| `promote-production.yml` | Manual dispatch or push to `production` branch | Deploy a specific image tag to Northflank production |

---

## Set up your own demo

### 1. Fork the repo

Fork [fly-demos/frogger](https://github.com/fly-demos/frogger) and clone it locally.

### 2. Create two Deployment services in Northflank

1. Create a free account at [northflank.com](https://northflank.com).
2. Create a project (e.g. `frogger-demo`).
3. Inside the project, create two **Deployment** services: `staging` and `production`.
4. For each service:
   - Source: **External Docker image** → `ghcr.io/<your-github-org>/frogger:latest`
   - Registry credentials: add a GitHub PAT with `read:packages` scope, note the credential ID
   - Port: `10000` · HTTP · public
5. Create a **Northflank API token** (Account → API tokens).

### 3. Add secrets and variables to GitHub

Go to your fork → **Settings → Secrets and variables → Actions**

| Type | Name | Value |
|---|---|---|
| Secret | `NORTHFLANK_API_TOKEN` | Northflank API token |
| Variable | `NORTHFLANK_TEAM_ID` | Northflank team slug — omit if using a personal account |
| Variable | `NORTHFLANK_PROJECT_ID` | Northflank project ID (from dashboard URL) |
| Variable | `NORTHFLANK_STAGING_SERVICE_ID` | Staging service ID |
| Variable | `NORTHFLANK_PRODUCTION_SERVICE_ID` | Production service ID |
| Variable | `NORTHFLANK_REGISTRY_CREDENTIAL_ID` | ID of the saved GHCR credential in Northflank |

> `GITHUB_TOKEN` is provided automatically — no extra secret needed for pushing to GHCR.

> **One-time org setting:** org → **Settings → Actions → General → Workflow permissions** → set to **Read and write**.

### 4. Push to main

```bash
git commit --allow-empty -m "trigger first deploy" && git push
```

GitHub Actions will build the image, push it to GHCR, and deploy it to staging automatically.

### 5. Promote to production

**Option A — GitHub Actions UI:**
Actions → **Promote to Production** → Run workflow → optionally enter a specific image tag.

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
