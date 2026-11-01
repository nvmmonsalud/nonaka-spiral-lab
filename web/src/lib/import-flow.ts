import { MAX_JSON_LENGTH, importConfig } from "./sim-config";
import type { SimParams } from "./spiral-engine";

/**
 * The part of `File` this flow needs. Declared structurally so tests can pass a
 * fake with a deferred `text()` instead of building a real file in a DOM.
 */
export interface ChosenFile {
  size: number;
  text(): Promise<string>;
}

export interface ImportSink {
  /** Claims this selection. Must be called before any early return. */
  takeTicket(): number;
  /** True while `ticket` is still the newest selection. */
  isCurrent(ticket: number): boolean;
  reject(message: string): void;
  apply(params: SimParams, message: string): void;
}

/**
 * Reads and applies one chosen configuration file.
 *
 * The ticket is claimed before the size check on purpose. A rejected selection is
 * still the user's newest choice, so it has to supersede any older read still in
 * flight; otherwise the UI reports "too large" and then quietly applies the
 * previous file, which is the opposite of what the user last asked for.
 */
export async function importChosenFile(file: ChosenFile, sink: ImportSink): Promise<void> {
  const ticket = sink.takeTicket();
  if (file.size > MAX_JSON_LENGTH) {
    sink.reject(`Import failed: the file is too large (limit ${MAX_JSON_LENGTH} bytes).`);
    return;
  }
  let text: string;
  try {
    text = await file.text();
  } catch {
    if (sink.isCurrent(ticket)) sink.reject("Import failed: the file could not be read.");
    return;
  }
  if (!sink.isCurrent(ticket)) return; // superseded by a newer selection
  const result = importConfig(text);
  if (!result.ok) {
    sink.reject(`Import failed: ${result.error}`);
    return;
  }
  sink.apply(result.value, "Imported the configuration from a file.");
}
