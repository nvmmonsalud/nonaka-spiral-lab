"use client";

import { useState } from "react";
import { translate, type Locale } from "../lib/simulator-copy";
import styles from "./GuidedWorkshop.module.css";

const stages = [
  { title: "workshopPredictTitle", prompt: "workshopPredictPrompt" },
  { title: "workshopObserveTitle", prompt: "workshopObservePrompt" },
  { title: "workshopCompareTitle", prompt: "workshopComparePrompt" },
];

export default function GuidedWorkshop({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState(0);
  const [notes, setNotes] = useState(["", "", ""]);
  const t = (key: string) => translate(locale, key);
  const current = stages[stage];

  return (
    <aside className={styles.workshop} aria-labelledby="workshop-title">
      <div className={styles.header}>
        <h2 id="workshop-title">{t("workshopTitle")}</h2>
        {!open && <button type="button" className={styles.button} onClick={() => setOpen(true)}>{t("workshopOpen")}</button>}
      </div>
      {open && <div className={styles.body}>
        <h3>{t(current.title)}</h3>
        <p>{t(current.prompt)}</p>
        <label htmlFor="workshop-notes">{t("workshopNotes")}</label>
        <textarea id="workshop-notes" value={notes[stage]} onChange={(event) => setNotes((previous) => previous.map((note, i) => i === stage ? event.target.value : note))} rows={3} />
        <div className={styles.actions}>
          <button type="button" className={styles.button} onClick={() => setStage((value) => value - 1)} disabled={stage === 0}>{t("workshopBack")}</button>
          {stage < stages.length - 1 && <button type="button" className={styles.button} onClick={() => setStage((value) => value + 1)}>{t("workshopNext")}</button>}
          <button type="button" className={styles.button} onClick={() => setOpen(false)}>{t("workshopExit")}</button>
        </div>
      </div>}
    </aside>
  );
}
