import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import presets from "../data/presets.json";
import SpiralSimulator from "../src/components/SpiralSimulator";

describe("simulator server rendering", () => {
  it("renders replay, comparison, history, inspector and workshop controls with labels", () => {
    const html = renderToStaticMarkup(createElement(SpiralSimulator));
    expect(html).toMatch(/seed/i);
    expect(html).toMatch(/compare/i);
    expect(html).toMatch(/history/i);
    expect(html).toMatch(/inspector/i);
    expect(html).toMatch(/workshop/i);
    expect(html).toMatch(/illustrative/i);
    expect(html).toMatch(/<label[^>]*>/i);
    expect(html).toMatch(/<canvas[^>]*aria-label=/i);
    expect(html).toContain(presets.presets[0].description);
    expect(html).toMatch(/<label[^>]*>Seed<input[^>]*type="number"/);
    expect(html).toMatch(/<label[^>]*>Compare|<label[^>]*><input[^>]*type="checkbox"[^>]*\/> Compare/);
  });
});
