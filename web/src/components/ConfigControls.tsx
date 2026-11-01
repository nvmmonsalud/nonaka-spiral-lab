"use client";

import { useRef, type ChangeEvent } from "react";
import { MAX_JSON_LENGTH, buildShareUrl, exportConfig, importConfig } from "@/lib/sim-config";
import type { SimParams } from "@/lib/spiral-engine";

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

export default function ConfigControls({ getParams, onApply, onNotice, notice }: ConfigControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyLink = async () => {
    const link = buildShareUrl(window.location.href, getParams());
    // Put the configuration in the address bar too: a reload keeps it, and if the
    // clipboard is blocked the user can still copy it from there. replaceState, not
    // pushState: this is not a navigation, and Back should not step through snapshots.
    window.history.replaceState(null, "", link);
    try {
      await navigator.clipboard.writeText(link);
      onNotice("ok", "Link copied. Anyone who opens it starts with this configuration.");
    } catch {
      onNotice("error", "Could not reach the clipboard. The link is now in the address bar: copy it from there.");
    }
  };

  const exportJson = () => {
    downloadText(EXPORT_FILENAME, exportConfig(getParams()));
    onNotice("ok", `Downloaded ${EXPORT_FILENAME}.`);
  };

  const onFileChosen = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = ""; // lets the same file be chosen again after it is edited
    if (!file) return;
    if (file.size > MAX_JSON_LENGTH) {
      onNotice("error", `Import failed: the file is too large (limit ${MAX_JSON_LENGTH} bytes).`);
      return;
    }
    let text: string;
    try {
      text = await file.text();
    } catch {
      onNotice("error", "Import failed: the file could not be read.");
      return;
    }
    const result = importConfig(text);
    if (!result.ok) {
      onNotice("error", `Import failed: ${result.error}`);
      return;
    }
    onApply(result.value, "Imported the configuration from a file.");
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn ghost" style={{ padding: "10px 12px" }} onClick={copyLink}>
          Copy link
        </button>
        <button className="btn ghost" style={{ padding: "10px 12px" }} onClick={exportJson}>
          Export JSON
        </button>
        <button
          className="btn ghost"
          style={{ padding: "10px 12px" }}
          onClick={() => fileInputRef.current?.click()}
        >
          Import JSON
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
