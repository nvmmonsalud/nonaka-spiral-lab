import Link from "next/link";
import { SecQuadrant } from "@/components/SecQuadrant";

export default function Home() {
  return (
    <>
      <div className="hero">
        <div className="inner">
          <p className="eyebrow">The Knowledge Spiral Lab · SECI × AI · 2026</p>
          <h1>
            Build the <em>Spiral</em>, Not the Answer
          </h1>
          <p className="sub">
            An interactive simulation of Nonaka &amp; Takeuchi&apos;s SECI model —
            extended with <strong>tacit machine knowledge</strong>. Add humans and AI
            agents to an organization, tune its shared context, and watch knowledge
            spiral, stall, or scale.
          </p>
          <div className="meta">
            <span>Based on 6,000-word research paper</span>
            <span>·</span>
            <span>7 real-world cases</span>
            <span>·</span>
            <span>9-movement extended model</span>
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

      <section>
        <p className="eyebrow">01 · The thesis</p>
        <h2>Nonaka is more relevant than ever — but the spiral must be extended</h2>
        <p className="lede">
          Artificial intelligence introduces a new object into the knowledge-creating
          company: <strong>tacit machine knowledge</strong> — knowledge machines hold
          that is hard to articulate, but travels at software speed. That changes
          everything except the core job.
        </p>
        <div className="grid grid-3">
          <div className="card">
            <p className="mono-label">Question 1</p>
            <h3>Does SECI still explain?</h3>
            <p>
              Yes — but only in an extended, <strong>nine-movement</strong> form where
              every human mode has a machine counterpart.
            </p>
          </div>
          <div className="card">
            <p className="mono-label">Question 2</p>
            <h3>Can LLMs externalize tacit knowledge?</h3>
            <p>
              Partially. Machines <strong>elicit brilliantly but articulate
              unreliably</strong> — externalization must be hybrid, with humans as the
              arbiter of justification.
            </p>
          </div>
          <div className="card">
            <p className="mono-label">Question 3</p>
            <h3>What is ba when agents participate?</h3>
            <p>
              It is <strong>infrastructure</strong>: a governed, permission-aware shared
              context layer — a graph, an MCP server, a memory policy.
            </p>
          </div>
        </div>
      </section>

      <section className="alt">
        <p className="eyebrow">02 · The model</p>
        <h2>Four modes of knowledge conversion</h2>
        <p className="lede">
          The SECI model (Nonaka &amp; Takeuchi, 1995): knowledge is created by
          converting between tacit and explicit knowledge, escalating across
          individual → group → organization → inter-organization.
        </p>
        <SecQuadrant />
      </section>

      <section>
        <p className="eyebrow">03 · Try it</p>
        <h2>Run the spiral yourself</h2>
        <p className="lede">
          Jump into the simulator. Choose a preset — NotCo&apos;s accelerating
          human-machine spiral, the siloed org that stalls, the green-milk context
          failure — then tune the levers and watch knowledge convert, corrupt, and scale.
        </p>
        <Link href="/simulator" className="btn" style={{ display: "inline-block" }}>
          Open the Simulator →
        </Link>
      </section>

      <footer>
        <div className="inner">
          <span>The Knowledge Spiral Lab · Nonaka × AI</span>
          <span>
            <Link href="/research" style={{ color: "var(--gray-500)" }}>Research</Link>
            {" · "}
            <a href="https://github.com/nvmmonsalud/nonaka-spiral-lab" style={{ color: "var(--gray-500)" }}>GitHub</a>
          </span>
        </div>
      </footer>
    </>
  );
}
