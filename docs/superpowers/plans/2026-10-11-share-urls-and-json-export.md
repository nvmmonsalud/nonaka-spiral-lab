# Shareable Links and JSON Config Export/Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let anyone share a simulator setup as a link (`/simulator?humans=6&agents=3&...`) or as a small JSON file, and load either one back with exactly the same eight lever values. Closes issues #11 and #10.

**Architecture:** One pure module, `web/src/lib/sim-config.ts`, owns the legal range of every lever and both codecs (query string and JSON file). Every function in it returns `{ ok: true, value } | { ok: false, error }` and never throws. `SpiralSimulator.tsx` sends presets, links and imported files through one `applyConfig` path, so the `paramsRef`/React-state split is untouched, and a small `ConfigControls` component holds the three buttons and the status line.

**Tech Stack:** Next.js 16.3.0, React 19.2.8, TypeScript 5.9.3 (strict), Vitest 5.0.3 (node environment). No new dependencies, runtime or dev.

**Spec:** None separate. The requirements are the acceptance criteria of GitHub issues #11 and #10, quoted next, plus the decisions in the table after them.

## Requirements this plan implements

Issue #11, "Shareable simulation URLs":

- Opening a URL with valid params starts the sim with exactly those values.
- Share button copies a URL that reproduces the current configuration.
- Malformed/out-of-range values are clamped or ignored gracefully. (This plan **ignores** them, with visible text. See D3.)
- `npm run lint`, `npm run typecheck`, `npm run build` pass.

Issue #10, "Export / import simulation configuration as JSON":

- Export downloads a JSON file matching the `presets.json` `initial` schema.
- Importing that file restores the exact same simulation parameters.
- Invalid/malformed files fail gracefully (no crash; a message in the event log is a nice touch).
- `npm run lint`, `npm run typecheck`, `npm run build` pass.

Both issues also say: no new dependencies, style with the existing design tokens, preserve the `paramsRef` + state split, apply through the same path the presets use.

## Base branch and ordering

This plan builds on the engine in **PR #23** (`docs/engine-hardening-plan`, not yet on `main`): it needs `SimParams`/`Particle` exported from `web/src/lib/spiral-engine.ts`, the Vitest harness, and the component's `applyOutcome`/`stepParticle` shape. Branch from that tip. Task 1 also edits `web/tests/presets.test.ts`, a file PR #23 owns; the edit is small (it swaps local constants for imports), so a rebase after #23 merges is trivial.

```bash
git fetch origin
git switch -c feat/share-links-and-json-config origin/docs/engine-hardening-plan   # repo root
cd web && npm ci
```

## Decisions and evidence

| # | Decision | Why |
|---|---|---|
| D1 | Read the link with `window.location.search` inside a mount `useEffect`. Do **not** use `useSearchParams` or the page `searchParams` prop. | See "Evidence" below: `useSearchParams` either fails `next build` (no `Suspense`) or, with `Suspense`, removes the whole simulator from the prerendered HTML. The `searchParams` prop makes the route dynamic. The effect keeps `/simulator` `○ (Static)` with the full UI in the HTML. |
| D2 | `replaceState` (never `pushState`) on **Copy link**, and only then. No live URL syncing while sliders move. | Copy link is not a navigation: Back must not step through snapshots, and nothing reads the URL on `popstate`. Live syncing would need debouncing (Safari throws a `SecurityError` after roughly 100 History calls in 30 seconds, recalled from WebKit behavior and not tested here, and a slider drag fires `onChange` far faster). Cost: after you tweak a slider the address bar is stale until you click Copy link again. See Q3. |
| D3 | **Reject, don't clamp.** One bad lever rejects the whole link or file, with text naming the lever. Unrelated and unknown query parameters (`utm_source`, `fbclid`) are ignored; unknown keys inside a JSON file are rejected. | The sliders can only produce legal values, so an out-of-range value means a hand edit or a unit mix-up (`feedbackRate=85` because the slider says 85%). Clamping would silently run a different experiment from the one that was shared. Issue #11's "clamped or ignored" allows this; #10's "clamps values" does not literally. See Q1. |
| D4 | The file is `{ "schema": "nonaka-spiral-lab/config", "version": 1, "initial": { ...eight levers } }`. | `initial` is byte-for-byte the block a `presets.json` entry carries (same keys, same order), so an exported file's `initial` can be pasted into a preset PR. `schema` stops a random JSON file with `"version": 1` from importing; `version` lets a future format change fail loudly. |
| D5 | Lever bounds live once, in `PARAM_SPECS` in `sim-config.ts`. The two head-count sliders and `presets.test.ts` read them. | `presets.test.ts` hard-coded `0–12` and `0–1` and the sliders hard-coded `max={12}`. The six 0–100 percentage sliders stay as they are: they are the same 0–1 range times 100. |
| D6 | A loaded link or file highlights a preset only if all eight levers equal that preset's (`findMatchingPresetId`). Slider edits still clear the highlight (`updateParam` is unchanged). Preset buttons pass their own id. | "Share the NotCo preset, get NotCo highlighted" is the least surprising behavior, and the match is exact, never fuzzy. |
| D7 | All whole-configuration changes (preset button, link, file) go through one `applyConfig(next, message, presetId?)`. | It sets `paramsRef` first, then state, then calls `rebuildParticles`, which is what `applyPreset` did. |
| D8 | Errors show as visible text under the buttons (`role="alert"`) and in the event log as kind `"warn"`. | `pushEvent(…, "bad")` increments the Failures stat, which counts simulation failures. A rejected file is not one. |
| D9 | **Copy link** reads `paramsRef.current` (what the loop is running), not React state. It always writes all eight levers. | No stale closure. A link keeps its meaning even if `DEFAULT_PARAMS` changes later. |

### Evidence: `useSearchParams` on Next 16.3.0 (D1)

Docs read first: `web/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md` ("Prerendering" section), `.../03-file-conventions/page.md` (`searchParams` prop), `.../01-getting-started/04-linking-and-navigating.md` ("Native History API"). They say: in a prerendered route `useSearchParams` client-renders everything up to the nearest `Suspense`; "During production builds, a static page that calls `useSearchParams` ... must be wrapped in a `Suspense` boundary, otherwise the build fails"; in dev it "may appear to work without `Suspense`"; the page `searchParams` prop "will opt the page into dynamic rendering"; and `history.replaceState` calls "integrate into the Next.js Router".

Then measured, in a throwaway copy of `web/` at the PR #23 tip, `next build` with Turbopack, checking `.next/server/app/simulator.html`:

| Variant | `next build` | Route table | `Spiral score` in HTML | `NotCo / Giuseppe` in HTML | CSR-bailout marker |
|---|---|---|---|---|---|
| Baseline (today) | passes | `○ /simulator` | 1 | 1 | 0 |
| A. `useSearchParams()` in `SpiralSimulator`, no `Suspense` | **fails**: `useSearchParams() should be wrapped in a suspense boundary at page "/simulator"` | none | none | none | none |
| B. A plus `<Suspense>` around `<SpiralSimulator />` in `page.tsx` | passes | `○ /simulator` | **0** | **0** | 1 (fallback only) |
| C. `window.location.search` in a mount effect (this plan, with the UI complete) | passes | `○ /simulator` | 1 | 1 (and `Copy link` 1) | 0 |

B "works" but ships a page whose stats, sliders and preset buttons are not in the initial HTML, so they are blank until JavaScript runs. C costs one extra render after hydration (the server HTML is the default preset, the effect swaps the shared values in). A is a trap: per the docs `npm run dev` does not show it, while `npm run build` (and so CI) fails on it, as measured above. Task 3 Step 8 turns variant C's numbers into a check.

## Global Constraints

- Work on a branch and open a PR. **Never push to `main`**: `deploy.yml` deploys production on every push to `main`. Do not edit `.github/workflows/deploy.yml`.
- Next.js is v16 with breaking changes: read the relevant guide in `web/node_modules/next/dist/docs/` before writing Next-specific code. This plan's only Next-specific choice is D1; do not "fix" it into `useSearchParams` later.
- No new runtime dependencies, and no new dev dependencies: no jsdom, no Playwright, no Testing Library. UI behavior is checked by hand (Task 4). Download uses `Blob` plus a temporary anchor; copy uses `navigator.clipboard`.
- Keep the ref/state split in `SpiralSimulator.tsx`: the RAF loop reads `paramsRef`/`particlesRef`/`cycleRef`/`scoreRef`/`failureRef`; React state mirrors them for the UI. Handlers that need the live params read `paramsRef.current`.
- Reuse tokens from `globals.css` (`var(--rust)`, `var(--olive)`, `.btn.ghost`); no new hardcoded colors.
- Match the surrounding style: double quotes, semicolons, 2-space indent, explicit `interface`s.
- Pure logic goes in `web/src/lib/`, with no React and no DOM globals at import time; tests live in `web/tests/` and run in the node environment.
- `npm`, `npx` and `grep .next/...` commands run in `web/`. `git` and `gh` commands run at the repository root, so their paths start with `web/` (git paths are relative to the current directory). Keep two shells.
- Before every push, all four must pass: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- `git add` only the files each step names; never `git add -A`. Stray untracked tooling directories (for example `.impeccable/`) must not be committed.

## Review Focus

Failure modes the issues imply but their acceptance criteria do not test, most likely to bite first. Each names the test or check that pins it.

1. **A shared link picks up tracking parameters** (`?utm_source=...`, `fbclid=...`), and chat apps and email clients append them. It must still load, not be rejected. Pinned by `tolerates a leading ? and ignores unrelated parameters` (Task 1) and manual check M2 (Task 4).
2. **Percentages typed where fractions belong** (`baChaos=60`, `"feedbackRate": 85`), because the sliders display `85%`. Must be rejected with the lever named, never clamped to 1 and run as a different experiment. Pinned by `rejects percent instead of fraction` (Task 1), `rejects percentages typed where a 0-1 fraction belongs` (Task 2) and M5.
3. **A hand-edited or truncated file**: a UTF-8 byte-order mark from a Windows editor (must be accepted), a half-written file, `1e999`, a value like `1e-7` that `String()` renders in exponent form (must survive a round trip). Pinned by the BOM, `hostile or truncated`, `non-finite` and `awkward floats` tests (Tasks 1 and 2) and M13.
4. **The clipboard is unavailable** (plain `http://` LAN address, permission denied). Copy link must say so in visible text and leave the link in the address bar, not fail silently. No automated test (no DOM framework); pinned by M9.
5. **Dev double-mount and re-picking a file.** React StrictMode runs mount effects twice in `next dev`; the link must load once, not log twice. Choosing the same file twice in a row (after editing it) must work, which needs the input's value reset. Pinned by M15 and M12.

