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
