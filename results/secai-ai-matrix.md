# SECI × AI: A Capability Matrix for the Age of LLMs and Agentic Intelligence

**Working paper — Phase 1 deliverable**
*Nonaka × AI Knowledge Creation project, August 2026*

---

## 0. Purpose and Method

This document maps the four quadrants of Nonaka's SECI model — Socialization, Externalization, Combination, Internalization — and the fifth element, *ba* (shared context), against concrete capabilities of contemporary AI systems: large language models (LLMs), retrieval-augmented generation (RAG), knowledge graphs, enterprise search, meeting copilots, coding agents, adaptive tutoring systems, and agentic orchestration platforms. For each element we provide (1) the original theoretical meaning, (2) the AI instantiations that realize it today, (3) a maturity assessment (mature / emerging / speculative) with reasoning, and (4) available evidence. We then integrate the analysis into a proposed **SECI-as-architecture** design principle for building agentic knowledge-management systems.

The analysis is anchored in Chatterji, Rock and Talamàs (2026), *The Human-Machine Knowledge Spiral* (arXiv 2606.29227), which argues that AI introduces a third kind of knowledge — **tacit machine knowledge** — into Nonaka's spiral, and that Nonaka's central claim ("the knowledge-creating company provides the shared context in which a virtuous spiral of knowledge can recur") is *more* relevant, not less, in the age of AI.

---

## 1. The Extended Model: From Four Modes to Nine Movements

Nonaka (1994) and Nonaka & Takeuchi (1995) described organizational knowledge creation as a spiral in which **tacit knowledge** ("we know more than we can tell," Polanyi 1966) and **explicit knowledge** convert into one another through four modes:

| Mode | Direction | Classic archetype |
|---|---|---|
| **Socialization (S)** | tacit → tacit | Apprenticeship, joint experience; Matsushita's head baker teaching the "twist dough" technique |
| **Externalization (E)** | tacit → explicit | Articulating the twist into a prototype spec; metaphor → concept → model |
| **Combination (C)** | explicit → explicit | Synthesizing documents, databases, and specs into new explicit knowledge |
| **Internalization (I)** | explicit → tacit | Learning-by-doing; reading the manual until it becomes embodied skill |

Chatterji et al. (2026) add a third knowledge type: **tacit machine knowledge** — knowledge acquired by machine learning systems that is hard to articulate (opaque even to its builders) but, unlike human tacit knowledge, **portable at software speed**. Once embodied in weights, embeddings, or memories, it can be copied, distilled, fine-tuned, or served via API without ever being fully articulated. The NotCo/Giuseppe case is their flagship illustration: Giuseppe proposed a milk formula containing dill; the milk came out green; the chefs' tacit judgment ("milk is not green") had to re-enter the loop as feedback. The resulting NotMilk (pineapple + cabbage) crystallized the spiral into a product, and Giuseppe itself later became a transferable asset (NotCo AI, Barry Callebaut partnership, 2025).

This yields **five new movements** added to Nonaka's four:

1. **Encoding** (explicit human → tacit machine): feeding documents, formulas, and constraints into a learning system. *Modern form: pre-training, fine-tuning, RAG ingestion on enterprise corpora.*
2. **Embedding** (tacit human → tacit machine): transferring human tacit judgment through choices, demonstrations, corrections, ratings. *Modern form: RLHF preference rankings, expert demonstrations, acceptance/rejection of agent outputs.*
3. **Extraction** (tacit machine → explicit human): machines express implications as predictions, designs, hypotheses. *Modern form: generated recipes, code, memos, hypotheses that humans inspect and test.*
4. **Assimilation** (tacit machine → tacit human): humans learn from machines through observation and practice, reshaping what they notice and expect. *Modern form: developers internalizing agent-suggested patterns.*
5. **Machine transfer** (tacit machine → tacit machine): models, embeddings, and memories transfer between systems without human articulation. *Modern form: model distillation, agent memory sharing, API-portable capabilities.*

The SECI-as-architecture principle (Section 7) treats these nine movements as the load-bearing structure of agentic knowledge systems.

---

## 2. The Matrix

