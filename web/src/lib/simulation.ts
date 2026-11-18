import { validateParams } from "./sim-config";
import {
  countLevels, createParticle, meanLevel, QUADRANTS, stepParticle,
  type ConvertResult, type LevelCounts, type Particle, type SimEvent, type SimParams,
} from "./spiral-engine";

export const ENGINE_VERSION = "1";
export const DEFAULT_SEED = 42;
export const TICKS_PER_SECOND = 60;

export type SimulationParticle = Particle & { lastResult: ConvertResult | null; lastTick: number | null };
export type HistorySample = LevelCounts & {
  tick: number; time: number; score: number; cycles: number; failures: number;
  corrupted: number; repairs: number; meanLevel: number;
};
export type SimulationEvent = SimEvent & {
  id: number; tick: number; particleId: number; result: ConvertResult;
  code: "hallucination" | "contextFailure" | "transferRefused" | "transfer" | "repair" | "levelUp";
  level: number; particleKind: Particle["kind"];
};
export type SimulationState = {
  seed: number; rngState: number; tick: number; params: SimParams;
  particles: SimulationParticle[]; score: number; cycles: number; failures: number;
  repairs: number; events: SimulationEvent[]; history: HistorySample[];
};

// Mulberry32: state is a single unsigned integer and survives JSON round trips.
function random(state: { value: number }): number {
  state.value = (state.value + 0x6d2b79f5) >>> 0;
  let t = state.value;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function getSimulationSample(state: SimulationState): HistorySample {
  return {
    ...countLevels(state.particles), tick: state.tick, time: state.tick / TICKS_PER_SECOND,
    score: state.score, cycles: state.cycles, failures: state.failures,
    corrupted: state.particles.filter((particle) => particle.corrupted).length,
    repairs: state.repairs, meanLevel: meanLevel(state.particles),
  };
}

export function createSimulation(params: SimParams, seed: number): SimulationState {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError("Seed must be an unsigned 32-bit integer.");
  const checked = validateParams(params);
  if (!checked.ok) throw new RangeError(checked.error);
  const rng = { value: seed };
  const particles: SimulationParticle[] = [];
  for (let id = 0; id < checked.value.humans + checked.value.agents; id++) {
    const kind = id < checked.value.humans ? "human" : "agent";
    particles.push({ ...createParticle(id, kind, () => random(rng)), lastResult: null, lastTick: null });
  }
  const state: SimulationState = {
    seed, rngState: rng.value, tick: 0, params: checked.value, particles,
    score: 0, cycles: 0, failures: 0, repairs: 0, events: [], history: [],
  };
  state.history.push(getSimulationSample(state));
  return state;
}

function eventCode(event: SimEvent): SimulationEvent["code"] {
  if (event.msg.startsWith("False externalization") || event.msg.startsWith("An agent hallucinated")) return "hallucination";
  if (event.msg.startsWith("Context failure")) return "contextFailure";
  if (event.msg.startsWith("Machine transfer refused")) return "transferRefused";
  if (event.msg.startsWith("Machine transfer:")) return "transfer";
  if (event.msg.startsWith("Feedback loop:")) return "repair";
  return "levelUp";
}

export function stepSimulation(state: SimulationState, steps = 1): SimulationState {
  if (!Number.isSafeInteger(steps) || steps < 0) throw new RangeError("Steps must be a nonnegative safe integer.");
  if (steps === 0) return state;
  const next: SimulationState = {
    ...state, params: { ...state.params }, particles: state.particles.map((particle) => ({ ...particle })),
    events: state.events.slice(), history: state.history.slice(),
  };
  const rng = { value: state.rngState };
  let eventId = (next.events.at(-1)?.id ?? 0) + 1;
  for (let i = 0; i < steps; i++) {
    next.tick++;
    for (const particle of next.particles) {
      const quadrant = QUADRANTS.find((q) => q.key === particle.quad)!;
      const factor = (1.6 + particle.level * 0.3) / TICKS_PER_SECOND;
      particle.x += (quadrant.ax - particle.x) * factor;
      particle.y += (quadrant.ay - particle.y) * factor;
      const arrived = Math.hypot(quadrant.ax - particle.x, quadrant.ay - particle.y) < 0.02;
      const outcome = stepParticle(particle, 1 / TICKS_PER_SECOND, arrived, next.params, () => random(rng));
      if (!outcome) continue;
      particle.lastResult = outcome.result;
      particle.lastTick = next.tick;
      next.score += outcome.score;
      next.cycles += outcome.cycles;
      for (const event of outcome.events) {
        const code = eventCode(event);
        if (event.kind === "bad") next.failures++;
        if (code === "repair") next.repairs++;
        next.events.push({ ...event, id: eventId++, tick: next.tick, particleId: particle.id,
          result: outcome.result, code, level: particle.level, particleKind: particle.kind });
      }
      if (next.events.length > 100) next.events.splice(0, next.events.length - 100);
    }
    if (next.tick % TICKS_PER_SECOND === 0) {
      next.history.push(getSimulationSample(next));
      if (next.history.length > 600) next.history.shift();
    }
  }
  next.rngState = rng.value;
  return next;
}
