import { describe, expect, it } from "vitest";
import { historyToCsv } from "../src/lib/simulation-history";
import type { HistorySample } from "../src/lib/simulation";

const sample: HistorySample = { tick: 60, time: 1, score: 20, cycles: 1, failures: 2, corrupted: 1, repairs: 1, meanLevel: 1.5, l1: 2, l2: 2, l3: 0, l4: 0 };

describe("history CSV", () => {
  it("exports primary and comparison values with reproducibility metadata", () => {
    const csv = historyToCsv([sample], { seed: 42, engineVersion: "1" }, [{ ...sample, score: 40 }]);
    const [header, primary, comparison] = csv.trim().split("\n");
    expect(header).toBe("engine_version,seed,run,tick,time_seconds,score,cycles,failures,corrupted,repairs,mean_level,l1,l2,l3,l4");
    expect(primary).toBe("1,42,A,60,1,20,1,2,1,1,1.5,2,2,0,0");
    expect(comparison).toBe("1,42,B,60,1,40,1,2,1,1,1.5,2,2,0,0");
  });

  it("handles empty history and CSV quoting without mutating inputs", () => {
    expect(historyToCsv([], { seed: 0, engineVersion: "1" }).trim().split("\n")).toHaveLength(1);
    const before = JSON.stringify(sample);
    expect(historyToCsv([sample], { seed: 0, engineVersion: 'v,"1"' })).toContain('"v,""1""",0,A');
    expect(JSON.stringify(sample)).toBe(before);
  });
});
