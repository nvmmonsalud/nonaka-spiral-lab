"use client";

import { useEffect, useRef, type ChangeEvent } from "react";
import { buildShareUrl, exportConfig } from "../lib/sim-config";
import { importChosenFile } from "../lib/import-flow";
import { buildReplayUrl, exportReplay, importRunFile } from "../lib/run-config";
import { translate, type Locale } from "../lib/simulator-copy";
import type { SimParams } from "../lib/spiral-engine";

export interface ConfigNotice {
  kind: "ok" | "error";
  text: string;
}

interface ConfigControlsProps {
  /** Reads the params the simulation is actually running (the parent's paramsRef.current). */
  getParams: () => SimParams;
  /** Applies a whole configuration through the same path the preset buttons use. */
  onApply: (next: SimParams, message: string) => void;
  onNotice: (kind: ConfigNotice["kind"], text: string) => void;
  notice: ConfigNotice | null;
  getSeed?: () => number;
  locale?: Locale;
  generation?: number;
  getGeneration?: () => number;
  onApplyReplay?: (next: SimParams, seed: number, message: string) => void;
}

const EXPORT_FILENAME = "spiral-lab-config.json";

function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ConfigControls({ getParams, onApply, onNotice, notice, getSeed, locale = "en", generation = 0, getGeneration, onApplyReplay }: ConfigControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = (key: string) => translate(locale, key);
  // Monotonic guard for overlapping imports: only the most recently chosen file
  // may apply. A slow earlier read must not land after a newer configuration.
  const importSeqRef = useRef(0);

  // A read that lands after unmount has nothing left to apply to; superseding it
  // stops the flow from calling back into a component that no longer exists.
  useEffect(
    () => () => {
      importSeqRef.current += 1;
    },
    [],
  );

  const copyLink = async () => {
    const link = getSeed ? buildReplayUrl(window.location.href, getParams(), getSeed()) : buildShareUrl(window.location.href, getParams());
    // Put the configuration in the address bar too: a reload keeps it, and if the
    // clipboard is blocked the user can still copy it from there. replaceState, not
    // pushState: this is not a navigation, and Back should not step through snapshots.
    window.history.replaceState(null, "", link);
    try {
      await navigator.clipboard.writeText(link);
      onNotice("ok", t("copied"));
    } catch {
      onNotice("error", locale === "ja" ? "クリップボードにアクセスできません。アドレスバーのリンクをコピーしてください。" : "Could not reach the clipboard. Copy the link from the address bar.");
    }
  };

  const exportJson = () => {
    downloadText(getSeed ? "spiral-lab-replay.json" : EXPORT_FILENAME, getSeed ? exportReplay(getParams(), getSeed()) : exportConfig(getParams()));
    onNotice("ok", t("exported"));
  };

  const onFileChosen = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = ""; // lets the same file be chosen again after it is edited
    if (!file) return;
    if (getSeed && onApplyReplay) {
      const ticket = ++importSeqRef.current;
      const startGeneration = getGeneration?.() ?? generation;
      void importRunFile(file, getSeed(), {
        isCurrent: () => ticket === importSeqRef.current && startGeneration === (getGeneration?.() ?? generation),
        reject: () => onNotice("error", locale === "ja" ? "設定を読み込めません。対応する形式・バージョン・シード・値と、4 KB以下のファイルサイズを確認してください。" : "Could not import. Check the file format, version, seed, lever values, and 4 KB size limit."),
        apply: (params, seed) => onApplyReplay(params, seed, t("imported")),
      }).catch((error: unknown) => console.error("Replay import failed unexpectedly:", error));
      return;
    }
    // The sequencing rules live in importChosenFile so they can be tested without a DOM.
    void importChosenFile(file, {
      takeTicket: () => ++importSeqRef.current,
      isCurrent: (ticket) => ticket === importSeqRef.current,
      reject: (message) => onNotice("error", message),
      apply: onApply,
    }).catch((error: unknown) => {
      // Only a throwing sink callback reaches here — read failures and invalid
      // configurations are reported through `reject`. Log rather than call
      // onNotice, which may be the callback that just threw.
      console.error("Configuration import failed unexpectedly:", error);
    });
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn ghost" style={{ padding: "10px 12px" }} onClick={copyLink}>
          {t("copyLink")}
        </button>
        <button className="btn ghost" style={{ padding: "10px 12px" }} onClick={exportJson}>
          {t("exportJson")}
        </button>
        <button
          className="btn ghost"
          style={{ padding: "10px 12px" }}
          onClick={() => fileInputRef.current?.click()}
        >
          {t("importJson")}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={onFileChosen}
          hidden
        />
      </div>
      {notice && (
        <p
          role={notice.kind === "error" ? "alert" : "status"}
          style={{
            marginTop: 8,
            fontSize: 12,
            lineHeight: 1.4,
            color: notice.kind === "error" ? "var(--rust)" : "var(--olive)",
          }}
        >
          {notice.text}
        </p>
      )}
    </div>
  );
}
