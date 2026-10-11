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