| SECI element | Original meaning (Nonaka) | AI instantiations (2026) | Maturity | Evidence |
|---|---|---|---|---|
| **Socialization** (tacit→tacit) | Shared experience, apprenticeship, observation, imitation | Meeting copilots (Microsoft Copilot, Otter, Fireflies) that record and share experiential context; pair-programming agents (GitHub Copilot, Cursor); shadowing/observation agents that watch human workflows; video+transcript knowledge capture; expert-following chatbots | **Emerging** — capture is mature, transfer of *tacit* content is partial | NotCo case (arXiv 2606.29227): chefs' tacit judgment embedded via feedback; Dresher (2026) on agent squads learning from human review; Uchihira (2026) GenAI SECI |
| **Externalization** (tacit→explicit) | Articulation via metaphor, dialogue, elicitation; the hardest mode | Expert-interview LLMs; ontology/knowledge-graph elicitation (LLM as interviewee); meeting-to-document pipelines; reflection prompts ("document what you learned"); interview-question generation (arXiv 2507.02858); productized KM copilots | **Emerging** — works for codifiable tacit, unreliable for deep tacit; **hallucination = false externalization** | van den Bent, Pernisch & Schlobach (2025, SWJ swj3868); Industry-Science (2026) ChatGPT-5 elicitation study; hallucination survey arXiv 2510.06265; Glean (2026) enterprise hallucination data |
| **Combination** (explicit→explicit) | Synthesizing explicit knowledge into new explicit knowledge | Enterprise search with grounding (Glean); RAG pipelines over the corpus; knowledge graphs + semantic layers (Atlan, Microsoft Fabric); AI-native KM platforms (Shelf.io); document synthesis and report generation; agentic research pipelines | **Mature** — the most industrialized quadrant; quality varies with grounding | Glean; Shelf.io (2026); Atlan (2026); Microsoft Fabric IQ (2026); Böhm & Durst (2026) SECI→GRAI |
| **Internalization** (explicit→tacit) | Learning-by-doing; embodied mastery | Adaptive tutoring systems (Khanmigo, Duolingo Max, Socratic AI tutors); interactive coding agents that teach while doing; simulated-practice environments (agentic role-play, flight-sim-style training sims); personalized learning paths from learner traces | **Emerging** — real in education and developer onboarding; thin in enterprise KM | Khanmigo / Duolingo Max product evidence; arXiv 2607.13091 (agents internalize review rules); SIGPLAN blog (2026) AGENTS.md |
| **Ba / shared context** (the enabling field) | Physical/virtual/mental shared space where knowledge acquires meaning; redundancy, autonomy, creative chaos | Digital Ba: shared context layers (Atlan Agent Context Layer); Microsoft Fabric IQ (ontologies, Digital Twin, graph); MCP-style tool/context servers; agent memory stores shared across squads (Augment Code); meeting + transcript + knowledge-graph platforms as persistent fields | **Emerging** — the quadrant where vendors are actively building; still fragmented | Atlan (2026); Microsoft Fabric IQ (2026); Augment Code (2026); Chatterji et al. (2026) on ba; He et al. (2026) Revisiting Ba |

---

## 3. Socialization (tacit → tacit): The Quadrant AI Records but Cannot Yet Transfer

**Original theory.** Socialization is the sharing of tacit knowledge through shared experience — apprenticeship, observation, imitation, and informal dialogue. It is the mode Nonaka & Takeuchi (1995) illustrated with the Matsushita baker whose twist technique was absorbed by a trainee through watching and doing, not through manuals. Socialization works because people co-located in a *ba* develop common ground that words cannot carry.

**AI instantiations.** Contemporary AI's socialization portfolio is dominated by **capture and ambient observation**: meeting copilots (Microsoft Copilot in Teams, Otter.ai, Fireflies.ai) that transcribe, summarize, and surface the experiential content of live interaction; pair-programming agents (GitHub Copilot, Cursor) that work alongside developers and absorb their corrections; and "shadowing" agents that observe expert workflows in enterprise software and propose next actions. These systems do not merely store explicit transcript content — they are trained on the *choices* and *corrections* of experts, which is precisely how tacit preference enters a machine (the **embedding** movement). RLHF itself is socialization at scale: human raters' implicit preferences about "what a good answer looks like" are transferred to model weights (Ouyang et al., 2022), a process Chatterji et al. (2026) identify as the human–machine spiral operating inside AI laboratories.

