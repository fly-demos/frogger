# Frogger — JFrog Fly demo

React + Vite Frogger clone with **Docker** image built in **GitHub Actions**, pushed to **Docker Hub**, and deployed to **Render** (Existing Image + deploy hook). Intended as a Fly-ready sample: add a **JFrog registry** later and repoint Render without changing the game code.

## Create the GitHub org and repository

This environment could not run `gh` or the GitHub API with your credentials, so create the org and repo in the browser (or install the [GitHub CLI](https://cli.github.com/) and run the commands below locally).

### 1. Create organization `jfrog-fly-demos`

1. Open **[Create a new organization](https://github.com/account/organizations/new?plan=free)** (Free plan).
2. Name it **`jfrog-fly-demos`** (must be available on GitHub).
3. Finish the wizard (billing email, etc.).

### 2. Create the repository

1. Go to **https://github.com/organizations/jfrog-fly-demos/repositories/new** (adjust if your org URL differs).
2. Repository name: **`frogger`**.
3. Visibility: **Public** (recommended for Actions minutes on free orgs) or Private if your org policy requires it.
4. **Do not** add a README, `.gitignore`, or license (this repo already has them).
5. Create the repository.

### 3. Push this code

If this folder is **already a git repo** with a commit, add the remote and push:

```bash
cd /path/to/Frogger
git remote add origin https://github.com/jfrog-fly-demos/frogger.git
git branch -M main
git push -u origin main
```

Otherwise:

```bash
cd /path/to/Frogger
git init
git checkout -b main
git add .
git commit -m "Initial Frogger demo: React, Docker, GHA, Render"
git remote add origin https://github.com/jfrog-fly-demos/frogger.git
git push -u origin main
```

This repo was committed with a **local** `user.name` / `user.email` only for that machine; override with your identity if you amend or re-commit: `git config user.name "…"` and `git config user.email "…"`.

**Optional (GitHub CLI):**

```bash
brew install gh
gh auth login
gh org create jfrog-fly-demos --plan free   # if not created in the UI
gh repo create jfrog-fly-demos/frogger --public --source=. --remote=origin --push
```

## Local development

```bash
npm install
npm run dev
```

If your machine routes npm through JFrog and installs fail, use a clean registry for this folder:

```bash
npm install --registry=https://registry.npmjs.org/
```

Or keep the included [`.npmrc`](.npmrc) (`registry=https://registry.npmjs.org/`) and adjust corporate policy if it overrides project settings.

## Docker

```bash
docker build -t frogger:local .
docker run --rm -p 8080:8080 -e PORT=8080 frogger:local
```

Open **http://localhost:8080**.

## GitHub Actions secrets

In **GitHub → repo → Settings → Secrets and variables → Actions**, add:

| Secret | Purpose |
|--------|---------|
| `DOCKERHUB_USERNAME` | Docker Hub user or org name (image is `docker.io/<username>/frogger:<tag>`). |
| `DOCKERHUB_TOKEN` | [Docker Hub access token](https://docs.docker.com/docker-hub/access-tokens/) with **read & write** (CI push). |
| `RENDER_DEPLOY_HOOK_URL` | Full deploy hook URL from Render (includes `key=`). Optional until Render is configured. |

**Render dashboard**

Render must verify it can **pull** your image when you create an **Existing Image** service, so **push at least one tag** to Docker Hub first (e.g. run the **Deploy** workflow once after secrets exist, or `docker build` + `docker push` locally).

1. Create a **Web Service** → **Existing Image**.
2. Default image: `docker.io/<DOCKERHUB_USERNAME>/frogger:<some-tag>` — the **registry + repository path** must stay the same as in CI (`docker.io/<user>/frogger`). Tags can differ per deploy; the workflow passes `imgURL` with the new `sha-*` tag ([Render docs](https://render.com/docs/deploy-hooks#deploying-from-an-image-registry)).
3. Add **Container registry credentials** for Docker Hub with **pull** access to the private image.
4. Copy **Deploy Hook** URL into `RENDER_DEPLOY_HOOK_URL`.

On each push to `main`, [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds, pushes `docker.io/<user>/frogger:sha-<short>`, and POSTs the deploy hook with URL-encoded `imgURL` so Render pulls that tag.

## JFrog Fly (later)

- Push the same image to your **JFrog Docker registry** from CI (second `docker push`).
- Store pull credentials in Render for the JFrog host.
- Point the default image / `imgURL` prefix at the JFrog reference once Fly is the artifact source of truth.

## Scripts

- `npm run dev` — Vite dev server  
- `npm run build` — production bundle  
- `npm run test` — Vitest  
- `npm run lint` — ESLint  

## License

MIT — see [LICENSE](LICENSE).
