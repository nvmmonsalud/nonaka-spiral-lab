# Project Expansion Research: GitHub Repo + Vercel Deploy + Interactive Web App

> Research memo · 2026-08-04 · Companion to the research paper (`results/paper.md`)
> Goal: turn the Nonaka × AI research into a **live, interactive, deployable web app**.

---

## 1. Why this is worth building (the pitch)

The research concluded with a design principle: **"build the spiral, not the answer."** That principle is currently expressed in prose. An interactive web app lets people *feel* it: watch knowledge spiral, stall, and escalate as they tweak organizational conditions. It also gives the project a public face — a GitHub repo + live Vercel URL turns a lab deliverable into a portfolio piece and a teaching tool.

**What doesn't exist yet (our niche):** search shows plenty of academic SECI explainers and Wikipedia-style static diagrams, but no interactive *simulation* of the spiral — and none that incorporate the 2026 "tacit machine knowledge" extension (Chatterji, Rock & Talamàs) or the SECI-as-architecture prescriptions. We'd be first to that space.

---

## 2. The interactive concept: "The Knowledge Spiral Lab" (flagship)

A single-page interactive app with two linked experiences:

### 2a. The Spiral Simulator (the showpiece)
An animated canvas where users **run the knowledge spiral** and watch it live:
- Knowledge "particles" enter at Socialization, convert through Externalization → Combination → Internalization, and **escalate across ontological levels** (individual → group → organization → inter-organization)
- **Controls:** add human experts (tacit knowledge), add AI agents (tacit machine knowledge), tune ba conditions (redundancy, creative chaos, autonomy), toggle machine-transfer portability
- **Failure events:** trigger a "green milk" (context failure) or hallucination (false externalization) — watch the spiral stall or produce corrupted knowledge
- **Presets:** "NotCo mode" (accelerating spiral), "Matsushita mode" (externalization archetype), "Siloed org" (stalls), "AI-native org" (machine-transfer heavy)
- **Outcome:** a spiral score + lessons mapped to the 7 SECI-as-architecture prescriptions

### 2b. The SECI Maturity Assessor (the practical tool)
A self-assessment questionnaire that scores an organization's AI-KM maturity:
- ~24 questions across 6 dimensions: Socialization, Externalization, Combination, Internalization, Ba/shared context, Machine transfer
- **Output:** radar chart + per-dimension scores + personalized recommendations pulled from the research (the 7 prescriptions + the case evidence)
- **Shareable result:** URL-encoded score (no backend needed — localStorage + URL params)

### Why this combination
- The simulator is the *wow* (interactive, animated, teaches the thesis)
- The assessor is the *utility* (real practitioners can use it; drives repeat visits and sharing)
- Both are **pure client-side** → zero backend, zero cost, instant Vercel deploy

---

## 3. Tech stack recommendation

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 16 (App Router)** | Matches caseloop's proven stack; Vercel-native; the AGENTS.md gotchas are already known |
| UI | **React + hand-rolled SVG/canvas** | No heavy chart deps; the SECI quadrant + radar are straightforward hand-authored SVG (same house style as the HTML presentation) |
| Animation | **Canvas 2D or Framer Motion** | Particles + spiral motion; keep it light |
| State | **React context + localStorage** | Simulator state, assessor answers, saved spirals |
| Data | **Static JSON** | The matrix rows, 7 cases, 7 prescriptions, preset configs — all as typed JSON derived from the research docs |
| Styling | **CSS modules / plain CSS** | Reuse the house-style tokens (ivory/clay/olive/rust) for visual continuity with the presentation |
| Deploy | **Vercel** | `vercel link --yes` once, then `vercel --prod --yes` = one-command prod (proven pattern in memory) |

**No backend, no database, no API keys.** The whole app is static-compatible — which is exactly what makes it deploy anywhere and cost nothing.

---

## 4. GitHub repo plan

