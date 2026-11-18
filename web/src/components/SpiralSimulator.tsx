"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import presetsData from "../../data/presets.json";
import ConfigControls, { type ConfigNotice } from "./ConfigControls";
import GuidedWorkshop from "./GuidedWorkshop";
import HistoryChart from "./HistoryChart";
import ParticleInspector from "./ParticleInspector";
import SimulationCanvas from "./SimulationCanvas";
import { DEFAULT_PARAMS, PARAM_KEYS, PARAM_SPECS, findMatchingPresetId, parseParams, type ParamKey } from "../lib/sim-config";
import { parseRunSeed } from "../lib/run-config";
import { createSimulation, DEFAULT_SEED, getSimulationSample, stepSimulation, TICKS_PER_SECOND, type SimulationState } from "../lib/simulation";
import { getEventCopy, getPresetCopy, translate, type Locale } from "../lib/simulator-copy";
import type { SimParams } from "../lib/spiral-engine";
import styles from "./SimulationDashboard.module.css";

type Runs = { primary: SimulationState; comparison: SimulationState };
const makeRuns = (a: SimParams, b: SimParams, seed: number): Runs => ({ primary: createSimulation(a, seed), comparison: createSimulation(b, seed) });

export default function SpiralSimulator() {
  const [locale, setLocale] = useState<Locale>("en");
  const t = (key: string) => translate(locale, key);
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [comparisonParams, setComparisonParams] = useState<SimParams>(DEFAULT_PARAMS);
  const paramsRef = useRef(params), comparisonParamsRef = useRef(comparisonParams);
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const seedRef = useRef(seed);
  const [seedInput, setSeedInput] = useState(String(DEFAULT_SEED));
  const [running, setRunning] = useState(false);
  const [compare, setCompare] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [comparisonSelectedId, setComparisonSelectedId] = useState<number | null>(null);
  const [notice, setNotice] = useState<ConfigNotice | null>(null);
  const generationRef = useRef(0);
  const [generation, setGeneration] = useState(0);
  const [runs, setRuns] = useState<Runs>(() => makeRuns(DEFAULT_PARAMS, DEFAULT_PARAMS, DEFAULT_SEED));
  const runsRef = useRef(runs);
  const initialized = useRef(false);

  const resetWith = useCallback((a: SimParams, b: SimParams, nextSeed: number) => {
    generationRef.current += 1; setGeneration(generationRef.current);
    paramsRef.current = a; comparisonParamsRef.current = b; seedRef.current = nextSeed;
    setParams(a); setComparisonParams(b); setSeed(nextSeed); setSeedInput(String(nextSeed));
    const next = makeRuns(a, b, nextSeed); runsRef.current = next; setRuns(next);
    setSelectedId(null); setComparisonSelectedId(null);
  }, []);
  const applyConfig = useCallback((next: SimParams) => {
    resetWith(next, comparisonParamsRef.current, seedRef.current); setNotice(null);
  }, [resetWith]);
  const applyReplay = useCallback((next: SimParams, nextSeed: number, message: string) => {
    resetWith(next, comparisonParamsRef.current, nextSeed); setNotice({ kind: "ok", text: message });
  }, [resetWith]);
  const showNotice = useCallback((kind: ConfigNotice["kind"], text: string) => setNotice({ kind, text }), []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const parsed = parseParams(window.location.search, DEFAULT_PARAMS);
    const parsedSeed = parseRunSeed(window.location.search);
    if (!parsed.ok || !parsedSeed.ok) {
      // URL hydration intentionally updates the prerendered defaults once.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotice({ kind: "error", text: !parsed.ok ? parsed.error : !parsedSeed.ok ? parsedSeed.error : "" });
    } else if (parsed.value || parsedSeed.value !== null) {
      resetWith(parsed.value ?? DEFAULT_PARAMS, DEFAULT_PARAMS, parsedSeed.value ?? DEFAULT_SEED);
    }
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setRunning(true);
  }, [resetWith]);

  useEffect(() => {
    if (!running) return;
    let frame = 0, last = 0, remainder = 0, lastPaint = 0;
    const tick = (now: number) => {
      if (last) {
        remainder += Math.min((now - last) / 1000, 0.25) * TICKS_PER_SECOND;
        const steps = Math.floor(remainder);
        if (steps) {
          remainder -= steps;
          runsRef.current = { primary: stepSimulation(runsRef.current.primary, steps), comparison: stepSimulation(runsRef.current.comparison, steps) };
          if (now - lastPaint >= 100) { setRuns(runsRef.current); lastPaint = now; }
        }
      }
      last = now; frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);
  const pause = () => { setRunning(!running); setRuns(runsRef.current); };
  const step = () => {
    const next = { primary: stepSimulation(runsRef.current.primary), comparison: stepSimulation(runsRef.current.comparison) };
    runsRef.current = next; setRuns(next);
  };
  const applySeed = () => {
    if (!/^\d+$/.test(seedInput) || Number(seedInput) > 4294967295) { setNotice({ kind: "error", text: t("invalidSeed") }); return; }
    resetWith(paramsRef.current, comparisonParamsRef.current, Number(seedInput)); setNotice(null);
  };
  const changeParam = (which: "primary" | "comparison", key: ParamKey, value: number) => {
    const a = which === "primary" ? { ...paramsRef.current, [key]: value } : paramsRef.current;
    const b = which === "comparison" ? { ...comparisonParamsRef.current, [key]: value } : comparisonParamsRef.current;
    resetWith(a, b, seedRef.current);
  };
  const changePreset = (which: "primary" | "comparison", id: string) => {
    const preset = presetsData.presets.find(p => p.id === id);
    if (preset) resetWith(which === "primary" ? { ...preset.initial } : paramsRef.current, which === "comparison" ? { ...preset.initial } : comparisonParamsRef.current, seedRef.current);
  };
  const toggleComparison = (enabled: boolean) => {
    if (enabled) {
      // Revealing a comparison preserves the observation the user just made.
      // The immutable state can be shared until the next simulation step clones it.
      const nextParams = { ...paramsRef.current };
      comparisonParamsRef.current = nextParams;
      setComparisonParams(nextParams);
      const next = { primary: runsRef.current.primary, comparison: { ...runsRef.current.primary, params: nextParams } };
      runsRef.current = next;
      setRuns(next);
      setComparisonSelectedId(null);
      generationRef.current += 1;
      setGeneration(generationRef.current);
    }
    setCompare(enabled);
  };
  const config = (which: "primary" | "comparison", values: SimParams) => <ConfigFields which={which} values={values} locale={locale} onPreset={changePreset} onChange={changeParam} />;
  const panel = (state: SimulationState, comparison: boolean) => <div className="card">
    <h2>{t(comparison ? "comparisonRun" : "primaryRun")}</h2>
    <SimulationCanvas particles={state.particles} selectedId={comparison ? comparisonSelectedId : selectedId} onSelect={comparison ? setComparisonSelectedId : setSelectedId} locale={locale} />
    <div className={styles.stats}>{(["score", "cycles", "failures", "repairs"] as const).map(k => <div key={k}><span className="mono-label">{t(k)}</span><p className="num">{state[k]}</p></div>)}</div>
    <dl className={styles.levels}>{(["individual", "group", "organization", "interOrganization"] as const).map((key, i) => <div key={key}><dt>{`L${i + 1} · ${t(key)}`}</dt><dd>{getSimulationSample(state)[`l${i + 1}` as "l1" | "l2" | "l3" | "l4"]}</dd></div>)}</dl>
    <ParticleInspector particles={state.particles} selectedId={comparison ? comparisonSelectedId : selectedId} onSelect={comparison ? setComparisonSelectedId : setSelectedId} locale={locale} />
    <h3>{t("eventLog")}</h3>{state.events.length ? <ol className={styles.events}>{state.events.slice().reverse().map(event => <li key={event.id}>{(event.tick / TICKS_PER_SECOND).toFixed(1)} {t("seconds")} · {getEventCopy(locale, event)}</li>)}</ol> : <p>{t("noEvents")}</p>}
  </div>;
  return <>
    <div className="hero" lang={locale}><div className="inner"><div className={styles.actions}><label>{t("language")} <select value={locale} onChange={e => setLocale(e.target.value as Locale)}><option value="en">English</option><option value="ja">日本語</option></select></label></div><h1>{t("title")}</h1><p className="sub">{t("intro")}</p><p>{t("illustrative")}</p></div></div>
    <nav lang={locale}><div className="inner"><Link href="/">{t("home")}</Link><Link href="/research">{t("research")}</Link></div></nav>
    <section lang={locale}><GuidedWorkshop locale={locale} /><p className={styles.legend}>{["legendHuman", "legendAgent", "legendCorrupted", "legendLevel"].map(key => <span key={key}>{t(key)}</span>)}</p><div className={styles.layout}>
      <div className={styles.main}><div className={styles.actions}><button className="btn" onClick={pause}>{t(running ? "pause" : "resume")}</button><button className="btn ghost" onClick={step} disabled={running}>{t("step")}</button><button className="btn ghost" onClick={() => resetWith(paramsRef.current, comparisonParamsRef.current, seedRef.current)}>{t("reset")}</button><span>{t(running ? "running" : "paused")} · {(runs.primary.tick / TICKS_PER_SECOND).toFixed(1)} {t("seconds")}</span></div>
        <div className={styles.runs}>{panel(runs.primary, false)}{compare && panel(runs.comparison, true)}</div>
        <HistoryChart samples={runs.primary.history} comparisonSamples={compare ? runs.comparison.history : undefined} locale={locale} seed={seed} />
      </div>
      <div className={styles.controls}><div className="card"><label className={styles.field}>{t("seed")}<input type="number" min="0" max="4294967295" step="1" value={seedInput} onChange={e => setSeedInput(e.target.value)} /></label><button className="btn ghost" onClick={applySeed}>{t("applySeed")}</button><p className={styles.muted}>{t("seed")}: {seed}. {t("sameSeed")}</p><label><input type="checkbox" checked={compare} onChange={e => toggleComparison(e.target.checked)} /> {t("compare")}</label></div>
        {config("primary", params)}{compare && config("comparison", comparisonParams)}
        <ConfigControls getParams={() => paramsRef.current} getSeed={() => seedRef.current} locale={locale} generation={generation} getGeneration={() => generationRef.current} onApply={applyConfig} onApplyReplay={applyReplay} onNotice={showNotice} notice={notice} />
      </div>
    </div></section>
  </>;
}

function ConfigFields({ which, values, locale, onPreset, onChange }: { which: "primary" | "comparison"; values: SimParams; locale: Locale; onPreset: (which: "primary" | "comparison", id: string) => void; onChange: (which: "primary" | "comparison", key: ParamKey, value: number) => void }) {
  const t = (key: string) => translate(locale, key);
  const presetId = findMatchingPresetId(values, presetsData.presets);
  const presetCopy = presetId ? getPresetCopy(locale, presetId) : null;
  return <div className="card">
    <h3>{t(which === "primary" ? "primaryRun" : "comparisonRun")}</h3>
    <label className={styles.field}>{t(which === "primary" ? "preset" : "comparisonPreset")}
      <select value={presetId} onChange={e => onPreset(which, e.target.value)}>
        <option value="">—</option>{presetsData.presets.map(p => <option key={p.id} value={p.id}>{getPresetCopy(locale, p.id).name}</option>)}
      </select>
    </label>
    {presetCopy && <p className={styles.muted}><strong>{presetCopy.tagline}</strong><br />{presetCopy.description}</p>}
    {PARAM_KEYS.map(key => <label key={key} className={styles.field}>{t(key)} <span>{PARAM_SPECS[key].integer ? values[key] : `${Math.round(values[key] * 100)}%`}</span>
      <input type="range" min={PARAM_SPECS[key].min} max={PARAM_SPECS[key].max} step={PARAM_SPECS[key].integer ? 1 : 0.01} value={values[key]} onChange={e => onChange(which, key, Number(e.target.value))} />
    </label>)}
  </div>;
}
