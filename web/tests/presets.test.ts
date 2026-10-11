import { describe, expect, it } from "vitest";
import presetsData from "../data/presets.json";
import { convertChance } from "../src/lib/spiral-engine";

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
