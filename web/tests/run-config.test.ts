import { describe, expect, it } from "vitest";
import { DEFAULT_PARAMS, exportConfig, MAX_JSON_LENGTH } from "../src/lib/sim-config";
import { buildReplayUrl, exportReplay, importReplay, importRunFile, parseRunSeed } from "../src/lib/run-config";

describe("replay sharing", () => {
  it("round trips seeds at both boundaries through share URLs", () => {
    for (const seed of [0, 42, 4294967295]) {
      const url = new URL(buildReplayUrl("https://example.test/simulator?utm_source=x#old", DEFAULT_PARAMS, seed));
      expect(parseRunSeed(url.search)).toEqual({ ok: true, value: seed });
      expect(url.searchParams.get("feedbackRate")).toBe("0.85");
      expect(url.searchParams.has("utm_source")).toBe(false);
      expect(url.hash).toBe("");
    }
  });

  it("keeps links without seed compatible but rejects ambiguous or invalid seeds", () => {
    expect(parseRunSeed("?humans=6")).toEqual({ ok: true, value: null });
    for (const search of ["?seed=-1", "?seed=4294967296", "?seed=1.5", "?seed=", "?seed=NaN", "?seed=0x10", "?seed=1&seed=2", "?seed=%201", "?seed=1e2"]) {
      expect(parseRunSeed(search).ok, search).toBe(false);
    }
  });
});

describe("replay JSON", () => {
  it("round trips the configuration, seed and engine version", () => {
    const text = exportReplay(DEFAULT_PARAMS, 912);
    expect(importReplay(text, 42)).toEqual({ ok: true, value: { params: DEFAULT_PARAMS, seed: 912 } });
    expect(JSON.parse(text)).toMatchObject({ schema: "nonaka-spiral-lab/run", version: 1, engineVersion: "1", seed: 912 });
  });

  it("loads a legacy configuration with the displayed seed", () => {
    expect(importReplay(exportConfig(DEFAULT_PARAMS), 719)).toEqual({ ok: true, value: { params: DEFAULT_PARAMS, seed: 719 } });
  });

  it("rejects unknown keys, wrong versions, bad seeds, and invalid parameters", () => {
    const valid = JSON.parse(exportReplay(DEFAULT_PARAMS, 42));
    for (const patch of [{ version: 2 }, { engineVersion: "future" }, { seed: -1 }, { seed: "42" }, { seed: 1.5 }, { seed: 4294967296 }, { unexpected: true }, { initial: { ...DEFAULT_PARAMS, humans: 13 } }]) {
      expect(importReplay(JSON.stringify({ ...valid, ...patch }), 42).ok).toBe(false);
    }
    for (const key of ["seed", "initial", "engineVersion"]) {
      const doc = { ...valid };
      delete doc[key];
      expect(importReplay(JSON.stringify(doc), 42).ok).toBe(false);
    }
  });

  it("rejects repeated and escaped duplicate keys before JSON collapses them", () => {
    const text = exportReplay(DEFAULT_PARAMS, 42);
    expect(importReplay(text.replace('"seed": 42', '"seed": 2, "seed": 42'), 42).ok).toBe(false);
    expect(importReplay(text.replace('"seed": 42', '"se\\u0065d": 2, "seed": 42'), 42).ok).toBe(false);
    expect(importReplay(text.replace('"humans": 6', '"humans": 99, "humans": 6'), 42).ok).toBe(false);
  });

  it("accepts BOM and rejects oversized or malformed input without throwing", () => {
    expect(importReplay(`\ufeff${exportReplay(DEFAULT_PARAMS, 0)}`, 42).ok).toBe(true);
    for (const text of ["{", "null", "[]", "{}", "[".repeat(MAX_JSON_LENGTH + 1)]) {
      expect(() => importReplay(text, 42)).not.toThrow();
      expect(importReplay(text, 42).ok).toBe(false);
    }
  });
});

describe("replay file supersession", () => {
  it("discards a read after a newer preset, slider, seed or reset action", async () => {
    let generation = 1;
    const applied: number[] = [];
    const errors: string[] = [];
    let release!: (value: string) => void;
    const text = new Promise<string>((resolve) => { release = resolve; });
    const pending = importRunFile({ size: 100, text: () => text }, 42, {
      isCurrent: () => generation === 1,
      apply: (_params, seed) => { applied.push(seed); },
      reject: (message) => { errors.push(message); },
    });
    generation += 1;
    release(exportReplay(DEFAULT_PARAMS, 777));
    await pending;
    expect(applied).toEqual([]);
    expect(errors).toEqual([]);
  });

  it("rejects oversized files before reading and applies valid replay seeds", async () => {
    let reads = 0;
    const applied: number[] = [];
    const errors: string[] = [];
    const sink = { isCurrent: () => true, apply: (_params: typeof DEFAULT_PARAMS, seed: number) => { applied.push(seed); }, reject: (message: string) => { errors.push(message); } };
    await importRunFile({ size: MAX_JSON_LENGTH + 1, text: async () => { reads++; return ""; } }, 42, sink);
    expect(reads).toBe(0);
    expect(errors).toHaveLength(1);
    const text = exportReplay(DEFAULT_PARAMS, 101);
    await importRunFile({ size: text.length, text: async () => text }, 42, sink);
    expect(applied).toEqual([101]);
  });
});
