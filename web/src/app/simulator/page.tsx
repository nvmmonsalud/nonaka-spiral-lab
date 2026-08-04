import Link from "next/link";
import SpiralSimulator from "@/components/SpiralSimulator";

export default function SimulatorPage() {
  return (
    <>
      <div className="hero" style={{ padding: "48px 24px 40px" }}>
        <div className="inner">
          <p className="eyebrow">The Knowledge Spiral Lab · Interactive</p>
          <h1 style={{ fontSize: 34 }}>Run the Knowledge Spiral</h1>
          <p className="sub" style={{ fontSize: 16 }}>
            Particles convert through Socialization → Externalization → Combination →
            Internalization. Each full cycle escalates an ontological level. Add agents,
            tune ba, and watch knowledge spiral — or stall.
          </p>
          <div className="meta">
            <span>Green = human · Orange = agent</span>
            <span>·</span>
            <span>Red = corrupted (false externalization)</span>
            <span>·</span>
            <span>Dashed ring = level 3+ knowledge</span>
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
        <SpiralSimulator />

        <div className="callout" style={{ marginTop: 28 }}>
          <p className="big">Build the spiral, not the answer.</p>
          <p style={{ marginTop: 8 }}>
            Low redundancy and high hallucination risk create <strong>false
            externalization</strong> — corrupted knowledge that stalls the loop.
            High feedback returns human judgment to the machine (the NotCo pattern).
            High machine transfer lets agent knowledge cross boundaries without
            articulation. The lesson is playable: <strong>context is the scarce
            resource</strong>.
          </p>
        </div>

        <div className="grid grid-3" style={{ marginTop: 20 }}>
          <div className="card">
            <p className="mono-label">Why it works</p>
            <h3>Redundancy + feedback</h3>
            <p>
              Overlapping knowledge builds shared meaning (ba); feedback returns
              human judgment to the machine — the HAC-SECI inner loop.
            </p>
          </div>
          <div className="card">
            <p className="mono-label">Why it fails</p>
            <h3>Context + truth failures</h3>
            <p>
              Green milk: machine knowledge meets human expectation without shared
              meaning. Hallucination: machine output claims explicit status without
              ground truth.
            </p>
          </div>
          <div className="card">
            <p className="mono-label">The frontier</p>
            <h3>Machine transfer</h3>
            <p>
              Tacit machine knowledge is portable at software speed — the scaling
              mechanism human tacit knowledge never had. Watch it cross level 4.
            </p>
          </div>
        </div>
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
