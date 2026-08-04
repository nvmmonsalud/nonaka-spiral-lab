# Knowledge Creation in the Age of LLMs and Agentic AI: Revisiting Nonaka & Takeuchi's SECI Model

**Research paper — Nonaka × AI Knowledge Creation project**
*Lab workspace: `~/projects/lab/nonaka-ai-knowledge-creation/` · August 2026*

---

## Abstract

Ikujiro Nonaka and Hirotaka Takeuchi's theory of organizational knowledge creation — the SECI model (Socialization, Externalization, Combination, Internalization), the knowledge spiral, and *ba* — was built for a world in which humans performed all knowledge work. This paper asks whether the theory still explains how organizations create knowledge when large language models (LLMs) and agentic AI participate in that work, and whether it can guide the design of AI systems that create knowledge rather than merely answer questions. Drawing on the canonical literature (Nonaka 1994; Nonaka & Takeuchi 1995; Nonaka, Toyama & Konno 2000; Polanyi 1966), the emergent academic literature on AI and knowledge creation (Chatterji, Rock & Talamàs 2026; Matsumoto et al. 2025; Böhm & Durst 2026; Kirchner & Scarso 2026; Uchihira 2026), systematic review evidence (Yan, Husted & Fath 2026), and seven grounded real-world cases (NotCo, Matsushita, coding agents, enterprise agentic AI, AI-native KM platforms, LLM tacit elicitation, Khanmigo), we argue that SECI survives — and is amplified — in the AI age, but only if the model is extended. Artificial intelligence introduces a third kind of knowledge — *tacit machine knowledge* — that is portable at software speed yet opaque even to its builders. This adds five movements to Nonaka's four modes of conversion, and reframes the knowledge-creating company's central role as the provision of *shared context* — now a digital, governed, engineerable substrate rather than an organizational accident. We synthesize these findings into a prescriptive design principle — *SECI-as-architecture* — for building agentic knowledge-management systems that respect the spiral rather than short-circuit it.

**Keywords:** SECI model, Nonaka, tacit knowledge, explicit knowledge, knowledge spiral, ba, large language models, agentic AI, organizational knowledge creation, tacit machine knowledge

---

## 1. Introduction

In 1985, Matsushita Electric set out to build a bread-making machine that could reproduce the work of a professional baker. The project team's problem was not mechanical but epistemological: the know-how that mattered — how to knead dough — was tacit, embodied in the hands of bakers who could not articulate it. The team's software developer, Ikuko Tanaka, apprenticed herself to the head baker of the Osaka International Hotel, internalized the skill, and was then able to name it: the secret was "twist and stretch." That moment became the archetype of *externalization* in the most influential theory of organizational knowledge creation ever produced (Nonaka & Takeuchi 1995).

Thirty-five years later, the bread machine's descendants are fundamentally different. Today's "kneading" is performed by large language models that propose plant-based milk formulas, write production code, answer customer inquiries, and tutor students — machines that learn from data and, in a sense that this paper takes seriously, *know more than they can tell*. Artificial intelligence has introduced a new object into the knowledge-creating company: tacit machine knowledge (Chatterji, Rock & Talamàs 2026). And the company itself has changed: agents now participate in the very processes — articulation, combination, internalization — that Nonaka described as distinctively human.

This paper asks three questions:

1. **Does SECI still explain organizational knowledge creation when agents are knowledge workers?**
2. **Can LLMs externalize tacit knowledge — the "we know more than we can tell" problem — or only recombine what is already explicit?**
3. **What is *ba* — the shared context for knowledge creation — when its participants include agents?**

Our method is synthetic: we reconstruct the theory (Section 2), extend it with the concept of tacit machine knowledge (Section 3), map each SECI quadrant against contemporary AI capability with maturity assessments (Section 4), test the extended model against seven real-world cases (Section 5), and extract a prescriptive design principle for agentic knowledge systems (Section 6). Section 7 concludes.

The paper's central thesis, in one sentence: **Nonaka's insights are more relevant than ever, but only if the spiral is extended to include machines — and the knowledge-creating company's job becomes the engineering of shared context for two species of knower.**

---

## 2. The theory: SECI, the spiral, and ba

### 2.1 Tacit and explicit knowledge

The theory's load-bearing wall is Michael Polanyi's (1966) observation that "we can know more than we can tell." Tacit knowledge is personal, context-specific, and deeply embodied — acquired through practice rather than instruction. Nonaka & Takeuchi (1995) distinguish a *technical* dimension (the craftsman's know-how, Gilbert Ryle's "knowing how") and a *cognitive* dimension (mental models, beliefs, schemata that shape perception). Explicit knowledge, by contrast, can be codified and transmitted in formal, systematic language: documents, formulas, specifications, databases.

Two qualifications matter. First, Nonaka's definition of knowledge is deliberately non-cartesian: knowledge is "a dynamic human process of justifying personal belief toward the 'truth'" (Nonaka & Takeuchi 1995, p. 58). The emphasis falls on *justification* — belief warranted through social interaction. Second, Nonaka & von Krogh (2009) later recast the tacit/explicit distinction as a *continuum* rather than a dichotomy: knowledge moves along it through conversion, expression, and embodiment. This refinement is the theoretical wedge that makes LLM-based externalization plausible at all — if tacit knowledge is not an all-or-nothing category, then *some* portion of it can always be articulated (Section 4.2).

