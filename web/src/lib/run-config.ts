import { buildShareUrl, CONFIG_SCHEMA, findRepeatedKey, importConfig, MAX_JSON_LENGTH, MAX_QUERY_LENGTH, validateParams, type Result } from "./sim-config";
import { ENGINE_VERSION } from "./simulation";
import type { ChosenFile } from "./import-flow";
import type { SimParams } from "./spiral-engine";

const REPLAY_SCHEMA = "nonaka-spiral-lab/run";
const SEED_MAX = 4294967295;
const validSeed = (seed: unknown): seed is number => typeof seed === "number" && Number.isInteger(seed) && seed >= 0 && seed <= SEED_MAX;
const failure = (error: string) => ({ ok: false as const, error });

export function parseRunSeed(search: string): Result<number | null> {
  if (search.length > MAX_QUERY_LENGTH) return failure("The link is too long.");
  const values = new URLSearchParams(search).getAll("seed");
  if (!values.length) return { ok: true, value: null };
  if (values.length !== 1 || !/^\d+$/.test(values[0]) || !validSeed(Number(values[0]))) {
    return failure(`Seed must be a whole number between 0 and ${SEED_MAX}.`);
  }
  return { ok: true, value: Number(values[0]) };
}

export function buildReplayUrl(href: string, params: SimParams, seed: number): string {
  if (!validSeed(seed)) throw new RangeError("Invalid seed.");
  const url = new URL(buildShareUrl(href, params));
  url.searchParams.set("seed", String(seed));
  return url.toString();
}

export function exportReplay(params: SimParams, seed: number): string {
  if (!validSeed(seed)) throw new RangeError("Invalid seed.");
  const checked = validateParams(params);
  if (!checked.ok) throw new RangeError(checked.error);
  return `${JSON.stringify({ schema: REPLAY_SCHEMA, version: 1, engineVersion: ENGINE_VERSION, seed, initial: checked.value }, null, 2)}\n`;
}

export interface ReplayConfiguration { params: SimParams; seed: number }

/** A replay is a fresh run, not a snapshot. Legacy lever-only files retain their original format. */
export function importReplay(text: string, fallbackSeed: number): Result<ReplayConfiguration> {
  if (text.length > MAX_JSON_LENGTH) return failure("The file is too large.");
  if (!validSeed(fallbackSeed)) return failure("Invalid fallback seed.");
  const body = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const repeated = findRepeatedKey(body);
  if (repeated !== null) return failure("The file contains repeated keys.");
  let doc: unknown;
  try { doc = JSON.parse(body); } catch { return failure("The file is not valid JSON."); }
  if (typeof doc !== "object" || doc === null || Array.isArray(doc)) return failure("The file must contain an object.");
  const record = doc as Record<string, unknown>;
  if (record.schema === CONFIG_SCHEMA) {
    const legacy = importConfig(text);
    return legacy.ok ? { ok: true, value: { params: legacy.value, seed: fallbackSeed } } : legacy;
  }
  if (record.schema !== REPLAY_SCHEMA) return failure("This is not a Spiral Lab replay file.");
  if (record.version !== 1 || record.engineVersion !== ENGINE_VERSION) return failure("The replay or engine version is not supported.");
  const fields = new Set(["schema", "version", "engineVersion", "seed", "initial"]);
  if (Object.keys(record).some((key) => !fields.has(key))) return failure("The file contains unknown fields.");
  if (!validSeed(record.seed)) return failure("Invalid replay seed.");
  const params = validateParams(record.initial);
  if (!params.ok) return params;
  return { ok: true, value: { params: params.value, seed: record.seed } };
}

export interface RunImportSink {
  isCurrent(): boolean;
  apply(params: SimParams, seed: number): void;
  reject(message: string): void;
}

/** The caller claims a selection before calling, including files rejected without reading. */
export async function importRunFile(file: ChosenFile, fallbackSeed: number, sink: RunImportSink): Promise<void> {
  if (file.size > MAX_JSON_LENGTH) {
    if (sink.isCurrent()) sink.reject("The file is too large.");
    return;
  }
  let text: string;
  try { text = await file.text(); } catch {
    if (sink.isCurrent()) sink.reject("The file could not be read.");
    return;
  }
  if (!sink.isCurrent()) return;
  const result = importReplay(text, fallbackSeed);
  if (!result.ok) { sink.reject(result.error); return; }
  sink.apply(result.value.params, result.value.seed);
}
