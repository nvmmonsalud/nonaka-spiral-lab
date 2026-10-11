import type { SimParams } from "./spiral-engine";

export type ParamKey = keyof SimParams;

export interface ParamSpec {
  min: number;
  max: number;
  integer: boolean;
}

/**
 * The one place that says what a legal simulator configuration is: which
 * levers exist, in what order, and their bounds. The UI sliders, the share-link
 * parser, the JSON importer and the presets guard test all read this, so a
 * slider range can never drift from what a link or file is allowed to carry.
 */
export const PARAM_SPECS: Record<ParamKey, ParamSpec> = {
  humans: { min: 0, max: 12, integer: true },
  agents: { min: 0, max: 12, integer: true },
  baRedundancy: { min: 0, max: 1, integer: false },
  baChaos: { min: 0, max: 1, integer: false },
  baAutonomy: { min: 0, max: 1, integer: false },
  feedbackRate: { min: 0, max: 1, integer: false },
  machineTransfer: { min: 0, max: 1, integer: false },
  hallucinationRisk: { min: 0, max: 1, integer: false },
};

export const PARAM_KEYS = Object.keys(PARAM_SPECS) as ParamKey[];

/** What the simulator opens on, and what a partial link falls back to. Equals the `notco` preset. */
export const DEFAULT_PARAMS: SimParams = {
  humans: 6,
  agents: 3,
  baRedundancy: 0.7,
  baChaos: 0.6,
  baAutonomy: 0.6,
  feedbackRate: 0.85,
  machineTransfer: 0.7,
  hallucinationRisk: 0.2,
};

export type Failure = { ok: false; error: string };
export type Result<T> = { ok: true; value: T } | Failure;

const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const fail = (error: string): Failure => ({ ok: false, error });

/** Validates one lever. Normalises -0 to 0 so equality and display stay boring. */
function checkValue(key: ParamKey, v: unknown): Result<number> {
  const spec = PARAM_SPECS[key];
  if (typeof v !== "number") return fail(`${key} must be a number.`);
  if (!Number.isFinite(v)) return fail(`${key} must be a finite number.`);
  if (spec.integer && !Number.isInteger(v)) return fail(`${key} must be a whole number.`);
  if (v < spec.min || v > spec.max) return fail(`${key} must be between ${spec.min} and ${spec.max}.`);
  return ok(v === 0 ? 0 : v);
}

// ---------------------------------------------------------------------------
// Share links: ?humans=6&agents=3&baRedundancy=0.7&...
// ---------------------------------------------------------------------------

/** A full link is ~120 characters; anything past this is not one of ours. */
export const MAX_QUERY_LENGTH = 2048;

// Plain decimal or exponent form. Excludes "", " ", "NaN", "Infinity", "0x10", "+3".
// Every finite value `String(n)` can emit matches, so serialize -> parse round-trips.
const DECIMAL = /^-?\d+(\.\d+)?([eE][-+]?\d+)?$/;

/** Always writes all eight levers so a link keeps its meaning if defaults ever change. */
export function serializeParams(params: SimParams): string {
  const query = new URLSearchParams();
  for (const k of PARAM_KEYS) query.set(k, String(params[k]));
  return query.toString();
}

/**
 * Reads the eight levers from a query string (leading "?" optional) over `base`.
 * - Unrelated parameters (utm_*, fbclid, __proto__, ...) are ignored.
 * - A URL with none of the eight levers yields `{ ok: true, value: null }`: "nothing to apply".
 * - Any recognised lever with a bad value rejects the whole link, so a half-applied
 *   configuration is never shown as if it were the one that was shared.
 * Never throws.
 */
export function parseParams(search: string, base: SimParams): Result<SimParams | null> {
  if (search.length > MAX_QUERY_LENGTH) return fail("The link is too long.");
  const query = new URLSearchParams(search);
  const next: SimParams = { ...base };
  let seen = 0;
  for (const k of PARAM_KEYS) {
    const all = query.getAll(k);
    if (all.length === 0) continue;
    if (all.length > 1) return fail(`${k} appears more than once.`);
    if (!DECIMAL.test(all[0])) return fail(`${k} must be a number.`);
    const checked = checkValue(k, Number(all[0]));
    if (!checked.ok) return checked;
    next[k] = checked.value;
    seen += 1;
  }
  return ok(seen === 0 ? null : next);
}

/** `href` must be an absolute URL (pass `window.location.href`). Drops any other query and the fragment. */
export function buildShareUrl(href: string, params: SimParams): string {
  const url = new URL(href);
  url.search = serializeParams(params);
  url.hash = "";
  return url.toString();
}

// ---------------------------------------------------------------------------
// Preset matching: lets a loaded link or file highlight the preset it equals
// ---------------------------------------------------------------------------

/** Id of the preset whose eight levers all equal `params`, or "" for a custom configuration. */
export function findMatchingPresetId(
  params: SimParams,
  presets: ReadonlyArray<{ id: string; initial: SimParams }>,
): string {
  const hit = presets.find((p) => PARAM_KEYS.every((k) => p.initial[k] === params[k]));
  return hit ? hit.id : "";
}
