import type { HistorySample } from "./simulation";

const csvCell = (value: string | number) => {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

/** Stable machine-readable columns; each row describes one retained sample of run A or B. */
export function historyToCsv(
  samples: readonly HistorySample[],
  metadata: { seed: number; engineVersion: string },
  comparisonSamples?: readonly HistorySample[],
): string {
  const rows = ["engine_version,seed,run,tick,time_seconds,score,cycles,failures,corrupted,repairs,mean_level,l1,l2,l3,l4"];
  for (const [run, history] of [["A", samples], ["B", comparisonSamples ?? []]] as const) {
    for (const s of history) {
      rows.push([metadata.engineVersion, metadata.seed, run, s.tick, s.time, s.score, s.cycles, s.failures, s.corrupted, s.repairs, s.meanLevel, s.l1, s.l2, s.l3, s.l4].map(csvCell).join(","));
    }
  }
  return `${rows.join("\n")}\n`;
}
