# Contributing to the Knowledge Spiral Lab

Thanks for your interest in improving the Knowledge Spiral Lab — an interactive
simulator of Nonaka & Takeuchi's SECI model extended for the age of AI agents.
Try it live at https://nonaka-spiral-lab.vercel.app.

By participating you agree to our [Code of Conduct](CODE_OF_CONDUCT.md).

## Development setup

You need Node.js 22+. All app code lives in `web/`:

```bash
cd web
npm install
npm run dev
# → http://localhost:3000
```

Before pushing, run the same checks CI runs:

```bash
npm run lint
npm run typecheck
npm run build
```

## Ways to contribute

### 1. Submit a simulator preset (no coding required)

Presets are real-world organizational scenarios run through the spiral — the
lowest-barrier and most-wanted contribution. Two routes:

- **No code:** open a [preset proposal issue](https://github.com/nvmmonsalud/nonaka-spiral-lab/issues/new?template=simulator-preset.yml)
  with the scenario and parameter values.
- **Direct PR:** add an entry to [`web/data/presets.json`](web/data/presets.json)
  following the existing schema (`id`, `name`, `tagline`, `icon`, `description`,
  and an `initial` block with the eight simulation parameters).

Conventions for presets:

- Every preset must model a **real-world case** (a company, team, or documented
  organizational pattern) and cite it in the description or the accompanying
  issue/PR — see `research/expansion-research.md` for how existing presets are
  grounded.
- Accepted presets are credited in [CONTRIBUTORS.md](CONTRIBUTORS.md).

### 2. Report bugs and propose features

Use the [issue forms](https://github.com/nvmmonsalud/nonaka-spiral-lab/issues/new/choose).
For larger features, please open an issue to discuss before writing code.
Good entry points are labeled
[`good first issue`](https://github.com/nvmmonsalud/nonaka-spiral-lab/labels/good%20first%20issue).

### 3. Improve the research corpus

The app is grounded in the papers under `research/` and `results/`. Corrections,
additional sources, and new case studies are welcome — cite your sources.

## Pull request process

1. Fork the repo and create a branch from `main`.
2. Make your change; keep PRs small and focused.
3. Ensure `lint`, `typecheck`, and `build` pass locally — CI runs the same
   checks on every PR and must be green.
4. Open a PR against `main`. The maintainer ([@nvmmonsalud](https://github.com/nvmmonsalud))
   reviews all external PRs. (The maintainer may push directly to `main`;
   external contributions always go through PRs.)

## Code style

- TypeScript strict mode; the ESLint config in the repo is the source of truth.
- Follow the existing patterns in `web/src/components/` — in particular,
  `SpiralSimulator.tsx` keeps live simulation values in refs so the
  `requestAnimationFrame` loop runs without re-rendering; preserve that split.
- Styling uses the design tokens in `web/src/app/globals.css`
  (ivory/clay/olive/rust palette) — reuse tokens, don't hardcode colors.
- **No new runtime dependencies without prior discussion.** The app is
  deliberately dependency-light (`next`, `react`, `react-dom` only) and fully
  client-side — no backend, no API keys.

## Questions?

Open a thread in [GitHub Discussions](https://github.com/nvmmonsalud/nonaka-spiral-lab/discussions).
