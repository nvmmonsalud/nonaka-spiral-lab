# Knowledge Transfer Product Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve Knowledge Spiral Lab into a credible Japanese-language workshop and test a human-reviewed knowledge-transfer workflow, with a governed path to private workspaces and optional real AI.

**Architecture:** Keep the existing Next.js app and synthetic simulator. First extract deterministic simulation behavior into a pure TypeScript module, then add a local-only workshop workflow. Treat the private backend and AI as separate future projects with explicit design and readiness gates; their exact services and interfaces are not yet approved.

**Tech Stack:** Existing Next.js 16.3.0, React 19.2.8, TypeScript 5, Node 22+; Vitest for unit tests and Playwright for browser tests are proposed additions, subject to compatibility verification. Later: PostgreSQL, private object storage and a server-side provider adapter, vendor TBD.

**Spec:** [Research and proposed product design](../../../research/japan-scale-product-architecture-report.md). It is a research proposal, not an approved specification. This plan makes assumptions for review; it does not authorize implementation, provider use, customer data, deployment or outreach.

## Global Constraints

- Run all npm commands in `web/`; inspect `web/AGENTS.md` and installed Next.js documentation before changing Next.js code.
- Preserve existing working-tree changes and untracked files. Do not overwrite the research report or change existing tests during implementation; add new tests first, as required by the supplied AGENTS.md.
- The simulation is illustrative; its AI agents, events and score are not live AI, evidence of real organizational performance or a validated assessment.
- Existing public simulator remains usable without accounts, APIs, secrets or network calls. Local-only artifacts must not contain real customer information during development.
- Do not provision paid infrastructure, submit model requests, push, merge, deploy or publish without explicit authorization. No credentials in browser code, commits, logs or fixtures. Use `STUB_REPLACE_ME` for required placeholders.
- Every implementation slice passes its targeted tests, `npm run typecheck`, `npm run lint` and `npm run build`; report command results. A local pass is not a hosted or production check.
- Commit commands below are suggested task boundaries only; commit only when separately authorized. Integrator owns integration and avoids staging unrelated changes.

## Review Focus

1. Identical seed/configuration but different rendering speed: simulation results must remain identical (Task 2).
2. Invalid or missing imported workshop data: reject without overwriting an existing draft (Task 4).
3. Browser reload and shared-device privacy: local persistence is explicit and clearing it removes the draft (Task 4).
4. Keyboard and reduced-motion use: controls must work without a pointer and animation respects the user preference (Task 3).
5. Japanese/English explanation and score ambiguity: each language clearly labels outcomes as illustrative, including when presets change (Task 3).

## Delivery structure and agent operating model

This is a program of three independently reviewable projects: **A. workshop and manual pilot** (detailed below); **B. private workspace**; **C. optional AI-assisted drafting**. Write separate implementation plans for B and C after their decision gates; otherwise an invented schema, provider or procurement policy would be mistaken for agreed requirements. The research report is the design input, not customer validation.

One orchestrator maintains the dependency graph, contracts, integration and approval boundaries. Each implementation worker reads the current files and applicable instructions, records branch/HEAD/status and relevant interfaces before editing, and owns only its assigned files. Workers use isolated worktrees created by the execution environment, not manual shared-branch edits; uncommitted research and instructions must be provided explicitly because they may not follow the base commit. Do not copy secrets into worktrees. A reviewer uses a fresh context and checks behavior, tests, scope and risk. The integrator alone applies reviewed changes in dependency order and runs cross-slice verification. Independent design or copy work can happen in parallel; edits to `SpiralSimulator.tsx`, `package.json` and lockfile are serialized. Do not start a downstream worker against an unmerged interface. If a worker cannot meet a contract, return the discrepancy instead of inventing a replacement.

**Proposed roles:** coordinator/integrator; simulation engineer; frontend/accessibility engineer; backend/security engineer for B; infrastructure/operations engineer for B; evaluation/AI engineer for C; independent reviewer. These are responsibilities, not a requirement to run all agents simultaneously. Assign provider/model and resource limits at execution time; the fleet rules in the supplied AGENTS.md must be reconciled with available tooling before delegation.

