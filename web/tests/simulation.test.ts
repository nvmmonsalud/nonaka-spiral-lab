import { describe, expect, it } from "vitest";
import { DEFAULT_PARAMS } from "../src/lib/sim-config";
import { createSimulation, getSimulationSample, stepSimulation } from "../src/lib/simulation";

describe("deterministic simulation", () => {
  it("replays the same seed independently and across batch boundaries", () => {
    const initial = createSimulation(DEFAULT_PARAMS, 42);
    expect(stepSimulation(initial, 100)).toEqual(stepSimulation(stepSimulation(initial, 20), 80));
    expect(stepSimulation(initial, 100)).toEqual(stepSimulation(createSimulation(DEFAULT_PARAMS, 42), 100));
    expect(createSimulation(DEFAULT_PARAMS, 43).particles).not.toEqual(initial.particles);
  });

  it("does not mutate input and can resume after JSON serialization", () => {
    const initial = createSimulation(DEFAULT_PARAMS, 7);
    const snapshot = structuredClone(initial);
    const next = stepSimulation(initial, 120);
    expect(initial).toEqual(snapshot);
    expect(stepSimulation(JSON.parse(JSON.stringify(next)), 60)).toEqual(stepSimulation(initial, 180));
    expect(stepSimulation(initial, 0)).toEqual(initial);
    for (const n of [-1, 0.5, NaN, Infinity]) expect(() => stepSimulation(initial, n)).toThrow();
  });

  it("rejects invalid seed and parameters", () => {
    for (const seed of [-1, 1.5, NaN, Infinity, 4294967296]) expect(() => createSimulation(DEFAULT_PARAMS, seed)).toThrow();
    expect(() => createSimulation({ ...DEFAULT_PARAMS, humans: 13 }, 1)).toThrow();
    expect(() => createSimulation({ ...DEFAULT_PARAMS, feedbackRate: NaN }, 1)).toThrow();
  });

  it("samples empty and maximum populations and bounds the history", () => {
    const empty = createSimulation({ ...DEFAULT_PARAMS, humans: 0, agents: 0 }, 0);
    expect(getSimulationSample(empty)).toMatchObject({ tick: 0, time: 0, meanLevel: 1, l1: 0, corrupted: 0 });
    const max = createSimulation({ ...DEFAULT_PARAMS, humans: 12, agents: 12 }, 1);
    expect(max.particles).toHaveLength(24);
    const long = stepSimulation(empty, 600 * 60);
    expect(long.history).toHaveLength(600);
    expect(long.history[0].tick).toBe(60);
    expect(long.history.at(-1)?.tick).toBe(600 * 60);
  });

  it("tracks outcomes and caps events while preserving engine accounting", () => {
    const params = { ...DEFAULT_PARAMS, humans: 0, agents: 12, hallucinationRisk: 1, feedbackRate: 0, machineTransfer: 0 };
    const state = stepSimulation(createSimulation(params, 12), 30000);
    expect(state.events.length).toBeLessThanOrEqual(100);
    expect(state.failures).toBeGreaterThan(100);
    expect(state.events.every((event) => event.code === "hallucination" && event.kind === "bad")).toBe(true);
    expect(state.particles.some((particle) => particle.corrupted)).toBe(true);
    expect(state.history.at(-1)).toEqual(getSimulationSample(state));
  });
});
