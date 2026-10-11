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