**Dependency graph:** A1 test harness → A2 engine → A3 simulator UI; A1 → A4 local pilot workflow; A3 + A4 → A5 integration. After pilot discovery, B design → B implementation and security review → approved private pilot; only then C design → offline evaluation → explicitly authorized provider trial. A3 and A4 may run concurrently only after A1, with disjoint ownership.

## File map for project A

- Modify `web/package.json`, `web/package-lock.json`: unit/browser test scripts and pinned compatible dependencies (A1 owner only).
- Create `web/vitest.config.ts`, `web/playwright.config.ts`, `web/tests/`: test configuration and fixtures.
- Create `web/src/lib/simulation/engine.ts` and `types.ts`: versioned pure simulation contracts and deterministic state transitions.
- Modify `web/src/components/SpiralSimulator.tsx`: connect engine to display and controls; preserve existing presets.
- Create `web/src/lib/workshop/draft.ts`: local draft validation and versioned serialization.
- Create `web/src/components/WorkshopDraft.tsx`, `web/src/app/workshop/page.tsx`: synthetic manual capture, review and export.
- Modify `web/src/app/page.tsx` only during integration to link the workshop; add `web/tests/` files for each slice.
- Create `docs/pilot/manual-pilot-guide.md`: participant roles, sanitized workflow, baseline and measurement instructions.

### Task 1: Establish a test harness (A1)

**Files:** `web/package.json`, `web/package-lock.json`, `web/vitest.config.ts`, `web/playwright.config.ts`, `web/tests/smoke.test.ts`, `web/tests/smoke.spec.ts`.

**Interfaces:** `npm test -- --run` executes Vitest; `npm run test:e2e` executes Playwright against a local server. Test fixtures never contact model providers.

- [ ] Add a unit smoke test asserting `1 + 1 === 2` and a browser smoke test asserting `/simulator` returns a visible main landmark.
- [ ] Run both commands; confirm they fail because the scripts do not exist. Record actual failures.
- [ ] Add compatible pinned dev dependencies, scripts and configs; use a local Playwright webServer on a fixed loopback port and isolate test artifacts. Do not alter existing tests.
- [ ] Run `npm test -- --run` and `npm run test:e2e`; expect both tests to pass. Install browser binaries only if missing and permitted by the environment.
- [ ] Run typecheck, lint and build. Request integration review; if commit authorized: `git commit -m "test(web): add local test harness"` with only owned files staged.

### Task 2: Deterministic simulation contract (A2)

**Files:** create `web/src/lib/simulation/types.ts`, `web/src/lib/simulation/engine.ts`, `web/tests/simulation-engine.test.ts`.

**Interfaces:** `SimParams` matches the eight numeric fields in existing `SpiralSimulator.tsx`; export `ENGINE_VERSION = "1"`, `createSimulation(params: SimParams, seed: number): SimulationState`, and `stepSimulation(state: SimulationState, steps: number): SimulationState`. State includes params, seed, tick, particles, event counts, cycle count and score; no DOM, wall-clock time or global random state. A run advances one fixed simulation step at a time, irrespective of frame rate.

- [ ] Write tests: same params/seed and 100 steps deep-equal across two runs; 20+80 steps deep-equal 100 steps; different seeds give different initial particle positions; zero steps leaves state unchanged; non-finite or negative steps throw; no mutation of input state; humans and agents remain within preset limits (1–20 each).
- [ ] Run `npm test -- --run tests/simulation-engine.test.ts`; expect failure because the module does not exist.
- [ ] Extract the existing conversion, transfer and score rules into the pure engine; use a documented seeded PRNG with state stored in `SimulationState`. Capture a baseline of existing rule constants before moving them. Use fixed ticks, not elapsed frames. No claim of scientific validation; record any behavior changes in the task receipt.
- [ ] Run targeted tests; expect pass. Review the new rules against the old code and add characterization tests for every preserved transition and counter. No canvas or React dependency in the engine.
- [ ] Run typecheck, lint and build; reviewer checks deterministic behavior and rule fidelity. Suggested commit: `refactor(simulator): extract deterministic engine`.

