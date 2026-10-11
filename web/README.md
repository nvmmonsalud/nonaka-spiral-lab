# web/ — the Knowledge Spiral Lab app

The Next.js 16 (App Router) + React 19 application. Pure client-side: canvas
simulation, no backend, no API keys.

## Develop

```bash
npm install       # Node.js 22+
npm run dev       # → http://localhost:3000
npm run lint      # eslint
npm run typecheck # tsc --noEmit
npm test          # vitest run
npm run build     # production build (CI runs all four checks)
```

## Where things live

- `src/app/` — routes: `/` (landing), `/simulator`, `/research`; design tokens in `globals.css`
- `src/components/SpiralSimulator.tsx` — the core canvas simulation
- `src/components/ConfigControls.tsx` — Copy link / Export JSON / Import JSON buttons and their status line
- `src/lib/spiral-engine.ts` — the pure SECI model (no React, no canvas)
- `src/lib/sim-config.ts` — share-link and JSON-file codec; the single source of truth for lever bounds
- `src/components/SecQuadrant.tsx` — the SVG SECI quadrant diagram
- `data/presets.json` — simulator presets (see [CONTRIBUTING.md](../CONTRIBUTING.md) to add one)

See the [root README](../README.md) for the project overview and
[DEPLOYMENT.md](../DEPLOYMENT.md) for deployment options.