Also checked by hand (M7): a link or file with `humans=0&agents=0` is legal (the sliders allow it) and must give an empty canvas, not `NaN` or an error. The engine side is already pinned by `meanLevel([])` in `spiral-engine.test.ts`.

---

## File structure

| File | Responsibility | Task |
|---|---|---|
| `web/src/lib/sim-config.ts` (create) | `PARAM_SPECS` (bounds, order), `DEFAULT_PARAMS`, `Result`, share-link codec, preset matching, JSON file codec | 1, 2 |
| `web/tests/sim-config.test.ts` (create) | Link codec, bounds, preset matching | 1 |
| `web/tests/sim-config-json.test.ts` (create) | File codec: round trips, every invalid-input class, pollution keys | 2 |
| `web/tests/presets.test.ts` (modify) | Read bounds and keys from `sim-config.ts` instead of local copies | 1 |
| `web/src/components/ConfigControls.tsx` (create) | Copy link / Export JSON / Import JSON buttons, status line | 3 |
| `web/src/components/SpiralSimulator.tsx` (modify) | `applyConfig`, link loading on mount, notice state, sliders read `PARAM_SPECS` | 3 |
| `README.md`, `web/README.md`, `CLAUDE.md`, `CONTRIBUTING.md` (modify) | Document the feature and the `useSearchParams` decision | 5 |

---

### Task 1: Lever bounds and the share-link codec

**Files:**
- Create: `web/src/lib/sim-config.ts`
- Create: `web/tests/sim-config.test.ts`
- Modify: `web/tests/presets.test.ts`

**Interfaces:**
- Consumes: `SimParams` (type only) from `web/src/lib/spiral-engine.ts`; `web/data/presets.json`.
- Produces, all exported from `@/lib/sim-config`:
  - `type ParamKey = keyof SimParams`, `interface ParamSpec { min: number; max: number; integer: boolean }`
  - `const PARAM_SPECS: Record<ParamKey, ParamSpec>`, `const PARAM_KEYS: ParamKey[]` (slider order)
  - `const DEFAULT_PARAMS: SimParams` (equals the `notco` preset)
  - `type Failure = { ok: false; error: string }`, `type Result<T> = { ok: true; value: T } | Failure`
  - `const MAX_QUERY_LENGTH = 2048`
  - `serializeParams(params: SimParams): string`
  - `parseParams(search: string, base: SimParams): Result<SimParams | null>` (`null` = the URL carries none of the eight levers)
  - `buildShareUrl(href: string, params: SimParams): string`
  - `findMatchingPresetId(params: SimParams, presets: ReadonlyArray<{ id: string; initial: SimParams }>): string` (`""` = custom)

- [ ] **Step 1: Confirm the baseline**

Run: `npm test`
Expected: PASS, 2 test files, 50 tests.

- [ ] **Step 2: Write the failing tests**

Create `web/tests/sim-config.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import presetsData from "../data/presets.json";
import {
  DEFAULT_PARAMS,
  MAX_QUERY_LENGTH,
  PARAM_KEYS,
  PARAM_SPECS,
  buildShareUrl,
  findMatchingPresetId,
  parseParams,
  serializeParams,
} from "../src/lib/sim-config";
import type { SimParams } from "../src/lib/spiral-engine";

const SAMPLE: SimParams = {
  humans: 7,
  agents: 2,
  baRedundancy: 0.35,
  baChaos: 0.05,
  baAutonomy: 1,
  feedbackRate: 0,
  machineTransfer: 0.99,
  hallucinationRisk: 0.07,
};

/** A different, valid base so tests can tell "kept from base" from "parsed". */
const BASE: SimParams = {
  humans: 1,
  agents: 1,
  baRedundancy: 0.5,
  baChaos: 0.5,
  baAutonomy: 0.5,
  feedbackRate: 0.5,
  machineTransfer: 0.5,
  hallucinationRisk: 0.5,
};

const parsed = (search: string, base: SimParams = BASE) => parseParams(search, base);

describe("PARAM_SPECS", () => {
  it("lists the eight levers in slider order", () => {
    expect(PARAM_KEYS).toEqual([
      "humans",
      "agents",
      "baRedundancy",
      "baChaos",
      "baAutonomy",
      "feedbackRate",
      "machineTransfer",
      "hallucinationRisk",
    ]);
  });

  it("matches the UI sliders: head-counts are integers 0-12, the other six are 0-1", () => {
    for (const k of ["humans", "agents"] as const) {
      expect(PARAM_SPECS[k]).toEqual({ min: 0, max: 12, integer: true });
    }
    for (const k of PARAM_KEYS.filter((key) => key !== "humans" && key !== "agents")) {
      expect(PARAM_SPECS[k]).toEqual({ min: 0, max: 1, integer: false });
    }
  });

  it("makes DEFAULT_PARAMS the notco preset, the one the simulator opens on", () => {
    const notco = presetsData.presets.find((p) => p.id === "notco");
    expect(notco).toBeDefined();
    expect(DEFAULT_PARAMS).toEqual(notco!.initial);
  });
});

describe("serializeParams", () => {
  it("emits all eight levers by their SimParams names, in order, with no extras", () => {
    expect(serializeParams(SAMPLE)).toBe(
      "humans=7&agents=2&baRedundancy=0.35&baChaos=0.05&baAutonomy=1&feedbackRate=0&machineTransfer=0.99&hallucinationRisk=0.07",
    );
  });

  it("writes negative zero as plain 0", () => {
    expect(serializeParams({ ...SAMPLE, feedbackRate: -0 })).toContain("feedbackRate=0&");
  });
});

describe("parseParams: round trips", () => {
  it("restores every preset exactly", () => {
    for (const preset of presetsData.presets) {
      expect(parsed(serializeParams(preset.initial))).toEqual({ ok: true, value: preset.initial });
    }
  });

  it("restores every value the sliders can produce", () => {
    for (let n = 0; n <= 100; n++) {
      const v = n / 100; // the component's onChange does Number(e.target.value) / 100
      const p: SimParams = { ...SAMPLE, baRedundancy: v, baChaos: v, baAutonomy: v, feedbackRate: v, machineTransfer: v, hallucinationRisk: v };
      expect(parsed(serializeParams(p))).toEqual({ ok: true, value: p });
    }
    for (let n = 0; n <= 12; n++) {
      const p: SimParams = { ...SAMPLE, humans: n, agents: 12 - n };
      expect(parsed(serializeParams(p))).toEqual({ ok: true, value: p });
    }
  });

  it("restores awkward floats that a hand-edited file could carry", () => {
    for (const v of [1e-7, 0.1 + 0.2, 0.9999999999999999, Number.MIN_VALUE, 1 / 3]) {
      const p: SimParams = { ...SAMPLE, baChaos: v };
      expect(parsed(serializeParams(p))).toEqual({ ok: true, value: p });
    }
  });

  it("accepts both bounds of every lever", () => {
    for (const k of PARAM_KEYS) {
      const { min, max } = PARAM_SPECS[k];
      expect(parsed(`${k}=${min}`)).toMatchObject({ ok: true, value: { [k]: min } });
      expect(parsed(`${k}=${max}`)).toMatchObject({ ok: true, value: { [k]: max } });
    }
  });

  it("reads -0 as plain 0", () => {
    const r = parsed("humans=-0");
    expect(r.ok && r.value !== null && Object.is(r.value.humans, 0)).toBe(true);
  });
});

describe("parseParams: partial and unrelated URLs", () => {
  it("returns null when the URL carries none of the eight levers", () => {
    for (const search of ["", "?", "?utm_source=newsletter&ref=x", "?preset=notco"]) {
      expect(parsed(search)).toEqual({ ok: true, value: null });
    }
  });

  it("fills missing levers from the base", () => {
    expect(parsed("?humans=9&baChaos=0.25")).toEqual({
      ok: true,
      value: { ...BASE, humans: 9, baChaos: 0.25 },
    });
  });

  it("does not mutate the base", () => {
    const base = { ...BASE };
    parsed("humans=9", base);
    expect(base).toEqual(BASE);
  });

  it("tolerates a leading ? and ignores unrelated parameters", () => {
    expect(parsed("?utm_source=x&humans=3&fbclid=abc")).toEqual({ ok: true, value: { ...BASE, humans: 3 } });
  });

  it("matches lever names exactly (case-sensitive), so near-misses are just unrelated", () => {
    expect(parsed("?Humans=3&BAREDUNDANCY=0.1")).toEqual({ ok: true, value: null });
  });
});

describe("parseParams: invalid values are rejected whole, naming the lever", () => {
  const bad: Array<[string, string, string]> = [
    // [why, search, lever named in the error]
    ["not a number", "humans=abc", "humans"],
    ["empty value", "baChaos=", "baChaos"],
    ["NaN", "baChaos=NaN", "baChaos"],
    ["Infinity", "baChaos=Infinity", "baChaos"],
    ["overflowing exponent", "baChaos=1e999", "baChaos"],
    ["hex", "humans=0x10", "humans"],
    ["surrounding space", "humans=%206", "humans"],
    ["comma decimal", "baChaos=0,5", "baChaos"],
    ["plus sign", "humans=%2B3", "humans"],
    ["head-count above 12", "humans=13", "humans"],
    ["head-count below 0", "agents=-1", "agents"],
    ["fractional head-count", "humans=6.5", "humans"],
    ["fractional head-count, tiny", "agents=2.0000001", "agents"],
    ["unit lever above 1", "baRedundancy=1.01", "baRedundancy"],
    ["unit lever below 0", "hallucinationRisk=-0.01", "hallucinationRisk"],
    ["percent instead of fraction", "feedbackRate=85", "feedbackRate"],
    ["repeated lever", "humans=6&humans=7", "humans"],
  ];

  for (const [why, search, lever] of bad) {
    it(`rejects ${why}`, () => {
      const r = parsed(search);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toContain(lever);
    });
  }

  it("rejects the whole link even when other levers are fine", () => {
    expect(parsed("humans=6&baChaos=2&agents=3").ok).toBe(false);
  });

  it("rejects oversized input before parsing it", () => {
    const r = parsed(`humans=6&${"x".repeat(MAX_QUERY_LENGTH)}=1`);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/too long/i);
  });

  it("accepts input exactly at the size limit", () => {
    const search = `humans=6&pad=${"x".repeat(MAX_QUERY_LENGTH - "humans=6&pad=".length)}`;
    expect(search.length).toBe(MAX_QUERY_LENGTH);
    expect(parsed(search)).toEqual({ ok: true, value: { ...BASE, humans: 6 } });
  });

  it("never throws on malformed encodings and odd syntax", () => {
    for (const search of ["%", "%E0%A4%A", "humans[]=1", "&&&", "=", "humans", "humans=%00", "?humans=6#frag", "\u0000", "humans=6&&agents=2"]) {
      expect(() => parsed(search)).not.toThrow();
    }
  });
});

describe("parseParams: prototype-pollution style keys", () => {
  it("ignores __proto__, constructor and prototype and leaves Object.prototype alone", () => {
    const r = parsed("__proto__=1&constructor=2&prototype=3&__proto__[humans]=99&humans=4");
    expect(r).toEqual({ ok: true, value: { ...BASE, humans: 4 } });
    expect(({} as Record<string, unknown>).humans).toBeUndefined();
    expect(Object.keys(Object.prototype)).toEqual([]);
  });
});

describe("buildShareUrl", () => {
  it("replaces the whole query and fragment, keeping origin and path", () => {
    expect(
      buildShareUrl("https://nonaka-spiral-lab.vercel.app/simulator?utm_source=x&humans=1#log", SAMPLE),
    ).toBe(
      "https://nonaka-spiral-lab.vercel.app/simulator?humans=7&agents=2&baRedundancy=0.35&baChaos=0.05&baAutonomy=1&feedbackRate=0&machineTransfer=0.99&hallucinationRisk=0.07",
    );
  });

  it("works on localhost with a port and no query", () => {
    const url = buildShareUrl("http://localhost:3000/simulator", SAMPLE);
    expect(url.startsWith("http://localhost:3000/simulator?humans=7&")).toBe(true);
  });

  it("produces a link that parseParams reads back to the same configuration", () => {
    const url = new URL(buildShareUrl("https://example.test/simulator", SAMPLE));
    expect(parsed(url.search)).toEqual({ ok: true, value: SAMPLE });
  });
});

describe("findMatchingPresetId", () => {
  it("returns the id of the preset whose eight levers all match", () => {
    for (const preset of presetsData.presets) {
      expect(findMatchingPresetId({ ...preset.initial }, presetsData.presets)).toBe(preset.id);
    }
  });

  it("returns an empty string for a custom configuration", () => {
    expect(findMatchingPresetId(SAMPLE, presetsData.presets)).toBe("");
  });

  it("returns an empty string when any single lever differs", () => {
    const notco = presetsData.presets.find((p) => p.id === "notco")!;
    expect(findMatchingPresetId({ ...notco.initial, humans: notco.initial.humans + 1 }, presetsData.presets)).toBe("");
  });
});
```

