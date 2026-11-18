# Reproducible SECI Workshop Implementation Plan

> **For agentic workers:** Use subagent-driven-development with parallel, disjoint file ownership. The user explicitly requested all five features and GPT-6.1 Terra agents. Release authorization is recorded in the execution ledger.

**Goal:** Deliver seeded replay, same-seed comparison, history charts/CSV, a particle inspector, and an English/Japanese guided exercise.

**Architecture:** Preserve the existing tested conversion engine and strict v1 configuration codec. Add an immutable, fixed-step simulation around the engine. A client simulator coordinates two runs on the same clock and renders independent presentational panels. Language changes affect presentation only.

**Tech Stack:** Existing Next.js 16, React 19, TypeScript, Vitest; no new runtime dependencies. Existing CSS design tokens.

**Spec:** User request on November 18 accepting all five features proposed in the preceding review. This plan records implementation decisions made by the coordinator.

## Global Constraints

- All npm commands run from `web/`. Add and run failing tests before implementation; leave existing tests unchanged.
- Existing engine rules, presets, strict config v1 functions, and their tests retain compatibility.
- Client-side only; no backend, accounts, model calls, paid services, or automatic persistence.
- Model for every new agent/subagent: `gpt-6.1-terra`.
- Shared checkout branch: `feat/reproducible-seci-workshop`; file ownership below prevents concurrent edits.
- Managed worktree creation succeeded but its path is outside permitted writable roots; use the provided writable checkout on its new feature branch.
- Configuration/seed changes reset the run, counters, history, and selection. A single reset uses unchanged seed/configuration. Language changes and pause preserve state.
- Shared URLs include the seed. New replay JSON uses its own schema; legacy v1 imports continue to work. Pending imports are invalidated by later configuration edits.
- Reduced-motion preference starts paused; keyboard controls and text alternatives accompany canvas/charts.
- Show in both languages that simulation outcomes are illustrative, not measurements of actual business performance or AI behavior.
- Verify targeted tests, complete suite, typecheck, lint, build; use browser checks if available. Do not claim checks not performed.

## Shared Interfaces (frozen before parallel implementation)

`web/src/lib/simulation.ts` exports:

```ts
ENGINE_VERSION = "1"; DEFAULT_SEED = 42; TICKS_PER_SECOND = 60;
type SimulationParticle = Particle & { lastResult: ConvertResult | null; lastTick: number | null };
type HistorySample = LevelCounts & {
  tick: number; time: number; score: number; cycles: number; failures: number;
  corrupted: number; repairs: number; meanLevel: number;
};
type SimulationEvent = SimEvent & {
  id: number; tick: number; particleId: number; result: ConvertResult;
  code: "hallucination" | "contextFailure" | "transferRefused" | "transfer" | "repair" | "levelUp";
  level: number; particleKind: Particle["kind"];
};
type SimulationState = {
  seed: number; rngState: number; tick: number; params: SimParams;
  particles: SimulationParticle[]; score: number; cycles: number; failures: number;
  repairs: number; events: SimulationEvent[]; history: HistorySample[];
};
createSimulation(params: SimParams, seed: number): SimulationState;
stepSimulation(state: SimulationState, steps?: number): SimulationState;
getSimulationSample(state: SimulationState): HistorySample;
```

Positions use normalized coordinates. Only simulation ticks consume RNG. History includes tick zero, samples every 60 ticks, and retains at most 600 samples; events at most 100. Preserve score/cycle/failure definitions from the old engine. Immutable input state and serializable RNG enable exact batch equivalence.

`web/src/lib/simulator-copy.ts` exports:

```ts
type Locale = "en" | "ja";
type CopyKey = string; // Concrete shared keys below, plus workshop internals.
translate(locale: Locale, key: CopyKey): string;
getPresetCopy(locale: Locale, id: string): { name: string; tagline: string; description: string };
getEventCopy(locale: Locale, event: SimulationEvent): string;
```

Required translation keys: `title`, `intro`, `illustrative`, `language`, `humans`, `agents`, `baRedundancy`, `baChaos`, `baAutonomy`, `feedbackRate`, `machineTransfer`, `hallucinationRisk`, `seed`, `applySeed`, `pause`, `resume`, `reset`, `step`, `compare`, `primaryRun`, `comparisonRun`, `comparisonPreset`, `sameSeed`, `score`, `cycles`, `failures`, `repairs`, `corrupted`, `meanLevel`, `individual`, `group`, `organization`, `interOrganization`, `socialization`, `externalization`, `combination`, `internalization`, `tacit`, `explicit`, `history`, `historyDescription`, `rollingHistory`, `exportCsv`, `inspector`, `selectParticle`, `noParticles`, `particle`, `human`, `agent`, `quadrant`, `level`, `status`, `healthy`, `lastTransition`, `noTransition`, `eventLog`, `noEvents`, `copyLink`, `exportJson`, `importJson`, `copied`, `clipboardFailed`, `exported`, `imported`, `importFailed`, `invalidSeed`, `home`, `research`, `preset`, `seconds`, `running`, `paused`.

`GuidedWorkshop({ locale }: { locale: Locale })` is a default export. It contains three stages: predict a bottleneck, observe/inspect, change one lever and compare. Back/next/exit controls, local observation text, optional reopening, no automatic simulation mutations.

`HistoryChart({ samples, locale, comparisonSamples? })` and `ParticleInspector({ particles, selectedId, onSelect, locale })` are default exports. `historyToCsv(samples, metadata, comparisonSamples?)` produces stable data with engine version, seed, run, time, score, cycles, failures, corrupted, repairs, mean level and level counts. `metadata: {seed:number; engineVersion:string}`. Chart has labeled axes and textual current values; inspector supports keyboard selection and highlights selection in canvas.

