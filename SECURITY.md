# Security Policy

## Scope

The Knowledge Spiral Lab is a pure client-side web application: no backend, no
database, no API keys, and no user data collection. The realistic attack
surface is limited to:

- Cross-site scripting via rendered content (e.g. preset data)
- Supply-chain issues in npm dependencies or GitHub Actions
- The build and deploy pipeline: pushes to `main` deploy to production through
  Vercel's Git integration, which authenticates via the Vercel GitHub App. No
  deploy token is stored in GitHub Actions, and no application secrets exist.
  Preview deployments for branches are publicly readable, which is acceptable
  while the repository and all simulated data are public — revisit if private
  presets or credentials are ever added.

## Supported versions

Only the latest code on `main` (and the live deployment at
https://nonaka-spiral-lab.vercel.app) is supported.

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Instead, use
GitHub's private vulnerability reporting:

1. Go to the repository's **Security** tab
2. Click **Report a vulnerability**
3. Describe the issue, impact, and reproduction steps

You can expect an initial response within a week. Once a fix ships, the report
will be credited (unless you prefer to remain anonymous).

## Known accepted risks

- **`minimatch` below 11.0.1 (moderate, build-time only).** Reached through
  ESLint's config loader (`^3.1.5`) and `@typescript-eslint/typescript-estree`
  (`^10.2.2`). The patched release is 11.0.1, which sits outside both parents'
  ranges. Remediation therefore needs compatible releases from each consumer —
  an ESLint major whose bundled plugins also support it is one, and
  `typescript-eslint` is a separate consumer with its own dependency — not a
  version bump. Forcing `minimatch@11`
  onto consumers written against v3 is a breakage, not a fix. Reaching the
  vulnerable path requires attacker-controlled glob patterns during lint, which
  means changing lint configuration; that is governed by the same review
  boundary as any other build change, not by dependency classification alone.
- **Dev dependencies carry advisories; the shipped bundle does not.**
  `npm audit --omit=dev` reports zero. The application ships only `next`,
  `react` and `react-dom`; everything else is build and lint tooling.