**Maturity: Emerging.** The *capture* half of socialization is mature (meeting transcription is commoditized); the *transfer* half is not. What transfers to machines is the *trace* of tacit judgment (ratings, corrections, acceptances), not the tacit knowledge itself. A meeting copilot can tell you what was said; it cannot tell you why the senior engineer hesitated at a design choice, or reproduce the embodied "feel" of the twist. Dresher's (2026) agent-squad account makes the same point: agents learn operational knowledge — "when to escalate, what requires a human" — only when it is deliberately recorded, not through ambient observation. The NotCo case shows the productive direction: chefs' sensory judgment entered Giuseppe through *repeated evaluations* — socialization engineered as a feedback loop rather than passive recording.

**Evidence.** Chatterji, Rock & Talamàs (2026), arXiv 2606.29227, §2 (embedding, NotCo feedback loop); Ouyang et al. (2022) on RLHF; Uchihira (2026), *Tacit Knowledge Management with Generative AI*; Matsumoto et al. (2025), HAC-SECI dual-loop model; Dresher, "The Ship's Computer Has a Memory Problem" (2026).

---

## 4. Externalization (tacit → explicit): The Critical Question — Can LLMs Elicit What People Cannot Say?

**Original theory.** Externalization is the articulation of tacit knowledge into explicit concepts — the "quintessential knowledge-creation process" (Nonaka, 1994), accomplished through metaphor, analogy, dialogue, and modeling. It is the hardest mode because tacit knowledge resists articulation by definition. Nonaka and von Krogh (2009) later softened the dichotomy into a continuum: tacit knowledge is not an all-or-nothing category, and *some* portion can always be made explicit. This continuum is the theoretical wedge that makes LLM-based externalization plausible at all.

**The externalization question.** Two 2025–2026 studies put LLM elicitation to an empirical test:

- **van den Bent, Pernisch & Schlobach (2025), Semantic Web Journal (swj3868), *Investigating Knowledge Elicitation Automation with Large Language Models*.** The researchers interviewed an LLM (ChatGPT v4) and two human domain experts under identical protocols, using the interviews to build ontologies. Results were genuinely mixed: LLM interviews were dramatically cheaper and faster (~10 minutes, no knowledge engineer needed, vs. ~35 minutes per expert plus a human interviewer), and the LLM produced a credible ontology skeleton. But the human experts contributed situated distinctions, terminological grounding, and structural decisions that the LLM missed or got subtly wrong, requiring correction. The paper's verdict: LLM-based elicitation is feasible as a *first-pass* externalization instrument, but it is not yet a replacement for expert interviewers — the tacit residue remains with the humans.
- **Industry-Science (2026), *Reinterpret Corporate Tacit Knowledge Using LLMs*.** A field study using ChatGPT-5 to elicit tacit knowledge from corporate experts found that LLMs can productively surface and restructure knowledge experts themselves had not articulated, but flagged the absence of a logic-checking stage: elicited output must be validated against organizational reality before it becomes trustworthy explicit knowledge.

