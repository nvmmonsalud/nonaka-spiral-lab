export type Quad = "S" | "E" | "C" | "I";
export type Mode = "tacit" | "explicit";
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

export interface QuadrantDef {
  key: Quad;
  name: string;
  from: Mode;
  to: Mode;
  x: 0 | 1; // grid column: 0 = converts *to* tacit, 1 = converts *to* explicit
  y: 0 | 1; // grid row: 0 = converts *from* tacit, 1 = converts *from* explicit
  ax: number; // anchor, fraction of canvas width
  ay: number; // anchor, fraction of canvas height
}

export const MAX_LEVEL = 4;
export const COOLDOWN_MIN = 1.5;
export const COOLDOWN_JITTER = 1.0;

export const NEXT_QUADRANT: Record<Quad, Quad> = { S: "E", E: "C", C: "I", I: "S" };

// Nonaka's matrix: columns = knowledge converted TO, rows = converted FROM.
// Reading S → E → C → I walks the grid clockwise.
export const QUADRANTS: QuadrantDef[] = [
  { key: "S", name: "SOCIALIZATION", from: "tacit", to: "tacit", x: 0, y: 0, ax: 0.25, ay: 0.25 },
  { key: "E", name: "EXTERNALIZATION", from: "tacit", to: "explicit", x: 1, y: 0, ax: 0.75, ay: 0.25 },
  { key: "C", name: "COMBINATION", from: "explicit", to: "explicit", x: 1, y: 1, ax: 0.75, ay: 0.75 },
  { key: "I", name: "INTERNALIZATION", from: "explicit", to: "tacit", x: 0, y: 1, ax: 0.25, ay: 0.75 },
];

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

/**
 * Advance one particle's conversion clock by `dt`. Converts when the particle has
 * arrived at its quadrant anchor and its own cooldown has elapsed. A regression
 * leaves the cooldown alone so the particle can try again immediately.
 */
export function stepParticle(
  pt: Particle,
  dt: number,
  arrived: boolean,
  p: SimParams,
  rng: Rng = Math.random
): ConvertOutcome | null {
  pt.cooldown -= dt;
  if (!arrived || pt.cooldown > 0) return null;
  const out = convertParticle(pt, p, rng);
  if (out.result !== "regress") pt.cooldown = COOLDOWN_MIN + rng() * COOLDOWN_JITTER;
  return out;
}

export interface LevelCounts {
  l1: number;
  l2: number;
  l3: number;
  l4: number;
}

export function countLevels(parts: Particle[]): LevelCounts {
  const counts: LevelCounts = { l1: 0, l2: 0, l3: 0, l4: 0 };
  for (const pt of parts) {
    if (pt.level === 1) counts.l1++;
    else if (pt.level === 2) counts.l2++;
    else if (pt.level === 3) counts.l3++;
    else counts.l4++;
  }
  return counts;
}

export function levelCountsEqual(a: LevelCounts, b: LevelCounts): boolean {
  return a.l1 === b.l1 && a.l2 === b.l2 && a.l3 === b.l3 && a.l4 === b.l4;
}

/** Mean ontological level, 1 when there are no particles. */
export function meanLevel(parts: Particle[]): number {
  if (parts.length === 0) return 1;
  return parts.reduce((sum, pt) => sum + pt.level, 0) / parts.length;
}
