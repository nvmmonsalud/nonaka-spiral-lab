import { describe, expect, it } from "vitest";
import {
  convertChance,
  convertParticle,
  createParticle,
  type Particle,
  type Quad,
  type SimParams,
} from "../src/lib/spiral-engine";

// convertChance(P) = 0.905
const P: SimParams = {
  humans: 6,
  agents: 3,
  baRedundancy: 0.7,
  baChaos: 0.6,
  baAutonomy: 0.6,
  feedbackRate: 0.85,
  machineTransfer: 0.7,
  hallucinationRisk: 0.2,
};

/** Returns the given values in order, wrapping around. */
const scripted = (...vals: number[]) => {
  let i = 0;
  return () => vals[i++ % vals.length];
};

const make = (kind: Particle["kind"], quad: Quad, level = 1): Particle => ({
  ...createParticle(1, kind, scripted(0.5)),
  quad,
  level,
  cooldown: 0,
});

describe("convertChance", () => {
  it("weights redundancy highest and clamps to 0.15–0.95", () => {
    expect(convertChance(P)).toBeCloseTo(0.905, 5);
    expect(convertChance({ ...P, baRedundancy: 0, baChaos: 0, baAutonomy: 0, feedbackRate: 0 })).toBe(0.15);
    expect(convertChance({ ...P, baRedundancy: 1, baChaos: 1, baAutonomy: 1, feedbackRate: 1 })).toBe(0.95);
  });
});

describe("convertParticle", () => {
  it("advances a human one quadrant on success", () => {
    const pt = make("human", "S");
    const out = convertParticle(pt, P, scripted(0));
    expect(out.result).toBe("ok");
    expect(pt.quad).toBe("E");
    expect(out.cycles).toBe(0);
  });

  it("escalates level and scores on a full cycle", () => {
    const pt = make("human", "I");
    const out = convertParticle(pt, P, scripted(0, 0.99));
    expect(pt.quad).toBe("S");
    expect(pt.level).toBe(2);
    expect(out.cycles).toBe(1);
    expect(out.score).toBe(20);
    expect(out.events).toHaveLength(0);
  });

  it("stalls without moving when the roll fails", () => {
    const pt = make("human", "E");
    const out = convertParticle(pt, P, scripted(0.99));
    expect(out.result).toBe("stall");
    expect(pt.quad).toBe("E");
  });

  it("regresses to S in a very chaotic ba on a failed roll", () => {
    const pt = make("human", "E");
    const out = convertParticle(pt, { ...P, baChaos: 0.8 }, scripted(0.99, 0));
    expect(out.result).toBe("regress");
    expect(pt.quad).toBe("S");
  });

  it("corrupts an agent's externalization when hallucination fires", () => {
    const pt = make("agent", "E");
    const out = convertParticle(pt, { ...P, hallucinationRisk: 1 }, scripted(0));
    expect(out.result).toBe("stall");
    expect(pt.corrupted).toBe(true);
    expect(pt.quad).toBe("E");
    expect(out.events[0].kind).toBe("bad");
  });

  it("never hallucinates humans", () => {
    const pt = make("human", "E");
    convertParticle(pt, { ...P, hallucinationRisk: 1 }, scripted(0));
    expect(pt.corrupted).toBe(false);
  });

  it("fails combination without shared context (green milk)", () => {
    const pt = make("human", "C");
    const out = convertParticle(pt, { ...P, baRedundancy: 0.1 }, scripted(0));
    expect(out.result).toBe("stall");
    expect(pt.corrupted).toBe(true);
    expect(out.events[0].msg).toMatch(/green milk/);
  });

  it("lets agents transfer knowledge without changing quadrant", () => {
    const pt = make("agent", "S");
    const out = convertParticle(pt, { ...P, machineTransfer: 0.9 }, scripted(0));
    expect(out.result).toBe("transfer");
    expect(pt.quad).toBe("S");
    expect(pt.level).toBe(2);
    expect(out.cycles).toBe(1);
    expect(out.score).toBe(20);
  });

  it("repairs corrupted knowledge through the feedback loop", () => {
    const pt = make("human", "E");
    pt.corrupted = true;
    const out = convertParticle(pt, { ...P, feedbackRate: 1 }, scripted(0));
    expect(pt.corrupted).toBe(false);
    expect(pt.quad).toBe("C");
    expect(out.events[0].kind).toBe("ok");
  });

  it("keeps knowledge corrupted when there is no feedback loop", () => {
    const pt = make("human", "E");
    pt.corrupted = true;
    convertParticle(pt, { ...P, feedbackRate: 0 }, scripted(0));
    expect(pt.corrupted).toBe(true);
    expect(pt.quad).toBe("C");
  });

  it("needs machineTransfer strictly above 0.6 before agents skip articulation", () => {
    const pt = make("agent", "S");
    const out = convertParticle(pt, { ...P, machineTransfer: 0.6 }, scripted(0));
    expect(out.result).toBe("ok");
    expect(pt.quad).toBe("E");
  });

  it("caps level at 4", () => {
    const pt = make("human", "I", 4);
    convertParticle(pt, P, scripted(0, 0.99));
    expect(pt.level).toBe(4);
  });
});