`ConfigControls` retains its existing props and adds optional `getSeed: () => number`, `locale: Locale`, `generation: number`, and `onApplyReplay: (params: SimParams, seed: number, message: string) => void`. Legacy `onApply` stays usable. Replay exports include the seed and engine version; importing a legacy file uses the displayed seed. `generation` changing must invalidate pending reads synchronously, including before a rerendered effect could run.

## Review Focus

1. Same seed/configuration and tick count must deep-equal after different step batches; rendering/resize must not mutate state.
2. Pause/reset/configuration changes must affect both comparison runs consistently; changing locale must affect neither.
3. Oversized/malformed replay imports and late stale reads must not replace a later user choice.
4. Zero particles and maximum populations must remain usable in charts, inspector, and comparison.
5. Narrow screens, keyboard use, and reduced motion must preserve all controls; chart/export disclose the rolling history window.

## Task 1: Deterministic simulation (Terra engine owner)

**Files:** create `web/src/lib/simulation.ts`, `web/tests/simulation.test.ts`; no edits to existing engine/tests.

- [x] Write tests for deterministic equality, different seeds, immutability, 20+80 versus 100 ticks, zero/invalid steps, seed/parameter validation, bounded history/events, empty/max populations, and outcomes consistent with existing rules.
- [x] Run targeted tests and observe missing-module failure.
- [x] Implement the shared interfaces with a serializable seeded PRNG and fixed-step normalized movement. Use existing `stepParticle` on cloned particles.
- [x] Run targeted tests and report red/green evidence.

## Task 2: Localization and guided workshop (Terra copy/workshop owner)

**Files:** create `web/src/lib/simulator-copy.ts`, `web/src/components/GuidedWorkshop.tsx`, `web/src/components/GuidedWorkshop.module.css`, `web/tests/simulator-copy.test.ts`.

- [x] Add failing tests for both dictionaries, every preset, semantic event translation, and workshop steps; run to confirm missing-module failure.
- [x] Implement complete copy and the three-stage accessible guided exercise. Preserve existing product identity. No permanent storage.
- [x] Run targeted tests; communicate any new translation keys to collaborators.

## Task 3: Simulator integration (Terra UI owner)

**Files:** replace `web/src/components/SpiralSimulator.tsx`; create `SimulationCanvas.tsx`, `SimulationDashboard.module.css`; modify `web/src/app/simulator/page.tsx`; add `web/tests/simulator-render.test.ts`.

- [x] Write failing server-render tests for replay controls, comparison, history, inspector, workshop, illustrative explanation and associated labels.
- [x] Implement single fixed-step clock, independently configurable same-seed comparison, seed validation/reset, pause/step, bounded UI refresh, localized controls and semantic event log. Wire all agreed components and ConfigControls props.
- [x] Draw normalized particles without RNG/state mutation, map pointer selection, provide accessible canvas label, show selected particle highlight, handle resize and reduced motion.
- [x] Run targeted tests; leave full integration checks to coordinator after all owners finish.

## Task 4: History, inspector, replay files and final verification (coordinator)

**Files:** create `web/src/components/HistoryChart.tsx`, `ParticleInspector.tsx`, `SimulationPanels.module.css`, `web/src/lib/simulation-history.ts`, `run-config.ts`; modify `ConfigControls.tsx`; add corresponding unit/render tests. Update README with final usage.

- [x] Write/run failing tests for CSV values/escaping, empty/max samples, chart/inspector accessibility, replay URL/JSON round trips, strict seed/version validation and legacy import compatibility.
- [x] Implement panels and replay codec; preserve original config/import-flow tests. Add generation guard to ConfigControls.
- [x] Independently review each task diff, fix integration defects, run full unit suite, typecheck, lint and build. Exercise browser flows if available.
- [x] Dispatch a fresh GPT-6.1 Terra review of integrated changes, resolve concrete findings and repeat relevant checks.
- [x] Report changed paths, actual verification output and known limitations. No push/deploy.

## Execution ledger

- Baseline `75cf355`; existing review ran 137 passing tests, lint, typecheck and build.
- November 18: two Terra reconnaissance agents completed; contracts above incorporate their findings.
- User explicitly selected all five features and parallel Terra execution; proceed without an additional design approval round.
- Implementation complete: Terra engine/copy/UI builders worked with disjoint file ownership; independent Terra engine and integration reviewers completed. The coordinator integrated history, inspector and replay file handling.
- Review corrections: comparison clones the observed primary state when revealed; actual lever changes reset both. Restored level counts, SECI conversion labels and level rings. Added both history text summaries/data table, successful import status and synchronous generation checks for stale imports.
- Verification from `web/`: 163 unit/render tests passed; lint, typecheck and production build passed. Eight workflow browser tests passed; the additional desktop/Japanese-mobile visual test passed with no page errors or horizontal overflow (nine browser tests in total). Screenshots inspected locally. `/simulator` remains static.
- Existing five test files are unchanged. The new browser test selectors were corrected after actual browser diagnostics showed ambiguous labels and the framework's extra route-announcer alert; their behavioral assertions were retained.
- Dependency addition: pinned development-only `@playwright/test@1.65.1`; no new runtime packages. Preserved all 14 existing lockfile libc constraints after npm rewrote metadata.
- Known external baseline issue: `npm audit --omit=dev` reports one moderate Next.js package finding (two cache-related advisories), with 16.4.6 offered as the fix. Next's build command stops once with a security reminder, then succeeds on retry. No framework upgrade or deployment was included.
- Japanese wording was browser-checked, not independently reviewed by a native speaker.
- Release authorized by the user: commit, create a PR, wait for CI to pass, then merge. Integrate latest main first, preserving its minimatch security patch. PR screenshots are included under `docs/screenshots/`.
