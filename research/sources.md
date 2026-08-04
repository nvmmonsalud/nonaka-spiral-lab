# Source Registry — Nonaka × AI Knowledge Creation

> Discovery sweep 2026-08-04. Evidence labels: **[PRIMARY]** = canon/first-party academic,
> **[SECONDARY]** = review/commentary, **[CASE]** = real-world use case, **[PRODUCT]** = vendor/practice.

## A. Core theory (the canon)

| Source | Type | Why it matters |
|--------|------|----------------|
| Nonaka, I. (1994). *A Dynamic Theory of Organizational Knowledge Creation.* Organization Science 5(1). | [PRIMARY] | The foundational paper: SECI, knowledge spiral, tacit/explicit |
| Nonaka & Takeuchi (1995). *The Knowledge-Creating Company.* Oxford UP. | [PRIMARY] | The book — Matsushita home-bakery case, the archetype |
| Nonaka, Toyama & Konno (2000). *SECI, Ba and Leadership.* Long Range Planning 33(1), 5–34. | [PRIMARY] | Ba concept formalized |
| Nonaka & Konno (1998). *The Concept of "Ba": Building a Foundation for Knowledge Creation.* California Management Review. | [PRIMARY] | Ba origins |
| Nonaka & von Krogh (2009). *Tacit Knowledge and Knowledge Conversion.* Organization Science 20(3), 635–652. | [PRIMARY] | Response to critiques; tacit↔explicit continuum |
| Polanyi, M. (1966). *The Tacit Dimension.* | [PRIMARY] | "We know more than we can tell" — the load-bearing wall |
| Gourlay (2006). *Conceptualizing Knowledge Creation: A Critique of Nonaka's Theory.* JMS. | [SECONDARY] | Known weak points (empirical support, linearity) |
| Wikipedia: SECI model of knowledge dimensions | [SECONDARY] | Overview + critiques (linearity question) |
| CIO Wiki: SECI Model of Knowledge Creation | [SECONDARY] | Practitioner-oriented overview |
| ASCN: SECI model change theory page | [SECONDARY] | Educational summary w/ proper citations |

## B. AI × SECI academic literature (the new wave)

| Source | Type | Why it matters |
|--------|------|----------------|
| **Chatterji, Rock & Talamàs (2026). *The Human-Machine Knowledge Spiral.* arXiv 2606.29227** | [PRIMARY] | **THE anchor paper.** Introduces *tacit machine knowledge* — a third kind beyond tacit/explicit. Adds 5 movements to Nonaka's 4 modes. NotCo/Giuseppe case. Argues Nonaka "more relevant than ever" — shared context = the knowledge-creating company's role. |
| Matsumoto, Nishikawa & Morimoto (2025). *Human-AI-Collaboration SECI (HAC-SECI) Model.* Tokyo Univ of Science. | [PRIMARY] | Dual-loop: Inner (Agent Growth) + Outer (Target Development) — AI as participant in knowledge creation |
| Uchihira (2026). *Tacit Knowledge Management with Generative AI: Proposal of the GenAI SECI Model.* | [PRIMARY] | GenAI-specific SECI extension |
| Böhm & Durst (2026). *Knowledge Management in the Age of Generative AI: From SECI to GRAI.* | [PRIMARY] | SECI → GRAI evolution |
| Kirchner & Scarso (2026). *Revisiting the SECI Model: The Impact of Generative AI on Organizational Knowledge Creation.* Springer, pp. 105–125. | [PRIMARY] | Direct revisit of SECI under GenAI |
| He et al. (2026). *Revisiting Ba: How Generative AI Transforms Knowledge Creation.* | [PRIMARY] | Ba in the AI age — directly our question |
| Yan, Husted & Fath. *Transforming Organizational Knowledge Creation Through AI: A Systematic Review.* ScienceDirect (82 articles, open access). | [SECONDARY] | Systematic review → 5 propositions on AI×SECI |
| Sanzogni et al. (2017). *AI and Knowledge Management: Questioning the Tacit Dimension.* | [SECONDARY] | Early AI × tacit dimension question |
| Sumbal & Amber (2025). *ChatGPT: A Game Changer for Knowledge Management.* | [SECONDARY] | LLM-as-KM-tool view |
| van den Bent, Pernisch & Schlobach. *Investigating Knowledge Elicitation Automation with LLMs.* Semantic Web Journal swj3868. | [PRIMARY] | LLM vs human-expert interviews → ontology creation (externalization test!) |
| Industry-Science (2026). *Reinterpret Corporate Tacit Knowledge Using LLMs.* | [CASE] | LLM tacit-knowledge elicitation study; ChatGPT-5 potential + lack of logic check |
| *Requirements Elicitation Follow-Up Question Generation.* arXiv 2507.02858 | [SECONDARY] | LLM interview question generation (externalization machinery) |
| *LLM Hallucination: A Comprehensive Survey.* arXiv 2510.06265 | [SECONDARY] | Hallucination = false externalization risk |
| *Self-Improving AI Coding Agents Through Accumulated Behavioral Rules.* arXiv 2607.13091 | [PRIMARY] | Coding agents + organizational memory: persistent knowledge artifact from review outcomes |
| SIGPLAN Blog (2026). *Repositories Are Human/Agent Knowledge Factories.* | [CASE] | Docs hierarchy for agents (AGENTS.md) — externalization of repo knowledge |
| Gloaguen et al. (2026) [via SIGPLAN] | [SECONDARY] | Boilerplate context can hurt agents — knowledge quality > quantity |

