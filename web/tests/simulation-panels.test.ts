import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HistoryChart from "../src/components/HistoryChart";
import ParticleInspector from "../src/components/ParticleInspector";
import type { HistorySample } from "../src/lib/simulation";

const sample: HistorySample = { tick: 0, time: 0, score: 0, cycles: 0, failures: 0, corrupted: 0, repairs: 0, meanLevel: 1, l1: 0, l2: 0, l3: 0, l4: 0 };

describe("history and inspector text alternatives", () => {
  it("renders a chart with an accessible name, values and CSV action", () => {
    const html = renderToStaticMarkup(createElement(HistoryChart, { samples: [sample], locale: "en", seed: 42 }));
    expect(html).toContain('role="img"');
    expect(html).toContain("aria-labelledby");
    expect(html).toContain("Export CSV");
    expect(html).toContain("Cycles");
    expect(html).toContain("Failures");
    expect(html).not.toContain("NaN");
  });

  it("handles no particles with bilingual guidance", () => {
    const props = { particles: [], selectedId: null, onSelect: () => {} };
    const en = renderToStaticMarkup(createElement(ParticleInspector, { ...props, locale: "en" }));
    const ja = renderToStaticMarkup(createElement(ParticleInspector, { ...props, locale: "ja" }));
    expect(en).toContain("No particles");
    expect(ja).toMatch(/[一-龯ぁ-んァ-ン]/);
  });

  it("provides a labeled keyboard-selectable particle and its transition", () => {
    const particles = [{ id: 7, kind: "agent" as const, quad: "E" as const, level: 2, x: .3, y: .2, vx: 0, vy: 0, size: 8, cooldown: 1, corrupted: true, lastResult: "stall" as const, lastTick: 120 }];
    const html = renderToStaticMarkup(createElement(ParticleInspector, { particles, selectedId: 7, onSelect: () => {}, locale: "en" }));
    expect(html).toContain("<select");
    expect(html).toContain("for=");
    expect(html).toContain("Externalization");
    expect(html).toContain("Stalled");
    expect(html).toContain("7");
  });
});
