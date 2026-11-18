"use client";

import { useId } from "react";
import { TICKS_PER_SECOND, type SimulationParticle } from "../lib/simulation";
import { translate, type Locale } from "../lib/simulator-copy";
import styles from "./SimulationPanels.module.css";

const quadrants = { S: "socialization", E: "externalization", C: "combination", I: "internalization" };
const transitions = { ok: "transitionOk", stall: "transitionStall", regress: "transitionRegress", transfer: "transitionTransfer" };
const levels = ["", "individual", "group", "organization", "interOrganization"];

export default function ParticleInspector({ particles, selectedId, onSelect, locale }: {
  particles: readonly SimulationParticle[]; selectedId: number | null;
  onSelect: (id: number | null) => void; locale: Locale;
}) {
  const id = useId();
  const t = (key: string) => translate(locale, key);
  const particle = particles.find(p => p.id === selectedId);
  return <div className={styles.panel}>
    <h3>{t("inspector")}</h3>
    {!particles.length ? <p>{t("noParticles")}</p> : <>
      <label className={styles.select} htmlFor={`${id}-particle`}>{t("selectParticle")}
        <select id={`${id}-particle`} value={particle?.id ?? ""} onChange={e => onSelect(e.target.value === "" ? null : Number(e.target.value))}>
          <option value="">—</option>{particles.map(p => <option key={p.id} value={p.id}>{t(p.kind)} #{p.id + 1}</option>)}
        </select>
      </label>
      {particle && <dl className={styles.details}>
        <dt>{t("particle")}</dt><dd>{t(particle.kind)} #{particle.id + 1}</dd>
        <dt>{t("quadrant")}</dt><dd>{t(quadrants[particle.quad])}</dd>
        <dt>{t("level")}</dt><dd>{particle.level} · {t(levels[particle.level])}</dd>
        <dt>{t("status")}</dt><dd>{t(particle.corrupted ? "corrupted" : "healthy")}</dd>
        <dt>{t("lastTransition")}</dt><dd>{particle.lastResult ? `${t(transitions[particle.lastResult])} · ${((particle.lastTick ?? 0) / TICKS_PER_SECOND).toFixed(1)} ${t("seconds")}` : t("noTransition")}</dd>
      </dl>}
    </>}
  </div>;
}