### 2.2 The four modes of SECI

The acronym SECI names four modes through which tacit and explicit knowledge convert into one another:

| Mode | Direction | Characteristic process | Output knowledge |
|------|-----------|------------------------|------------------|
| **Socialization** | tacit → tacit | Shared experience; observation, imitation, apprenticeship | Sympathized knowledge |
| **Externalization** | tacit → explicit | Articulation via dialogue, metaphor, analogy, models | Conceptual knowledge |
| **Combination** | explicit → explicit | Reconfiguring, sorting, synthesizing existing explicit knowledge | Systemic knowledge |
| **Internalization** | explicit → tacit | Embodiment through learning by doing | Operational knowledge |

Externalization is the "quintessential" process — the point at which knowledge moves from the private and embodied into the communicable. It is triggered by dialogue and collective reflection, progressing from metaphor to analogy to model. The Matsushita case (§5.2) remains its canonical instance. The four modes are not independent but form a *conversion sequence*: socialization generates the shared tacit base that externalization can articulate; combination systematizes the resulting explicit knowledge; internalization embodies it; and the enriched tacit knowledge enables richer socialization.

### 2.3 The knowledge spiral

Knowledge creation follows an *upward spiral*, not a closed circle. The spiral results from two interacting dimensions (Nonaka 1994): the *epistemological* dimension of tacit–explicit conversion and the *ontological* dimension of social aggregation — individual → group → organization → inter-organization. Each full SECI cycle escalates the level of social aggregation: knowledge born in an individual becomes group knowledge, then organizational knowledge, then knowledge shared across organizational boundaries.

The spiral does not run by itself. Nonaka (1994) specifies five enabling conditions: *organizational intention* (a strategic vision that justifies which beliefs count as knowledge), *autonomy* (self-organizing teams), *fluctuation and creative chaos* (deliberate exposure to turbulence), *redundancy* (overlapping information and intentional slack), and *requisite variety* (internal diversity matching environmental complexity). The spiral also implies a distinctive theory of management — *middle-up-down*: top management articulates visions, the frontline generates context-rich knowledge of practice, and middle managers — the "knowledge engineers" — synthesize the two.

### 2.4 Ba: the shared context

Knowledge conversion does not occur in a vacuum; it requires *ba* — "a shared context in motion" in which knowledge is created, shared, and utilized (Nonaka, Toyama & Konno 2000). Ba, developed from Nishida's notion of *basho* ("place"), is not merely physical space but an existential "here and now" — a time-space nexus of relationships whose participants supply the energy and quality that make knowledge creation possible. Nonaka & Konno (1998) distinguish *physical ba* (offices, labs), *virtual ba* (electronic space), and *mental ba* (shared ideals and mental models). The 2000 formulation maps ba onto the SECI modes: *originating ba* (individual, face-to-face; socialization), *dialoguing ba* (collective, face-to-face; externalization), *systemizing ba* (collective, virtual; combination), and *exercising ba* (individual, virtual; internalization). Leadership in the knowledge-creating company is largely *ba-building*.

### 2.5 Critiques and weak points

Any extension of SECI must contend with its known weaknesses. Stephen Gourlay (2006) argues that (1) the empirical basis is thin — the model rests almost entirely on the theorists' own case studies; (2) the *conversion* metaphor is doubtful — if Polanyi is right that the tacit dimension is ineradicable, then full conversion is impossible; (3) the "justified true belief" definition is philosophically contentious; (4) the assumed S→E→C→I sequence has little empirical support; and (5) the theory is normative and hard to falsify. Tsoukas (1996) adds a deeper objection: tacit and explicit knowledge are inseparably entangled aspects of knowing, making "externalization" as full articulation a category mistake — codification transforms rather than transfers knowledge. Independent empirical tests (Schulze & Hoegl 2008) produce partial and inconsistent results. Nonaka & von Krogh (2009) responded by recasting the distinction as a continuum and reframing conversion as movement along it — partial articulation that leaves a residual tacit surplus.

These critiques define the standards of evidence for this paper: any claim that LLMs externalize tacit knowledge must be tested against the Matsushita benchmark, must distinguish articulation from fabrication, and must acknowledge the residual tacit surplus that machines, like humans, cannot fully capture.

---

## 3. The extended model: tacit machine knowledge and the nine-movement spiral

Chatterji, Rock & Talamàs (2026) — *The Human-Machine Knowledge Spiral* (arXiv 2606.29227) — argue that artificial intelligence introduces a fundamentally new form of knowledge into organizations: **tacit machine knowledge**. Like its human counterpart, it is hard to articulate — opaque even to its builders. Unlike its human counterpart, it is **portable at software speed**: once embodied in a model's weights, embeddings, or memories, it can be copied, distilled, fine-tuned, or served via API without ever being fully articulated. The authors' flagship illustration is NotCo's Giuseppe system (§5.1): Giuseppe proposed a milk formula containing dill; the milk came out green; the chefs' tacit judgment — "milk is not green" — had to re-enter the loop as feedback.

