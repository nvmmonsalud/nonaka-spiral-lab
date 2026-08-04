# The Knowledge Spiral Lab — SECI × AI

**Build the spiral, not the answer.**

An interactive simulation of Nonaka & Takeuchi's SECI model (Socialization →
Externalization → Combination → Internalization) extended with **tacit machine
knowledge** — the 2026 insight from Chatterji, Rock & Talamàs that AI introduces
a third kind of knowledge that is portable at software speed.

## Live

- **App:** https://nonaka-spiral-lab.vercel.app
- **Simulator:** run knowledge through the spiral, tune ba conditions, watch it escalate or stall
- **Research:** the matrix, seven real-world cases, and the SECI-as-architecture design principle

## The interactive simulator

Choose a preset — NotCo's accelerating human-machine spiral, the siloed org that
stalls, the green-milk context failure — then tune the levers:

| Lever | What it does |
|-------|--------------|
| Humans / AI Agents | Population of knowledge carriers |
| Ba · Redundancy | Shared meaning; low = green-milk failures |
| Ba · Creative chaos | Turbulence; very high = regression to socialization |
| Ba · Autonomy | Self-organization |
| Feedback loop | Returns human judgment to the machine (the NotCo pattern) |
| Machine transfer | Agent knowledge crosses boundaries without articulation |
| Hallucination risk | Agents produce false externalization |

- Green particles = human knowledge · Orange = agent (machine) knowledge
- Red = corrupted (false externalization) · Dashed ring = level 3+ knowledge
- Each full SECI cycle escalates one ontological level (individual → group → org → inter-org)

## Research

The app is grounded in a full research paper: *Knowledge Creation in the Age of
LLMs and Agentic AI: Revisiting Nonaka & Takeuchi's SECI Model* (6,000+ words,
30 sources, 7 real-world cases). Key results:

- Only **Combination** is industrialized by AI; the rest are emerging
- **Hallucination = false externalization** — legal 6.4% vs general 0.8% hallucination rates
- **Shared context (digital Ba) is the scarce resource** — 5× agent accuracy with unchanged model and data
- The design principle: **7 prescriptions for agentic KM systems** — build the spiral, not the answer

## Tech

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript
- Pure client-side — canvas simulation, no backend, no database, no API keys
- House-style design system (ivory/clay/olive/rust tokens)

## Run locally

```bash
cd web
npm install
npm run dev
# → http://localhost:3000
```

## Repo structure

```
├── web/                    # Next.js app
│   ├── src/app/            # routes: /, /simulator, /research
│   ├── src/components/     # SpiralSimulator (canvas), SecQuadrant (SVG)
│   └── data/presets.json   # simulator presets
├── research/               # source registry + expansion research
├── results/                # paper, theory brief, matrix, case studies
└── artifacts/              # standalone HTML presentation
```

## License

MIT
