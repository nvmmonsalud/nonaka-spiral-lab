import Link from "next/link";

const MATRIX_ROWS = [
  {
    el: "Socialization",
    dir: "tacit → tacit",
    ai: "Meeting copilots, pair-programming agents, RLHF preference transfer",
    maturity: "Emerging",
    bottle: "Capture mature; tacit transfer partial",
    badge: "emerging",
  },
  {
    el: "Externalization",
    dir: "tacit → explicit",
    ai: "Expert-interview LLMs, ontology elicitation, meeting-to-doc pipelines",
    maturity: "Emerging",
    bottle: "Works for shallow tacit; hallucination = false externalization",
    badge: "emerging",
  },
  {
    el: "Combination",
    dir: "explicit → explicit",
    ai: "RAG, Glean, knowledge graphs (Atlan, Fabric IQ), Shelf.io",
    maturity: "Mature",
    bottle: "Grounding quality in specialized domains",
    badge: "mature",
  },
  {
    el: "Internalization",
    dir: "explicit → tacit",
    ai: "Khanmigo, Duolingo Max, simulated practice, agent rule-learning",
    maturity: "Emerging",
    bottle: "Requires doing; thin in enterprise KM",
    badge: "emerging",
  },
  {
    el: "Ba / shared context",
    dir: "the field",
    ai: "Atlan Agent Context Layer, Fabric IQ, Augment cross-agent memory, MCP",
    maturity: "Emerging",
    bottle: "Fragmented substrates; governance unsolved",
    badge: "emerging",
  },
  {
    el: "Machine transfer",
    dir: "tacit machine → tacit machine",
    ai: "Model distillation, agent memory sharing, API-portable capabilities",
    maturity: "Emerging→Mature",
    bottle: "Portability solved; meaning/context unsolved",
    badge: "emerging",
  },
];

const CASES = [
  { name: "NotCo / Giuseppe", tag: "Food tech", lesson: "Machine knowledge without shared context fails; tacit machine knowledge is portable and sellable." },
  { name: "Matsushita Home Bakery", tag: "Appliances", lesson: "The externalization benchmark — AI lowers articulation cost but sharpens the ineffability critique." },
  { name: "Coding agents → rules", tag: "Software", lesson: "Human review is the highest-quality knowledge source (39% of rules); governance prevents ossification." },
  { name: "JPMorgan & Walmart agents", tag: "Banking / retail", lesson: "Combination and internalization run at machine scale; trust and context determine adoption." },
  { name: "Glean · Shelf.io · Atlan", tag: "Enterprise KM", lesson: "Shared context is the scarce resource — 5× accuracy with unchanged model and data." },
  { name: "LLM expert interviews", tag: "Consulting", lesson: "Machines elicit brilliantly but articulate unreliably — hybrid, human-validated externalization." },
  { name: "Khanmigo", tag: "Education", lesson: "Internalization can be engineered and measured (6.1% next-item gain); practice remains irreplaceable." },
];

export default function ResearchPage() {
  return (
    <>
      <div className="hero" style={{ padding: "48px 24px 40px" }}>
        <div className="inner">
          <p className="eyebrow">The Knowledge Spiral Lab · Research</p>
          <h1 style={{ fontSize: 34 }}>The SECI × AI Research</h1>
          <p className="sub" style={{ fontSize: 16 }}>
            The interactive app is grounded in a full research paper: Nonaka &amp;
            Takeuchi&apos;s SECI model, extended with tacit machine knowledge
            (Chatterji, Rock &amp; Talamàs 2026). The matrix below is the evidence
            spine.
          </p>
          <div className="meta">
            <span>6,000+ word paper</span>
            <span>·</span>
            <span>30 sources</span>
            <span>·</span>
            <span>7 real-world cases</span>
          </div>
        </div>
      </div>

      <nav>
        <div className="inner">
          <Link href="/">Home</Link>
          <Link href="/simulator">Simulator</Link>
          <Link href="/research">Research</Link>
          <Link href="https://github.com/nvmmonsalud/nonaka-spiral-lab" target="_blank" rel="noopener noreferrer">GitHub</Link>
        </div>
      </nav>

      <section style={{ paddingTop: 32 }}>
        <p className="eyebrow">01 · The matrix</p>
        <h2>SECI × AI: what actually exists</h2>
        <p className="lede">
          Only Combination is industrialized. The others are emerging — and the
          bottleneck is shared context, not raw knowledge.
        </p>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Element</th>
                <th>AI instantiations</th>
                <th>Maturity</th>
                <th>Bottleneck</th>
              </tr>
            </thead>
            <tbody>
              {MATRIX_ROWS.map((r) => (
                <tr key={r.el}>
                  <td>
                    <strong>{r.el}</strong>
                    <br />
                    <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--gray-500)" }}>
                      {r.dir}
                    </span>
                  </td>
                  <td>{r.ai}</td>
                  <td><span className={`badge ${r.badge}`}>{r.maturity}</span></td>
                  <td>{r.bottle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="alt">
        <p className="eyebrow">02 · Real-world cases</p>
        <h2>Seven cases, one pattern: AI as participant, not tool</h2>
        <div className="grid grid-2">
          {CASES.map((c) => (
            <div className="card" key={c.name}>
              <p className="mono-label">{c.tag}</p>
              <h3>{c.name}</h3>
              <p>{c.lesson}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="eyebrow">03 · The design principle</p>
        <h2>Build the spiral, not the answer</h2>
        <div className="grid grid-2">
          <div className="card">
            <p className="mono-label">1 · Truth-conditioned extraction</p>
            <p>Every extracted claim cites its source. Hallucination becomes a detectable event.</p>
          </div>
          <div className="card">
            <p className="mono-label">2 · Feedback as first-class substrate</p>
            <p>Every accept/reject/correct/rate returns to the model. The system learns your tacit preferences.</p>
          </div>
          <div className="card">
            <p className="mono-label">3 · Ba as governed infrastructure</p>
            <p>A semantic layer plus cross-agent memory — versioned, diffable, revertible. Disposable agents, durable memory.</p>
          </div>
          <div className="card">
            <p className="mono-label">4 · Respect the knowledge classes</p>
            <p>Stable, decision, operational, workstream, ephemeral — different lifecycles. Mixing breeds synthetic folklore.</p>
          </div>
          <div className="card">
            <p className="mono-label">5 · Close the loop into practice</p>
            <p>Generate tutoring, simulations, agent-executed tasks with review. Measure by action traces.</p>
          </div>
          <div className="card">
            <p className="mono-label">6 · Middle manager → spiral engineer</p>
            <p>Someone owns the spiral&apos;s rhythm — pairing wild proposals with domain judgment.</p>
          </div>
        </div>
        <div className="callout olive" style={{ marginTop: 20 }}>
          <p className="big">7 · Agent memory as a governed asset</p>
          <p style={{ marginTop: 8 }}>
            Uninspectable memory is a liability; governed, audited memory is the
            machine-side crystallization of the firm&apos;s learning — portable,
            combinable, valuable.
          </p>
        </div>
      </section>

      <footer>
        <div className="inner">
          <span>The Knowledge Spiral Lab · Nonaka × AI</span>
          <span>
            <Link href="/simulator" style={{ color: "var(--gray-500)" }}>Simulator</Link>
            {" · "}
            <a href="https://github.com/nvmmonsalud/nonaka-spiral-lab" style={{ color: "var(--gray-500)" }}>GitHub</a>
          </span>
        </div>
      </footer>
    </>
  );
}
