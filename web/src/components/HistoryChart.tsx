"use client";

import { useId, useState } from "react";
import { DEFAULT_SEED, ENGINE_VERSION, type HistorySample } from "../lib/simulation";
import { historyToCsv } from "../lib/simulation-history";
import { translate, type Locale } from "../lib/simulator-copy";
import styles from "./SimulationPanels.module.css";

type Metric = "cycles" | "failures" | "corrupted" | "repairs" | "meanLevel" | "score";
const metrics: Metric[] = ["cycles", "failures", "corrupted", "repairs", "meanLevel", "score"];

export default function HistoryChart({ samples, comparisonSamples, locale, seed = DEFAULT_SEED }: {
  samples: readonly HistorySample[];
  comparisonSamples?: readonly HistorySample[];
  locale: Locale;
  seed?: number;
}) {
  const [metric, setMetric] = useState<Metric>("cycles");
  const [showTable, setShowTable] = useState(false);
  const id = useId();
  const t = (key: string) => translate(locale, key);
  const all = [...samples, ...(comparisonSamples ?? [])];
  const minTime = Math.min(...all.map(s => s.time), samples[0]?.time ?? 0);
  const maxTime = Math.max(minTime + 1, ...all.map(s => s.time));
  const maxValue = Math.max(1, ...all.map(s => s[metric]));
  const x = (time: number) => 48 + (time - minTime) / (maxTime - minTime) * 530;
  const y = (value: number) => 190 - value / maxValue * 160;
  const points = (history: readonly HistorySample[]) => history.map(s => `${x(s.time)},${y(s[metric])}`).join(" ");
  const histories = [["A", samples], ...(comparisonSamples ? [["B", comparisonSamples] as const] : [])] as const;
  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([historyToCsv(samples, { seed, engineVersion: ENGINE_VERSION }, comparisonSamples)], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `spiral-history-seed-${seed}.csv`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div className={styles.panel}>
    <div className={styles.header}>
      <div><h2 id={`${id}-title`}>{t("history")}</h2><p className={styles.hint}>{t("historyDescription")}</p></div>
      <button type="button" className="btn ghost" onClick={exportCsv} aria-describedby={`${id}-window`}>{t("exportCsv")}</button>
    </div>
    <label className={styles.select} htmlFor={`${id}-metric`}>{t("history")}
      <select id={`${id}-metric`} value={metric} onChange={e => setMetric(e.target.value as Metric)}>{metrics.map(key => <option key={key} value={key}>{t(key)}</option>)}</select>
    </label>
    <div className={styles.legend}><span><i className={styles.swatch} aria-hidden="true" />A · {t("primaryRun")}</span>{comparisonSamples && <span><i className={`${styles.swatch} ${styles.dash}`} aria-hidden="true" />B · {t("comparisonRun")}</span>}</div>
    <svg className={styles.chart} viewBox="0 0 620 235" role="img" aria-labelledby={`${id}-title ${id}-description`}>
      <title id={`${id}-description`}>{`${t(metric)} · ${minTime.toFixed(0)}–${maxTime.toFixed(0)} ${t("seconds")}`}</title>
      {[0, .5, 1].map(f => <g key={f}>
        <line className={styles.axis} x1="48" y1={y(maxValue * f)} x2="578" y2={y(maxValue * f)} />
        <text fill="currentColor" x="40" y={y(maxValue * f) + 4} textAnchor="end">{Number((maxValue * f).toFixed(1))}</text>
      </g>)}
      <polyline className={styles.primary} points={points(samples)} />
      {samples.length === 1 && <circle cx={x(samples[0].time)} cy={y(samples[0][metric])} r="3" fill="var(--rust)" />}
      {comparisonSamples && <polyline className={styles.comparison} points={points(comparisonSamples)} />}
      <text fill="currentColor" x="48" y="211">{minTime.toFixed(0)}</text><text fill="currentColor" x="578" y="211" textAnchor="end">{maxTime.toFixed(0)}</text>
      <text fill="currentColor" x="310" y="231" textAnchor="middle">{t("seconds")}</text>
    </svg>
    {histories.map(([run, history]) => {
      const latest = history.at(-1);
      const title = `${run} · ${t(run === "A" ? "primaryRun" : "comparisonRun")} ${t("historyValues")}`;
      return latest && <div key={run} role="group" aria-label={title}><p>{title}</p><dl className={styles.summary}>{metrics.map(key => <div key={key}><dt>{t(key)}</dt><dd>{Number(latest[key].toFixed(2))}</dd></div>)}</dl></div>;
    })}
    <button type="button" className="btn ghost" aria-expanded={showTable} aria-controls={`${id}-table`} onClick={() => setShowTable(value => !value)}>{t("historyTable")}</button>
    {showTable && <div id={`${id}-table`} className={styles.table}><table><caption>{t(metric)}</caption><thead><tr><th scope="col">{t("seconds")}</th><th scope="col">A · {t("primaryRun")}</th>{comparisonSamples && <th scope="col">B · {t("comparisonRun")}</th>}</tr></thead><tbody>{samples.map((sample, i) => <tr key={sample.tick}><th scope="row">{sample.time}</th><td>{Number(sample[metric].toFixed(2))}</td>{comparisonSamples && <td>{comparisonSamples[i] ? Number(comparisonSamples[i][metric].toFixed(2)) : "—"}</td>}</tr>)}</tbody></table></div>}
    <p className={styles.hint} id={`${id}-window`}>{t("rollingHistory")} {t("exportCsvHint")}</p>
  </div>;
}
