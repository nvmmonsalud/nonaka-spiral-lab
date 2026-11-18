import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SpiralSimulator from "../src/components/SpiralSimulator";
import HistoryChart from "../src/components/HistoryChart";
import { createSimulation } from "../src/lib/simulation";
import { DEFAULT_PARAMS } from "../src/lib/sim-config";

describe("preserved domain overview and comparison text", () => {
  it("shows all four ontological populations and human/agent legend", () => {
    const html = renderToStaticMarkup(createElement(SpiralSimulator));
    for (const label of ["L1 · Individual", "L2 · Group", "L3 · Organization", "L4 · Inter-organization", "Green = human", "Orange = agent", "Red = corrupted"]) expect(html).toContain(label);
  });

  it("provides separate primary and comparison history values", () => {
    const samples = createSimulation(DEFAULT_PARAMS, 42).history;
    const html = renderToStaticMarkup(createElement(HistoryChart, { samples, comparisonSamples: samples, locale: "en" }));
    expect(html).toContain('aria-label="A · Primary run history values"');
    expect(html).toContain('aria-label="B · Comparison run history values"');
    expect(html).toContain("History data table");
  });
});
