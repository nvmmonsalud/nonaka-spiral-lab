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

## Dependency advisory mitigation

- **`minimatch` GHSA-g3hv-75wg-m249 (moderate, build-time only).**
  `npm ci` runs `web/scripts/patch-minimatch.mjs`, backporting the expansion limit
  and large-set comparison guard from
  [upstream commit 77a0f5c](https://github.com/isaacs/minimatch/commit/77a0f5c)
  to both the CommonJS and ESM entry points of the installed minimatch 10.2.6.
  The default expansion limit is lowered from upstream's 100,000 to 1,000:
  compiling 100,000 generated patterns still consumed excessive memory in the
  regression test. Explicit `braceExpandMax` options retain upstream behavior.
  Source hashes and installed versions are checked; an unexpected dependency
  update fails installation and requires reassessment. Tests exercise the installed
  entry points with hostile patterns in time- and memory-limited subprocesses.
  Minimatch 3.1.5, used by ESLint and its plugins, has no affected
  `firstPhasePreProcess` implementation and does not need this backport.
  Registry audits still flag both versions because they cannot see local patches
  and the advisory's range includes v3. Do not suppress the audit or force v11
  onto v3 consumers. Remove the backport once compatible upstream consumers use
  a patched release. Installs with `--ignore-scripts` do not apply the mitigation;
  run `node scripts/patch-minimatch.mjs` from `web/` before using tooling in that case.
- **Dev dependencies carry advisories; the shipped bundle does not.**
  `npm audit --omit=dev` reports zero. The application ships only `next`,
  `react` and `react-dom`; everything else is build and lint tooling.
