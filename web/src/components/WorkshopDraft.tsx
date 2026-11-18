"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { parseDraft, serializeDraft, type WorkshopDraft as Draft } from "@/lib/workshop/draft";

const storageKey = "knowledge-spiral-workshop-draft-v1";
const emptyDraft: Draft = {
  version: 1, task: "", conditions: "", observations: "", sources: "", reviewer: "", status: "draft",
};
const fields = [
  ["task", "Task / 作業"],
  ["conditions", "Conditions / 条件"],
  ["observations", "Observations / 観察"],
  ["sources", "Sources / 出典"],
  ["reviewer", "Reviewer / レビュー担当者"],
] as const;

export default function WorkshopDraft() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [ready, setReady] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [message, setMessage] = useState("Loading local draft / 保存済み下書きを確認中");
  const [error, setError] = useState("");
  // A slow file read must never replace a newer edit, import or clear action.
  const revision = useRef(0);

  useEffect(() => {
    let active = true;
    // Defer browser-only initialization until after the server/client first render.
    void Promise.resolve().then(() => {
      if (!active) return;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved !== null) {
          setDraft(parseDraft(saved));
          setMessage("Loaded saved copy. New edits are not saved automatically. / 保存済みデータを復元しました。変更は自動保存されません。");
        } else {
          setMessage("Not saved. Edits stay in this tab until reload. / 未保存。再読み込みすると変更は失われます。");
        }
      } catch {
        setError("Saved draft could not be loaded. Stored data was not changed. / 保存済み下書きを読み込めませんでした。保存データは変更していません。");
        setMessage("Current form is empty / 現在のフォームは空です");
      }
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  function edit(field: (typeof fields)[number][0], value: string) {
    revision.current += 1;
    setDraft({ ...draft, [field]: value, status: "draft" });
    setError("");
    setMessage("Unsaved changes; review required after editing. / 未保存の変更があります。編集後は再レビューが必要です。");
  }

  function changeStatus(status: Draft["status"]) {
    try {
      const validated = parseDraft(JSON.stringify({ ...draft, status }));
      revision.current += 1;
      setDraft(validated);
      setError("");
      setMessage("Review status changed in this tab; save explicitly to keep it. / このタブのレビュー状態を変更しました。保持するには明示的に保存してください。");
    } catch {
      setError("Review requires a task, a named reviewer and valid draft data (maximum 100,000 JSON characters). / レビュー済みにするには作業名、レビュー担当者名、有効な下書きが必要です（JSON全体で10万文字以内）。");
    }
  }

  function save() {
    if (!acknowledged) return;
    try {
      const json = serializeDraft(draft);
      localStorage.setItem(storageKey, json);
      setError("");
      setMessage("Saved locally. Later changes require another save. / このブラウザーに保存しました。以後の変更には再度保存が必要です。");
    } catch {
      setError("Save failed. Check draft size and browser storage availability. / 保存に失敗しました。下書きのサイズとブラウザーの保存設定を確認してください。");
    }
  }

  function clear() {
    revision.current += 1;
    setDraft({ ...emptyDraft });
    setAcknowledged(false);
    setError("");
    setMessage("Cleared current draft and saved copy. Exported files remain on your device. / 下書きと保存済みデータを消去しました。書き出したファイルは端末に残ります。");
    try {
      localStorage.removeItem(storageKey);
    } catch {
      setError("Saved copy could not be removed. Only the current form was cleared; remove this site's data in browser settings. / 保存済みデータを削除できませんでした。フォームのみ消去しました。ブラウザー設定でこのサイトのデータを削除してください。");
      setMessage("Current form cleared / 現在のフォームを消去しました");
    }
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    const requestRevision = ++revision.current;
    try {
      // Reject very large files before reading; UTF-8 needs at most four bytes per character.
      if (file.size > 400_000) throw new Error("File too large");
      const imported = parseDraft(await file.text());
      if (requestRevision !== revision.current) return;
      setDraft(imported);
      setError("");
      setMessage("Imported into this tab only. Save explicitly to keep it. / このタブにのみ読み込みました。保持するには明示的に保存してください。");
    } catch {
      if (requestRevision !== revision.current) return;
      setError("Import failed. Current draft and saved copy are unchanged. Use valid version-1 JSON up to 100,000 characters; reviewed drafts need a task and reviewer. / 読み込みに失敗しました。現在の下書きと保存済みデータは変更していません。バージョン1のJSONを10万文字以内で指定してください。レビュー済みには作業名と担当者名が必要です。");
    }
  }

  function exportFile() {
    try {
      const json = serializeDraft(draft);
      const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "synthetic-workshop-draft.json";
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      setError("");
      setMessage("Export requested. The downloaded file is unencrypted; browser storage was not changed. / 書き出しを開始しました。ファイルは暗号化されません。ブラウザーの保存データは変更していません。");
    } catch {
      setError("Export failed. Check draft validity and the 100,000-character JSON limit. / 書き出しに失敗しました。下書きの内容とJSON全体の10万文字制限を確認してください。");
    }
  }

  return (
    <div className="workshop">
      <aside className="callout rust" aria-label="Privacy / プライバシー">
        <p><strong>Synthetic or sanitized examples only</strong></p>
        <p lang="ja"><strong>架空または機密情報を除去した例のみ使用してください</strong></p>
        <p>No customer documents, personal data or secrets. No account, AI service or network upload. / 顧客文書・個人情報・秘密情報を入力しないでください。アカウント、AIサービス、ネットワークへのアップロードはありません。</p>
      </aside>
      <p role="status" aria-live="polite">{message}</p>
      {error && <p role="alert" className="callout rust">{error}</p>}
      <fieldset disabled={!ready}>
        <legend>Capture and review / 記録とレビュー</legend>
        <p>Describe a non-safety-critical practice task, context, observations and source references. / 安全に関わらない練習作業、条件、観察、出典を記録してください。</p>
        {fields.map(([field, label]) => (
          <div className="field" key={field}>
            <label htmlFor={`workshop-${field}`}>{label}</label>
            <textarea id={`workshop-${field}`} rows={field === "reviewer" ? 1 : 3} maxLength={100_000} value={draft[field]} onChange={(event) => edit(field, event.target.value)} />
          </div>
        ))}
        <div className="field">
          <label htmlFor="workshop-review-status">Review status / レビュー状態</label>
          <select id="workshop-review-status" value={draft.status} onChange={(event) => changeStatus(event.target.value as Draft["status"])}>
            <option value="draft">Draft / 下書き</option>
            <option value="reviewed">Reviewed / レビュー済み</option>
          </select>
        </div>
        <p>Reviewer sign-off is a manual declaration, not operational approval or verified identity. Editing any field returns the record to draft. / レビュー済みは手動の申告であり、業務の実施承認や本人確認ではありません。項目を編集すると下書きに戻ります。</p>
        <div className="callout" id="storage-warning">
          <p>Local browser data is unencrypted and available to other users of this browser. It stays until cleared or removed by browser settings. Exported JSON files are also unencrypted. / 保存データは暗号化されず、このブラウザーの他の利用者もアクセスできます。消去またはブラウザー設定で削除するまで残ります。書き出したJSONファイルも暗号化されません。</p>
          <label className="acknowledgement">
            <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} aria-describedby="storage-warning" />
            <span>I understand the local storage privacy warning / ブラウザー保存の注意事項を理解しました</span>
          </label>
        </div>
        <div className="actions">
          <button type="button" className="btn" disabled={!acknowledged} onClick={save}>Save locally / このブラウザーに保存</button>
          <button type="button" className="btn ghost" onClick={exportFile}>Export JSON / JSONを書き出す</button>
          <button type="button" className="btn ghost" onClick={clear}>Clear draft and saved copy / 下書きと保存済みデータを消去</button>
        </div>
        <label className="field">
          <span>Import JSON / JSONを読み込む</span>
          <input type="file" accept=".json,application/json" onChange={importFile} aria-describedby="import-help" />
        </label>
        <p id="import-help">Reads one local file in your browser; nothing is uploaded. Valid import replaces the current form only. Maximum 100,000 JSON characters. / ローカルファイル1件をブラウザー内で読み込みます。アップロードはしません。有効なファイルは現在のフォームのみを置き換えます。JSON全体で10万文字以内。</p>
        <p>Clear removes this draft and its saved browser copy; downloaded files and other open tabs remain. / 消去はこの下書きとブラウザーの保存済みデータが対象です。ダウンロード済みファイルや他のタブは残ります。</p>
      </fieldset>
      <style jsx>{`
        .workshop { overflow-wrap: anywhere; }
        fieldset { border: var(--border); border-radius: var(--radius-panel); padding: 20px; min-width: 0; margin-top: 20px; }
        legend { padding: 0 8px; font-weight: 600; }
        .field { display: flex; flex-direction: column; gap: 6px; margin: 18px 0; }
        .field span, .field > label { font-weight: 600; }
        textarea, select, input[type="file"] { width: 100%; min-width: 0; max-width: 100%; font: inherit; color: var(--slate); }
        textarea, select { padding: 10px; border: var(--border); border-radius: var(--radius-row); background: var(--white); }
        textarea { resize: vertical; }
        .acknowledgement { display: flex; align-items: flex-start; gap: 10px; margin-top: 14px; }
        input[type="checkbox"] { margin-top: 6px; flex-shrink: 0; }
        .actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn { white-space: normal; }
        button:disabled { opacity: .5; cursor: not-allowed; }
        textarea:focus-visible, select:focus-visible, input:focus-visible, button:focus-visible { outline: 3px solid var(--clay); outline-offset: 3px; }
        @media (max-width: 480px) { fieldset { padding: 12px; } .actions .btn { width: 100%; } }
      `}</style>
    </div>
  );
}
