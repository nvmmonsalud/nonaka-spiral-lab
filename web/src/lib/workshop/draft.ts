export type WorkshopDraft = {
  version: 1;
  task: string;
  conditions: string;
  observations: string;
  sources: string;
  reviewer: string;
  status: "draft" | "reviewed";
};

const textFields = ["task", "conditions", "observations", "sources", "reviewer"] as const;

/** Validate before replacing any in-memory or saved draft. Input is plain text. */
export function parseDraft(input: string): WorkshopDraft {
  if (input.length > 100_000) throw new Error("Draft JSON exceeds 100,000 characters.");
  const value: unknown = JSON.parse(input);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Draft must be a JSON object.");
  }
  const record = value as Record<string, unknown>;
  if (record.version !== 1) throw new Error("Unsupported draft version; expected 1.");
  for (const field of textFields) {
    if (typeof record[field] !== "string") throw new Error(`${field} must be present and contain text.`);
  }
  if (record.status !== "draft" && record.status !== "reviewed") {
    throw new Error("Status must be draft or reviewed.");
  }
  const result: WorkshopDraft = {
    version: 1,
    task: record.task as string,
    conditions: record.conditions as string,
    observations: record.observations as string,
    sources: record.sources as string,
    reviewer: record.reviewer as string,
    status: record.status,
  };
  if (result.status === "reviewed" && (!result.task.trim() || !result.reviewer.trim())) {
    throw new Error("Reviewed drafts require a nonblank task and named reviewer.");
  }
  return result;
}

/** Compact output uses the same size/validation contract as imports. */
export function serializeDraft(draft: WorkshopDraft): string {
  return JSON.stringify(parseDraft(JSON.stringify(draft)));
}