The introduction of tacit machine knowledge adds **five movements** to Nonaka's four modes, forming a second spiral interleaved with the human one:

| Movement | Direction | Modern form |
|----------|-----------|-------------|
| **Encoding** | explicit human → tacit machine | Pre-training, fine-tuning, RAG ingestion on enterprise corpora |
| **Embedding** | tacit human → tacit machine | RLHF preference rankings, expert demonstrations, acceptance/rejection of agent outputs |
| **Extraction** | tacit machine → explicit human | Generated recipes, code, memos, hypotheses that humans inspect and test |
| **Assimilation** | tacit machine → tacit human | Developers internalizing agent-suggested patterns |
| **Machine transfer** | tacit machine → tacit machine | Model distillation, agent memory sharing, API-portable capabilities |

Three implications follow. First, **externalization is no longer the only bottleneck**: tacit machine knowledge becomes organizational *without* externalization, through machine transfer — but only if the shared context exists to give it meaning. Second, **every quadrant now has a machine counterpart**: socialization ↔ embedding; externalization ↔ extraction; combination ↔ encoding + synthesis; internalization ↔ assimilation and rule accumulation. An organization that builds only the human-side capabilities runs a half-spiral. Third, **false externalization is the new failure mode**: hallucination — machine output claiming explicit status without ground truth — corrupts the spiral at its source. (We develop this in §4.2.)

---

## 4. SECI × AI: mapping the quadrants against contemporary capability

This section maps each SECI element against concrete AI instantiations as of 2026, with maturity assessments grounded in the evidence collected in the source registry (see `research/sources.md`).

### 4.1 Socialization (tacit → tacit): the quadrant AI records but cannot yet transfer

**Original theory.** Socialization is the sharing of tacit knowledge through shared experience — apprenticeship, observation, imitation. It works because people co-located in a ba develop common ground that words cannot carry.

**AI instantiations.** Contemporary AI's socialization portfolio is dominated by *capture and ambient observation*: meeting copilots (Microsoft Copilot in Teams, Otter.ai, Fireflies.ai) that transcribe and summarize live interaction; pair-programming agents (GitHub Copilot, Cursor) that work alongside developers and absorb their corrections; "shadowing" agents that observe expert workflows. These systems are trained on the *choices and corrections* of experts — which is precisely how tacit preference enters a machine (the **embedding** movement). RLHF itself is socialization at scale: human raters' implicit preferences about "what a good answer looks like" are transferred to model weights (Ouyang et al. 2022).

**Maturity: Emerging.** The *capture* half is mature; the *transfer* half is not. What transfers to machines is the *trace* of tacit judgment (ratings, corrections, acceptances), not the tacit knowledge itself. A meeting copilot can tell you what was said; it cannot tell you why the senior engineer hesitated at a design choice. Dresher's (2026) agent-squad account makes the same point: agents learn operational knowledge — "when to escalate, what requires a human" — only when it is deliberately recorded, not through ambient observation. The productive direction is socialization *engineered as a feedback loop* rather than passive recording — the NotCo pattern.

### 4.2 Externalization (tacit → explicit): can LLMs elicit what people cannot say?

**Original theory.** Externalization is the articulation of tacit knowledge into explicit concepts — the "quintessential" mode, and the hardest. The Nonaka–von Krogh continuum (2009) is the wedge that makes LLM-based externalization plausible: if tacit knowledge is not all-or-nothing, *some* portion can always be articulated.

**The empirical test.** Two 2025–2026 studies put LLM elicitation to a direct test:

- **van den Bent, Pernisch & Schlobach (2025, Semantic Web Journal)** interviewed an LLM (ChatGPT-4) and two human domain experts under identical protocols, using the interviews to build RDF ontologies. Results were genuinely mixed: LLM interviews were dramatically cheaper and faster (~10 minutes, no knowledge engineer needed, vs. ~35 minutes per expert plus a human interviewer) and produced a credible ontology skeleton. But human experts contributed situated distinctions, terminological grounding, and structural decisions the LLM missed or got subtly wrong. **Verdict: LLM elicitation is feasible as a first-pass instrument, not a replacement for expert interviewers.**
- **Industry-Science (2026)** used a ChatGPT-5-based chatbot to elicit tacit knowledge from corporate experts in manufacturing. The chatbot's *interview behavior* outperformed its *summaries*; experts described the atmosphere as pleasant, but evaluators flagged the absence of a logic-checking stage — elicited output must be validated against organizational reality before it becomes trustworthy explicit knowledge.