- [ ] **Step 3: Run them to verify they fail**

Run: `npx vitest run tests/sim-config.test.ts`
Expected: FAIL, `Cannot find module '../src/lib/sim-config' imported from .../tests/sim-config.test.ts`, 0 tests run.

- [ ] **Step 4: Write the implementation**

Create `web/src/lib/sim-config.ts`:

```ts
import type { SimParams } from "./spiral-engine";

export type ParamKey = keyof SimParams;

export interface ParamSpec {
  min: number;
  max: number;
  integer: boolean;
}

/**
 * The one place that says what a legal simulator configuration is: which
 * levers exist, in what order, and their bounds. The UI sliders, the share-link
 * parser, the JSON importer and the presets guard test all read this, so a
 * slider range can never drift from what a link or file is allowed to carry.
 */
export const PARAM_SPECS: Record<ParamKey, ParamSpec> = {
  humans: { min: 0, max: 12, integer: true },
  agents: { min: 0, max: 12, integer: true },
  baRedundancy: { min: 0, max: 1, integer: false },
  baChaos: { min: 0, max: 1, integer: false },
  baAutonomy: { min: 0, max: 1, integer: false },
  feedbackRate: { min: 0, max: 1, integer: false },
  machineTransfer: { min: 0, max: 1, integer: false },
  hallucinationRisk: { min: 0, max: 1, integer: false },
};

export const PARAM_KEYS = Object.keys(PARAM_SPECS) as ParamKey[];

/** What the simulator opens on, and what a partial link falls back to. Equals the `notco` preset. */
export const DEFAULT_PARAMS: SimParams = {
  humans: 6,
  agents: 3,
  baRedundancy: 0.7,
  baChaos: 0.6,
  baAutonomy: 0.6,
  feedbackRate: 0.85,
  machineTransfer: 0.7,
  hallucinationRisk: 0.2,
};

export type Failure = { ok: false; error: string };
export type Result<T> = { ok: true; value: T } | Failure;

const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const fail = (error: string): Failure => ({ ok: false, error });

/** Validates one lever. Normalises -0 to 0 so equality and display stay boring. */
function checkValue(key: ParamKey, v: unknown): Result<number> {
  const spec = PARAM_SPECS[key];
  if (typeof v !== "number") return fail(`${key} must be a number.`);
  if (!Number.isFinite(v)) return fail(`${key} must be a finite number.`);
  if (spec.integer && !Number.isInteger(v)) return fail(`${key} must be a whole number.`);
  if (v < spec.min || v > spec.max) return fail(`${key} must be between ${spec.min} and ${spec.max}.`);
  return ok(v === 0 ? 0 : v);
}

// ---------------------------------------------------------------------------
// Share links: ?humans=6&agents=3&baRedundancy=0.7&...
// ---------------------------------------------------------------------------

/** A full link is ~120 characters; anything past this is not one of ours. */
export const MAX_QUERY_LENGTH = 2048;

// Plain decimal or exponent form. Excludes "", " ", "NaN", "Infinity", "0x10", "+3".
// Every finite value `String(n)` can emit matches, so serialize -> parse round-trips.
const DECIMAL = /^-?\d+(\.\d+)?([eE][-+]?\d+)?$/;

/** Always writes all eight levers so a link keeps its meaning if defaults ever change. */
export function serializeParams(params: SimParams): string {
  const query = new URLSearchParams();
  for (const k of PARAM_KEYS) query.set(k, String(params[k]));
  return query.toString();
}

/**
 * Reads the eight levers from a query string (leading "?" optional) over `base`.
 * - Unrelated parameters (utm_*, fbclid, __proto__, ...) are ignored.
 * - A URL with none of the eight levers yields `{ ok: true, value: null }`: "nothing to apply".
 * - Any recognised lever with a bad value rejects the whole link, so a half-applied
 *   configuration is never shown as if it were the one that was shared.
 * Never throws.
 */
export function parseParams(search: string, base: SimParams): Result<SimParams | null> {
  if (search.length > MAX_QUERY_LENGTH) return fail("The link is too long.");
  const query = new URLSearchParams(search);
  const next: SimParams = { ...base };
  let seen = 0;
  for (const k of PARAM_KEYS) {
    const all = query.getAll(k);
    if (all.length === 0) continue;
    if (all.length > 1) return fail(`${k} appears more than once.`);
    if (!DECIMAL.test(all[0])) return fail(`${k} must be a number.`);
    const checked = checkValue(k, Number(all[0]));
    if (!checked.ok) return checked;
    next[k] = checked.value;
    seen += 1;
  }
  return ok(seen === 0 ? null : next);
}

/** `href` must be an absolute URL (pass `window.location.href`). Drops any other query and the fragment. */
export function buildShareUrl(href: string, params: SimParams): string {
  const url = new URL(href);
  url.search = serializeParams(params);
  url.hash = "";
  return url.toString();
}

// ---------------------------------------------------------------------------
// Preset matching: lets a loaded link or file highlight the preset it equals
// ---------------------------------------------------------------------------

/** Id of the preset whose eight levers all equal `params`, or "" for a custom configuration. */
export function findMatchingPresetId(
  params: SimParams,
  presets: ReadonlyArray<{ id: string; initial: SimParams }>,
): string {
  const hit = presets.find((p) => PARAM_KEYS.every((k) => p.initial[k] === params[k]));
  return hit ? hit.id : "";
}
```

- [ ] **Step 5: Run them to verify they pass**

Run: `npx vitest run tests/sim-config.test.ts`
Expected: PASS, 43 tests.

- [ ] **Step 6: Make the presets guard read the same bounds**

`web/tests/presets.test.ts` keeps its own copy of the key list and the `0–12` / `0–1` ranges. Replace the whole file so a preset is checked against the exact bounds the simulator, links and files enforce:

Replace `web/tests/presets.test.ts` entirely with:

```ts
import { describe, expect, it } from "vitest";
import presetsData from "../data/presets.json";
import { PARAM_KEYS, PARAM_SPECS } from "../src/lib/sim-config";
import { convertChance } from "../src/lib/spiral-engine";

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

      it("keeps every lever inside its PARAM_SPECS bounds, with whole-number head-counts", () => {
        for (const k of PARAM_KEYS) {
          const { min, max, integer } = PARAM_SPECS[k];
          const v = preset.initial[k];
          expect(v, `${preset.id}.${k}`).toBeGreaterThanOrEqual(min);
          expect(v, `${preset.id}.${k}`).toBeLessThanOrEqual(max);
          if (integer) expect(Number.isInteger(v), `${preset.id}.${k} must be whole`).toBe(true);
        }
      });

      it("has at least one knowledge carrier", () => {
        expect(preset.initial.humans + preset.initial.agents).toBeGreaterThan(0);
      });
    });
  }

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
});
```

