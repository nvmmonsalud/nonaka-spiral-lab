# Deploying the Knowledge Spiral Lab

The app is a **pure client-side** Next.js application in `web/` — no backend,
no database, and no environment variables are needed to run it. That makes
every deployment path simple.

## Option 1 — One-click Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnvmmonsalud%2Fnonaka-spiral-lab&root-directory=web&project-name=nonaka-spiral-lab)

This clones the repo into your GitHub account and creates a Vercel project.
If the wizard doesn't pick it up automatically, set **Root Directory** to
`web` in the project settings.

## Option 2 — Fork + Vercel Git integration (auto-deploy on push)

There is **no deploy workflow**. Vercel's Git integration builds and promotes
on push, which keeps every deploy credential out of CI.

1. Fork this repository.
2. In Vercel, **Add New → Project**, then import your fork.
3. Set **Root Directory** to `web`. This step is not optional: the Next.js app
   lives there, so with the setting empty Vercel builds from the repo root and
   fails with `NEXT_NO_VERSION — No Next.js version detected`.
4. Leave **Production Branch** as `main`. Pushes to `main` deploy to
   production; every other branch gets its own preview URL.

No repository secrets are needed — the integration authenticates through the
Vercel GitHub App, not a token.

> **CI is a detector, not a gate.** Vercel runs its own build, so a commit that
> does not compile will not publish. But Vercel does not wait for
> `.github/workflows/ci.yml`: a commit whose **lint or tests** fail still reaches
> production, because Vercel never runs them. Land changes through a PR with
> green checks, or run `npm run lint && npm run typecheck && npm test && npm run
> build` locally before pushing to `main`. Requiring the `build` check on `main`
> is what turns CI into an actual gate — see *Operational notes*.

**Manual deploys** (useful for hotfixes and for previewing without a push):

```bash
cd web
npx vercel --prod    # after `npx vercel link` once
```

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
    "humans": 6,            // 0–12 knowledge workers
    "agents": 3,            // 0–12 AI agents
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
- **No secrets anywhere.** There is no `VERCEL_TOKEN`, no org or project IDs,
  and no repository secrets at all — deploys authenticate through the Vercel
  GitHub App. (The org/project IDs remain in `web/.vercel/project.json` for
  local CLI use, and that file is gitignored.)
- **`main` is protected.** A push must pass the `build` check first — `strict`,
  and enforced against admins too — and force-pushes and deletions are blocked.
  Because Vercel deploys on push to `main`, this protection is what actually
  keeps untested code out of production; Vercel's own Deployment Checks would be
  a second layer, but none are configured on this project and the team is on the
  Hobby plan, so the branch rule is the only gate. To land an emergency
  fix while CI itself is broken, lift the rule, push, then restore it:
  `gh api -X DELETE repos/<owner>/<repo>/branches/main/protection`.
- **Node version:** Vercel builds with Node 24.x while CI pins Node 22. Align them
  if a build ever behaves differently in CI than in production.
- **Rolling back** is a Vercel operation: promote the previous deployment from
  the project's *Deployments* tab. There is no `git revert` dance required.
- **No scheduled jobs, no database, nothing to migrate.** Redeploying is
  always just a rebuild.