### Task 3: Credible bilingual simulator (A3)

**Files:** modify `web/src/components/SpiralSimulator.tsx`; create `web/tests/simulator.spec.ts` and, if needed, `web/src/lib/simulation/copy.ts`.

**Interfaces:** consume Task 2 engine and `web/data/presets.json`; UI provides English/Japanese language selection, seed display, pause and reset. Reset uses the displayed seed and selected parameters; changing language does not change simulation state.

- [ ] Write browser tests asserting: simulator loads each existing preset; pause stops tick progression; reset restores tick zero; selecting Japanese shows `このシミュレーションは説明用です。実際の業績やAIの挙動を測定するものではありません。`; English shows `This simulation is illustrative. It does not measure actual business performance or AI behavior.`; the caveat remains visible after changing preset; keyboard can operate all controls; reduced-motion preference disables automatic animation until explicitly started.
- [ ] Run `npm run test:e2e -- tests/simulator.spec.ts`; expect failure for missing controls/copy.
- [ ] Wire fixed-timestep engine to canvas, cap work per frame and expose semantic labels and a textual status. Translate simulator controls and preset descriptions, preserve existing preset IDs, and label score as a simulation score. Use accessible native controls and visible focus.
- [ ] Run targeted browser tests and a manual keyboard/screen-reader-oriented review at desktop and narrow widths; document actual browsers and limitations. Japanese copy requires native-speaker review before external use.
- [ ] Run unit tests, typecheck, lint and build; reviewer verifies loop cleanup, reset and responsiveness. Suggested commit: `feat(simulator): add bilingual reproducible workshop`.

### Task 4: Local manual knowledge-transfer draft (A4)

**Files:** create `web/src/lib/workshop/draft.ts`, `web/src/components/WorkshopDraft.tsx`, `web/src/app/workshop/page.tsx`, `web/tests/workshop-draft.test.ts`, `web/tests/workshop.spec.ts`, `docs/pilot/manual-pilot-guide.md`.

**Interfaces:** export `type WorkshopDraft = { version: 1; task: string; conditions: string; observations: string; sources: string; reviewer: string; status: "draft" | "reviewed" }`; `parseDraft(input: string): WorkshopDraft` validates JSON and rejects unknown version, missing or non-string fields, over 100,000 characters and invalid status; `serializeDraft(draft: WorkshopDraft): string` returns versioned JSON. A `reviewed` status requires a nonblank reviewer and task. All fields are plain text, rendered as text; no uploads or HTML rendering.

- [ ] Unit tests assert round trip, rejection of malformed JSON, unknown version, oversize payload and missing fields, plus rejection of `reviewed` without reviewer. Browser tests assert invalid import preserves current draft, no draft persists by default on reload, explicit save persists in localStorage, and clear removes it; export/import restore fields. Display “Synthetic or sanitized examples only” in English and Japanese.
- [ ] Run the targeted unit and browser tests; expect missing module/page failures.
- [ ] Implement local form, explicit save/clear, JSON import/export and named-reviewer status. Validate before replacing state. Local browser data is unencrypted and available to other users of the browser; warn before saving. No account, AI call, backend, or customer document ingestion. Provide Japanese and English labels.
- [ ] Write the guide with synthetic example, expert/reviewer roles, a non-safety-critical task, baseline versus total capture/review/approval time, novice exercise and stop criteria; distinguish reviewer sign-off from operational approval.
- [ ] Run targeted tests, typecheck, lint and build; reviewer checks import validation and persistence behavior. Suggested commit: `feat(workshop): add local knowledge draft`.

### Task 5: Integrate and verify project A (A5)

**Files:** modify `web/src/app/page.tsx`; update `docs/pilot/manual-pilot-guide.md` only for findings; add integration tests under `web/tests/` if a gap exists.

**Interfaces:** link `/workshop` and `/simulator`; consume A2–A4 without changing their contracts.

