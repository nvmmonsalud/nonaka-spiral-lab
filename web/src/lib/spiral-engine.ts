export type Quad = "S" | "E" | "C" | "I";
export type Rng = () => number;
export type EventKind = "ok" | "warn" | "bad" | "info";

export interface SimParams {
  humans: number;
  agents: number;
  baRedundancy: number;
  baChaos: number;
  baAutonomy: number;
  feedbackRate: number;
  machineTransfer: number;
  hallucinationRisk: number;
}

export interface Particle {
  id: number;
  kind: "human" | "agent";
  quad: Quad;
  level: number; // 1..4 ontological level
  x: number;
  y: number;
  vx: number;
  vy: number;
  corrupted: boolean;
  size: number;
  cooldown: number; // seconds until this particle may convert again
}

export interface SimEvent {
  msg: string;
  kind: EventKind;
}

export type ConvertResult = "ok" | "stall" | "regress" | "transfer";

export interface ConvertOutcome {
  result: ConvertResult;
  events: SimEvent[];
  cycles: number; // full SECI cycles / machine transfers completed by this conversion
  score: number;
}

export const MAX_LEVEL = 4;
export const COOLDOWN_MIN = 1.5;
export const COOLDOWN_JITTER = 1.0;

export const NEXT_QUADRANT: Record<Quad, Quad> = { S: "E", E: "C", C: "I", I: "S" };

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function createParticle(id: number, kind: Particle["kind"], rng: Rng = Math.random): Particle {
  return {
    id,
    kind,
    quad: "S",
    level: 1,
    x: rng(),
    y: rng(),
    vx: 0,
    vy: 0,
    corrupted: false,
    size: (kind === "human" ? 7 : 8) + rng() * 3,
    cooldown: rng() * COOLDOWN_MIN, // stagger first conversions
  };
}

export function convertChance(p: SimParams): number {
  const raw = p.baRedundancy * 0.5 + p.baChaos * 0.2 + p.baAutonomy * 0.3 + p.feedbackRate * 0.3;
  return clamp(raw, 0.15, 0.95);
}

function levelUp(pt: Particle, out: ConvertOutcome) {
  pt.level = clamp(pt.level + 1, 1, MAX_LEVEL);
  out.cycles += 1;
  out.score += pt.level * 10;
}

/** One SECI conversion attempt. Mutates `pt`; reports what happened. */
export function convertParticle(pt: Particle, p: SimParams, rng: Rng = Math.random): ConvertOutcome {
  const out: ConvertOutcome = { result: "ok", events: [], cycles: 0, score: 0 };
  const success = rng() < convertChance(p);

  // Hallucination risk: agent output may be false externalization
  if (pt.kind === "agent" && pt.quad === "E" && rng() < p.hallucinationRisk) {
    pt.corrupted = true;
    out.result = "stall";
    out.events.push({
      msg:
        pt.level >= 3
          ? `False externalization: an agent at level ${pt.level} produced hallucinated knowledge.`
          : "An agent hallucinated during externalization.",
      kind: "bad",
    });
    return out;
  }

  // Green-milk style context failure when ba redundancy is very low
  if (pt.quad === "C" && p.baRedundancy < 0.25 && rng() < 0.35) {
    pt.corrupted = true;
    out.result = "stall";
    out.events.push({
      msg: "Context failure: combined knowledge without shared meaning (green milk).",
      kind: "bad",
    });
    return out;
  }

  if (!success) {
    // Chaotic environments sometimes move knowledge *back* a mode — creative chaos.
    if (p.baChaos > 0.7 && rng() < 0.25) {
      pt.quad = "S";
      out.result = "regress";
      return out;
    }
    out.result = "stall";
    return out;
  }

  // Machine transfer: at high machineTransfer, agent knowledge skips human articulation
  if (pt.kind === "agent" && p.machineTransfer > 0.6 && rng() < p.machineTransfer * 0.4) {
    levelUp(pt, out);
    if (pt.level >= MAX_LEVEL && rng() < 0.2) {
      out.events.push({
        msg: "Machine transfer: tacit machine knowledge crossed the organizational boundary.",
        kind: "ok",
      });
    }
    out.result = "transfer";
    return out;
  }

  // Normal conversion: advance to next quadrant
  const next = NEXT_QUADRANT[pt.quad];
  pt.quad = next;
  if (pt.corrupted && rng() < p.feedbackRate) {
    // Feedback loop repairs corrupted knowledge (the NotCo pattern)
    pt.corrupted = false;
    out.events.push({ msg: "Feedback loop: a human judgment corrected corrupted knowledge.", kind: "ok" });
  }
  if (next === "S") {
    // Full cycle complete → escalate ontological level
    levelUp(pt, out);
    if (pt.level >= 2 && rng() < 0.15) {
      out.events.push({ msg: `Knowledge escalated to level ${pt.level} (${pt.kind}).`, kind: "info" });
    }
  }
  return out;
}