## C. Real-world / enterprise cases

| Source | Type | Why it matters |
|--------|------|----------------|
| NotCo / Giuseppe (via arXiv 2606.29227) | [CASE] | THE flagship human-machine knowledge spiral: green-milk failure → feedback loop → NotMilk (pineapple+cabbage) → $1.5B valuation |
| Matsushita home bakery (Nonaka & Takeuchi 1995) | [CASE] | The classic tacit→explicit archetype to revisit with AI |
| Acuvate. *21 Real-World Agentic AI Examples.* | [CASE] | Customer support, IT service desk, enterprise knowledge agents |
| Adobe. *Agentic AI Use Cases.* | [CASE] | E-commerce, HR, finance agentic workflows |
| MIT Sloan. *Agentic AI, Explained* (Sinan Aral). | [SECONDARY] | JPMorgan (fraud, loan approvals), Walmart (shopping agents) — enterprise scale |
| Shelf.io. *AI Knowledge Management: The Secret Weapon of Enterprise AI.* | [PRODUCT] | AI-native KM: semantic tags, quality scoring, agent-consumable structure |
| Atlan. *Agent Context Layer vs Knowledge Base.* | [PRODUCT] | Shared context substrate for multi-agent systems = digital Ba |
| Microsoft Fabric IQ. *The Shared Context Layer for AI Agents.* | [PRODUCT] | Ontologies, Digital Twin, Graph — Microsoft's shared-context play |
| Augment Code. *Cross-Agent Organizational Memory.* | [PRODUCT] | Persistent governed memory across agents; Stripe/Ramp/Uber agentic SDLC |
| Tamir Dresher. *Designing Memory for AI Agent Squads.* | [CASE] | Memory ≠ documentation; knowledge taxonomy (stable/decision/operational/ephemeral); "synthetic folklore" risk |
| Gunnar Östberg (Medium). *Make Tacit Knowledge Work for AI.* | [SECONDARY] | Externalization methods: facilitation, storytelling, observation, interviews; KG modeling |
| Glean. *Understanding LLM Hallucinations in Enterprise.* | [PRODUCT] | Hallucination rates by domain (legal 6.4% vs general 0.8%) — trust risk for externalization |
| OWASP LLM09:2025 (via A10). *LLM Hallucination & Misinformation.* | [SECONDARY] | Hallucination taxonomy + mitigation (RAG, fine-tuning) |
| Zendesk AI / Hyland Enterprise Agent Mesh / OneReach | [PRODUCT] | KM for agent consumption across platforms |

## D. Key concepts to track (working vocabulary)

- **Tacit machine knowledge** — machines "know more than they can tell"; portable, scaleable, opaque (Chatterji et al. 2026)
- **Five new spiral movements** — human→machine, machine→human, + machine→machine (the 5th: machine-to-machine portability)
- **HAC-SECI** — dual-loop human-AI collaboration model
- **GRAI** — SECI evolution for generative AI (Böhm & Durst)
- **Digital Ba / shared context layer** — Fabric IQ, Atlan, agent context layers
- **False externalization** — hallucination as fabricated explicit knowledge
- **Knowledge ossification** — explicit knowledge frozen in agents/docs, spiral stalls
- **Agent memory taxonomy** — stable / decision / operational / ephemeral (Dresher)
- **"Synthetic folklore"** — agent memory that drifts from ground truth

## Gaps to fill (subagent tasks)

1. Deep-dive the HAC-SECI / GenAI SECI / GRAI / Revisiting-Ba papers (abstracts + key claims)
2. Map each SECI quadrant to concrete AI capabilities with evidence
3. Collect 6–8 real-world cases across industries with sources
