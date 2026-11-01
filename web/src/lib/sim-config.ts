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

// ---------------------------------------------------------------------------
// Export / import file: { "schema", "version", "initial": { ...the eight levers } }
// `initial` is byte-for-byte the block a presets.json entry carries.
// ---------------------------------------------------------------------------

export const CONFIG_SCHEMA = "nonaka-spiral-lab/config";
export const CONFIG_VERSION = 1;
/** A real file is ~330 characters; anything past this is not one of ours. */
export const MAX_JSON_LENGTH = 4096;

const hasOwn = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Quotes a user-supplied key for an error message, truncated so a hostile key cannot flood the UI. */
const quote = (key: string) => JSON.stringify(key.length > 32 ? `${key.slice(0, 32)}...` : key);

/**
 * Strict check of an untrusted object: exactly the eight levers, no more and no
 * fewer, each a finite number inside its PARAM_SPECS bounds. The result is a
 * fresh plain object built only from PARAM_KEYS, so nothing the input carries
 * (for example an own "__proto__" key from JSON.parse) can reach it.
 */
export function validateParams(input: unknown): Result<SimParams> {
  if (!isRecord(input)) return fail("Parameters must be an object.");
  for (const key of Object.keys(input)) {
    if (!hasOwn(PARAM_SPECS, key)) return fail(`Unknown parameter ${quote(key)}.`);
  }
  const out: Partial<SimParams> = {};
  for (const k of PARAM_KEYS) {
    if (!hasOwn(input, k)) return fail(`Missing parameter ${quote(k)}.`);
    const checked = checkValue(k, input[k]);
    if (!checked.ok) return checked;
    out[k] = checked.value;
  }
  return ok(out as SimParams);
}

/** Pretty-printed config file text, ending in a newline. Only the eight levers are written. */
export function exportConfig(params: SimParams): string {
  const initial: Partial<SimParams> = {};
  for (const k of PARAM_KEYS) initial[k] = params[k];
  return `${JSON.stringify({ schema: CONFIG_SCHEMA, version: CONFIG_VERSION, initial }, null, 2)}\n`;
}

/**
 * JSON.parse keeps the last of two identical keys, so `{"humans": 99, "humans": 6}`
 * parses as 6 and the 99 never exists to be validated. The share-link parser rejects
 * a repeated lever outright (`parseParams`), so the file importer has to as well or
 * the two entry points disagree about what a strict configuration is.
 *
 * JSON.parse cannot help here: duplicates are already collapsed by the time it
 * returns, so this walks the raw text and reports the first key repeated within one
 * object, at any depth. Escapes are decoded, so `"hum\u0061ns"` collides with
 * `"humans"` exactly as it does after parsing.
 *
 * Returns null when nothing repeats, and also when the text is malformed: JSON.parse
 * owns that error and phrases it better.
 */
function findRepeatedKey(text: string): string | null {
  interface Frame {
    kind: "object" | "array";
    keys: Set<string>;
    expectKey: boolean;
  }
  const stack: Frame[] = [];
  let i = 0;

  const readString = (): string | null => {
    i += 1; // opening quote
    let out = "";
    while (i < text.length) {
      const c = text[i];
      if (c === '"') {
        i += 1;
        return out;
      }
      if (c !== "\\") {
        out += c;
        i += 1;
        continue;
      }
      const esc = text[i + 1];
      i += 2;
      switch (esc) {
        case '"': out += '"'; break;
        case "\\": out += "\\"; break;
        case "/": out += "/"; break;
        case "b": out += "\b"; break;
        case "f": out += "\f"; break;
        case "n": out += "\n"; break;
        case "r": out += "\r"; break;
        case "t": out += "\t"; break;
        case "u": {
          const hex = text.slice(i, i + 4);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) return null;
          out += String.fromCharCode(parseInt(hex, 16));
          i += 4;
          break;
        }
        default:
          return null; // not JSON; JSON.parse reports it
      }
    }
    return null; // unterminated string
  };

  while (i < text.length) {
    const c = text[i];
    if (c === '"') {
      const frame = stack[stack.length - 1];
      const s = readString();
      if (s === null) return null;
      if (frame?.kind === "object" && frame.expectKey) {
        if (frame.keys.has(s)) return s;
        frame.keys.add(s);
        frame.expectKey = false;
      }
      continue;
    }
    if (c === "{") {
      stack.push({ kind: "object", keys: new Set(), expectKey: true });
      i += 1;
      continue;
    }
    if (c === "[") {
      stack.push({ kind: "array", keys: new Set(), expectKey: false });
      i += 1;
      continue;
    }
    if (c === "}" || c === "]") {
      stack.pop();
      i += 1;
      continue;
    }
    if (c === ",") {
      const frame = stack[stack.length - 1];
      if (frame?.kind === "object") frame.expectKey = true;
      i += 1;
      continue;
    }
    i += 1; // whitespace, ':', digits, literals
  }
  return null;
}

/**
 * Strictly parses config file text. Rejects (never clamps) anything that is not
 * exactly what `exportConfig` writes: bad JSON, a key repeated within one object,
 * wrong schema or version, unknown or missing fields, wrong types, non-finite or
 * out-of-range numbers, fractional head-counts, and oversized text. Never throws.
 */
export function importConfig(text: string): Result<SimParams> {
  if (text.length > MAX_JSON_LENGTH) {
    return fail(`The file is too large (limit ${MAX_JSON_LENGTH} characters).`);
  }
  // Windows editors save "UTF-8 with BOM"; JSON.parse rejects the leading U+FEFF.
  const body = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const repeated = findRepeatedKey(body);
  if (repeated !== null) return fail(`${quote(repeated)} appears more than once in the file.`);
  let doc: unknown;
  try {
    doc = JSON.parse(body);
  } catch {
    return fail("The file is not valid JSON.");
  }
  if (!isRecord(doc)) return fail("The file must contain a JSON object.");
  if (doc.schema !== CONFIG_SCHEMA) return fail("This is not a Spiral Lab configuration file.");
  if (doc.version !== CONFIG_VERSION) {
    return fail(`Unsupported configuration version (this app reads version ${CONFIG_VERSION}).`);
  }
  for (const key of Object.keys(doc)) {
    if (key !== "schema" && key !== "version" && key !== "initial") return fail(`Unknown field ${quote(key)}.`);
  }
  return validateParams(doc.initial);
}
