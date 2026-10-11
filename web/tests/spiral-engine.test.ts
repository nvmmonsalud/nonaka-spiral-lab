import { describe, expect, it } from "vitest";
import {
  COOLDOWN_MIN,
  NEXT_QUADRANT,
  QUADRANTS,
  convertChance,
  convertParticle,
  countLevels,
  createParticle,
  levelCountsEqual,
  meanLevel,
  stepParticle,
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

/** Returns the given values in order; throws once the script is exhausted. */
const scripted = (...vals: number[]) => {
  let i = 0;
  return () => {
    if (i >= vals.length) throw new Error("scripted rng exhausted");
    return vals[i++];
  };
};

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const make = (kind: Particle["kind"], quad: Quad, level = 1): Particle => ({
  ...createParticle(1, kind, () => 0.5),
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
    const out = convertParticle(pt, { ...P, hallucinationRisk: 1 }, scripted(0, 0));
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
    const out = convertParticle(pt, { ...P, baRedundancy: 0.1 }, scripted(0, 0));
    expect(out.result).toBe("stall");
    expect(pt.corrupted).toBe(true);
    expect(out.events[0].msg).toMatch(/green milk/);
  });

  it("lets agents transfer knowledge without changing quadrant", () => {
    const pt = make("agent", "S");
    const out = convertParticle(pt, { ...P, machineTransfer: 0.9 }, scripted(0, 0));
    expect(out.result).toBe("transfer");
    expect(pt.quad).toBe("S");
    expect(pt.level).toBe(2);
    expect(out.cycles).toBe(1);
    expect(out.score).toBe(20);
  });

  it("repairs corrupted knowledge through the feedback loop", () => {
    const pt = make("human", "E");
    pt.corrupted = true;
    const out = convertParticle(pt, { ...P, feedbackRate: 1 }, scripted(0, 0));
    expect(pt.corrupted).toBe(false);
    expect(pt.quad).toBe("C");
    expect(out.events[0].kind).toBe("ok");
  });

  it("keeps knowledge corrupted when there is no feedback loop", () => {
    const pt = make("human", "E");
    pt.corrupted = true;
    convertParticle(pt, { ...P, feedbackRate: 0 }, scripted(0, 0));
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

describe("stepParticle", () => {
  it("does nothing until the particle arrives", () => {
    const pt = make("human", "S");
    expect(stepParticle(pt, 0.1, false, P, scripted(0))).toBeNull();
    expect(pt.quad).toBe("S");
  });

  it("waits out its own cooldown", () => {
    const pt = { ...make("human", "S"), cooldown: 1 };
    expect(stepParticle(pt, 0.5, true, P, scripted(0))).toBeNull();
    expect(pt.cooldown).toBeCloseTo(0.5, 5);
  });

  it("converts and re-arms its cooldown", () => {
    const pt = make("human", "S");
    const out = stepParticle(pt, 0.016, true, P, scripted(0, 0));
    expect(out?.result).toBe("ok");
    expect(pt.cooldown).toBeGreaterThanOrEqual(COOLDOWN_MIN);
  });

  it("leaves the cooldown alone after a regression", () => {
    const pt = make("human", "E");
    const out = stepParticle(pt, 0.016, true, { ...P, baChaos: 0.8 }, scripted(0.99, 0));
    expect(out?.result).toBe("regress");
    expect(pt.cooldown).toBeLessThanOrEqual(0);
  });

  it("scales throughput with population (no shared cooldown)", () => {
    const run = (n: number) => {
      const rng = mulberry32(42);
      const parts = Array.from({ length: n }, (_, i) => createParticle(i, "human", rng));
      let attempts = 0;
      for (let t = 0; t < 20; t += 1 / 60) {
        for (const pt of parts) if (stepParticle(pt, 1 / 60, true, P, rng)) attempts++;
      }
      return attempts;
    };
    expect(run(8)).toBeGreaterThan(run(1) * 4);
  });
});

describe("level stats", () => {
  const at = (...levels: number[]) => levels.map((l) => make("human", "S", l));

  it("counts particles per level, folding anything above 3 into l4", () => {
    expect(countLevels(at(1, 1, 2, 3, 4, 4))).toEqual({ l1: 2, l2: 1, l3: 1, l4: 2 });
  });

  it("compares counts structurally", () => {
    expect(levelCountsEqual({ l1: 1, l2: 2, l3: 3, l4: 4 }, { l1: 1, l2: 2, l3: 3, l4: 4 })).toBe(true);
    expect(levelCountsEqual({ l1: 1, l2: 2, l3: 3, l4: 4 }, { l1: 1, l2: 2, l3: 4, l4: 3 })).toBe(false);
  });

  it("averages levels, defaulting to 1 when there are no particles", () => {
    expect(meanLevel([])).toBe(1);
    expect(meanLevel(at(1, 3))).toBe(2);
  });
});

describe("QUADRANTS geometry", () => {
  const byKey = Object.fromEntries(QUADRANTS.map((q) => [q.key, q]));

  it("places each quadrant by Nonaka's matrix (columns = to, rows = from)", () => {
    for (const q of QUADRANTS) {
      expect(q.x).toBe(q.to === "explicit" ? 1 : 0);
      expect(q.y).toBe(q.from === "explicit" ? 1 : 0);
    }
  });

  it("moves between adjacent cells on every step, including I → S", () => {
    for (const q of QUADRANTS) {
      const n = byKey[NEXT_QUADRANT[q.key]];
      expect(Math.abs(q.x - n.x) + Math.abs(q.y - n.y)).toBe(1);
    }
  });
});