The two range tests (`head-counts` and `0–1 levers`) became one spec-driven test, so the per-preset count drops from 4 to 3.

- [ ] **Step 7: Run the whole suite, typecheck and lint**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS, 3 test files, 87 tests (23 engine + 21 presets + 43 sim-config); typecheck and lint clean.

- [ ] **Step 8: Check the guard still catches a bad preset**

Temporarily change `"humans": 6,` in the `notco` entry of `web/data/presets.json` to `"humans": 13,` and run `npx vitest run tests/presets.test.ts` in `web/`.
Expected: FAIL in `presets.json > notco > keeps every lever inside its PARAM_SPECS bounds, with whole-number head-counts` with `AssertionError: notco.humans: expected 13 to be less than or equal to 12`. Revert the edit (at the repo root: `git checkout web/data/presets.json`) and re-run: PASS.

- [ ] **Step 9: Commit** (repo root)

```bash
git add web/src/lib/sim-config.ts web/tests/sim-config.test.ts web/tests/presets.test.ts
git commit -m "feat: add lever bounds and a strict share-link codec"
```

---

### Task 2: The JSON config file codec

**Files:**
- Modify: `web/src/lib/sim-config.ts` (append)
- Create: `web/tests/sim-config-json.test.ts`

**Interfaces:**
- Consumes: `PARAM_SPECS`, `PARAM_KEYS`, `Result`, `ok`, `fail`, `checkValue` (module-internal) from Task 1.
- Produces, all exported from `@/lib/sim-config`:
  - `const CONFIG_SCHEMA = "nonaka-spiral-lab/config"`, `const CONFIG_VERSION = 1`, `const MAX_JSON_LENGTH = 4096`
  - `validateParams(input: unknown): Result<SimParams>` (strict: exactly the eight levers)
  - `exportConfig(params: SimParams): string` (pretty-printed, ends with a newline)
  - `importConfig(text: string): Result<SimParams>`

- [ ] **Step 1: Write the failing tests**

