# Spiral Lab Engine Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the simulator's model testable and correct — extract the SECI engine into a pure module, fix the throughput, render-loop, quadrant-geometry and labeling defects found in review, and add the repo's first test suite to CI.

**Architecture:** Pull every rule in `SpiralSimulator.tsx`'s `onConvert` into a pure, RNG-injectable module (`web/src/lib/spiral-engine.ts`). The component keeps owning canvas drawing, movement, and the ref/state split; it calls the engine and applies the returned outcome. Vitest (node environment, no DOM) tests the engine and `presets.json` directly.

**Tech Stack:** Next.js 16.3.0, React 19.2.8, TypeScript 5.9.3 (strict), Vitest 5.0.3 (new), GitHub Actions (Node 22).

**Spec:** None separate. The requirements come from the review findings in the next section, which is part of this plan.

## Findings that drive this plan

Review of `web/` at `b17fd29` plus the working tree on 2026-10-11. `npm run lint` and `npx tsc --noEmit` both pass clean on the working tree before any change.

| # | Finding | Where | Task |
|---|---|---|---|
| F1 | One shared `convertCooldown` gates *every* particle, so total conversions/sec is ~1 regardless of how many humans/agents exist. The Humans/Agents sliders barely change cycle rate. | `SpiralSimulator.tsx` `tick`: `let convertCooldown`, `convertCooldown -= dt`, the `convertCooldown <= 0` check | 3 |
| F2 | `setLevelCounts(counts)` runs every frame with a fresh object, so the whole component re-renders at 60fps. This violates the "RAF loop reads refs, state mirrors for UI" split in `CLAUDE.md`. | `tick`, "Level counts → React state" block | 4 |
| F3 | The rail labelled "ONTOLOGICAL LEVEL" actually draws `score % 100`. | `tick`, "Level rails" block | 4 |
| F4 | Quadrant layout matches no convention. Nonaka's matrix has columns = converted *to*, rows = converted *from*, so Combination (explicit→explicit) is bottom-right and Internalization (explicit→tacit) is bottom-left. The code has them swapped, so S→E→C jumps diagonally. The home-page diagram's four arrows don't follow S→E→C→I either (one points E→S). | `QUADRANTS` in `SpiralSimulator.tsx`; arrows and C/I blocks in `SecQuadrant.tsx` | 5 |
| F5 | The `siloed` preset says "the spiral stalls at socialization". The code gives it a ~21% success chance per attempt and no S-specific stall; it crawls, it doesn't stall at S. | `web/data/presets.json` | 6 |
| F6 | No tests exist, and nothing guards `presets.json` against out-of-range values (issue #15 invites outside contributors to add presets). | repo-wide | 1, 6 |
| F7 | `CLAUDE.md` says typecheck is "not in package.json scripts" and "there is no test suite". `typecheck` is in `web/package.json`; docs and the PR template list only lint/typecheck/build. | `CLAUDE.md`, `CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md` | 7 |
| F8 | `vitest@5.0.3` cannot install next to the working tree's pinned `@types/node@20.19.43` (`ERESOLVE`: peer `^20.19.0 \|\| >=22.12.0` via vite, `^22 \|\| >=24` via vitest). CI runs Node 22, so `@types/node@22` is the right pin. Dependabot PR #16 proposes `@types/node` 26. | `web/package.json` | 1, 7 |

## Global Constraints

- Work on a branch and open a PR. **Never push to `main`**: `deploy.yml` deploys production on every push to `main`.
- Do not edit `.github/workflows/deploy.yml`. Draft PR #20 ("ci: require manual validated deployments") rewrites it.
- Next.js is v16 with breaking changes: read the relevant guide in `web/node_modules/next/dist/docs/` before writing any Next-specific code. (This plan adds none.)
- Keep the ref/state split in `SpiralSimulator.tsx`: the RAF loop reads `paramsRef`/`particlesRef`/`cycleRef`/`scoreRef`/`failureRef`; React state mirrors them for the UI.
- Reuse the palette tokens from `globals.css`; do not introduce new hardcoded colors. (The existing hardcoded canvas hexes stay as they are; moving them is issue #12's job.)
- Match the surrounding code style: double quotes, semicolons, 2-space indent, explicit `interface`s.
- All commands run from `web/` unless a step says otherwise.
- Before every push, all four must pass: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- The working tree already has uncommitted edits to `web/package.json`, `web/package-lock.json`, `web/tsconfig.json`. Task 1 builds on the `package.json` pins in that working tree. Do not discard them; see Task 1 Step 1.

## Review Focus

Failure modes the spec implies but a casual reading would not test, most likely to bite first:

1. **No knowledge carriers** (humans 0 and agents 0): rail and stats must not divide by zero. Pinned by `meanLevel([])` (Task 4) and the presets "at least one knowledge carrier" check (Task 1).
2. **All levers at zero**: conversions must still be possible (floor of 0.15), never frozen. Pinned by the `convertChance` clamp test (Task 2).
3. **No feedback loop**: corrupted knowledge must stay corrupted when it advances. Pinned in Task 2.
4. **Boundary at `machineTransfer = 0.6`**: the rule is strictly greater than 0.6; exactly 0.6 must not transfer. Pinned in Task 2.
5. **Level 4 saturation and regression**: level stays capped at 4; a regression must not consume the cooldown. Pinned in Tasks 2 and 3.

---

## File structure

| File | Responsibility | Task |
|---|---|---|
| `web/vitest.config.ts` (create) | Vitest config: node env, `tests/**/*.test.ts` | 1 |
| `web/tests/presets.test.ts` (create) | Guard `data/presets.json` shape and ranges | 1, 6 |
| `web/src/lib/spiral-engine.ts` (create) | Pure model: types, constants, `convertChance`, `convertParticle`, `stepParticle`, level stats, `QUADRANTS` | 2–5 |
| `web/tests/spiral-engine.test.ts` (create) | Engine behavior tests | 2–5 |
| `web/src/components/SpiralSimulator.tsx` (modify) | Drop local model code; call the engine; per-particle cooldown; gated level-count state; mean-level rail | 2–5 |
| `web/src/components/SecQuadrant.tsx` (modify) | Combination/Internalization positions, clockwise arrows | 5 |
| `web/data/presets.json` (modify) | Honest `siloed` description | 6 |
| `.github/workflows/ci.yml` (modify) | Run `npm test` | 1 |
| `.github/dependabot.yml` (modify) | Hold `@types/node` majors to the CI Node version | 7 |
| `CLAUDE.md`, `CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md` (modify) | Doc fixes | 7 |

---

### Task 1: Test harness and preset guard

**Files:**
- Create: `web/vitest.config.ts`
- Create: `web/tests/presets.test.ts`
- Modify: `web/package.json` (scripts, devDependencies)
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Produces: `npm test` (runs `vitest run`), consumed by every later task and CI.

- [ ] **Step 1: Start from a clean branch, keeping the working-tree pins**

```bash
git switch -c feat/engine-hardening
git status --short
```

Expected: the three `web/` files from Global Constraints show as modified, nothing else you didn't expect. The `package.json` working-tree edit pins `@types/node`, `@types/react`, and `typescript` to exact versions; keep it. If the owner decides to discard those edits instead, Step 4 still works: it only needs `@types/node` at `22.x`.

- [ ] **Step 2: Write the failing preset guard test**

Create `web/tests/presets.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import presetsData from "../data/presets.json";

const PARAM_KEYS = [
  "humans",
  "agents",
  "baRedundancy",
  "baChaos",
  "baAutonomy",
  "feedbackRate",
  "machineTransfer",
  "hallucinationRisk",
] as const;
const UNIT_KEYS = PARAM_KEYS.filter((k) => k !== "humans" && k !== "agents");

describe("presets.json", () => {
  it("has unique ids", () => {
    const ids = presetsData.presets.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const preset of presetsData.presets) {
    describe(preset.id, () => {
      it("defines exactly the SimParams keys", () => {
        expect(Object.keys(preset.initial).sort()).toEqual([...PARAM_KEYS].sort());
      });

      it("keeps head-counts integral and inside the slider range 0–12", () => {
        for (const k of ["humans", "agents"] as const) {
          expect(Number.isInteger(preset.initial[k])).toBe(true);
          expect(preset.initial[k]).toBeGreaterThanOrEqual(0);
          expect(preset.initial[k]).toBeLessThanOrEqual(12);
        }
      });

      it("keeps ba, feedback, transfer and hallucination levers inside 0–1", () => {
        for (const k of UNIT_KEYS) {
          expect(preset.initial[k]).toBeGreaterThanOrEqual(0);
          expect(preset.initial[k]).toBeLessThanOrEqual(1);
        }
      });

      it("has at least one knowledge carrier", () => {
        expect(preset.initial.humans + preset.initial.agents).toBeGreaterThan(0);
      });
    });
  }
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test`
Expected: FAIL with `Missing script: "test"`.

- [ ] **Step 4: Install Vitest and add the script and config**

```bash
npm install -D vitest@5.0.3 @types/node@22.20.5 --save-exact
```

Expected: installs cleanly. If it still reports `ERESOLVE`, you are installing next to `@types/node@20.x`; the explicit `@types/node@22.20.5` in the same command resolves it.

In `web/package.json`, add to `scripts` (after `"typecheck"`):

```json
    "test": "vitest run"
```

(Mind the comma on the line above.) Create `web/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 5: Run the test, lint, typecheck**

Run: `npm test && npm run lint && npm run typecheck && npm run build`
Expected: PASS, 1 test file, 25 tests (1 + 6 presets × 4); lint, typecheck and build produce no errors (the build typechecks `tests/` and `vitest.config.ts` too).

- [ ] **Step 6: Run the suite in CI**

In `.github/workflows/ci.yml`, insert between the `Typecheck` and `Build` steps:

```yaml
      - name: Test
        run: npm test
```

- [ ] **Step 7: Commit**

```bash
git add web/package.json web/package-lock.json web/vitest.config.ts web/tests/presets.test.ts .github/workflows/ci.yml
git commit -m "test: add Vitest harness, preset shape guard, and CI test step"
```

Do not `git add web/tsconfig.json` here; it is unrelated churn (see Task 7).

---

### Task 2: Extract the SECI engine (behavior-preserving)

**Files:**
- Create: `web/src/lib/spiral-engine.ts`
- Create: `web/tests/spiral-engine.test.ts`
- Modify: `web/src/components/SpiralSimulator.tsx` (top-of-file types/helpers, `rebuildParticles`, `onConvert`, the `tick` conversion call, effect deps)

**Interfaces:**
- Produces (all exported from `@/lib/spiral-engine`):
  - `type Quad = "S" | "E" | "C" | "I"`, `type Rng = () => number`, `type EventKind = "ok" | "warn" | "bad" | "info"`
  - `interface SimParams` (the eight levers, same names as today)
  - `interface Particle` (today's fields, `quad: Quad`, plus `cooldown: number`)
  - `interface SimEvent { msg: string; kind: EventKind }`, `type ConvertResult = "ok" | "stall" | "regress" | "transfer"`, `interface ConvertOutcome { result: ConvertResult; events: SimEvent[]; cycles: number; score: number }`
  - `const MAX_LEVEL = 4`, `COOLDOWN_MIN = 1.5`, `COOLDOWN_JITTER = 1.0`, `NEXT_QUADRANT: Record<Quad, Quad>`, `clamp(v, lo, hi)`
  - `createParticle(id: number, kind: "human" | "agent", rng?: Rng): Particle`
  - `convertChance(p: SimParams): number`
  - `convertParticle(pt: Particle, p: SimParams, rng?: Rng): ConvertOutcome` (mutates `pt`)

- [ ] **Step 1: Write the failing engine tests**

Create `web/tests/spiral-engine.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL: `tests/spiral-engine.test.ts` cannot resolve `../src/lib/spiral-engine`.

- [ ] **Step 3: Write the engine**

Create `web/src/lib/spiral-engine.ts`:

```ts
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
```

- [ ] **Step 4: Run to verify the engine tests pass**

Run: `npm test`
Expected: PASS, 2 test files, 38 tests (25 presets + 13 engine: 1 `convertChance` + 12 `convertParticle`).

- [ ] **Step 5: Switch the component to the engine**

In `web/src/components/SpiralSimulator.tsx`:

1. Replace the imports and the local `SimParams`, `NEXT_QUADRANT`, `Particle`, and `clamp` definitions. Keep `type Preset`, `QUADRANTS` (Task 5 moves it), `EventLog`, `let nextId = 1;`, and `DEFAULT_PARAMS`. The head of the file becomes:

```tsx
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
```

2. In `rebuildParticles`, replace the two `while` loops with:

```tsx
    while (target.filter((pt) => pt.kind === "human").length < p.humans) {
      target.push(createParticle(nextId++, "human"));
    }
    while (target.filter((pt) => pt.kind === "agent").length < p.agents) {
      target.push(createParticle(nextId++, "agent"));
    }
```

3. Replace the whole `onConvert` callback (from `// One full knowledge conversion` through its `}, [pushEvent]);`) with:

```tsx
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
```

4. In `tick`, replace the conversion block (`if (convertCooldown <= 0 && Math.hypot(...) < 12) { const result = onConvert(pt); ... }`) with:

```tsx
        // Conversion when close to target
        if (convertCooldown <= 0 && Math.hypot(tx - pt.x, ty - pt.y) < 12) {
          const outcome = convertParticle(pt, paramsRef.current);
          applyOutcome(outcome);
          if (outcome.result !== "regress") {
            convertCooldown = 0.9 + Math.random() * 0.5;
          }
        }
```

5. Change the effect's dependency array from `[running, onConvert]` to `[running, applyOutcome]`.

- [ ] **Step 6: Verify nothing else changed**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: all pass. Then `npm run dev`, open `http://localhost:3000/simulator`: particles drift to quadrants, the Spiral score / Cycles counters climb, the event log fills, "Green Milk" produces red particles and "Context failure" log lines. This task must not change visible behavior.

- [ ] **Step 7: Commit**

```bash
git add web/src/lib/spiral-engine.ts web/tests/spiral-engine.test.ts web/src/components/SpiralSimulator.tsx
git commit -m "refactor: extract SECI conversion rules into a tested pure engine"
```

---

### Task 3: Per-particle cooldown (fixes F1)

**Files:**
- Modify: `web/src/lib/spiral-engine.ts` (append `stepParticle`)
- Modify: `web/tests/spiral-engine.test.ts`
- Modify: `web/src/components/SpiralSimulator.tsx` (`tick`)

**Interfaces:**
- Consumes: `Particle.cooldown`, `COOLDOWN_MIN`, `COOLDOWN_JITTER`, `convertParticle` (Task 2).
- Produces: `stepParticle(pt: Particle, dt: number, arrived: boolean, p: SimParams, rng?: Rng): ConvertOutcome | null`. Returns `null` when no conversion was attempted.

- [ ] **Step 1: Write the failing tests**

In `web/tests/spiral-engine.test.ts`, replace the import block with:

```ts
import { describe, expect, it } from "vitest";
import {
  COOLDOWN_MIN,
  convertChance,
  convertParticle,
  createParticle,
  stepParticle,
  type Particle,
  type Quad,
  type SimParams,
} from "../src/lib/spiral-engine";
```

Add after the `scripted` helper:

```ts
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
```

Append at the end of the file:

```ts
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
    const out = stepParticle(pt, 0.016, true, P, scripted(0));
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
      let conversions = 0;
      for (let t = 0; t < 20; t += 1 / 60) {
        for (const pt of parts) if (stepParticle(pt, 1 / 60, true, P, rng)) conversions++;
      }
      return conversions;
    };
    expect(run(8)).toBeGreaterThan(run(1) * 4);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL: `stepParticle` is not exported (import error / `stepParticle is not a function`).

- [ ] **Step 3: Implement `stepParticle`**

Append to `web/src/lib/spiral-engine.ts`:

```ts
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS, 43 tests.

- [ ] **Step 5: Use it in the component**

In `SpiralSimulator.tsx`:
- Import `stepParticle` (add to the engine import list) and remove `convertParticle` from it (no longer used there).
- Delete `let convertCooldown = 0;` and `convertCooldown -= dt;` from the effect/`tick`.
- Replace the conversion block from Task 2 Step 5.4 with:

```tsx
        // Conversion when close to target; each particle keeps its own cooldown
        const arrived = Math.hypot(tx - pt.x, ty - pt.y) < 12;
        const outcome = stepParticle(pt, dt, arrived, paramsRef.current);
        if (outcome) applyOutcome(outcome);
```

- [ ] **Step 6: Verify and tune by eye**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Then `npm run dev` and open `/simulator` with the NotCo preset. Expected: Cycles/Spiral score now climb noticeably faster with 9 particles than before, and dragging Humans from 1 to 12 visibly increases the rate. If it is too fast to read, raise `COOLDOWN_MIN` (currently 1.5 s) in `spiral-engine.ts`; the tests only depend on the constants, not their values, so no test change is needed.

- [ ] **Step 7: Commit**

```bash
git add web/src/lib/spiral-engine.ts web/tests/spiral-engine.test.ts web/src/components/SpiralSimulator.tsx
git commit -m "fix: give each particle its own conversion cooldown so population affects pace"
```

---

### Task 4: Stop 60fps re-renders and fix the mislabeled rail (F2, F3)

**Files:**
- Modify: `web/src/lib/spiral-engine.ts` (append level stats)
- Modify: `web/tests/spiral-engine.test.ts`
- Modify: `web/src/components/SpiralSimulator.tsx`

**Interfaces:**
- Consumes: `Particle`, `MAX_LEVEL` (Task 2).
- Produces: `interface LevelCounts { l1: number; l2: number; l3: number; l4: number }`, `countLevels(parts: Particle[]): LevelCounts`, `levelCountsEqual(a: LevelCounts, b: LevelCounts): boolean`, `meanLevel(parts: Particle[]): number` (returns `1` for an empty list).

- [ ] **Step 1: Write the failing tests**

In `web/tests/spiral-engine.test.ts`, add `countLevels`, `levelCountsEqual`, `meanLevel` to the import list (alphabetical, between `convertParticle`/`createParticle` and `stepParticle` is fine), then append:

```ts
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL: `countLevels is not a function` (and the other two).

- [ ] **Step 3: Implement**

Append to `web/src/lib/spiral-engine.ts`:

```ts
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS, 46 tests.

- [ ] **Step 5: Use it in the component**

In `SpiralSimulator.tsx`:
- Add `countLevels`, `levelCountsEqual`, `meanLevel`, `MAX_LEVEL`, `type LevelCounts` to the engine import.
- Next to the other refs add: `const lastCountsRef = useRef<LevelCounts>({ l1: 0, l2: 0, l3: 0, l4: 0 });`
- Replace the "Level counts → React state" block at the end of `tick` with:

```tsx
      // Only touch React state when the level histogram actually changed
      const counts = countLevels(parts);
      if (!levelCountsEqual(counts, lastCountsRef.current)) {
        lastCountsRef.current = counts;
        setLevelCounts(counts);
      }
```

- In the "Level rails" block, replace `const filled = clamp((scoreRef.current % 100) / 100, 0, 1);` with:

```tsx
      const filled = clamp((meanLevel(parts) - 1) / (MAX_LEVEL - 1), 0, 1);
```

and change the label `ctx.fillText("ONTOLOGICAL LEVEL", 10, railY - 6);` to `ctx.fillText("MEAN ONTOLOGICAL LEVEL", 10, railY - 6);`.

- [ ] **Step 6: Verify the render storm is gone**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Then temporarily add `console.count("SpiralSimulator render");` as the first line of the component body, run `npm run dev`, open `/simulator` with the browser console open, and wait 10 seconds. Expected: the counter rises only a few times per second (on conversions that change score or events), not ~60 per second; with the Pause button pressed it stays flat. The bottom rail now reads "MEAN ONTOLOGICAL LEVEL" and fills as particles reach levels 3–4. **Remove the `console.count` line before committing.**

- [ ] **Step 7: Commit**

```bash
git add web/src/lib/spiral-engine.ts web/tests/spiral-engine.test.ts web/src/components/SpiralSimulator.tsx
git commit -m "fix: gate level-count state updates and draw mean level on the rail"
```

---

### Task 5: Quadrant geometry matches Nonaka's matrix (F4)

**Files:**
- Modify: `web/src/lib/spiral-engine.ts` (append `QUADRANTS`)
- Modify: `web/tests/spiral-engine.test.ts`
- Modify: `web/src/components/SpiralSimulator.tsx`
- Modify: `web/src/components/SecQuadrant.tsx`

**Interfaces:**
- Consumes: `Quad`, `NEXT_QUADRANT` (Task 2).
- Produces: `type Mode = "tacit" | "explicit"`, `interface QuadrantDef { key: Quad; name: string; from: Mode; to: Mode; x: 0 | 1; y: 0 | 1; ax: number; ay: number }`, `const QUADRANTS: QuadrantDef[]` (S top-left, E top-right, C bottom-right, I bottom-left; columns = converted *to*, rows = converted *from*).

- [ ] **Step 1: Confirm the convention against the project's own sources**

Run (from repo root): `grep -n -i "tacit → tacit\|tacit→tacit\|explicit → tacit\|from.*to" results/theory-brief.md | head`
Expected: the brief defines S = tacit→tacit, E = tacit→explicit, C = explicit→explicit, I = explicit→tacit. If it disagrees, stop and raise it with the owner before continuing.

- [ ] **Step 2: Write the failing tests**

In `web/tests/spiral-engine.test.ts`, add `NEXT_QUADRANT` and `QUADRANTS` to the import list, then append:

```ts
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
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm test`
Expected: FAIL: `QUADRANTS` is not exported.

- [ ] **Step 4: Implement**

In `web/src/lib/spiral-engine.ts`, add near the other types:

```ts
export type Mode = "tacit" | "explicit";

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
```

and below `NEXT_QUADRANT`:

```ts
// Nonaka's matrix: columns = knowledge converted TO, rows = converted FROM.
// Reading S → E → C → I walks the grid clockwise.
export const QUADRANTS: QuadrantDef[] = [
  { key: "S", name: "SOCIALIZATION", from: "tacit", to: "tacit", x: 0, y: 0, ax: 0.25, ay: 0.25 },
  { key: "E", name: "EXTERNALIZATION", from: "tacit", to: "explicit", x: 1, y: 0, ax: 0.75, ay: 0.25 },
  { key: "C", name: "COMBINATION", from: "explicit", to: "explicit", x: 1, y: 1, ax: 0.75, ay: 0.75 },
  { key: "I", name: "INTERNALIZATION", from: "explicit", to: "tacit", x: 0, y: 1, ax: 0.25, ay: 0.75 },
];
```

- [ ] **Step 5: Run to verify it passes**

Run: `npm test`
Expected: PASS, 48 tests.

- [ ] **Step 6: Use it in the simulator canvas**

In `SpiralSimulator.tsx`: delete the local `QUADRANTS` const, add `QUADRANTS` and `type Quad` to the engine import, and add the colors next to `type Preset`:

```tsx
const QUADRANT_COLORS: Record<Quad, string> = {
  S: "#E3DACC",
  E: "#F3D9CE",
  C: "#DCE3D0",
  I: "#F0EEE6",
};
```

In the quadrant-drawing loop change `ctx.fillStyle = q.color;` to `ctx.fillStyle = QUADRANT_COLORS[q.key];`, and replace the sub-label call (the one with the nested `q.key === "S" ? "tacit→tacit" : ...` ternary) with:

```tsx
        ctx.fillText(`${q.from}→${q.to}`, qx, qy + 14);
```

- [ ] **Step 7: Fix the home-page diagram**

In `web/src/components/SecQuadrant.tsx`, replace everything from the `{/* Combination */}` comment through the closing `</defs>` with the block below. Combination moves to the bottom-right cell (x=660), Internalization to bottom-left (x=240), and the four arrows follow S→E→C→I clockwise:

```tsx
        {/* Combination */}
        <text x="660" y="310" fontFamily="Georgia,serif" fontSize="26" fill="#141413" textAnchor="middle" fontWeight="500">COMBINATION</text>
        <text x="660" y="338" fontFamily="ui-monospace,Menlo,monospace" fontSize="12" fill="#87867F" textAnchor="middle">explicit → explicit</text>
        <text x="660" y="368" fontFamily="system-ui,sans-serif" fontSize="14" fill="#3D3D3A" textAnchor="middle">Synthesizing documents,</text>
        <text x="660" y="390" fontFamily="system-ui,sans-serif" fontSize="14" fill="#3D3D3A" textAnchor="middle">databases, specs</text>
        <text x="660" y="422" fontFamily="ui-monospace,Menlo,monospace" fontSize="11" fill="#788C5D" textAnchor="middle">AI: RAG, Glean, KGs — MATURE</text>

        {/* Internalization */}
        <text x="240" y="310" fontFamily="Georgia,serif" fontSize="26" fill="#141413" textAnchor="middle" fontWeight="500">INTERNALIZATION</text>
        <text x="240" y="338" fontFamily="ui-monospace,Menlo,monospace" fontSize="12" fill="#87867F" textAnchor="middle">explicit → tacit</text>
        <text x="240" y="368" fontFamily="system-ui,sans-serif" fontSize="14" fill="#3D3D3A" textAnchor="middle">Learning by doing ·</text>
        <text x="240" y="390" fontFamily="system-ui,sans-serif" fontSize="14" fill="#3D3D3A" textAnchor="middle">embodied mastery</text>
        <text x="240" y="422" fontFamily="ui-monospace,Menlo,monospace" fontSize="11" fill="#D97757" textAnchor="middle">AI: Khanmigo, adaptive tutors</text>

        {/* spiral arrows: S → E → C → I → S, clockwise */}
        <path d="M 436 135 L 464 135" stroke="#D97757" strokeWidth="2.5" markerEnd="url(#spiralArrow)" />
        <path d="M 660 226 L 660 254" stroke="#D97757" strokeWidth="2.5" markerEnd="url(#spiralArrow)" />
        <path d="M 464 345 L 436 345" stroke="#D97757" strokeWidth="2.5" markerEnd="url(#spiralArrow)" />
        <path d="M 240 254 L 240 226" stroke="#D97757" strokeWidth="2.5" markerEnd="url(#spiralArrow)" />

        <defs>
          <marker id="spiralArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#D97757" />
          </marker>
        </defs>
```

- [ ] **Step 8: Verify visually**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Then `npm run dev`:
- `/`: the diagram shows S (top-left) → E (top-right) → C (bottom-right) → I (bottom-left) → back to S, with all four arrows pointing along that loop and no arrow pointing against it.
- `/simulator`: particles circle clockwise between adjacent boxes, never jumping diagonally; sub-labels read `tacit→tacit`, `tacit→explicit`, `explicit→explicit`, `explicit→tacit`.

- [ ] **Step 9: Commit**

```bash
git add web/src/lib/spiral-engine.ts web/tests/spiral-engine.test.ts web/src/components/SpiralSimulator.tsx web/src/components/SecQuadrant.tsx
git commit -m "fix: lay out SECI quadrants per Nonaka's matrix so the spiral reads clockwise"
```

---

### Task 6: Make the siloed preset tell the truth (F5)

**Files:**
- Modify: `web/tests/presets.test.ts`
- Modify: `web/data/presets.json` (`siloed.description`)

**Interfaces:**
- Consumes: `convertChance` (Task 2), `presetsData` (Task 1).

- [ ] **Step 1: Write the failing test**

In `web/tests/presets.test.ts`, add `import { convertChance } from "../src/lib/spiral-engine";` under the existing imports, and append inside the top-level `describe("presets.json", ...)`, after the `for` loop:

```ts
  it("makes the siloed org the slowest preset to convert", () => {
    const chance = (id: string) => convertChance(presetsData.presets.find((p) => p.id === id)!.initial);
    const siloed = chance("siloed");
    for (const p of presetsData.presets) {
      if (p.id !== "siloed") expect(chance(p.id)).toBeGreaterThan(siloed);
    }
  });

  it("does not claim the siloed spiral stalls at one quadrant (the engine has no such rule)", () => {
    const siloed = presetsData.presets.find((p) => p.id === "siloed")!;
    expect(siloed.description).not.toMatch(/stalls at socialization/i);
  });
```

- [ ] **Step 2: Run to verify the second test fails**

Run: `npm test`
Expected: FAIL: only "does not claim the siloed spiral stalls at one quadrant". The ordering test passes today and pins the model so a later rebalance can't quietly make the siloed org faster than the others.

- [ ] **Step 3: Fix the copy**

In `web/data/presets.json`, change the `siloed` description to:

```json
      "description": "Knowledge trapped in individuals and teams. Low redundancy, low chaos, no feedback loop. The spiral crawls: most conversion attempts fail, and combined knowledge loses its shared context.",
```

(Both halves are real engine behavior: ~21% success chance per attempt, and redundancy below 25% triggers the green-milk context failure in Combination.)

- [ ] **Step 4: Run to verify it passes**

Run: `npm test && npm run lint && npm run typecheck && npm run build`
Expected: all pass. Load `/simulator`, click "Siloed Org", hover the button: the tooltip shows the new description.

- [ ] **Step 5: Commit**

```bash
git add web/tests/presets.test.ts web/data/presets.json
git commit -m "fix: describe the siloed preset the way the engine actually behaves"
```

---

### Task 7: Docs, Dependabot, and repo hygiene (F7, F8)

**Files:**
- Modify: `CLAUDE.md`, `CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/dependabot.yml`

- [ ] **Step 1: Fix `CLAUDE.md`**

- In the Commands block, replace the line `npx tsc --noEmit   # typecheck (CI runs this; not in package.json scripts)` with:

```
npm run typecheck  # tsc --noEmit (CI runs this)
npm test           # vitest run — engine + presets (CI runs this)
```

- Replace the paragraph beginning "There is no test suite." with: "Tests live in `web/tests/` (Vitest, node environment, no DOM). CI (`.github/workflows/ci.yml`) runs lint + typecheck + test + build on PRs and pushes to `main`; `.github/workflows/deploy.yml` then deploys to Vercel production on every push to `main`, so a broken build on `main` blocks deploys. Run all four locally before pushing."
- In the Architecture list, add before the `SpiralSimulator.tsx` bullet: "`web/src/lib/spiral-engine.ts` — pure SECI model: conversion rules (`convertParticle`), per-particle cooldown (`stepParticle`), quadrant geometry (`QUADRANTS`), level stats. No React, no canvas, RNG injectable. Change simulation rules here, with a test in `web/tests/spiral-engine.test.ts`."
- In the `SpiralSimulator.tsx` bullet, change the first sentence so it describes the component as the canvas/React shell around the engine, and note that quadrant order is clockwise S → E → C → I (columns = converted *to*, rows = *from*).

- [ ] **Step 2: Fix the contributor-facing checklists**

- `CONTRIBUTING.md`: add `npm test` next to the existing `npm run typecheck` line (line ~24), and change "Ensure `lint`, `typecheck`, and `build` pass locally" (line ~65) to "Ensure `lint`, `typecheck`, `test`, and `build` pass locally".
- `.github/PULL_REQUEST_TEMPLATE.md` line 7: change to ``- [ ] `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass locally (in `web/`)``.

- [ ] **Step 3: Keep `@types/node` aligned with CI's Node 22**

In `.github/dependabot.yml`, add under the `npm` / `/web` update entry (same indent as `schedule`):

```yaml
    ignore:
      - dependency-name: "@types/node"
        update-types: ["version-update:semver-major"]
```

This stops Dependabot from re-proposing `@types/node` 26 (PR #16) while CI and Vitest target Node 22. Revisit when `node-version` in the workflows changes.

- [ ] **Step 4: Verify and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build` (from `web/`)
Expected: all pass (docs-only change, but the workflow file is parsed by GitHub only on push; check `git diff .github/dependabot.yml` for correct indentation).

```bash
git add CLAUDE.md CONTRIBUTING.md .github/PULL_REQUEST_TEMPLATE.md .github/dependabot.yml
git commit -m "docs: document the test suite and hold @types/node to the CI Node major"
```

- [ ] **Step 5: Push and open the PR**

```bash
npm run lint && npm run typecheck && npm test && npm run build
git push -u origin feat/engine-hardening
gh pr create --base main --title "Engine hardening: tested SECI engine, throughput + quadrant fixes" --body-file <(printf 'Implements docs/superpowers/plans/2026-10-11-spiral-lab-engine-hardening.md (Tasks 1–7).\n')
```

Expected: CI (`ci.yml`) goes green including the new `Test` step. Merge only after the owner reviews; merging deploys to production.

---

## Owner decisions (deliberately not tasks)

These need a human call. Nothing above depends on them.

1. **`nonaka-spiral-lab/` at the repo root (untracked).** It is an older copy of the repo (its `README.md`, `GROWTH-PLAN.md`, and `web/README.md` differ from the real ones). It is probably safe to delete, but confirm first; this plan does not touch it.
2. **Root `AGENTS.md` and `GEMINI.md` (untracked).** `AGENTS.md` holds personal "Fleet Rules" (model/tool orchestration). Decide whether this belongs in a public repo before committing either file. `web/AGENTS.md` is different: `next dev` regenerates it and `web/CLAUDE.md` imports it, so commit that one if it shows up in a diff.
3. **`web/tsconfig.json` working-tree edits** are tooling reformatting plus one added `include` path (`.next/dev/dev/types/**/*.ts`). Commit or revert; Task 1 deliberately leaves the file out.
4. **Duplicate issues.** #1 (dark mode) and #2 (shareable URLs) duplicate #12 and #11. Close them as duplicates.
5. **Model semantics** (research calls, not engineering): chaos currently only ever *helps* conversion except above 0.7 where it can regress; level 4 keeps scoring +40 per cycle forever; the landing page advertises a "9-movement extended model" while the simulator implements the four quadrants plus machine transfer. Decide whether the model or the copy should move.
6. **Pending Dependabot PRs.** After this merges: rebase #21 (grouped minor/patch); evaluate #7 (TypeScript 7.0.2) and #17 (ESLint 10.8.1) individually with `npm run lint && npm run typecheck && npm test && npm run build`; close #16 (superseded by the Task 7 ignore rule); merge #6 and #22 (GitHub Actions bumps) after confirming `ci.yml` still passes on them. Leave draft #20 (deploy workflow) alone.
7. **GROWTH-PLAN.md tracker is stale** on one row: "Topic tags added" says Pending, but the repo already carries all ten topics. GitHub Discussions is still disabled (`has_discussions: false`) although the issue chooser links to it.

## Follow-on plans (separate plans, now cheaper because the engine is pure)

Write each as its own plan after this one lands. Each produces working, testable software on its own:

- **Shareable URLs (#11) and JSON export/import (#10):** one `serializeParams`/`parseParams` pair in the engine, with round-trip and out-of-range tests (reuse the preset range rules from `presets.test.ts`).
- **Timeline visualization (#14):** a history ring buffer sampled from `countLevels`/score, drawn in a second canvas.
- **Dark mode (#12) and touch support (#13):** move the hardcoded canvas/SVG hexes onto CSS tokens first; that is the prerequisite for both.
- **Call for Presets (#15):** the preset guard in Task 1 is what makes accepting outside preset PRs safe; add a CI check that each new preset id appears in `research/expansion-research.md`.

## Self-review

- **Coverage:** F1→T3, F2/F3→T4, F4→T5, F5→T6, F6→T1/T6, F7/F8→T1/T7. No finding is left without a task.
- **Placeholders:** none. Every code step has the code; the two doc-edit steps in Task 7 give exact replacement text or exact insertion points.
- **Type consistency:** `Particle.cooldown`, `COOLDOWN_MIN/JITTER`, `stepParticle`, `ConvertOutcome`, `LevelCounts`, `QuadrantDef` carry the same names and signatures wherever they are used. The engine and test code in Tasks 2–5, taken together, was run in a scratch project during planning: 49 tests passing, `tsc --noEmit` clean under `strict`. Not run during planning: the component edits (Tasks 2–5), the `SecQuadrant.tsx` SVG, and the Task 6 "does not claim … stalls at socialization" test (it must fail before the copy fix and pass after). The scratch run used `presets.json` from `main` and a bare `tsconfig`, not the app's.
- **Counts to expect:** after Task 1: 25 tests; Task 2: 38; Task 3: 43; Task 4: 46; Task 5: 48; Task 6: 50.