**The SECI lesson.** LLMs externalize *well* when tacit knowledge is shallow or codifiable (procedures, heuristics, preferences experts can verbalize on prompting) and *poorly* when it is deep tacit (Polanyi's inarticulable residue — the chef's mouthfeel, the trader's risk sense). The design implication: **LLM externalization should be treated as generative hypothesis, not ground truth** — a draft explicit artifact that must be verified by the humans whose tacit knowledge it claims to represent. This mirrors Nonaka's own "metaphor → model" sequence: the LLM supplies the metaphor; the organization must validate the model.

**Hallucination as false externalization.** The deepest risk is that the machine articulates knowledge nobody holds. A hallucination is, in SECI terms, **false externalization**: fabricated content presented with the epistemic authority of explicit knowledge. It enters the explicit corpus, gets combined and internalized, and corrupts every downstream spiral turn. The scale of the threat is documented: the hallucination survey literature (arXiv 2510.06265) catalogs rates varying from <1% in constrained tasks to >50% in open-ended generation; Glean's enterprise data (2026) shows **6.4% hallucination for legal questions vs. 0.8% for general knowledge** (medical 4.3%). The domain gradient is the tell: the more specialized and knowledge-dense the domain, the more the model fabricates — precisely the domains where tacit expertise is deepest and false externalization does the most damage.

**Maturity: Emerging, with a safety caveat.** Deployable today as an elicitation and drafting instrument; dangerous without verification loops in high-stakes domains. The enterprise answer — RAG with citations, "contextual grounding" (Glean), OWASP LLM09:2025 mitigations — forces every externalized claim to point at an explicit source, converting extraction into a verifiable, human-auditable process.

### 4.3 Combination (explicit → explicit): the most industrialized quadrant

**Original theory.** Combination is the synthesis of existing explicit knowledge into new, more systematic explicit knowledge — the mode most naturally supported by information technology.

**AI instantiations.** This is where the AI stack is deepest: **RAG and enterprise search with grounding** (Glean connects to every enterprise application, indexes them into a knowledge graph, and answers with citations); **knowledge graphs and semantic layers** (Atlan's active metadata platform, Microsoft Fabric IQ's ontology + Digital Twin + graph); **AI-native knowledge management** (Shelf.io's semantic tagging, quality scoring, and content structured for agent consumption); **agentic research and document synthesis** (multi-step agents producing briefs, specs, PRDs); and **AI-in-the-loop knowledge-base hygiene** (deduplication, auto-tagging, stale-content detection).

**Maturity: Mature.** Combination is the quadrant LLMs do natively and industrially. Grounded retrieval + graph-structured organization + generative synthesis underpins the entire enterprise-AI product category. Two weaknesses remain: quality-of-grounding (residual hallucination concentrated in specialized domains) and the structural limit that combination without externalization input is *self-referential* — it recombines what is already explicit and cannot create genuinely new knowledge. Böhm & Durst's (2026) SECI→GRAI (Generate, Refine, Apply, Integrate) model argues GenAI has subsumed Combination so completely that a new acronym is warranted.

### 4.4 Internalization (explicit → tacit): machines as coaches, not just repositories

**Original theory.** Internalization is the conversion of explicit knowledge into embodied tacit know-how through action — "learning by doing."

**AI instantiations.** The clearest are **adaptive tutoring systems**: Khanmigo and Duolingo Max tutor through dialogue, adapt to learner errors, and scaffold practice. **Interactive coding agents** internalize explicit knowledge for their users — the developer who watches an agent refactor and reproduces the pattern by hand is assimilating machine-suggested structure into personal tacit skill (the **assimilation** movement in vivo). **Simulated practice environments** (agentic role-play for sales training, synthetic patients for medical education) convert explicit protocols into embodied response. On the machine side, **arXiv 2607.13091** (*Self-Improving AI Coding Agents Through Accumulated Behavioral Rules*, ICE 2026) shows the mirror process: agents convert explicit review feedback into persistent, version-controlled behavioral rules — a ratchet of behavioral improvement, explicit knowledge internalized into machine behavior. The SIGPLAN community's AGENTS.md practice does the same at repository scale — with the caveat (Gloaguen et al. 2026) that boilerplate context can *hurt* agents: knowledge quality matters more than quantity.

**Maturity: Emerging.** Mature in education technology and in the narrow sense of agent rule-learning; thin in general enterprise KM, where most systems deliver explicit knowledge *to* people and stop — never closing the loop into practice. Agentic systems change this: they log every action, creating — for the first time — observable traces of internalization.

### 4.5 Ba and the digital shared context layer

**Original theory.** Ba is the shared context — physical, virtual, or mental — in which knowledge acquires meaning and the spiral can turn, characterized by redundancy, creative chaos, and autonomy.

**AI instantiations — the digital Ba stack:**

- **Agent context layers**: Atlan's "Agent Context Layer" positions a semantic context substrate *under* multi-agent systems — metadata, glossary, lineage that let agents share meaning rather than just tokens. Ba as infrastructure.
- **Microsoft Fabric IQ**: Microsoft's "shared context layer for AI agents" — ontologies, a Digital Twin, and a graph of enterprise objects — gives every agent a common world-model.
- **Cross-agent memory**: Augment Code's cross-agent organizational memory (persistent, governed memory shared across agent instances; deployed at Stripe, Ramp, Uber) makes the field durable — what one agent learns, another inherits. This is **machine transfer** industrialized.
- **Agent memory taxonomy** (Dresher 2026): stable, decision, operational, workstream, and ephemeral knowledge require different lifecycle policies. Mixing them corrupts the field; his "synthetic folklore" risk — agent memory drifting from ground truth through iterative self-reference — is *creative chaos turned pathological*.
- **MCP and context servers**: the Model Context Protocol ecosystem turns "context" into an addressable, shareable layer — the plumbing of digital ba.

**Maturity: Emerging.** Every major vendor now sells a "context layer" or "memory layer," but the field is fragmented across proprietary substrates and governance is unsolved: who owns the shared context, who audits it, what happens when agent memory diverges from human truth? He et al. (2026), *Revisiting Ba*, argue GenAI transforms ba itself — AI-mediated interaction becoming a new form of shared context. The pieces exist; the standard does not.

### 4.6 Maturity summary

| Element | AI maturity | Bottleneck |
|---------|-------------|------------|
| Socialization | Emerging | Capture mature; tacit transfer partial |
| Externalization | Emerging | Works for shallow tacit; hallucination = false externalization |
| Combination | **Mature** | Grounding quality in specialized domains |
| Internalization | Emerging | Requires doing; thin in enterprise KM |
| Ba (shared context) | Emerging | Fragmented substrates; governance unsolved |
| Machine transfer | Emerging-to-mature | Portability solved; meaning/context unsolved |

---

## 5. Real-world cases: the extended model in practice

Seven grounded cases, drawn from the case-study corpus (`results/case-studies.md`), test the extended model across industries.

### 5.1 NotCo / Giuseppe (food technology) — the flagship human-machine spiral

NotCo, founded 2015, builds plant-based foods with **Giuseppe**, an AI that searches ingredient data, chemical analyses, and sensory results at a scale no food scientist could match. The canonical failure: an early NotMilk formulation containing dill was **green** — Giuseppe "had detected properties in dill that appeared useful in the data, but it missed something obvious to anyone standing in NotCo's kitchen: whatever else milk may be, people do not expect it to be green" (Chatterji et al. 2026). NotCo institutionalized the fix as a **feedback loop** — chefs and sensory panels taste, smell, measure, and modify proposals; their judgments return as training feedback (patents US 11,164,478 B2; US 11,205,101 B1). By 2021, 20+ chefs tested 100+ recipes monthly; the improbable **pineapple-and-cabbage** combination behind NotMilk launched at Whole Foods in 2020; a $235M Series D valued NotCo at **$1.5B**; NotCo AI (2022, $70M) sells Giuseppe's knowledge as a B2B platform; and the 2025 **Barry Callebaut** partnership moves the spiral to chocolate.

**SECI mapping:** all four human modes plus all five machine movements. **The lesson:** machine knowledge without shared context fails (green milk); tacit machine knowledge is portable and sellable — a scaling mechanism human tacit knowledge never had; and the firm's role remains what Nonaka said it was: providing the shared context in which different kinds of knowledge feed off each other.

### 5.2 Matsushita Home Bakery (consumer appliances) — the archetype revisited

The classic externalization case (§2.3): Ikuko Tanaka's apprenticeship to the Osaka hotel baker, her naming of "twist and stretch," the ribbed bread pan, one million units sold in the first year. Revisited in the AI age, three shifts appear (Case 2 in the corpus): (1) *externalization becomes cheaper and faster* — LLM interview agents elicit expert knowledge in minutes where Tanaka required months of apprenticeship (with quality caveats, §4.2); (2) *the machine side can now learn the skill rather than only encode its proxy* — the ribs-in-the-pan solution is exactly the kind of embodied constraint a learned controller could acquire through imitation learning; (3) *the ineffability critique sharpens* — Ribeiro & Collins (2007) rightly note the machine did not literally capture the baker's tacit knowledge; the green-milk failure confirms that machine instantiation of skill is not human understanding. **The home bakery remains the benchmark**: did the AI artifact preserve, distort, or fabricate the expert's tacit knowledge?

### 5.3 Coding agents as externalization engines (software engineering)

Software organizations are the vanguard of agentic knowledge creation. The corpus documents three systems: **self-improving coding agents with accumulated behavioral rules** (arXiv 2607.13091) — every accepted human review comment becomes a persistent, version-controlled behavioral rule plus a self-review checklist; **agent-driven repositories** (the AVA project, ~90% of code/docs/tests AI-authored) using a four-level documentation hierarchy (AGENTS.md → agent-reference → formal specs → source code) and a spec-first loop; and **spec and memory practice** (Osmani; Dresher; GitHub's analysis of 2,500+ agent-configuration files). Results are striking: in a 35+-service platform, the rule set grew from 5 to 18 behavioral rules with **0% recurrence of ruled-against error classes** across 11 sessions; **39% of rules originated from human PR reviewers vs. 22% from bots** — "human review is the highest-quality signal for rule generation." The hazards are equally clear: **knowledge ossification** (monotonically growing rule sets freeze the spiral without governance) and **synthetic folklore** — "a stale note can become a false requirement" (Dresher 2026).

**SECI mapping:** externalization at industrial scale (review→rules), combination (docs hierarchy), bidirectional internalization, literal machine transfer. **The lesson:** externalization is now a continuous, ratcheting conversion of human tacit knowledge into machine-readable organizational memory — and human review is upgraded, not displaced, to the highest-value knowledge source in the system.

### 5.4 Enterprise agentic AI (banking, retail): JPMorgan, Walmart

MIT Sloan's Sinan Aral: "The agentic AI age is already here." **JPMorgan Chase** deploys agents for fraud detection, financial advice, loan approvals, and legal/compliance — "which could reduce the need for junior bankers." **Walmart** builds LLM agents for shopping, customer service, and merchandise planning. Aral's controlled studies find human-AI teams achieving ~50% higher productivity per worker — while separate work finds people still trust conventional search over generative output: a live trust gap. Acuvate's catalog of 21 deployments generalizes the pattern (customer support, IT service desk, invoice processing, recruitment, compliance, knowledge agents).

**SECI mapping:** primarily **combination and internalization machines** — agents fuse explicit knowledge across systems and encode organizational routines into operating capability. **The lesson:** at enterprise scale, SECI's organizational cross-leveling is executed by machines; the friction points are context and trust; the junior-banker observation is the sharpest datum — routine externalization/internalization loops are becoming machine-owned, with human contribution concentrating at the judgment boundary.

### 5.5 AI-native knowledge management (enterprise KM): Glean, Shelf.io, Atlan

A new infrastructure category makes organizational knowledge consumable by agents — KM "built for machines first." Atlan (serving Mastercard, Workday, GM, CME, HubSpot, 400+ enterprises) operationalizes the **agent context layer**: an Enterprise Data Graph — "every asset, every relationship, every lineage path" — exposed to any MCP-compatible agent, with 80–90% of context AI-bootstrapped. Shelf.io's AI-native KM adds quality scoring with ROT detection, semantic structuring, governed access, and continuous freshness monitoring. Glean grounds agents in permission-aware context across 35+ LLMs.

**Results:** Atlan reports a **5× improvement in AI response accuracy** for a revenue-analysis agent after grounding — "The model did not change. The data did not change. The context infrastructure changed." Shelf reports 85% NPS growth over three months; Workday's VP frames the Ba statement directly: "All of the work that we did to get to a shared language amongst people at Workday can be leveraged by AI via Atlan's MCP server. We can start to teach AI language."

**SECI mapping:** these platforms are the **digital Ba** — Nonaka and Konno's shared context, rebuilt for machine participants. **The lesson:** shared context — not raw knowledge — is the scarce resource; the Ba must now be engineered as a graph, an MCP server, a permission model, before the spiral turns.

### 5.6 LLM-mediated tacit knowledge elicitation (consulting, manufacturing)

Professional-service and manufacturing firms face a classic SECI bottleneck: expert tacit knowledge leaves with its carriers, and skilled-labor shortages are worsening. LLMs are deployed as interviewers and elicitation agents. The Semantic Web Journal study (§4.2) found AI-led interviews faster, more structured, and more information-dense — but ontologies "created solely by AI lacked detail, contained hallucinated or inconsistent content." The Industry-Science chatbot's interview behavior outperformed its summaries. A research prototype (arXiv 2507.03811) using an LLM agent navigating the organizational graph achieved **94.9% full-knowledge recall across 864 simulations**.

**SECI mapping:** externalization machines (tacit expert → explicit transcripts, summaries, ontologies) plus embedding (dialogue) and extraction (structured artifacts). **The lesson:** **machines elicit brilliantly but articulate unreliably** — the robust pattern is hybrid: machine-led interviews to surface and structure raw material, human experts to validate and finalize. Extraction without verification produces plausible-but-unjustified explicit knowledge — false externalization.

### 5.7 Khanmigo (education) — engineering and measuring internalization

**Khanmigo**, Khan Academy's generative-AI tutor (launched 2023, millions of students), "doesn't just give answers. Instead, with limitless patience, it guides learners to find the answer themselves." In a six-month program (Oct 2025–Apr 2026), Khan Academy ran ~20 product tests giving the tutor structured signals about each student's performance patterns and skill gaps — and reports a **6.1% improvement in next-item correctness** when the tutor receives those signals. Earlier evidence associates ~18 hours/year of engagement with ~60% learning acceleration for eighth graders. An independent study (University of Windsor, 69 physics students) found significant learning gains across conditions but **no significant difference** between Khanmigo and Google-search groups over short exposure — a caution against hype.

**SECI mapping:** internalization as a designed, machine-mediated process — explicit knowledge becoming tacit skill through guided practice — plus a machine-side loop (the tutor's evolving model of the learner: machine tacit knowledge, assimilation). **The lesson:** internalization can be *engineered and measured*; but it remains effortful, embodied, and slow — AI's contribution is to orchestrate more, better-directed practice, not to replace it. In healthcare the same dynamic is nascent but trust-gated: with 4.3% hallucination rates for medical information, clinical tacit-knowledge capture remains a research frontier.

### 5.8 Cross-case synthesis

| Case | SECI quadrants | AI role | Key lesson |
|------|----------------|---------|------------|
| NotCo / Giuseppe | All 4 + all 5 machine movements | Co-creator | Machine knowledge without shared context fails; tacit machine knowledge is portable and sellable |
| Matsushita Home Bakery | S, **E**, C, I | (Revisited) accelerator — or distortion risk | The externalization benchmark; AI lowers articulation cost but sharpens the ineffability critique |
| Coding agents | **E**, C, I (both directions), machine transfer | Externalization engine | Human review is the highest-quality knowledge source; governance prevents ossification and synthetic folklore |
| Enterprise agents (JPMorgan, Walmart) | C, I (routines) | Process executor | Combination and internalization run at machine scale; trust and context determine adoption |
| AI-native KM (Glean, Shelf, Atlan) | C, machine transfer, (digital Ba) | Context infrastructure | Shared context is the scarce resource — 5× accuracy with unchanged model and data |
| LLM tacit elicitation | **E**, embedding, extraction | Interviewer | Machines elicit brilliantly but articulate unreliably — hybrid, human-validated externalization |
| Khanmigo | **I**, assimilation | Tutor | Internalization can be engineered and measured; practice remains irreplaceable |

Five analytic themes emerge:

1. **AI is a participant, not a tool.** Across all cases, AI occupies one pole of new knowledge conversions rather than merely supporting the four human modes.
2. **Externalization bifurcates.** Machines externalize faster but with a distinctive failure mode — false externalization. The human validation loop is the justification function that separates knowledge from plausible text.
3. **Internalization becomes measurable and scalable** — but cannot be shortcut (the physics-education null result).
4. **The Ba is now infrastructure** — shared, governed, permission-aware context; organizations that skip it reproduce the green-milk failure at enterprise scale.
5. **Trust is the rate-limiting factor.** The spiral only turns where knowledge is *believed* — and in the AI age, justified belief is increasingly a governance property (provenance, freshness, lineage), not a conversational one.

---

## 6. SECI-as-architecture: a design principle for agentic knowledge systems

The matrix and cases yield a prescriptive principle. Current agentic KM products overwhelmingly implement **Combination-plus-Externalization-as-answering**: they retrieve, synthesize, and answer. That is a search engine wearing a knowledge-creation costume. A system that *respects the spiral* must be designed as a closed loop over all nine movements:

**1. Ground every machine output in auditable explicit sources (truth-conditioned extraction).** No ungrounded externalization: every extracted claim must cite the explicit knowledge it came from (Glean-style grounding; RAG with provenance). This converts hallucination from an existential risk into a detectable, reviewable event.

**2. Build feedback as a first-class substrate, not an afterthought (embedding).** Every human accept/reject/correct/rate action on machine output must be captured and returned to the model or memory layer (NotCo's chefs; RLHF; arXiv 2607.13091's "every accepted review comment is a self-review rule"). The system should get *measurably better at the organization's tacit preferences* with use — the HAC-SECI inner loop.

**3. Design Ba as infrastructure: a governed shared context layer.** Implement the digital ba explicitly — a semantic layer (ontology, glossary, lineage; Fabric IQ, Atlan) that agents and humans both address, plus a cross-agent memory (Augment Code; Dresher's taxonomy) that is versioned, diffable, reviewable, and revertible. Memory must be treated with the seriousness of production code: **disposable agents, durable memory**.

**4. Respect the knowledge classes — never bucket them.** Stable, decision, operational, workstream, and ephemeral knowledge require different lifecycle policies. Mixing them is how synthetic folklore and knowledge ossification arise.

**5. Close the loop into practice (internalization + assimilation).** Knowledge systems must not stop at answering; they must generate practice — tutoring interactions, simulations, agent-executed tasks with human review — so that explicit knowledge becomes embodied (human) and behavioral (machine) knowledge. Measure internalization by action traces, not retrieval logs.

**6. Orchestrate the spiral deliberately — the middle manager becomes a spiral engineer.** Nonaka's knowledge engineers translated ideals into concepts; in the AI age they run the human–machine spiral: pairing the model's wild proposals with domain experts' judgment, curating the shared context, deciding which extractions deserve another turn. The NotCo ideal — "familiar food from plants" — is what gave Giuseppe's chaos direction. Failures (green milk) are knowledge events, not bugs.

**7. Treat agent memory as an organizational knowledge asset with an owner.** Memory that no human can inspect, diff, or revert is a liability (synthetic folklore). Memory that is governed, audited, and shared across the organization is a knowledge asset — the machine-side crystallization of the firm's learning, portable and combinable at scale. The NotMilk of the agentic age is not just the output artifact, but the trained, governed, transferable machine knowledge itself.

In one sentence: **build the spiral, not the answer** — the agentic KM system of record should be judged not by the quality of its answers but by whether the organization's human and machine knowledge are measurably feeding each other in an accelerating, grounded, governed loop.

---

## 7. Conclusion

Nonaka and Takeuchi built the SECI model for a world in which humans did all the knowledge work. That world no longer exists — but the model's central insight has not merely survived the transition; it has been sharpened by it. The knowledge-creating company's role was always to provide the shared context in which different kinds of knowledge feed off each other. The AI age adds a new kind of knowledge — tacit machine knowledge, portable at software speed — and thereby raises the stakes on context: the green-milk failure is what happens when machine knowledge meets human expectation without shared meaning; hallucination is what happens when machine output claims explicit status without ground truth. Both stall the spiral. Both are mitigated by the same mechanism: a shared, grounded, human-auditable context.

Our three questions resolve as follows. **Does SECI still explain organizational knowledge creation?** Yes — but only in its extended, nine-movement form, in which every human mode has a machine counterpart and the spiral runs across two species of knower. **Can LLMs externalize tacit knowledge?** Partially, and only with the Nonaka–von Krogh continuum as the wedge: machines elicit brilliantly but articulate unreliably, so externalization must be hybrid — machine-led elicitation, human validation, justification as the boundary between knowledge and plausible text. **What is ba when agents participate?** It is infrastructure: a governed, permission-aware shared context layer — a graph, an MCP server, a memory policy — engineered deliberately before the spiral can turn.

The design imperative that follows is captured in one sentence: **build the spiral, not the answer.** The organizations that thrive in the age of agentic AI will not be those with the best models or the biggest knowledge bases, but those that engineer the shared context in which human and machine knowledge feed off each other — and that treat every green milk, every hallucination, every stale note as a knowledge event to be folded back into the spiral.

---

## References

1. Böhm, S., & Durst, S. (2026). Knowledge Management in the Age of Generative AI: From SECI to GRAI.
2. Chatterji, A., Rock, D., & Talamàs, E. (2026). *The Human-Machine Knowledge Spiral.* arXiv:2606.29227.
3. de Halleux, J., Syme, D., & Zorn, B. (2026). Repositories Are Human/Agent Knowledge Factories. SIGPLAN Blog.
4. Dresher, T. (2026). The Ship's Computer Has a Memory Problem — Designing Memory for AI Agent Squads.
5. Gloaguen et al. (2026). Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents? arXiv:2602.11988.
6. Glean (2026). Understanding LLM Hallucinations in Enterprise Applications.
7. Gourlay, S. (2006). Conceptualizing Knowledge Creation: A Critique of Nonaka's Theory. *Journal of Management Studies*, 43(7), 1415–1436.
8. Grant, R. M. (1996). Toward a Knowledge-Based Theory of the Firm. *Strategic Management Journal*, 17(S2), 109–122.
9. He, J. et al. (2026). Revisiting Ba: How Generative AI Transforms Knowledge Creation.
10. Kirchner, K., & Scarso, E. (2026). Revisiting the SECI Model: The Impact of Generative AI on Organizational Knowledge Creation. Springer, 105–125.
11. Kogut, B., & Zander, U. (1992). Knowledge of the Firm, Combinative Capabilities, and the Replication of Technology. *Organization Science*, 3(3), 383–397.
12. LLM Hallucination: A Comprehensive Survey (2026). arXiv:2510.06265.
13. Matsumoto, T., Nishikawa, R., & Morimoto, C. (2025). Human-AI-Collaboration SECI (HAC-SECI) Model. Tokyo University of Science.
14. Nonaka, I. (1994). A Dynamic Theory of Organizational Knowledge Creation. *Organization Science*, 5(1), 14–37.
15. Nonaka, I., & Konno, N. (1998). The Concept of "Ba": Building a Foundation for Knowledge Creation. *California Management Review*, 40(3), 40–54.
16. Nonaka, I., & Takeuchi, H. (1995). *The Knowledge-Creating Company.* Oxford University Press.
17. Nonaka, I., Toyama, R., & Konno, N. (2000). SECI, Ba and Leadership: A Unified Model of Dynamic Knowledge Creation. *Long Range Planning*, 33(1), 5–34.
18. Nonaka, I., & von Krogh, G. (2009). Tacit Knowledge and Knowledge Conversion. *Organization Science*, 20(3), 635–652.
19. Osmani, A. (2026). How to Write a Good Spec for AI Agents.
20. Ouyang, L. et al. (2022). Training Language Models to Follow Instructions with Human Feedback.
21. Polanyi, M. (1966). *The Tacit Dimension.* Doubleday.
22. Ribeiro, R., & Collins, H. (2007). The Bread-Making Machine: Tacit Knowledge and Two Types of Action. *Organization Studies*.
23. Ryle, G. (1949). *The Concept of Mind.* Hutchinson.
24. Schulze, A., & Hoegl, M. (2008). Organizational Knowledge Creation and the Generation of New Product Ideas. *Research Policy*, 37(10), 1742–1750.
25. Self-Improving AI Coding Agents Through Accumulated Behavioral Rules (2026). arXiv:2607.13091.
26. Shelf.io (2026). AI Knowledge Management: The Secret Weapon of Enterprise AI.
27. Tsoukas, H. (1996). The Firm as a Distributed Knowledge System. *Strategic Management Journal*, 17(S2), 11–25.
28. Uchihira, N. (2026). Tacit Knowledge Management with Generative AI: Proposal of the GenAI SECI Model.
29. van den Bent, J., Pernisch, R., & Schlobach, S. (2025). Investigating Knowledge Elicitation Automation with Large Language Models. *Semantic Web Journal*, swj3868.
30. Yan, J., Husted, K., & Fath, B. (2026). Transforming Organizational Knowledge Creation Through Artificial Intelligence: A Systematic Review.
