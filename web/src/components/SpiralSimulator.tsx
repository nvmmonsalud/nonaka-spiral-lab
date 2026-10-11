"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import presetsData from "../../data/presets.json";
import {
  clamp,
  convertParticle,
  createParticle,
  type ConvertOutcome,
  type Particle,
  type SimParams,
} from "@/lib/spiral-engine";

type Preset = (typeof presetsData.presets)[number];

const QUADRANTS = [
  { key: "S", name: "SOCIALIZATION", color: "#E3DACC", x: 0, y: 0, ax: 0.25, ay: 0.25 },
  { key: "E", name: "EXTERNALIZATION", color: "#F3D9CE", x: 1, y: 0, ax: 0.75, ay: 0.25 },
  { key: "C", name: "COMBINATION", color: "#DCE3D0", x: 0, y: 1, ax: 0.25, ay: 0.75 },
  { key: "I", name: "INTERNALIZATION", color: "#F0EEE6", x: 1, y: 1, ax: 0.75, ay: 0.75 },
];

interface EventLog {
  id: number;
  t: string;
  msg: string;
  kind: "ok" | "warn" | "bad" | "info";
}

let nextId = 1;

const DEFAULT_PARAMS: SimParams = {
  humans: 6, agents: 3, baRedundancy: 0.7, baChaos: 0.6, baAutonomy: 0.6,
  feedbackRate: 0.85, machineTransfer: 0.7, hallucinationRisk: 0.2,
};

