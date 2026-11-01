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
