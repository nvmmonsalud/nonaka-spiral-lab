# Nonaka × AI: Knowledge Creation in the Age of LLMs & Agentic AI

> **Lab project:** Re-examining Ikujiro Nonaka & Hirotaka Takeuchi's knowledge-creation
> theory (SECI model, Ba, knowledge spiral, tacit/explicit knowledge) in the age of
> LLMs, AI, and agentic AI — and mapping its real-world applications and use cases.
> Created: 2026-08-04

## Why this project

Nonaka & Takeuchi's *The Knowledge-Creating Company* (1995) and the SECI model
(Socialization → Externalization → Combination → Internalization) remain the
canonical theory of how organizations create knowledge — but it was built for a
world where humans did all the knowledge work. LLMs now externalize, combine, and
internalize knowledge at machine scale; agentic AI acts as a knowledge worker;
and "Ba" (shared context for knowledge creation) is increasingly digital and
hybrid. This project asks: **does SECI still explain how knowledge is created —
and does it tell us how to build AI systems that create it better?**

## Core theory anchor (what we're testing)

| SECI quadrant | Direction | Classic mechanism | The question AI raises |
|---|---|---|---|
| **Socialization** | tacit → tacit | Apprenticeship, shadowing, shared experience | Can AI-mediated shared context (transcripts, copilots, agent memory) substitute for physical co-presence? |
| **Externalization** | tacit → explicit | Dialogue, metaphors, models — articulating know-how | Can LLMs *elicit* tacit knowledge (Socratic interviews, expert digital twins) better than humans? |
| **Combination** | explicit → explicit | Documents, databases, meetings, synthesis | The most mature AI quadrant: RAG, knowledge graphs, semantic search — what's the ceiling? |
| **Internalization** | explicit → tacit | Learning by doing, embodiment | Do AI tutors / simulators / copilot-assisted practice actually build tacit skill? |
| **Ba** | the platform | Shared space (physical/virtual/mental) where knowledge conversion happens | What is Ba when half the "members" are agents? |

Polanyi's "we know more than we can tell" is the load-bearing wall: the deepest
test is whether LLMs can externalize what was never articulated — the Matsushita
home-bakery case (kneading skill → bread machine) is the archetype to revisit.

---

## Research phases

### Phase 0 — Foundations (primary sources)
Read & capture the canon:
- Nonaka (1994), *A Dynamic Theory of Organizational Knowledge Creation* (Organization Science)
- Nonaka & Takeuchi (1995), *The Knowledge-Creating Company*
- Nonaka, Toyama & Konno (2000), *SECI, Ba and Leadership: a Unified Model of Dynamic Knowledge Creation*
- Polanyi (1966), *The Tacit Dimension* — the philosophical bedrock
- Modern KM critiques: is SECI still empirically supported? (e.g. Gourlay, 2006 critique)

**Output:** `results/theory-brief.md` — the model, its claims, and its known weak points.

### Phase 1 — LLM-era capability mapping (the intellectual core)
Map each SECI quadrant + Ba against what current AI/agentic systems actually do:
- **Externalization:** expert-knowledge elicitation via LLM interviews; documentation
  copilots; "explain your process" agents; the home-bakery question: can an agent
  extract the tacit rule a human can't state?
- **Combination:** RAG, enterprise search (Glean/Notion AI/Copilot M365), knowledge
  graphs, auto literature synthesis — measure the maturity gap vs Externalization
- **Internalization:** adaptive tutors, simulated practice, copilot-assisted learning
  — does tool-assisted learning build durable skill or dependency?
- **Socialization:** meeting copilots, team memory, shared agent context, VR presence
- **Ba → digital Ba:** hybrid human-agent workspaces, agent memory as organizational
  memory, multi-agent systems as knowledge-creating ecosystems

**Output:** `results/secai-ai-matrix.md` — quadrant × AI-capability × maturity × evidence.

