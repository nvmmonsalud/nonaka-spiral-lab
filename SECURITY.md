# Security Policy

## Scope

The Knowledge Spiral Lab is a pure client-side web application: no backend, no
database, no API keys, and no user data collection. The realistic attack
surface is limited to:

- Cross-site scripting via rendered content (e.g. preset data)
- Supply-chain issues in npm dependencies or GitHub Actions
- The CI/CD pipeline (Vercel deploy secrets are stored as GitHub repository
  secrets and are never exposed to pull requests from forks)

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