```bash
# Repo: nonaka-spiral-lab (public, portfolio-worthy)
gh repo create nonaka-spiral-lab --public --source ~/projects/lab/nonaka-ai-knowledge-creation --push

# Repo structure
nonaka-spiral-lab/
├── app/                    # Next.js App Router
│   ├── page.tsx            # landing + hero (thesis statement)
│   ├── simulator/          # The Spiral Simulator route
│   ├── assessor/           # The Maturity Assessor route
│   └── research/           # Paper + matrix + cases as readable pages
├── components/
│   ├── spiral/             # canvas simulation, controls, presets
│   ├── assessor/           # questionnaire, radar chart, recommendations
│   └── shared/             # SECI quadrant SVG, cards, pills
├── data/                   # JSON: matrix.json, cases.json, prescriptions.json, presets.json
├── public/                 # OG image, favicon
├── README.md               # thesis, live URL, screenshots, run instructions
└── LICENSE                 # MIT (research is MIT-friendly)
```

**Git hygiene:** the repo lives at `~/projects/lab/nonaka-ai-knowledge-creation/` (git init inside the existing project dir, keep the research docs in-repo as content source). Add `.gitignore` (node_modules, .next), commit the research docs as `docs/` so the app's content is version-controlled with its source.

---

## 5. Vercel deploy plan

```bash
cd ~/projects/lab/nonaka-ai-knowledge-creation
vercel link --yes                          # one-time: links to nvmmonsalud1984
vercel --prod --yes                        # one-command production deploy
# → https://nonaka-spiral-lab.vercel.app (stable alias, per memory pattern)
```

- **Framework preset:** Next.js auto-detected
- **Env vars:** none needed (pure client-side)
- **Preview deploys:** automatic per branch once GitHub is connected (Vercel ↔ GitHub integration is already available in the account)
- **Domain:** can add a custom domain later; the `*.vercel.app` alias is stable

**Alternative (simpler):** if we want *zero* framework — a static single-file HTML app (like the presentation) can also deploy to Vercel in one command and serve from `public/`. Next.js gives us routing + a cleaner app feel; static HTML gives us the fastest possible path. Recommendation: **Next.js** for the portfolio-grade app.

---

## 6. Build plan (phases)

| Phase | Deliverable | Est. effort |
|-------|-------------|-------------|
| 0 | Scaffold Next.js app in the project dir; git init; `.gitignore` | 30 min |
| 1 | Data layer: extract matrix/cases/prescriptions/presets from research into typed JSON | 1 h |
| 2 | SECI quadrant component + landing page (house style) | 1 h |
| 3 | Spiral Simulator: particle animation, controls, presets, failure events | 3–4 h |
| 4 | Maturity Assessor: questionnaire, radar chart, recommendations, shareable URL | 2–3 h |
| 5 | Research pages (paper, matrix, cases rendered from data) | 1 h |
| 6 | GitHub repo + Vercel deploy + live URL + README polish | 45 min |
| 7 | QA pass (browser test all routes, check responsive, verify deploy) | 45 min |

**Total ≈ 1.5–2 focused days**, or compressible if we ship the simulator first and the assessor as v2.

---

## 7. Risks & decisions

| Risk | Mitigation |
|------|-----------|
| Next.js 16 breaking changes (per caseloop AGENTS.md) | Read `node_modules/next/dist/docs/` before coding; follow the repo's own gotchas |
| Animation perf on low-end devices | Canvas 2D, cap particle counts, `requestAnimationFrame` throttling |
| Scope creep (two experiences) | Ship simulator first (flagship), assessor as fast-follow |
| Research content licensing | All sources cited; app content is our own synthesis (MIT) |

**Open decision for the user:** ship both experiences in v1, or simulator-first? And repo name — `nonaka-spiral-lab` vs something punchier (`spiral-lab`, `knowledge-spiral`, `build-the-spiral`)?

---

## 8. Recommendation

**Build "The Knowledge Spiral Lab" as a Next.js 16 app, public GitHub repo, deployed to Vercel — simulator first, assessor second, research docs in-repo as the content source.** It's the first interactive implementation of the extended nine-movement SECI model, it's portfolio-grade, and the pure-client-side architecture means it deploys in one command and costs $0 to run.
