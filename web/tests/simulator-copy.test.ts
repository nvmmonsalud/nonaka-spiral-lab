import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import presets from "../data/presets.json";
import { getEventCopy, getPresetCopy, translate } from "../src/lib/simulator-copy";
import GuidedWorkshop from "../src/components/GuidedWorkshop";
import type { SimulationEvent } from "../src/lib/simulation";

const keys = `title intro illustrative language humans agents baRedundancy baChaos baAutonomy feedbackRate machineTransfer hallucinationRisk seed applySeed pause resume reset step compare primaryRun comparisonRun comparisonPreset sameSeed score cycles failures repairs corrupted meanLevel individual group organization interOrganization socialization externalization combination internalization tacit explicit history historyDescription rollingHistory exportCsv inspector selectParticle noParticles particle human agent quadrant level status healthy lastTransition noTransition eventLog noEvents copyLink exportJson importJson copied clipboardFailed exported imported importFailed invalidSeed home manualWorkshop research preset seconds running paused workshopTitle workshopOpen workshopExit workshopBack workshopNext workshopNotes workshopPredictTitle workshopPredictPrompt workshopObserveTitle workshopObservePrompt workshopCompareTitle workshopComparePrompt`.split(" ");

describe("simulator copy", () => {
  it("provides every shared and workshop label in both languages", () => {
    for (const key of keys) {
      expect(translate("en", key), key).toBeTruthy();
      expect(translate("ja", key), key).toBeTruthy();
      expect(translate("ja", key), key).not.toBe(translate("en", key));
    }
  });
  it("localizes every preset with substantive copy", () => {
    for (const preset of presets.presets) {
      const en = getPresetCopy("en", preset.id);
      const ja = getPresetCopy("ja", preset.id);
      expect(en).toEqual({ name: preset.name, tagline: preset.tagline, description: preset.description });
      expect(ja.name).toBeTruthy();
      expect(ja.tagline).not.toBe(en.tagline);
      expect(ja.description).not.toBe(en.description);
    }
  });
  it("translates semantic events independently of their original messages", () => {
    const event: SimulationEvent = { id: 1, tick: 2, particleId: 3, result: "stall", code: "hallucination", level: 3, particleKind: "agent", kind: "bad", msg: "untrusted original" };
    expect(getEventCopy("en", event)).toMatch(/hallucinat/i);
    expect(getEventCopy("ja", event)).toMatch(/幻覚/);
    expect(getEventCopy("ja", { ...event, code: "levelUp", particleKind: "human", level: 4 })).toMatch(/4/);
    for (const code of ["hallucination", "contextFailure", "transferRefused", "transfer", "repair", "levelUp"] as const) {
      expect(getEventCopy("en", { ...event, code })).not.toContain("untrusted original");
      expect(getEventCopy("ja", { ...event, code })).not.toContain("untrusted original");
    }
  });
  it("offers an optional, localized workshop entry point", () => {
    for (const locale of ["en", "ja"] as const) {
      const html = renderToStaticMarkup(createElement(GuidedWorkshop, { locale }));
      expect(html).toContain(translate(locale, "workshopTitle"));
      expect(html).toContain(translate(locale, "workshopOpen"));
    }
  });
});