export default function SpiralSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const paramsRef = useRef<SimParams>(DEFAULT_PARAMS);
  const rafRef = useRef<number | null>(null);
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [running, setRunning] = useState(true);
  const [activePreset, setActivePreset] = useState<string>("notco");
  const [levelCounts, setLevelCounts] = useState({ l1: 0, l2: 0, l3: 0, l4: 0 });
  const [cycleCount, setCycleCount] = useState(0);
  const [spiralScore, setSpiralScore] = useState(0);
  const [events, setEvents] = useState<EventLog[]>([
    { id: 0, t: "00:00", msg: "Spiral initialized. Add knowledge, tune ba, watch the loop.", kind: "info" },
  ]);
  const [failureCount, setFailureCount] = useState(0);
  const eventCountRef = useRef(1);
  const cycleRef = useRef(0);
  const scoreRef = useRef(0);
  const failureRef = useRef(0);

  const pushEvent = useCallback((msg: string, kind: EventLog["kind"]) => {
    const now = new Date();
    const t = `${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    eventCountRef.current += 1;
    const ev = { id: eventCountRef.current, t, msg, kind };
    setEvents((prev) => [ev, ...prev].slice(0, 8));
    if (kind === "bad") {
      failureRef.current += 1;
      setFailureCount(failureRef.current);
    }
  }, []);

  // (Re)build the particle population from params
  const rebuildParticles = useCallback(() => {
    const p = paramsRef.current;
    const existing = particlesRef.current;
    // Keep existing non-corrupted particles; resize the population to target counts.
    const humans = existing.filter((pt) => pt.kind === "human");
    const agents = existing.filter((pt) => pt.kind === "agent");
    const target = [...humans.slice(0, p.humans), ...agents.slice(0, p.agents)];
    while (target.filter((pt) => pt.kind === "human").length < p.humans) {
      target.push(createParticle(nextId++, "human"));
    }
    while (target.filter((pt) => pt.kind === "agent").length < p.agents) {
      target.push(createParticle(nextId++, "agent"));
    }
    particlesRef.current = target;
  }, []);

  // Update params + persist to ref for the animation loop
  const updateParam = useCallback((key: keyof SimParams, value: number) => {
    const next = { ...paramsRef.current, [key]: value };
    paramsRef.current = next;
    setParams(next);
    setActivePreset("");
    rebuildParticles();
  }, [rebuildParticles]);

  const applyPreset = useCallback((preset: Preset) => {
    const next: SimParams = { ...preset.initial };
    paramsRef.current = next;
    setParams(next);
    setActivePreset(preset.id);
    rebuildParticles();
    pushEvent(`Preset loaded: ${preset.name} — ${preset.tagline}`, "info");
  }, [rebuildParticles, pushEvent]);

  // Apply what the engine reported to the UI mirrors (refs first, then state)
  const applyOutcome = useCallback((outcome: ConvertOutcome) => {
    if (outcome.cycles > 0) {
      cycleRef.current += outcome.cycles;
      setCycleCount(cycleRef.current);
      scoreRef.current += outcome.score;
      setSpiralScore(scoreRef.current);
    }
    outcome.events.forEach((ev) => pushEvent(ev.msg, ev.kind));
  }, [pushEvent]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let last = performance.now();
    let convertCooldown = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const parts = particlesRef.current;
      convertCooldown -= dt;

      ctx.clearRect(0, 0, w, h);

      // Draw quadrant zones
      QUADRANTS.forEach((q) => {
        const x0 = q.x === 0 ? 10 : w / 2 + 5;
        const y0 = q.y === 0 ? 10 : h / 2 + 5;
        const x1 = q.x === 0 ? w / 2 - 5 : w - 10;
        const y1 = q.y === 0 ? h / 2 - 5 : h - 10;
        ctx.fillStyle = q.color;
        ctx.strokeStyle = "#D1CFC5";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x0, y0, x1 - x0, y1 - y0, 12);
        ctx.fill();
        ctx.stroke();

        // Quadrant label
        const qx = (x0 + x1) / 2;
        const qy = y0 + 26;
        ctx.fillStyle = q.key === "E" ? "#B04A3F" : "#3D3D3A";
        ctx.font = "600 12px ui-monospace, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.fillText(q.name, qx, qy);
        ctx.fillStyle = "#87867F";
        ctx.font = "10px ui-monospace, Menlo, monospace";
        ctx.fillText(`${q.key === "S" ? "tacit→tacit" : q.key === "E" ? "tacit→explicit" : q.key === "C" ? "explicit→explicit" : "explicit→tacit"}`, qx, qy + 14);
      });

      // Level rails (ontological escalation indicator)
      const railY = h - 8;
      ctx.fillStyle = "#D1CFC5";
      ctx.fillRect(10, railY, w - 20, 4);
      const filled = clamp((scoreRef.current % 100) / 100, 0, 1);
      ctx.fillStyle = "#788C5D";
      ctx.fillRect(10, railY, (w - 20) * filled, 4);
      ctx.fillStyle = "#87867F";
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("ONTOLOGICAL LEVEL", 10, railY - 6);

      // Particles
      parts.forEach((pt) => {
        const q = QUADRANTS.find((qq) => qq.key === pt.quad) || QUADRANTS[0];
        const tx = q.ax * w + (Math.random() - 0.5) * w * 0.08;
        const ty = q.ay * h + (Math.random() - 0.5) * h * 0.08;
        const speed = 1.6 + pt.level * 0.3;
        pt.x += (tx - pt.x) * Math.min(dt * speed, 0.2);
        pt.y += (ty - pt.y) * Math.min(dt * speed, 0.2);

        // Conversion when close to target
        if (convertCooldown <= 0 && Math.hypot(tx - pt.x, ty - pt.y) < 12) {
          const outcome = convertParticle(pt, paramsRef.current);
          applyOutcome(outcome);
          if (outcome.result !== "regress") {
            convertCooldown = 0.9 + Math.random() * 0.5;
          }
        }

        const radius = pt.size * (pt.level > 2 ? 1.2 : 1);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        if (pt.corrupted) {
          ctx.fillStyle = "#B04A3F";
          ctx.strokeStyle = "#8F3A31";
        } else if (pt.kind === "agent") {
          ctx.fillStyle = pt.level >= 3 ? "#D97757" : "#E8A084";
          ctx.strokeStyle = "#D97757";
        } else {
          ctx.fillStyle = pt.level >= 3 ? "#788C5D" : "#A3B48C";
          ctx.strokeStyle = "#788C5D";
        }
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();

        // Level ring for high-level knowledge
        if (pt.level >= 3) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius + 3, 0, Math.PI * 2);
          ctx.strokeStyle = pt.kind === "agent" ? "#D97757" : "#788C5D";
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Level counts → React state (throttled-ish: every frame is fine, small object)
      const counts = { l1: 0, l2: 0, l3: 0, l4: 0 };
      parts.forEach((pt) => {
        if (pt.level === 1) counts.l1++;
        else if (pt.level === 2) counts.l2++;
        else if (pt.level === 3) counts.l3++;
        else counts.l4++;
      });
      setLevelCounts(counts);

      rafRef.current = requestAnimationFrame(tick);
    };

    if (running) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [running, applyOutcome]);

  // Initial rebuild on mount
  useEffect(() => {
    rebuildParticles();
  }, [rebuildParticles]);

  const toggleRun = () => setRunning((r) => !r);
  const resetSpiral = () => {
    particlesRef.current = [];
    cycleRef.current = 0;
    scoreRef.current = 0;
    failureRef.current = 0;
    setCycleCount(0);
    setSpiralScore(0);
    setFailureCount(0);
    rebuildParticles();
    pushEvent("Spiral reset. Fresh knowledge, fresh context.", "info");
  };

  return (
    <div className="sim-layout">
      <div>
        <div className="card" style={{ padding: 12 }}>
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: 420, display: "block", borderRadius: 8 }}
          />
        </div>
        <div className="stats">
          <div className="stat">
            <p className="mono-label">Spiral score</p>
            <p className="num">{spiralScore}</p>
          </div>
          <div className="stat">
            <p className="mono-label">Cycles</p>
            <p className="num">{cycleCount}</p>
          </div>
          <div className="stat" style={{ borderLeft: "4px solid var(--rust)" }}>
            <p className="mono-label">Failures</p>
            <p className="num" style={{ color: "var(--rust)" }}>{failureCount}</p>
          </div>
        </div>
        <div className="stats">
          <div className="stat"><p className="mono-label">L1 · Individual</p><p className="num">{levelCounts.l1}</p></div>
          <div className="stat"><p className="mono-label">L2 · Group</p><p className="num">{levelCounts.l2}</p></div>
          <div className="stat"><p className="mono-label">L3 · Org</p><p className="num">{levelCounts.l3}</p></div>
          <div className="stat"><p className="mono-label">L4 · Inter-org</p><p className="num">{levelCounts.l4}</p></div>
        </div>
      </div>

      <div className="controls">
        <div className="preset-grid">
          {presetsData.presets.map((preset) => (
            <button
              key={preset.id}
              className={`preset-btn ${activePreset === preset.id ? "active" : ""}`}
              onClick={() => applyPreset(preset)}
              title={preset.description}
            >
              {preset.icon} {preset.name}
            </button>
          ))}
        </div>

        <div className="control-row">
          <label>Humans <span className="val">{params.humans}</span></label>
          <input type="range" min={0} max={12} value={params.humans}
            onChange={(e) => updateParam("humans", Number(e.target.value))} />
        </div>
        <div className="control-row">
          <label>AI Agents <span className="val">{params.agents}</span></label>
          <input type="range" min={0} max={12} value={params.agents}
            onChange={(e) => updateParam("agents", Number(e.target.value))} />
        </div>
        <div className="control-row">
          <label>Ba · Redundancy <span className="val">{Math.round(params.baRedundancy * 100)}%</span></label>
          <input type="range" min={0} max={100} value={params.baRedundancy * 100}
            onChange={(e) => updateParam("baRedundancy", Number(e.target.value) / 100)} />
        </div>
        <div className="control-row">
          <label>Ba · Creative chaos <span className="val">{Math.round(params.baChaos * 100)}%</span></label>
          <input type="range" min={0} max={100} value={params.baChaos * 100}
            onChange={(e) => updateParam("baChaos", Number(e.target.value) / 100)} />
        </div>
        <div className="control-row">
          <label>Ba · Autonomy <span className="val">{Math.round(params.baAutonomy * 100)}%</span></label>
          <input type="range" min={0} max={100} value={params.baAutonomy * 100}
            onChange={(e) => updateParam("baAutonomy", Number(e.target.value) / 100)} />
        </div>
        <div className="control-row">
          <label>Feedback loop <span className="val">{Math.round(params.feedbackRate * 100)}%</span></label>
          <input type="range" min={0} max={100} value={params.feedbackRate * 100}
            onChange={(e) => updateParam("feedbackRate", Number(e.target.value) / 100)} />
        </div>
        <div className="control-row">
          <label>Machine transfer <span className="val">{Math.round(params.machineTransfer * 100)}%</span></label>
          <input type="range" min={0} max={100} value={params.machineTransfer * 100}
            onChange={(e) => updateParam("machineTransfer", Number(e.target.value) / 100)} />
        </div>
        <div className="control-row">
          <label>Hallucination risk <span className="val">{Math.round(params.hallucinationRisk * 100)}%</span></label>
          <input type="range" min={0} max={100} value={params.hallucinationRisk * 100}
            onChange={(e) => updateParam("hallucinationRisk", Number(e.target.value) / 100)} />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <button className="btn" onClick={toggleRun}>
            {running ? "⏸ Pause" : "▶ Resume"}
          </button>
          <button className="btn ghost" onClick={resetSpiral}>↺ Reset</button>
        </div>

        <div className="card" style={{ marginTop: 8 }}>
          <p className="mono-label">Event log</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {events.map((ev) => (
              <div key={ev.id} style={{ fontSize: 12, lineHeight: 1.4 }}>
                <span style={{ fontFamily: "var(--mono)", color: "var(--gray-500)" }}>{ev.t}</span>{" "}
                <span style={{ color: ev.kind === "bad" ? "var(--rust)" : ev.kind === "ok" ? "var(--olive)" : "var(--gray-700)" }}>
                  {ev.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