- [ ] Write a browser test following home → simulator → workshop, creating a synthetic draft, marking it reviewed with a reviewer, exporting, clearing and importing it; verify no external model/API requests are made.
- [ ] Run it and confirm failure before adding the link or missing flow.
- [ ] Add the link and resolve only integration defects; do not modify existing tests. Run `npm test -- --run`, `npm run test:e2e`, `npm run typecheck`, `npm run lint`, `npm run build` from `web/`.
- [ ] Independently review diff, authorization boundaries, accessibility and known limitations. Report tests, manual checks, outstanding issues, exact commit and dirty-tree state. Suggested commit: `feat(web): connect workshop flow`.
- [ ] Run a facilitated synthetic rehearsal and record time, reviewer burden and questions. A real customer pilot requires separately agreed scope, participant/data permissions, security and deployment authorization.

## Project B: private workspace — design gate, then separate plan

**Decision required:** intended first customer, hosting and region, data classification, authentication/SSO, retention, deletion, service budget and acceptable contract terms. Compare managed PostgreSQL plus private object storage against a customer-controlled deployment. Do not select a provider or create an account based on this plan alone.

**Required scope for its future plan:** tenant/membership and role model; tenant-aware server authorization and PostgreSQL RLS as defense in depth; sources and versioned instructions; expert review lifecycle; audit without raw sensitive prompts; private uploads and permission-aware downloads; backups, restore, deletion and incident response. Define APIs, migrations, storage keys and transaction-scoped tenant context before parallel work. Test unauthenticated access, cross-tenant IDs and foreign keys, revoked access, expired sessions, malicious files, worker privileges, backup restore and deletion propagation. Browser must never receive service-role credentials. Run security review and customer-approved data-processing and residency review before real data. Offline integration tests with disposable database/storage are the first target; no actual customer records in fixtures.

**Parallel ownership after contracts are approved:** backend owns schema/migrations and server authorization; frontend owns workspace screens against a typed API contract; infra owns local test environment and deployment proposal; security reviewer tests trust boundaries. Integrator merges schema/API before dependent screens and performs end-to-end isolation checks. Separate public demonstration from private data boundary.

## Project C: optional real AI — design gate, then separate plan

Before provider use define task, model/provider, approved data, region and retention, exact request count, token/time and spend caps, funding, logging, evaluation set, exclusions and stop conditions. Approval must cover the actual trial. With no approval, develop only a fake adapter and synthetic fixtures.

Future plan must define a server-only `DraftProvider` contract, permission-filtered source retrieval, source-version citations, an abstention path, untrusted-document prompt-injection handling, explicit user opt-in, per-tenant quotas, audit metadata and an expert approval gate. Test unsupported claims, conflicting or missing evidence, unauthorized sources, prompt injection, provider errors/timeouts, budget exhaustion and no key leakage. Compare AI-assisted drafts with manual preparation on quality, review time and full cost. Citation is provenance, not proof of correctness. No autonomous publication, equipment control or worker ranking.

## Release and decision gates

- **A completion:** local tests and manual checks pass; Japanese wording reviewed; simulation is explicitly illustrative; synthetic rehearsal documented.
- **Pilot go/no-go:** named sponsor and task, agreed baseline, participant permissions, reviewer, source ownership, success thresholds and non-safety-critical scope. No sales or ROI claims until observed.
- **B go/no-go:** approved architecture and threat review, tenant-isolation tests, restore/deletion evidence, privacy and contractual assessment, and separately authorized hosting.
- **C go/no-go:** approved provider terms/data flow and bounded spend, offline evaluation and human review workflow; report actual model-call and customer outcomes separately.
- **Release:** a fresh integrated review, CI status and owner approval precede any authorized deployment. Build/lint or synthetic results do not establish production readiness.

## Planning self-review and open choices

The research report's workshop, human review, privacy, backend, AI, evaluation and Japan pilot recommendations map to A, B, C and the gates above. B/C intentionally require their own detailed specs and test-by-test plans rather than speculative implementation. Validate the baseline simulation semantics and local dependency compatibility at execution; Task 2's fixed-timestep migration may change timing and needs explicit review. The target user, industry, localization scope, service budget and deployment/data-residency preferences remain assumptions for the user's review. No code or infrastructure is changed by this plan.
