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
4. Leave **Production Branch** as `main`. Pushes to `main` deploy to production;
   other branches get preview deployments when they push and the build succeeds
   (failed builds, and fork PRs awaiting approval, do not).

No repository secrets are needed — the integration authenticates through the
Vercel GitHub App, not a token.

> **Vercel does not wait for CI.** It runs its own `next build`, so a commit that
> does not compile never publishes — but Vercel never runs your lint or tests, so
> a commit whose tests fail would ship if it reached `main`. What stops that is
> GitHub's rule on `main` (see *Operational notes*), not Vercel.
>
> Know the limit of that rule: it binds the check named `build` to the GitHub
> Actions app, not to the contents of this repository's workflow. A change to
> `ci.yml` or `package.json` can redefine what "passing" means, so those edits
> need review on their own — the rule prevents accidental unverified updates, not
> a determined writer.

**Manual deploys are break-glass, not routine.** `npx vercel --prod` publishes
whatever is in your working tree — uncommitted edits, a feature branch, anything
— and bypasses the `main` rule entirely. If you use it, deploy an identified
checked commit and nothing else:

```bash
cd web
git switch main && git pull --ff-only   # a checked, known-good commit
git status --porcelain                  # must print nothing
npx vercel --prod                       # after `npx vercel link` once
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
- **No GitHub Actions deployment secrets.** No `VERCEL_TOKEN` and no repository
  secrets are configured or required — deploys authenticate through the Vercel
  GitHub App. The project/org IDs in `web/.vercel/project.json` are non-secret
  metadata for local CLI use, and that file is gitignored.
- **`main` is protected.** An update must pass the `build` check first — `strict`,
  enforced against admins too — and force-pushes and deletions are blocked. This
  is what stops unverified code from reaching production through the normal push
  path; Vercel's own Deployment Checks would be a second layer, but none are
  configured on this project. The rule is not independent review: see the caveat
  in Option 2 about workflow and dependency edits.
- **Break-glass procedure.** If production is broken, roll back in Vercel first
  (below) rather than bypassing the rule. If a push really is required while CI
  itself is down, save the rule before lifting it and restore it immediately —
  an interrupted break-glass leaves `main` unprotected and Vercel will publish
  whatever lands:

  ```bash
  REPO=owner/name
  gh api repos/$REPO/branches/main/protection > /tmp/protection.json   # save
  gh api -X DELETE repos/$REPO/branches/main/protection                # lift
  #   ... push the emergency commit ...
  gh api -X PUT repos/$REPO/branches/main/protection --input /tmp/protection.json
  gh api repos/$REPO/branches/main/protection                          # confirm
  ```
- **Node version:** CI and Vercel both build on Node 24. Keep them in step — CI
  validating a different runtime than production is how a green check lies.
- **Rolling back** is a Vercel operation: promote the previous deployment from
  the project's *Deployments* tab. There is no `git revert` dance required.
- **No scheduled jobs, no database, nothing to migrate.** Redeploying is
  always just a rebuild.