Create `web/tests/sim-config-json.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import presetsData from "../data/presets.json";
import {
  CONFIG_SCHEMA,
  CONFIG_VERSION,
  MAX_JSON_LENGTH,
  PARAM_KEYS,
  PARAM_SPECS,
  exportConfig,
  importConfig,
  validateParams,
} from "../src/lib/sim-config";
import type { SimParams } from "../src/lib/spiral-engine";

const SAMPLE: SimParams = {
  humans: 7,
  agents: 2,
  baRedundancy: 0.35,
  baChaos: 0.05,
  baAutonomy: 1,
  feedbackRate: 0,
  machineTransfer: 0.99,
  hallucinationRisk: 0.07,
};

const BOM = String.fromCharCode(0xfeff); // what Windows editors prepend to "UTF-8 with BOM" files
const NUL = String.fromCharCode(0);

/** Builds config-file text; `extra` adds envelope fields, `initial` replaces the params block. */
const fileText = (initial: unknown = SAMPLE, extra: Record<string, unknown> = {}) =>
  JSON.stringify({ schema: CONFIG_SCHEMA, version: CONFIG_VERSION, initial, ...extra });

const without = (key: keyof SimParams): Partial<SimParams> => {
  const copy: Partial<SimParams> = { ...SAMPLE };
  delete copy[key];
  return copy;
};

const expectError = (text: string, pattern: RegExp) => {
  const r = importConfig(text);
  expect(r.ok).toBe(false);
  if (!r.ok) expect(r.error).toMatch(pattern);
};

describe("exportConfig", () => {
  it("writes a versioned envelope around the presets.json `initial` block", () => {
    expect(JSON.parse(exportConfig(SAMPLE))).toEqual({
      schema: "nonaka-spiral-lab/config",
      version: 1,
      initial: SAMPLE,
    });
  });

  it("uses exactly the key set and order of a presets.json `initial` block", () => {
    const exported = JSON.parse(exportConfig(SAMPLE)) as { initial: object };
    expect(Object.keys(exported.initial)).toEqual(Object.keys(presetsData.presets[0].initial));
  });

  it("is pretty-printed and ends with a newline", () => {
    const text = exportConfig(SAMPLE);
    expect(text.endsWith("}\n")).toBe(true);
    expect(text).toContain('\n  "initial": {\n    "humans": 7,');
  });

  it("exports only the eight levers even if the object carries more", () => {
    const text = exportConfig({ ...SAMPLE, secret: "x" } as SimParams);
    expect(text).not.toContain("secret");
  });
});

describe("importConfig: round trips", () => {
  it("restores every preset exactly", () => {
    for (const preset of presetsData.presets) {
      expect(importConfig(exportConfig(preset.initial))).toEqual({ ok: true, value: preset.initial });
    }
  });

  it("restores bounds, slider values and awkward floats exactly", () => {
    const cases: SimParams[] = [
      SAMPLE,
      { ...SAMPLE, humans: 0, agents: 0, baChaos: 0, hallucinationRisk: 0 },
      { ...SAMPLE, humans: 12, agents: 12, baChaos: 1, hallucinationRisk: 1 },
      { ...SAMPLE, baChaos: 1e-7, baAutonomy: 0.1 + 0.2, feedbackRate: 0.9999999999999999 },
    ];
    for (let n = 0; n <= 100; n++) cases.push({ ...SAMPLE, baRedundancy: n / 100, machineTransfer: n / 100 });
    for (const p of cases) expect(importConfig(exportConfig(p))).toEqual({ ok: true, value: p });
  });

  it("accepts a UTF-8 byte-order mark, which Windows editors add", () => {
    expect(importConfig(`${BOM}${exportConfig(SAMPLE)}`)).toEqual({ ok: true, value: SAMPLE });
  });

  it("returns a plain object with exactly the eight levers", () => {
    const r = importConfig(exportConfig(SAMPLE));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(Object.keys(r.value)).toEqual([...PARAM_KEYS]);
      expect(Object.getPrototypeOf(r.value)).toBe(Object.prototype);
    }
  });

  it("reads -0 as plain 0", () => {
    const text = exportConfig(SAMPLE).replace('"humans": 7', '"humans": -0');
    expect(text).toContain('"humans": -0');
    const r = importConfig(text);
    expect(r.ok && Object.is(r.value.humans, 0)).toBe(true);
  });
});

describe("importConfig: rejects, naming what is wrong", () => {
  it("rejects text that is not JSON", () => {
    for (const text of ["", " ", "\n", "{", "}", "not json", "{'a':1}", "undefined", '{"schema":', '{"initial": NaN}', "{}x"]) {
      expectError(text, /not valid JSON/i);
    }
  });

  it("rejects JSON that is not an object", () => {
    for (const text of ["null", "[]", "[1,2]", "42", '"hi"', "true"]) expectError(text, /object/i);
  });

  it("rejects a different schema, or none", () => {
    expectError("{}", /Spiral Lab/);
    expectError(JSON.stringify({ schema: "other/thing", version: 1, initial: SAMPLE }), /Spiral Lab/);
    expectError(JSON.stringify({ version: 1, initial: SAMPLE }), /Spiral Lab/);
    // a bare presets.json `initial` block is not a config file either
    expectError(JSON.stringify(SAMPLE), /Spiral Lab/);
  });

  it("rejects a version mismatch, including a missing or mistyped version", () => {
    expectError(fileText(SAMPLE, { version: 2 }), /version/i);
    expectError(fileText(SAMPLE, { version: 0 }), /version/i);
    expectError(fileText(SAMPLE, { version: "1" }), /version/i);
    expectError(fileText(SAMPLE, { version: 1.5 }), /version/i);
    expectError(JSON.stringify({ schema: CONFIG_SCHEMA, initial: SAMPLE }), /version/i);
  });

  it("rejects a missing or non-object `initial`", () => {
    expectError(JSON.stringify({ schema: CONFIG_SCHEMA, version: 1 }), /Parameters must be an object/);
    for (const initial of [null, [], [SAMPLE], 5, "x", true]) {
      expectError(fileText(initial), /Parameters must be an object/);
    }
  });

  it("rejects unknown envelope fields", () => {
    expectError(fileText(SAMPLE, { name: "mine" }), /"name"/);
  });

  it("rejects unknown parameters", () => {
    expectError(fileText({ ...SAMPLE, extra: 1 }), /"extra"/);
    expectError(fileText({ ...SAMPLE, Humans: 6 }), /"Humans"/);
  });

  it("truncates a long unknown key in the message", () => {
    expectError(fileText({ ...SAMPLE, ["k".repeat(100)]: 1 }), /^Unknown parameter "k{32}\.\.\."\.$/);
  });

  it("rejects each missing parameter", () => {
    for (const k of PARAM_KEYS) expectError(fileText(without(k)), new RegExp(`Missing parameter "${k}"`));
  });

  it("rejects wrong types for every lever", () => {
    for (const k of PARAM_KEYS) {
      for (const bad of ["6", "0.5", "", null, true, false, [], [6], {}]) {
        expectError(fileText({ ...SAMPLE, [k]: bad }), new RegExp(`${k} must be a number`));
      }
    }
  });

  it("rejects non-finite numbers", () => {
    // JSON cannot spell NaN or Infinity, but 1e999 parses to Infinity
    const text = exportConfig(SAMPLE).replace('"baChaos": 0.05', '"baChaos": 1e999');
    expect(text).toContain("1e999");
    expectError(text, /baChaos must be a finite number/);
  });

  it("rejects out-of-range values on every lever", () => {
    for (const k of PARAM_KEYS) {
      const { min, max } = PARAM_SPECS[k];
      for (const bad of [min - 1, min - 0.01, max + 0.01, max + 1]) {
        expectError(fileText({ ...SAMPLE, [k]: bad }), new RegExp(`${k} must be (between|a whole)`));
      }
    }
  });

  it("rejects percentages typed where a 0-1 fraction belongs, instead of clamping them", () => {
    // the sliders display 85%, so 85 is an easy thing to type into a hand-edited file
    expectError(fileText({ ...SAMPLE, feedbackRate: 85 }), /feedbackRate must be between 0 and 1/);
    expectError(fileText({ ...SAMPLE, baChaos: 60 }), /baChaos must be between 0 and 1/);
  });

  it("rejects fractional head-counts", () => {
    expectError(fileText({ ...SAMPLE, humans: 6.5 }), /humans must be a whole number/);
    expectError(fileText({ ...SAMPLE, agents: 2.0000001 }), /agents must be a whole number/);
  });

  it("rejects oversized input before parsing it, and accepts input exactly at the limit", () => {
    const valid = exportConfig(SAMPLE);
    expectError(valid + " ".repeat(MAX_JSON_LENGTH), /too large/i);
    const atLimit = valid + " ".repeat(MAX_JSON_LENGTH - valid.length);
    expect(atLimit.length).toBe(MAX_JSON_LENGTH);
    expect(importConfig(atLimit)).toEqual({ ok: true, value: SAMPLE });
  });

  it("never throws on hostile or truncated input", () => {
    const hostile = [
      "[".repeat(MAX_JSON_LENGTH),
      '{"a":'.repeat(800) + "1" + "}".repeat(800),
      NUL,
      BOM,
      "\u00fc".repeat(100),
      '{"schema":"nonaka-spiral-lab/config","version":1,"initial":{"humans":',
    ];
    for (const text of hostile) {
      expect(() => importConfig(text)).not.toThrow();
      expect(importConfig(text).ok).toBe(false);
    }
  });
});

describe("importConfig: prototype-pollution style keys", () => {
  it("rejects __proto__, constructor and prototype inside `initial` without polluting anything", () => {
    for (const name of ["__proto__", "constructor", "prototype"]) {
      const levers = JSON.stringify(SAMPLE).slice(1); // the eight levers, minus the leading "{"
      const text = `{"schema":"${CONFIG_SCHEMA}","version":1,"initial":{"${name}":{"humans":99,"polluted":true},${levers}}`;
      const r = importConfig(text);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toContain(name);
    }
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(({} as Record<string, unknown>).humans).toBeUndefined();
    expect(Object.keys(Object.prototype)).toEqual([]);
  });

  it("rejects __proto__ at the top level of the file", () => {
    const text = `{"__proto__":{"polluted":true},"schema":"${CONFIG_SCHEMA}","version":1,"initial":${JSON.stringify(SAMPLE)}}`;
    expect(importConfig(text).ok).toBe(false);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("does not let a __proto__ value stand in for the levers", () => {
    const text = `{"schema":"${CONFIG_SCHEMA}","version":1,"initial":{"__proto__":${JSON.stringify(SAMPLE)}}}`;
    expect(importConfig(text).ok).toBe(false);
  });
});

describe("validateParams", () => {
  it("accepts a valid object and returns a fresh copy", () => {
    const r = validateParams(SAMPLE);
    expect(r).toEqual({ ok: true, value: SAMPLE });
    if (r.ok) expect(r.value).not.toBe(SAMPLE);
  });

  it("rejects NaN, Infinity and -Infinity on any lever", () => {
    for (const k of PARAM_KEYS) {
      for (const bad of [NaN, Infinity, -Infinity]) {
        const r = validateParams({ ...SAMPLE, [k]: bad });
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.error).toContain(k);
      }
    }
  });

  it("rejects non-objects and never throws", () => {
    const inputs: unknown[] = [undefined, null, 0, 1, NaN, "x", true, [], [SAMPLE], () => 1, Symbol("s"), BigInt(10)];
    for (const input of inputs) {
      expect(() => validateParams(input)).not.toThrow();
      expect(validateParams(input).ok).toBe(false);
    }
  });

  it("accepts both bounds of every lever", () => {
    for (const k of PARAM_KEYS) {
      const { min, max } = PARAM_SPECS[k];
      expect(validateParams({ ...SAMPLE, [k]: min }).ok).toBe(true);
      expect(validateParams({ ...SAMPLE, [k]: max }).ok).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run tests/sim-config-json.test.ts`
Expected: FAIL, 32 tests failing with `exportConfig is not a function`, `importConfig is not a function` or `validateParams is not a function`.

- [ ] **Step 3: Append the implementation**

The new block goes at the end of `web/src/lib/sim-config.ts`, after `findMatchingPresetId`, with one blank line before it.

Append to `web/src/lib/sim-config.ts`:

```ts
// ---------------------------------------------------------------------------
// Export / import file: { "schema", "version", "initial": { ...the eight levers } }
// `initial` is byte-for-byte the block a presets.json entry carries.
// ---------------------------------------------------------------------------

export const CONFIG_SCHEMA = "nonaka-spiral-lab/config";
export const CONFIG_VERSION = 1;
/** A real file is ~330 characters; anything past this is not one of ours. */
export const MAX_JSON_LENGTH = 4096;

const hasOwn = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Quotes a user-supplied key for an error message, truncated so a hostile key cannot flood the UI. */
const quote = (key: string) => JSON.stringify(key.length > 32 ? `${key.slice(0, 32)}...` : key);

/**
 * Strict check of an untrusted object: exactly the eight levers, no more and no
 * fewer, each a finite number inside its PARAM_SPECS bounds. The result is a
 * fresh plain object built only from PARAM_KEYS, so nothing the input carries
 * (for example an own "__proto__" key from JSON.parse) can reach it.
 */
export function validateParams(input: unknown): Result<SimParams> {
  if (!isRecord(input)) return fail("Parameters must be an object.");
  for (const key of Object.keys(input)) {
    if (!hasOwn(PARAM_SPECS, key)) return fail(`Unknown parameter ${quote(key)}.`);
  }
  const out: Partial<SimParams> = {};
  for (const k of PARAM_KEYS) {
    if (!hasOwn(input, k)) return fail(`Missing parameter ${quote(k)}.`);
    const checked = checkValue(k, input[k]);
    if (!checked.ok) return checked;
    out[k] = checked.value;
  }
  return ok(out as SimParams);
}

/** Pretty-printed config file text, ending in a newline. Only the eight levers are written. */
export function exportConfig(params: SimParams): string {
  const initial: Partial<SimParams> = {};
  for (const k of PARAM_KEYS) initial[k] = params[k];
  return `${JSON.stringify({ schema: CONFIG_SCHEMA, version: CONFIG_VERSION, initial }, null, 2)}\n`;
}

/**
 * Strictly parses config file text. Rejects (never clamps) anything that is not
 * exactly what `exportConfig` writes: bad JSON, wrong schema or version,
 * unknown or missing fields, wrong types, non-finite or out-of-range numbers,
 * fractional head-counts, and oversized text. Never throws.
 */
export function importConfig(text: string): Result<SimParams> {
  if (text.length > MAX_JSON_LENGTH) {
    return fail(`The file is too large (limit ${MAX_JSON_LENGTH} characters).`);
  }
  // Windows editors save "UTF-8 with BOM"; JSON.parse rejects the leading U+FEFF.
  const body = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  let doc: unknown;
  try {
    doc = JSON.parse(body);
  } catch {
    return fail("The file is not valid JSON.");
  }
  if (!isRecord(doc)) return fail("The file must contain a JSON object.");
  if (doc.schema !== CONFIG_SCHEMA) return fail("This is not a Spiral Lab configuration file.");
  if (doc.version !== CONFIG_VERSION) {
    return fail(`Unsupported configuration version (this app reads version ${CONFIG_VERSION}).`);
  }
  for (const key of Object.keys(doc)) {
    if (key !== "schema" && key !== "version" && key !== "initial") return fail(`Unknown field ${quote(key)}.`);
  }
  return validateParams(doc.initial);
}
```

- [ ] **Step 4: Run the suite, typecheck and lint**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS, 4 test files, 119 tests (23 + 21 + 43 + 32); typecheck and lint clean.

- [ ] **Step 5: Commit** (repo root)

```bash
git add web/src/lib/sim-config.ts web/tests/sim-config-json.test.ts
git commit -m "feat: add a strict, versioned JSON config export/import codec"
```

---

### Task 3: Wire links, Copy link, Export and Import into the simulator

**Files:**
- Create: `web/src/components/ConfigControls.tsx`
- Modify: `web/src/components/SpiralSimulator.tsx`

**Interfaces:**
- Consumes (Tasks 1 and 2): `DEFAULT_PARAMS`, `PARAM_SPECS`, `findMatchingPresetId`, `parseParams`, `buildShareUrl`, `exportConfig`, `importConfig`, `MAX_JSON_LENGTH`.
- Produces:
  - `interface ConfigNotice { kind: "ok" | "error"; text: string }` and the default export `ConfigControls` taking `{ getParams: () => SimParams; onApply: (next: SimParams, message: string) => void; onNotice: (kind: ConfigNotice["kind"], text: string) => void; notice: ConfigNotice | null }`, from `@/components/ConfigControls`.
  - Inside `SpiralSimulator`: `applyConfig(next: SimParams, message: string, presetId?: string)`, `showNotice(kind, text)`, `loadSharedLink()`.

No automated tests exist for this task (the repo has no DOM test framework and this plan does not add one). Steps 7 and 8 are mechanical checks; Task 4 is the behavioral check.

- [ ] **Step 1: Create the controls component**

Create `web/src/components/ConfigControls.tsx`:

```tsx
"use client";

import { useRef, type ChangeEvent } from "react";
import { MAX_JSON_LENGTH, buildShareUrl, exportConfig, importConfig } from "@/lib/sim-config";
import type { SimParams } from "@/lib/spiral-engine";

export interface ConfigNotice {
  kind: "ok" | "error";
  text: string;
}

interface ConfigControlsProps {
  /** Reads the params the simulation is actually running (the parent's paramsRef.current). */
  getParams: () => SimParams;
  /** Applies a whole configuration through the same path the preset buttons use. */
  onApply: (next: SimParams, message: string) => void;
  onNotice: (kind: ConfigNotice["kind"], text: string) => void;
  notice: ConfigNotice | null;
}

const EXPORT_FILENAME = "spiral-lab-config.json";

function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ConfigControls({ getParams, onApply, onNotice, notice }: ConfigControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyLink = async () => {
    const link = buildShareUrl(window.location.href, getParams());
    // Put the configuration in the address bar too: a reload keeps it, and if the
    // clipboard is blocked the user can still copy it from there. replaceState, not
    // pushState: this is not a navigation, and Back should not step through snapshots.
    window.history.replaceState(null, "", link);
    try {
      await navigator.clipboard.writeText(link);
      onNotice("ok", "Link copied. Anyone who opens it starts with this configuration.");
    } catch {
      onNotice("error", "Could not reach the clipboard. The link is now in the address bar: copy it from there.");
    }
  };

  const exportJson = () => {
    downloadText(EXPORT_FILENAME, exportConfig(getParams()));
    onNotice("ok", `Downloaded ${EXPORT_FILENAME}.`);
  };

  const onFileChosen = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = ""; // lets the same file be chosen again after it is edited
    if (!file) return;
    if (file.size > MAX_JSON_LENGTH) {
      onNotice("error", `Import failed: the file is too large (limit ${MAX_JSON_LENGTH} bytes).`);
      return;
    }
    let text: string;
    try {
      text = await file.text();
    } catch {
      onNotice("error", "Import failed: the file could not be read.");
      return;
    }
    const result = importConfig(text);
    if (!result.ok) {
      onNotice("error", `Import failed: ${result.error}`);
      return;
    }
    onApply(result.value, "Imported the configuration from a file.");
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn ghost" style={{ padding: "10px 12px" }} onClick={copyLink}>
          Copy link
        </button>
        <button className="btn ghost" style={{ padding: "10px 12px" }} onClick={exportJson}>
          Export JSON
        </button>
        <button
          className="btn ghost"
          style={{ padding: "10px 12px" }}
          onClick={() => fileInputRef.current?.click()}
        >
          Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={onFileChosen}
          hidden
        />
      </div>
      {notice && (
        <p
          role={notice.kind === "error" ? "alert" : "status"}
          style={{
            marginTop: 8,
            fontSize: 12,
            lineHeight: 1.4,
            color: notice.kind === "error" ? "var(--rust)" : "var(--olive)",
          }}
        >
          {notice.text}
        </p>
      )}
    </div>
  );
}
```

Why it is shaped this way: `getParams` is `() => paramsRef.current`, so a click always exports or copies what the loop is actually running. `copyLink` calls `replaceState` synchronously, before the first `await`, so the clipboard write still happens inside the click's user activation. The `try` also catches the `TypeError` thrown when `navigator.clipboard` is undefined on a non-secure origin. `input.value = ""` is what lets the same file be picked twice.

- [ ] **Step 2: Import the new pieces and drop the local default**

In `web/src/components/SpiralSimulator.tsx`, replace:

```tsx
import presetsData from "../../data/presets.json";
import {
  MAX_LEVEL,
```

with:

```tsx
import presetsData from "../../data/presets.json";
import ConfigControls, { type ConfigNotice } from "@/components/ConfigControls";
import { DEFAULT_PARAMS, PARAM_SPECS, findMatchingPresetId, parseParams } from "@/lib/sim-config";
import {
  MAX_LEVEL,
```

Then remove the component's own copy of the defaults (the engine-side `SimParams` import stays; it is still used).

In `web/src/components/SpiralSimulator.tsx`, replace:

```tsx
let nextId = 1;

const DEFAULT_PARAMS: SimParams = {
  humans: 6, agents: 3, baRedundancy: 0.7, baChaos: 0.6, baAutonomy: 0.6,
  feedbackRate: 0.85, machineTransfer: 0.7, hallucinationRisk: 0.2,
};

export default function SpiralSimulator() {
```

with:

```tsx
let nextId = 1;

export default function SpiralSimulator() {
```

- [ ] **Step 3: Add the notice state and the once-only guard**

In `web/src/components/SpiralSimulator.tsx`, replace:

```tsx
  const failureRef = useRef(0);
```

with:

```tsx
  const failureRef = useRef(0);
  const urlLoadedRef = useRef(false);
  const [notice, setNotice] = useState<ConfigNotice | null>(null);
```

- [ ] **Step 4: Route every whole-configuration change through `applyConfig`**

In `web/src/components/SpiralSimulator.tsx`, replace:

```tsx
  const applyPreset = useCallback((preset: Preset) => {
    const next: SimParams = { ...preset.initial };
    paramsRef.current = next;
    setParams(next);
    setActivePreset(preset.id);
    rebuildParticles();
    pushEvent(`Preset loaded: ${preset.name} — ${preset.tagline}`, "info");
  }, [rebuildParticles, pushEvent]);
```

with:

```tsx
  // The one path every whole-configuration change takes: preset buttons, a shared
  // link, an imported file. Ref first (the RAF loop reads it), then the UI mirror.
  const applyConfig = useCallback((next: SimParams, message: string, presetId?: string) => {
    paramsRef.current = next;
    setParams(next);
    setActivePreset(presetId ?? findMatchingPresetId(next, presetsData.presets));
    setNotice(null);
    rebuildParticles();
    pushEvent(message, "info");
  }, [rebuildParticles, pushEvent]);

  const applyPreset = useCallback((preset: Preset) => {
    applyConfig({ ...preset.initial }, `Preset loaded: ${preset.name} — ${preset.tagline}`, preset.id);
  }, [applyConfig]);

  // Visible feedback for copy/export/import and rejected links. Errors also go to the
  // event log as "warn", not "bad", so they do not count as simulation failures.
  const showNotice = useCallback((kind: ConfigNotice["kind"], text: string) => {
    setNotice({ kind, text });
    pushEvent(text, kind === "error" ? "warn" : "info");
  }, [pushEvent]);
```

- [ ] **Step 5: Load the link once on mount, and fade "ok" notices**

In `web/src/components/SpiralSimulator.tsx`, replace:

```tsx
  // Initial rebuild on mount
  useEffect(() => {
    rebuildParticles();
  }, [rebuildParticles]);
```

with:

```tsx
  // Initial rebuild on mount
  useEffect(() => {
    rebuildParticles();
  }, [rebuildParticles]);

  // Load a shared configuration from the URL once, after hydration. Reading
  // window.location here (not useSearchParams) keeps /simulator statically
  // prerendered with the full UI in the HTML; the default preset is what the
  // server renders and this swaps the shared values in.
  const loadSharedLink = useCallback(() => {
    const parsed = parseParams(window.location.search, DEFAULT_PARAMS);
    if (!parsed.ok) {
      showNotice("error", `Ignored the shared link: ${parsed.error}`);
    } else if (parsed.value) {
      applyConfig(parsed.value, "Loaded the configuration from the shared link.");
    }
  }, [applyConfig, showNotice]);

  useEffect(() => {
    if (urlLoadedRef.current) return; // StrictMode runs mount effects twice in dev
    urlLoadedRef.current = true;
    loadSharedLink();
  }, [loadSharedLink]);

  // "Link copied" style notices fade after a few seconds; errors stay until the next action.
  useEffect(() => {
    if (notice?.kind !== "ok") return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
```

Why `loadSharedLink` is a separate callback: with `eslint-config-next` 16.3.0 (`eslint-plugin-react-hooks` 7.1.1), calling `showNotice` directly in the effect body is flagged by `react-hooks/set-state-in-effect`; calling the callback is not. If a later rule version flags `loadSharedLink()` too, add `// eslint-disable-next-line react-hooks/set-state-in-effect -- reads the URL once after hydration; it is an external system` above that call. Do not move to `useSearchParams` to satisfy the rule (D1).

- [ ] **Step 6: Make the head-count sliders read `PARAM_SPECS`, and render the controls**

In `web/src/components/SpiralSimulator.tsx`, replace:

```tsx
          <input type="range" min={0} max={12} value={params.humans}
```

with:

```tsx
          <input type="range" min={PARAM_SPECS.humans.min} max={PARAM_SPECS.humans.max} value={params.humans}
```

In `web/src/components/SpiralSimulator.tsx`, replace:

```tsx
          <input type="range" min={0} max={12} value={params.agents}
```

with:

```tsx
          <input type="range" min={PARAM_SPECS.agents.min} max={PARAM_SPECS.agents.max} value={params.agents}
```

In `web/src/components/SpiralSimulator.tsx`, replace:

```tsx
          <button className="btn ghost" onClick={resetSpiral}>↺ Reset</button>
        </div>
```

with:

```tsx
          <button className="btn ghost" onClick={resetSpiral}>↺ Reset</button>
        </div>

        <ConfigControls
          getParams={() => paramsRef.current}
          onApply={applyConfig}
          onNotice={showNotice}
          notice={notice}
        />
```

- [ ] **Step 7: Lint, typecheck, test**

Run: `npm run lint && npm run typecheck && npm test`
Expected: all clean; 4 test files, 119 tests.

- [ ] **Step 8: Build, and assert `/simulator` is still static with the full UI in the HTML**

Run: `npm run build`
Expected: the route table lists `○ /simulator` (Static), not `ƒ`, and the build does not mention `useSearchParams`.

Then run:

```bash
grep -o "Spiral score" .next/server/app/simulator.html | wc -l
grep -o "Copy link" .next/server/app/simulator.html | wc -l
grep -o "BAILOUT_TO_CLIENT_SIDE_RENDERING" .next/server/app/simulator.html | wc -l
```

Expected: `1`, `1`, `0`. A `0` for the first two, or a `1` for the third, means something put the simulator behind a `Suspense`/CSR bailout (variant B in "Evidence"): find and remove it.

- [ ] **Step 9: Commit** (repo root)

```bash
git add web/src/components/ConfigControls.tsx web/src/components/SpiralSimulator.tsx
git commit -m "feat: load shared links on first load; add Copy link, Export JSON and Import JSON"
```

---

### Task 4: Verify in a real browser

No code. This is the gate for Task 3, because nothing automated covers it. Do it on the production build, then the one dev-server check.

**Files:** none (observations go in the PR description).

- [ ] **Step 1: Start the production build**

```bash
npm run build && npm run start
```

Open `http://localhost:3000/simulator`. Keep the browser console open; any red error during these checks is a failure.

- [ ] **Step 2: Run the checks**

Slider labels read `Humans 9`, `Ba · Redundancy 40%`, and so on. "Log" is the Event log card at the bottom of the controls column.

| # | Do | Expect |
|---|---|---|
| M1 | Open `/simulator` | Humans 6, AI Agents 3; **NotCo / Giuseppe** highlighted; no text under the three buttons; particles moving; log has only "Spiral initialized." |
| M2 | Open `/simulator?humans=9&agents=1&baRedundancy=0.4&baChaos=0.1&baAutonomy=0.9&feedbackRate=0.33&machineTransfer=0.05&hallucinationRisk=0.77&utm_source=test` | Labels: Humans 9, AI Agents 1, Redundancy 40%, Creative chaos 10%, Autonomy 90%, Feedback loop 33%, Machine transfer 5%, Hallucination risk 77%. No preset highlighted. Top log line "Loaded the configuration from the shared link." About 10 particles (9 green, 1 orange). No error text. |
| M3 | Click **Khanmigo Classroom**, click **Copy link**, paste into a new tab and open it | New tab shows Khanmigo highlighted and Humans 10 (a link that equals a preset highlights it). |
| M4 | Open `/simulator?humans=99&agents=2` | Red text under the buttons: "Ignored the shared link: humans must be between 0 and 12." Sliders stay at the defaults (6 and 3). Same line in the log. The **Failures** stat is still 0. |
| M5 | Open `/simulator?baChaos=60` | Red text naming `baChaos` ("must be between 0 and 1"); sliders at defaults. |
| M6 | Open `/simulator?agents=8` | AI Agents 8; every other lever at its default; no preset highlighted. |
| M7 | Open `/simulator?humans=0&agents=0` | Loads, empty canvas, no `NaN` text anywhere (stats, mean-level rail), no console error. Move a slider: particles appear. |
| M8 | Reach the simulator from the site's Home page (click the **Simulator** nav link), note the **Spiral score**, click **Copy link** | Green text "Link copied. ..." that disappears after about 4 seconds. The address bar now shows the full eight-parameter URL. The score keeps counting up (it does not reset) and particles do not jump. Pasting into a text box gives that same URL. Press Back: you land on Home (no extra history entry for the rewritten URL). |
| M9 | Open the app by its LAN address (`http://<your-ip>:3000/simulator`; `navigator.clipboard` is undefined on plain http) and click **Copy link** | Red text: "Could not reach the clipboard. The link is now in the address bar: copy it from there." and the address bar holds the full URL. |
| M10 | Click **Export JSON** | `spiral-lab-config.json` downloads (a few hundred bytes). Contents: `schema`, `version: 1`, `initial` with the eight keys in the same order as an entry in `web/data/presets.json`. Green text "Downloaded spiral-lab-config.json." |
| M11 | Drag three sliders to odd values, **Export JSON**, click **Siloed Org**, then **Import JSON** and choose the file | The sliders return to exactly the odd values; no preset highlighted; log "Imported the configuration from a file." Export while on a preset, import it later: that preset is highlighted. |
| M12 | Open the exported file in an editor, change `humans` to `12`, save, **Import JSON**, choose it again | Humans becomes 12 (picking the same file path twice works). |
| M13 | Create bad files (below) and import each | Each shows red "Import failed: ..." text, sliders unchanged, page still responsive. |
| M14 | Click **Pause**, import a valid file, click **Resume** | Sliders update while paused; after Resume the simulation runs on the new values. |

Bad files for M13 (`cd` to a scratch folder first):

```bash
printf 'nope' > not-json.json                      # "The file is not valid JSON."
printf '{}' > empty.json                           # "This is not a Spiral Lab configuration file."
sed 's/"version": 1/"version": 2/' spiral-lab-config.json > v2.json          # "Unsupported configuration version ..."
sed 's/"humans": [0-9]*/"humans": 13/' spiral-lab-config.json > range.json   # "humans must be between 0 and 12."
sed 's/"humans": [0-9]*/"humans": 6.5/' spiral-lab-config.json > frac.json   # "humans must be a whole number."
sed 's/"initial": {/"initial": {"__proto__": {"humans": 1},/' spiral-lab-config.json > proto.json   # 'Unknown parameter "__proto__".'
head -c 5000 /dev/zero | tr '\0' x > big.json      # "Import failed: the file is too large (limit 4096 bytes)."
```

- [ ] **Step 3: The dev-server check (StrictMode)**

Stop the production server, run `npm run dev`, and open the M2 URL.
Expected (M15): the log shows "Loaded the configuration from the shared link." **exactly once**, even though dev double-runs mount effects.

- [ ] **Step 4: Layout and keyboard**

M16: at desktop width the three buttons share one row inside the 320 px controls column, or wrap cleanly onto a second row; at a phone-width viewport they stay inside the column.

M17: Tab to **Import JSON** and press Enter; the file picker opens.

- [ ] **Step 5: Record the result**

Paste the filled table (M1–M17, pass/fail, browser and version) into the PR description. Any failure goes back to Task 3. `git status` must show no changes from this task.

---

### Task 5: Docs, final gate, pull request

**Files:**
- Modify: `README.md`, `web/README.md`, `CLAUDE.md`, `CONTRIBUTING.md`

**Interfaces:** none.

- [ ] **Step 1: README: describe the feature and the new directory**

In `README.md`, replace:

```markdown
- Each full SECI cycle escalates one ontological level (individual → group → org → inter-org)

## Research
```

with:

```markdown
- Each full SECI cycle escalates one ontological level (individual → group → org → inter-org)

Any setup can be shared or saved:

- **Copy link** puts the eight lever values in the URL (`/simulator?humans=6&agents=3&...`)
  and on your clipboard. Opening the link starts the simulation with exactly those values.
- **Export JSON / Import JSON** saves a setup to a small file and loads it back. The file's
  `initial` block has the same shape as an entry in `web/data/presets.json`.

Links and files are checked strictly: a value outside a slider's range is rejected with a
message, not quietly adjusted.

## Research
```

In `README.md`, replace:

```text
│   ├── src/components/     # SpiralSimulator (canvas), SecQuadrant (SVG)
```

with:

```text
│   ├── src/components/     # SpiralSimulator (canvas), ConfigControls, SecQuadrant (SVG)
│   ├── src/lib/            # spiral-engine (model), sim-config (link + file codec)
```

- [ ] **Step 2: web/README: the test command and the new files**

In `web/README.md`, replace:

```text
npm run build     # production build (CI runs all three checks)
```

with:

```text
npm test          # vitest run
npm run build     # production build (CI runs all four checks)
```

In `web/README.md`, replace:

```markdown
- `src/components/SpiralSimulator.tsx` — the core canvas simulation
```

with:

```markdown
- `src/components/SpiralSimulator.tsx` — the core canvas simulation
- `src/components/ConfigControls.tsx` — Copy link / Export JSON / Import JSON buttons and their status line
- `src/lib/spiral-engine.ts` — the pure SECI model (no React, no canvas)
- `src/lib/sim-config.ts` — share-link and JSON-file codec; the single source of truth for lever bounds
```

- [ ] **Step 3: CLAUDE.md: where the code lives and the rule that must not be "fixed"**

In `CLAUDE.md`, replace:

```markdown
- `web/src/components/SpiralSimulator.tsx` — the canvas/React shell around the engine.
```

with:

```markdown
- `web/src/lib/sim-config.ts` — pure config codec and the single source of truth for lever bounds (`PARAM_SPECS`: humans/agents are integers 0–12, the other six levers 0–1). Share links (`serializeParams`/`parseParams`) and the versioned JSON file (`exportConfig`/`importConfig`) validate through it, return `{ ok, value | error }` instead of throwing, and reject out-of-range values rather than clamping. Change a bound here, with a test in `web/tests/sim-config*.test.ts`; the head-count sliders and `web/tests/presets.test.ts` read it.
- `web/src/components/SpiralSimulator.tsx` — the canvas/React shell around the engine.
```

In `CLAUDE.md`, replace:

```markdown
- `web/src/components/SecQuadrant.tsx` — SVG SECI quadrant diagram.
```

with:

```markdown
- `web/src/components/ConfigControls.tsx` — Copy link / Export JSON / Import JSON buttons. Every whole-configuration change (preset button, shared link, imported file) goes through `applyConfig` in `SpiralSimulator.tsx`. The link is read from `window.location.search` in a mount effect on purpose: `useSearchParams` would either fail `next build` (no `Suspense`) or, with one, drop the whole simulator out of the prerendered HTML. Keep `/simulator` as `○ (Static)` in the `next build` route table. These UI paths have no automated test (no DOM framework); when you change them, run the manual browser check in `docs/superpowers/plans/2026-10-11-share-urls-and-json-export.md` (Task 4).
- `web/src/components/SecQuadrant.tsx` — SVG SECI quadrant diagram.
```

- [ ] **Step 4: CONTRIBUTING.md: preset authors get a shortcut, and the bounds rule**

In `CONTRIBUTING.md`, replace:

```markdown
- Accepted presets are credited in [CONTRIBUTORS.md](CONTRIBUTORS.md).
```

with:

```markdown
- Accepted presets are credited in [CONTRIBUTORS.md](CONTRIBUTORS.md).
- Tip: build the scenario with the sliders, click **Export JSON**, and paste the `initial`
  block of the downloaded file into your entry (or issue). `npm test` checks it against the
  same bounds the simulator enforces.
```

In `CONTRIBUTING.md`, replace:

```markdown
- Styling uses the design tokens in `web/src/app/globals.css`
```

with:

```markdown
- Lever ranges live in one place, `PARAM_SPECS` in `web/src/lib/sim-config.ts`; don't
  hardcode slider ranges or preset bounds elsewhere.
- Styling uses the design tokens in `web/src/app/globals.css`
```

- [ ] **Step 5: Full gate**

Run in `web/`: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: all pass; 4 test files, 119 tests; `/simulator` is `○ (Static)`. At the repo root, `git status --short` lists only the four docs files from this task (plus any untracked tooling directory).

- [ ] **Step 6: Commit** (repo root)

The `CLAUDE.md` note points at this plan file (for the Task 4 checklist), so the plan must be in the repo too. If your branch does not already contain `docs/superpowers/plans/2026-10-11-share-urls-and-json-export.md`, bring it over from the branch it was written on and include it in this commit:

```bash
git checkout docs/plan-share-urls-json-export -- docs/superpowers/plans/2026-10-11-share-urls-and-json-export.md
git add README.md web/README.md CLAUDE.md CONTRIBUTING.md docs/superpowers/plans/2026-10-11-share-urls-and-json-export.md
git commit -m "docs: document share links and JSON config export/import"
```

- [ ] **Step 7: Push and open the PR** (repo root)

Check whether PR #23 has merged (`gh pr view 23 --json state`). If it has, rebase onto `origin/main` first. Never push to `main`.

```bash
git push -u origin feat/share-links-and-json-config
gh pr create --base main --title "Shareable simulator links and JSON config export/import" --body-file <(cat <<'EOF'
Implements docs/superpowers/plans/2026-10-11-share-urls-and-json-export.md (Tasks 1-5).

- Copy link writes the eight levers into the URL (replaceState) and the clipboard; opening the link starts the simulation with exactly those values.
- Export JSON / Import JSON round-trip a versioned file whose `initial` block matches presets.json.
- Strict validation: out-of-range, non-integer head-counts, unknown keys, wrong types and oversized input are rejected with visible text, never clamped.
- `/simulator` stays statically prerendered (read from `window.location.search`, not `useSearchParams`).

Manual browser check results (plan Task 4): <paste the filled table>

Closes #10
Closes #11
EOF
)
```

If PR #23 has not merged and you must stack on it, use `--base docs/engine-hardening-plan` instead, and **retarget the PR to `main` once #23 merges**: GitHub only honors `Closes #10` / `Closes #11` when the PR merges into the default branch. Merging to `main` deploys to production, so merge only after the owner reviews.

Expected: CI (`ci.yml`) goes green: lint, typecheck, test, build.

---

## Owner decisions and open questions

1. **Q1, clamp or reject.** Issue #11 says "clamped or ignored" and #10 says "clamps values to valid ranges". This plan rejects (D3). If you prefer clamping, the change is local: the range branch of `checkValue` in `sim-config.ts` returns `ok(clamp(v, min, max))` instead of failing, and the "out of range" and "percent" tests flip. Non-numeric, non-integer and unknown-key rejection should stay either way.
2. **Q2, file envelope.** Issue #10's criterion says the file matches the `presets.json` `initial` schema. This plan wraps that block in `{ schema, version, initial }` so a future format can be told apart. If you want the bare eight-key object instead, drop the envelope and the version check; you lose version detection.
3. **Q3, live URL sync.** The address bar updates only on Copy link (D2). Moving a slider afterwards leaves it stale. A debounced `replaceState` on every change would fix that; it is small but adds a timer and the Safari rate-limit risk. Say if you want it.
4. **Q4, stacking on PR #23.** This work is branched from #23's tip and edits `web/tests/presets.test.ts`. Either wait for #23 to merge, or accept a stacked PR and retarget it (Task 5 Step 7).
5. **Q5, duplicate issue.** #2 ("shareable URLs") duplicates #11. Closing keywords in the PR close #10 and #11 only; close #2 as a duplicate by hand.
6. **Q6, `DEFAULT_PARAMS` duplication.** `DEFAULT_PARAMS` is a literal copy of the `notco` preset (a test pins that they stay equal). Deriving it from `presets.json` would make preset order significant, so it was left as a copy.
7. **Q7, export file name.** Fixed at `spiral-lab-config.json`. A name derived from the active preset id would be friendlier for people who export several setups; it is a one-line change in `ConfigControls.tsx`.

## Self-review

**1. Spec coverage.**

| Requirement | Where |
|---|---|
| #11: a URL with valid params starts the sim with exactly those values | `parseParams` (Task 1) + `loadSharedLink` (Task 3) + M2, M3, M6 |
| #11: Share copies a URL that reproduces the current configuration | `buildShareUrl` + round-trip tests (Task 1), `copyLink` (Task 3), M8 |
| #11: malformed or out-of-range values handled gracefully | rejected with named-lever text: Task 1 `invalid values are rejected whole` tests, Task 3 notice, M4, M5. Deliberately not clamped (D3, Q1) |
| #10: export matches the `presets.json` `initial` schema | `exportConfig` test `uses exactly the key set and order of a presets.json initial block` (Task 2), M10 |
| #10: importing restores the exact parameters | round-trip tests over all presets, all slider values, bounds and awkward floats (Task 2), M11 |
| #10: bad files fail gracefully, with a log message | every invalid-input class in Task 2; notice plus `"warn"` log line (Task 3, D8); M13 |
| lint, typecheck, build pass; no new deps; tokens only | Task 3 Steps 7-8, Task 5 Step 5; Global Constraints |
| `Closes #10`, `Closes #11` | Task 5 Step 7 PR body |
| Doc touch-ups that are actually needed | Task 5 (README feature text and structure, `web/README` test command and file list, `CLAUDE.md` architecture plus the `useSearchParams` warning, `CONTRIBUTING.md` export tip and bounds rule) |

**2. Placeholder scan.** No `TBD`/`TODO`/"add appropriate"/"similar to Task N". Every code step contains the code, every edit to an existing file is an exact find-and-replace pair, and the tests are complete. The one task with no code is Task 4, a checklist with exact URLs, commands and expected observations.

**3. Type consistency.** `ParamKey`, `PARAM_SPECS`, `PARAM_KEYS`, `DEFAULT_PARAMS`, `Result<T>`, `serializeParams`, `parseParams(search, base)`, `buildShareUrl(href, params)`, `findMatchingPresetId(params, presets)`, `CONFIG_SCHEMA`, `CONFIG_VERSION`, `MAX_JSON_LENGTH`, `validateParams`, `exportConfig`, `importConfig` and `ConfigNotice` have the same names and signatures in the Interfaces blocks, the tests, the implementation and the component. `applyConfig`'s third parameter is optional, so `ConfigControls`'s two-argument `onApply` type accepts it.

**4. Review Focus.** Each of the five lines names its pinning test in the section itself (Tasks 1 and 2 for 1-3, Task 4 M9/M12/M15 for 4-5), and the extra `humans=0&agents=0` case is M7.

**5. What was actually run, and what was not.** Local environment: macOS, Node v24.14.0 (CI uses Node 22; nothing here was run under Node 22), `vitest@5.0.3`, `typescript@5.9.3`, `@types/node@22.20.5` (the pin from the engine plan), Next 16.3.0 from the repo's lockfile.

Run, all in scratch directories outside the repo:

- The codec and its tests in a standalone project (strict tsconfig copied from the app): `tsc --noEmit --strict` exit 0; Vitest 5.0.3, 119 tests passing (50 on the PR #23 tip, plus 75 in the two new sim-config test files, minus 6 from merging the two presets range tests into one). The failing state was observed first: Task 1's file fails with `Cannot find module '../src/lib/sim-config'`; Task 2's file fails 32 of 32 with `... is not a function`.
- Mutation checks, to confirm the tests bite: 11 mutations of the link codec (drop -0 handling, permissive number regex, no integer check, 2-decimal serialization, no duplicate check, no size check, off-by-one bounds, null-vs-base, keep fragment, skip a lever in preset matching) and 16 of the file codec (BOM strip, unknown or missing parameters, unknown envelope keys, version, schema, size limit and its off-by-one, export leaking extra keys, missing newline, finite check, type check, array-as-object, copying the input wholesale, unguarded `JSON.parse`, key truncation) each made the suite fail; 5 corruptions of `presets.json` (13 humans, 6.5 humans, `baChaos` 1.5, negative risk, a renamed key) each made the presets guard fail.
- The plan's own text was executed by script against a clone of `web/` at the PR #23 tip: all 22 instructions (4 file creates, 1 whole-file replace, 1 append, 8 find-and-replace edits in Task 3, 8 in Task 5) applied, every find block matched exactly once, and the resulting source files are byte-identical to the files that were tested. At the Task 1 state: 3 files, 87 tests. At the Task 2 state: 4 files, 119 tests; lint and `tsc --noEmit` clean. At the Task 3/5 state: `npm run lint`, `npm run typecheck`, `npm test` (119) and `npm run build` all pass; route table `○ /simulator`; `grep -o ... | wc -l` on `.next/server/app/simulator.html` gives `Spiral score` 1, `Copy link` 1, `BAILOUT_TO_CLIENT_SIDE_RENDERING` 0. Task 1 Step 8's expected failure text was captured from a real run.
- The M13 bad-file shell recipes, taken verbatim from this document, generated real files from a real `exportConfig` output and each went through `importConfig`: every one produced the error text the recipe claims (the oversized-file text comes from the component's size pre-check instead, which the jsdom harness below covers).
- The Next 16 experiments in "Evidence" (baseline, A, B, C), including the exact build error for A.
- `eslint-plugin-react-hooks` 7.1.1 (via `eslint-config-next` 16.3.0) rejects calling `showNotice` directly inside the mount effect (`react-hooks/set-state-in-effect`) and accepts the `loadSharedLink()` form; that is why Step 5 has that shape.
- A throwaway jsdom + Testing Library harness, installed only in the scratch copy (not in this plan, not in the repo, so Global Constraints still hold), mounted the real `SpiralSimulator` and `ConfigControls` and passed 18 checks: default load, full custom link, link equal to a preset (highlight), partial link, bad link (alert text, defaults kept), hostile query strings, one load under `StrictMode`, Copy link (`replaceState` with the same URL that is copied, no `pushState`, live slider values, blocked clipboard, missing clipboard API), Export (blob contents, file name, temp anchor removed), Import (valid, preset-equal, six bad files including `__proto__` and oversize, no Failures-stat change, error cleared by a preset click, same file twice). Removing the `urlLoadedRef` guard makes the StrictMode check fail (2 loads instead of 1).

Not run:

- **Any real browser.** The Chrome extension could not reach the sandboxed localhost server (it showed its error page), so M1-M17 are unexecuted. That leaves unverified: the real clipboard, a real download, the real file picker, real Back-button behavior after `replaceState`, `replaceState` going through Next's patched `history` (jsdom's is not Next's), canvas rendering and the 3-button layout in the 320 px column, accessibility announcements, and the Safari History rate-limit claim in D2.
- A real `next dev` run (the StrictMode behavior is covered only by the jsdom check).
- CI, Node 22, and anything on GitHub: no push, no PR, no issue or PR was edited; issues #10 and #11 were only read.
