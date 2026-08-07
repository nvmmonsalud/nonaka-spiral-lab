# Deploying the Knowledge Spiral Lab

The app is a **pure client-side** Next.js application in `web/` — no backend,
no database, and no environment variables are needed to run it. That makes
every deployment path simple.

## Option 1 — One-click Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnvmmonsalud%2Fnonaka-spiral-lab&root-directory=web&project-name=nonaka-spiral-lab)

This clones the repo into your GitHub account and creates a Vercel project.
If the wizard doesn't pick it up automatically, set **Root Directory** to
`web` in the project settings.

## Option 2 — Fork + GitHub Actions auto-deploy

The repo ships a workflow (`.github/workflows/deploy.yml`) that deploys to
Vercel production on every push to `main`. To use it in your fork:

1. Fork this repository.
2. Create a Vercel project for the fork (root directory `web`), or run
   `npx vercel link` inside `web/` locally.
3. Add three **repository secrets** in your fork
   (Settings → Secrets and variables → Actions):
   - `VERCEL_TOKEN` — create at [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` — found in `web/.vercel/project.json`
     after `vercel link`, or in the Vercel project settings.
4. Push to `main`. The workflow lints, typechecks, builds, and deploys.

Pull requests never receive these secrets — CI for PRs
(`.github/workflows/ci.yml`) runs with a read-only token and no secrets.

## Option 3 — Static hosting (GitHub Pages, Netlify, any static server)

Because the app is fully client-side, it can be exported as static files.
This is **not** enabled in the default config (the Vercel pipeline doesn't
need it), but for your own deployment add one line to `web/next.config.ts`:

```ts
const nextConfig: NextConfig = {
  output: "export",
};
```

Then `npm run build` produces a static site in `web/out/` that any static
host can serve.

> **GitHub Pages caveat:** for a project site served under
> `https://<user>.github.io/<repo>/`, also set `basePath: "/<repo>"` in the
> config so asset URLs resolve.

## Local development

```bash
cd web
npm install       # Node.js 22+
npm run dev       # → http://localhost:3000
```

## Custom presets for private deployments

Simulator presets are bundled at build time from
[`web/data/presets.json`](web/data/presets.json). To ship your own scenarios
(e.g. your organization's knowledge flows), add entries with this shape and
rebuild:

```jsonc
{
  "id": "my-org",
  "name": "My Org",
  "tagline": "Short description of the spiral pattern",
  "icon": "🏭",
  "description": "What this scenario models and why.",
  "initial": {
    "humans": 6,            // 1–20 knowledge workers
    "agents": 3,            // 1–20 AI agents
    "baRedundancy": 0.7,    // 0–1 shared context / overlapping knowledge
    "baChaos": 0.6,         // 0–1 creative turbulence
    "baAutonomy": 0.6,      // 0–1 self-organization
    "feedbackRate": 0.85,   // 0–1 human judgment returned to machines
    "machineTransfer": 0.7, // 0–1 agent-to-agent knowledge transfer
    "hallucinationRisk": 0.2 // 0–1 false externalization probability
  }
}
```

## Operational notes

- **Runtime requirements:** Node.js 22+ to build; any static/edge host to serve.
- **No secrets in the app.** The only secrets anywhere in the project are the
  three Vercel deploy credentials used by CI, stored as GitHub repo secrets.
- **No scheduled jobs, no database, nothing to migrate.** Redeploying is
  always just a rebuild.