### Phase 2 — Agentic AI as knowledge workers (the frontier)
- Autonomous research/coding agents that externalize via commits, PRs, docs, memos
- Multi-agent systems (orchestrator + workers) mirroring SECI flows
- Agent memory (long-term, episodic, semantic) as a *knowledge asset* in Nonaka's taxonomy
- Where agents create genuinely *new* organizational knowledge vs. recombine existing

**Output:** `results/agentic-frontier.md`.

### Phase 3 — Real-world applications & use cases
Grounded case studies across industries:
- **Consulting / professional services** — expert-knowledge capture, KM platforms (the classic SECI users, now AI-augmented)
- **Software orgs** — coding agents as externalization engines; docs/PRs as knowledge artifacts
- **R&D / science** — literature synthesis, lab-notebook AI, hypothesis generation
- **Healthcare** — clinical tacit knowledge capture, decision support
- **Education / training** — internalization at scale
- **Manufacturing / ops** — the home-bakery legacy: tacit skill → machine rule, AI edition

Each case: the SECI pattern it instantiates, the AI system involved, evidence, and gaps.

**Output:** `results/case-studies.md`.

### Phase 4 — Synthesis, critique & implications
- What SECI still explains; what the AI age breaks (tacit→explicit at scale may erode
  the tacit base; hallucination as *false externalization*; knowledge ossification)
- Design implications: how to build agentic systems that *respect the spiral* —
  externalize → combine → internalize → socialize, not just answer
- A proposed framework: "SECI-as-architecture" for agentic KM systems

**Output:** `results/synthesis.md` → feeds the main deliverable(s).

---

## Deliverables

**Locked:** 1. **Full research paper** — complete treatment with citations (primary:
Nonaka canon, Polanyi; secondary: modern KM + agentic AI literature; evidence:
real product/case references). ~4,000–6,000 words + bibliography.

**Optional add-ons later** (not scheduled unless requested): executive summary,
presentation deck, case-study catalog, SECI-as-architecture framework artifact.

---

## Execution plan (convergence-research workflow)

Follows the `ai-research-assistant` convergence pattern: plan-first → discovery
sweep → main-agent writes overview → 3 parallel deep-dive subagents → verify →
synthesize.

```bash
# 1. Discovery sweep (this session): web search + arXiv for
#    "SECI model AI", "Nonaka knowledge creation LLM", "tacit knowledge agents"
# 2. Three parallel subagents (delegate_task batch, max 3):
#    A. Theory foundations — SECI, Ba, spiral, Polanyi, critiques
#    B. AI capability mapping — quadrant × LLM/agent evidence, product examples
#    C. Real-world cases — industry use cases with sources
# 3. Parent synthesizes overview + matrix; subagent outputs verified from disk
# 4. Findings distilled into deliverables
```

**Tools:** `ai-research-assistant` skill (web + arXiv), Bing News RSS fallback
(memory note), `delegate_task` batch, `session_search` for prior KM sessions.

---

## Directory layout

```
nonaka-ai-knowledge-creation/
├── PLAN.md              # this file
├── README.md            # pointer + status
├── research/            # raw sources, notes, discovery sweep
│   └── sources.md       # source registry with URLs + evidence labels
├── results/             # phase outputs + final deliverables
└── artifacts/           # framework pattern, prompts, reusable assets
```

## Sequence & effort

```
Phase 0 (1–2h) → Phase 1 (2–3h) → Phase 2 (1–2h) → Phase 3 (2–3h, parallel) → Phase 4 (1–2h)
→ deliverables (1–3h)
```
Roughly **1.5–2 focused days** total, compressible: Phase 0+1 can merge if the
canon is captured fast; Phases 2–3 run as parallel subagent tracks.

## Status

- [ ] Phase 0 — theory brief
- [ ] Phase 1 — SECI × AI capability matrix
- [ ] Phase 2 — agentic frontier
- [ ] Phase 3 — case studies
- [ ] Phase 4 — synthesis + framework
- [ ] Deliverables picked & produced