**The lesson for the SECI frame:** LLMs externalize *well* when tacit knowledge is shallow or codifiable (procedures, heuristics, preferences that experts can verbalize on prompting) and *poorly* when it is deep tacit (Polanyi's "we know more than we can tell" — the chef's mouthfeel, the trader's risk sense). The practical design implication is that LLM externalization should be treated as *generative hypothesis*, not *ground truth*: it produces a draft explicit artifact that must be verified by the humans whose tacit knowledge it claims to represent. This mirrors Nonaka's own "metaphor → model" sequence: the LLM supplies the metaphor; the organization must validate the model.

**Hallucination as false externalization.** The deepest risk of LLM externalization is that the machine articulates knowledge nobody holds. A hallucination is, in SECI terms, **false externalization**: fabricated content presented with the epistemic authority of explicit knowledge. It enters the organization's explicit corpus, gets combined and internalized, and corrupts every downstream spiral turn. The scale of the threat:

- **arXiv 2510.06265, *LLM Hallucination: A Comprehensive Survey*** documents hallucination as a systemic property of LLMs, with rates varying from <1% in constrained tasks to >50% in open-ended generation, and catalogs mitigation strategies (RAG grounding, fine-tuning, self-consistency, post-hoc verification).
- **Glean (2026), *Understanding LLM Hallucinations in Enterprise***: in grounded enterprise deployments, hallucination rates are **6.4% for legal questions vs. 0.8% for general knowledge questions** (with medical at 4.3% for top models). The domain gradient is the tell: the more specialized and knowledge-dense the domain, the more the model fabricates — precisely the domains where tacit expertise is deepest and where false externalization does the most damage.

**Maturity: Emerging, with a safety caveat.** LLM externalization is deployable today as an elicitation and drafting instrument (emerging-to-mature), but ungrounded externalization is dangerous (the hallucination literature makes it speculative-to-unsafe for high-stakes domains without verification loops). The enterprise answer — Glean's "contextual grounding," RAG with citation, OWASP LLM09:2025 mitigations — is to *force every externalized claim to point at an explicit source*, converting extraction into a verifiable, human-auditable process.

**Evidence.** van den Bent, Pernisch & Schlobach (2025), Semantic Web Journal swj3868; Industry-Science (2026) tacit-knowledge elicitation study; arXiv 2510.06265 hallucination survey; Glean (2026) enterprise hallucination data; arXiv 2507.02858 (interview follow-up question generation); Nonaka & von Krogh (2009) tacit–explicit continuum; Östberg (2026) on externalization methods (facilitation, storytelling, interviews) plus knowledge-graph modeling.

---

## 5. Combination (explicit → explicit): The Most Industrialized Quadrant

**Original theory.** Combination is the synthesis of existing explicit knowledge into new, more systematic explicit knowledge: sorting, adding, combining, and categorizing — the mode most naturally supported by information technology, and the one Nonaka saw as the West's home turf.

**AI instantiations.** This is where the AI stack is deepest and most commercialized:

- **RAG and enterprise search with grounding**: Glean connects to every enterprise application, indexes them into a unified knowledge graph, and answers with citations to sources. This is Combination engineered for trust — explicit knowledge retrieved, combined, and re-presented with provenance.
- **Knowledge graphs and semantic layers**: Atlan's active metadata platform and Microsoft Fabric IQ's ontology + Digital Twin + graph substrate organize explicit knowledge into machine-readable structure that agents can combine reliably.
- **AI-native knowledge management**: Shelf.io explicitly markets "AI Knowledge Management" — semantic tagging, quality scoring, and content structured for agent consumption — i.e., KM platforms rebuilt so that combination can be performed *by agents* rather than only by humans.
- **Agentic research and document synthesis**: multi-step agents that gather sources, synthesize reports, and produce new explicit artifacts (briefs, specs, PRDs) from existing ones.
- **AI-in-the-loop knowledge-base hygiene**: deduplication, auto-tagging, taxonomy maintenance, stale-content detection — combination as janitorial work.

**Maturity: Mature.** Combination is the quadrant that LLMs do natively and industrially. Grounded retrieval (RAG) + graph-structured organization + generative synthesis is a solved-enough architecture that it underpins the entire enterprise-AI product category. The remaining weaknesses are quality-of-grounding (the Glean data shows residual hallucination even in grounded systems, concentrated in specialized domains) and the fact that combination without externalization input is self-referential — it recombines what is already explicit and cannot create genuinely new knowledge. Böhm & Durst's (2026) SECI→GRAI (Generate, Refine, Apply, Integrate) model essentially argues that GenAI has subsumed Combination so completely that a new acronym is warranted.

**Evidence.** Glean (2026); Shelf.io (2026); Atlan (2026); Microsoft Fabric IQ (2026); Böhm & Durst (2026); Kirchner & Scarso (2026), *Revisiting the SECI Model*; Yan, Husted & Fath (2026) systematic review of AI×SECI (82 articles).

---

## 6. Internalization (explicit → tacit): Machines as Coaches, Not Just Repositories

**Original theory.** Internalization is the conversion of explicit knowledge into embodied, tacit know-how through action — "learning by doing." The explicit knowledge created by externalization and combination must be lived until it becomes second nature.

**AI instantiations.** The clearest instantiations are **adaptive tutoring systems**: Khanmigo (Khan Academy × OpenAI) and Duolingo Max tutor through dialogue, adapt to learner errors, and scaffold practice; Socratic-style AI tutors embed explicit knowledge into learners through iterative problem-solving rather than presentation. **Interactive coding agents** internalize explicit knowledge for their users: the developer who watches an agent refactor and then reproduces the pattern by hand is assimilating machine-suggested structure into personal tacit skill — Chatterji et al.'s **assimilation** movement in vivo. **Simulated practice environments** (agentic role-play for sales training, synthetic patients for medical education) let people practice against AI-generated scenarios, converting explicit protocols into embodied response. On the machine side, **arXiv 2607.13091, *Self-Improving AI Coding Agents Through Accumulated Behavioral Rules*** (ICE 2026) shows the mirror process: agents convert explicit review feedback into persistent, version-controlled rules ("every accepted review comment is a self-review rule"), creating a ratchet of behavioral improvement — explicit knowledge internalized into machine behavior. The SIGPLAN community's AGENTS.md practice (2026) does the same at repository scale: repo-level docs function as the explicit substrate that agents internalize into behavior, with the caveat (Gloaguen et al., 2026) that boilerplate context can *hurt* agents — knowledge quality matters more than quantity.

**Maturity: Emerging.** Internalization is mature in education technology and in the narrow sense of agent rule-learning, but thin in general enterprise KM: most systems deliver explicit knowledge *to* people and stop there, never closing the loop back into embodied practice. The quadrant is the least instrumented in most organizations precisely because it requires *doing*, which enterprise software has historically not measured. Agentic systems change this: they log every action, creating — for the first time — observable traces of internalization.

**Evidence.** Khanmigo and Duolingo Max product evidence (2024–2026); arXiv 2607.13091; SIGPLAN blog (2026) *Repositories Are Human/Agent Knowledge Factories*; Gloaguen et al. (2026) via SIGPLAN; Matsumoto et al. (2025) HAC-SECI inner loop (agent growth through use).

---

## 7. Ba and the Digital Shared Context Layer: Where the Spiral Actually Happens

**Original theory.** *Ba* (Nonaka & Konno, 1998; Nonaka, Toyama & Konno, 2000) is the shared context — physical, virtual, or mental — in which knowledge acquires meaning and the spiral can turn. Ba is characterized by **redundancy** (overlapping information and responsibility that build common ground), **creative chaos** (ambiguity that forces re-examination), and **autonomy**. For Chatterji et al. (2026), the firm's core role in the AI age is precisely to *create the shared context in which human and machine knowledge can feed off each other* — the green milk is the failure of context, the prototype on the kitchen table is its remedy.

**AI instantiations — the digital Ba stack:**

- **Agent context layers**: Atlan's "Agent Context Layer vs. Knowledge Base" positions a semantic context substrate *under* multi-agent systems — the metadata, glossary, and lineage that let agents share meaning rather than just tokens. Ba as infrastructure: a shared field where agents and humans orient to the same concepts.
- **Microsoft Fabric IQ**: Microsoft's "shared context layer for AI agents" — ontologies, a Digital Twin, and a graph of enterprise objects — gives every agent a common world-model. A *shared context* play in name and design.
- **Cross-agent memory**: Augment Code's cross-agent organizational memory (persistent, governed memory shared across agent instances; deployed at Stripe, Ramp, Uber) makes the field itself durable — what one agent learns, another inherits. This is the **machine transfer** movement industrialized.
- **Agent memory taxonomy** (Dresher, 2026): stable knowledge (principles, conventions, glossary), decision knowledge (ADRs, tradeoffs, rejected options), operational knowledge (routing, escalation), workstream knowledge (current state of an effort), and ephemeral knowledge (scratch notes). Memory is not documentation; mixing these classes corrupts the field. His "synthetic folklore" risk — agent memory drifting from ground truth through iterative self-reference — is *creative chaos turned pathological*: the chaos Nonaka valued must stay grounded in reality, or it becomes compounding fiction.
- **MCP and context servers**: the Model Context Protocol ecosystem turns "context" into an addressable, shareable layer — the plumbing of digital ba.

**Maturity: Emerging.** Every major vendor now sells a "context layer" or "memory layer," but the field is fragmented across proprietary substrates, and governance is unsolved: who owns the shared context, who audits it, what happens when agent memory diverges from human truth? He et al. (2026), *Revisiting Ba*, argue GenAI transforms ba itself — AI-mediated interaction becoming a new form of shared context. The pieces exist; the standard does not.

**Evidence.** Atlan (2026) Agent Context Layer; Microsoft Fabric IQ (2026); Augment Code (2026) cross-agent memory; Dresher (2026) memory taxonomy; Chatterji et al. (2026) §3 on ba and redundancy; He et al. (2026) *Revisiting Ba*; Nonaka & Konno (1998).

---

## 8. Tacit Machine Knowledge and the Five New Movements: Synthesis

Chatterji et al.'s (2026) deepest claim is that tacit machine knowledge is not a metaphor but a new ontological category with one decisive property: **portability**. Human tacit knowledge travels slowly, person to person, through shared experience; machine tacit knowledge travels at software speed, machine to machine, without ever being articulated. The five movements it adds to SECI — encoding, embedding, extraction, assimilation, machine transfer — form a *second spiral* interleaved with Nonaka's human spiral. The NotCo case demonstrates all five in one product lifecycle; the ChatGPT training pipeline (web-scale encoding → RLHF embedding → output extraction → user assimilation → API-served machine transfer) demonstrates them at planetary scale.

Three implications for the matrix above:

1. **Externalization is no longer the only bottleneck.** In Nonaka's original model, tacit knowledge becomes organizational only by being externalized. In the extended model, tacit machine knowledge becomes organizational *without* externalization — through machine transfer. This is why Combination and Ba are rising in strategic importance relative to Externalization: the machine half of the spiral can move knowledge without articulating it, but only if the shared context exists to give it meaning.
2. **Every quadrant now has a machine counterpart.** Socialization ↔ embedding; externalization ↔ extraction; combination ↔ encoding (into models) + synthesis (out of them); internalization ↔ assimilation and rule accumulation. An organization that builds only the human-side capabilities is running a half-spiral.
3. **False externalization is the new failure mode of the spiral.** The green milk was a *context* failure (machine knowledge meeting human expectation without shared meaning); hallucination is a *truth* failure (machine output claiming explicit status without ground truth). Both stall the spiral, and both are mitigated by the same mechanism: a shared, grounded, human-auditable context.

---

## 9. SECI-as-Architecture: A Design Principle for Agentic Knowledge-Management Systems

The matrix yields a prescriptive principle. Current agentic KM products overwhelmingly implement **Combination-plus-Externalization-as-answering**: they retrieve, synthesize, and answer. That is a search engine wearing a knowledge-creation costume. A system that *respects the spiral* must be designed as a closed loop over all nine movements:

**1. Ground every machine output in auditable explicit sources (truth-conditioned extraction).** No ungrounded externalization: every extracted claim must cite the explicit knowledge it came from (Glean-style grounding; RAG with provenance). This converts hallucination from an existential risk into a detectable, reviewable event.

**2. Build feedback as a first-class substrate, not an afterthought (embedding).** Every human accept/reject/correct/rate action on machine output must be captured and returned to the model or memory layer (NotCo's chefs; RLHF; arXiv 2607.13091's "every accepted review comment is a self-review rule"). The system should get *measurably better at the organization's tacit preferences* with use — this is the HAC-SECI inner loop.

**3. Design Ba as infrastructure: a governed shared context layer.** Implement the digital ba explicitly — a semantic layer (ontology, glossary, lineage; Fabric IQ, Atlan) that agents and humans both address, plus a cross-agent memory (Augment Code, Dresher's taxonomy) that is versioned, diffable, reviewable, and revertible. Memory must be treated with the seriousness of production code: disposable agents, durable memory.

**4. Respect the knowledge classes — never bucket them.** Stable, decision, operational, workstream, and ephemeral knowledge require different lifecycle policies (Dresher, 2026). Mixing them is how synthetic folklore and knowledge ossification arise: the spiral stalls when explicit knowledge is frozen in agents that no longer consult humans or ground truth.

**5. Close the loop into practice (internalization + assimilation).** Knowledge systems must not stop at answering; they must generate practice: tutoring interactions, simulations, agent-executed tasks with human review — so that explicit knowledge becomes embodied (human) and behavioral (machine) knowledge. Measure internalization by action traces, not by retrieval logs.

**6. Orchestrate the spiral deliberately — the middle manager becomes a spiral engineer.** Nonaka's knowledge engineers (middle managers) translate ideals into concepts; in the AI age their job is to run the human–machine spiral: pairing the model's wild proposals with domain experts' judgment, curating the shared context, deciding which extractions deserve another turn. The NotCo ideal — "familiar food from plants" — is what gave Giuseppe's chaos direction. A system that respects the spiral is one in which *some human role owns the spiral's rhythm*: chaos is admitted deliberately, redundancy is designed in, and failures (green milk) are treated as knowledge events, not bugs.

**7. Treat agent memory as an organizational knowledge asset with an owner.** Memory that no human can inspect, diff, or revert is a liability (synthetic folklore). Memory that is governed, audited, and shared across the organization is a knowledge asset — the machine-side crystallization of the firm's learning, portable (machine transfer) and combinable at scale. This is the new "knowledge crystallized in the product": the NotMilk of the agentic age is not just the output artifact, but the trained, governed, transferable machine knowledge itself.

In one sentence: **build the spiral, not the answer** — the agentic KM system of record should be judged not by the quality of its answers but by whether the organization's human and machine knowledge are measurably feeding each other in an accelerating, grounded, governed loop.

---

## 10. Maturity Summary

| Element | AI maturity | Bottleneck |
|---|---|---|
| Socialization | Emerging | Capture mature; tacit transfer partial |
| Externalization | Emerging | Works for shallow tacit; hallucination = false externalization |
| Combination | **Mature** | Grounding quality in specialized domains |
| Internalization | Emerging | Requires doing; thin in enterprise KM |
| Ba (shared context) | Emerging | Fragmented substrates; governance unsolved |
| Machine transfer | Emerging-to-mature | Portability solved; meaning/context unsolved |

---

## References

1. Nonaka, I. (1994). A Dynamic Theory of Organizational Knowledge Creation. *Organization Science*, 5(1). [PRIMARY]
2. Nonaka & Takeuchi (1995). *The Knowledge-Creating Company*. Oxford UP. [PRIMARY]
3. Nonaka, Toyama & Konno (2000). SECI, Ba and Leadership. *Long Range Planning*, 33(1). [PRIMARY]
4. Nonaka & Konno (1998). The Concept of "Ba". *California Management Review*. [PRIMARY]
5. Nonaka & von Krogh (2009). Tacit Knowledge and Knowledge Conversion. *Organization Science*, 20(3). [PRIMARY]
6. Polanyi, M. (1966). *The Tacit Dimension*. [PRIMARY]
7. **Chatterji, Rock & Talamàs (2026). The Human-Machine Knowledge Spiral. arXiv 2606.29227.** [PRIMARY — anchor]
8. van den Bent, Pernisch & Schlobach (2025). Investigating Knowledge Elicitation Automation with LLMs. *Semantic Web Journal*, swj3868. [PRIMARY]
9. Industry-Science (2026). Reinterpret Corporate Tacit Knowledge Using LLMs. [CASE]
10. LLM Hallucination: A Comprehensive Survey. arXiv 2510.06265. [SECONDARY]
11. Self-Improving AI Coding Agents Through Accumulated Behavioral Rules. arXiv 2607.13091 (ICE 2026). [PRIMARY]
12. Requirements Elicitation Follow-Up Question Generation. arXiv 2507.02858. [SECONDARY]
13. Glean (2026). Understanding LLM Hallucinations in Enterprise. [PRODUCT]
14. Atlan (2026). Agent Context Layer vs Knowledge Base. [PRODUCT]
15. Microsoft (2026). Fabric IQ: The Shared Context Layer for AI Agents. [PRODUCT]
16. Augment Code (2026). Cross-Agent Organizational Memory. [PRODUCT]
17. Shelf.io (2026). AI Knowledge Management. [PRODUCT]
18. Dresher, T. (2026). The Ship's Computer Has a Memory Problem. [CASE]
19. Ouyang et al. (2022). Training Language Models to Follow Instructions with Human Feedback. [PRIMARY]
20. Uchihira (2026). Tacit Knowledge Management with Generative AI: GenAI SECI Model. [PRIMARY]
21. Matsumoto, Nishikawa & Morimoto (2025). HAC-SECI Model. Tokyo University of Science. [PRIMARY]
22. Böhm & Durst (2026). Knowledge Management in the Age of Generative AI: From SECI to GRAI. [PRIMARY]
23. Kirchner & Scarso (2026). Revisiting the SECI Model. Springer. [PRIMARY]
24. He et al. (2026). Revisiting Ba: How Generative AI Transforms Knowledge Creation. [PRIMARY]
25. Yan, Husted & Fath (2026). Transforming Organizational Knowledge Creation Through AI: A Systematic Review. [SECONDARY]
26. SIGPLAN Blog (2026). Repositories Are Human/Agent Knowledge Factories. [CASE]
27. Gloaguen et al. (2026) via SIGPLAN. [SECONDARY]
28. Östberg, G. (2026). Make Tacit Knowledge Work for AI. [SECONDARY]
29. OWASP LLM09:2025 — LLM Hallucination and Misinformation. [SECONDARY]
30. Stanford HAI (2024). Hallucinating Law: Legal Mistakes with LLMs are Pervasive. [SECONDARY]
