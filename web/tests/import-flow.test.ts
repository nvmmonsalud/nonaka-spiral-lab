import { describe, expect, it } from "vitest";
import { importChosenFile, type ImportSink } from "../src/lib/import-flow";
import { DEFAULT_PARAMS, MAX_JSON_LENGTH, exportConfig } from "../src/lib/sim-config";
import type { SimParams } from "../src/lib/spiral-engine";

const VALID = exportConfig(DEFAULT_PARAMS);
const OTHER = exportConfig({ ...DEFAULT_PARAMS, humans: 9 });

const TOO_LARGE = `Import failed: the file is too large (limit ${MAX_JSON_LENGTH} bytes).`;

function makeSink() {
  let current = 0;
  const events: string[] = [];
  const applied: SimParams[] = [];
  const sink: ImportSink = {
    takeTicket: () => ++current,
    isCurrent: (ticket) => ticket === current,
    reject: (message) => {
      events.push(`reject:${message}`);
    },
    apply: (params, message) => {
      applied.push(params);
      events.push(`apply:${message}`);
    },
  };
  return { sink, events, applied };
}

/** A file whose read resolves only when the test says so, so interleaving is explicit. */
function deferred(text: string) {
  let release!: (value: string) => void;
  let fail!: (error: Error) => void;
  const promise = new Promise<string>((resolve, reject) => {
    release = resolve;
    fail = reject;
  });
  return {
    file: { size: text.length, text: () => promise },
    release: () => release(text),
    fail: (error: Error) => fail(error),
  };
}

describe("importChosenFile", () => {
  it("applies a valid file", async () => {
    const { sink, events, applied } = makeSink();
    await importChosenFile({ size: VALID.length, text: async () => VALID }, sink);
    expect(applied).toHaveLength(1);
    expect(applied[0].humans).toBe(DEFAULT_PARAMS.humans);
    expect(events).toEqual(["apply:Imported the configuration from a file."]);
  });

  it("reports a file that is not a valid configuration", async () => {
    const { sink, events, applied } = makeSink();
    await importChosenFile({ size: 2, text: async () => "{}" }, sink);
    expect(applied).toHaveLength(0);
    expect(events).toEqual(["reject:Import failed: This is not a Spiral Lab configuration file."]);
  });

  it("reports a read failure when nothing superseded it", async () => {
    const { sink, events } = makeSink();
    await importChosenFile({ size: 10, text: () => Promise.reject(new Error("boom")) }, sink);
    expect(events).toEqual(["reject:Import failed: the file could not be read."]);
  });

  it("an oversized selection supersedes an import that is still reading", async () => {
    const { sink, events, applied } = makeSink();
    const slow = deferred(VALID);

    const first = importChosenFile(slow.file, sink);
    // The user immediately picks a file that is too large, before the first read lands.
    await importChosenFile({ size: MAX_JSON_LENGTH + 1, text: async () => "" }, sink);
    slow.release();
    await first;

    // The last thing the user chose was rejected, so nothing may be applied.
    expect(applied).toHaveLength(0);
    expect(events).toEqual([`reject:${TOO_LARGE}`]);
  });

  it("a newer valid selection wins over an older one still reading", async () => {
    const { sink, applied } = makeSink();
    const slow = deferred(VALID);

    const first = importChosenFile(slow.file, sink);
    await importChosenFile({ size: OTHER.length, text: async () => OTHER }, sink);
    slow.release();
    await first;

    expect(applied).toHaveLength(1);
    expect(applied[0].humans).toBe(9);
  });

  it("does not read a file that is too large", async () => {
    const { sink, events } = makeSink();
    let reads = 0;
    await importChosenFile(
      {
        size: MAX_JSON_LENGTH + 1,
        text: async () => {
          reads += 1;
          return VALID;
        },
      },
      sink,
    );
    // The cap has to reject before allocating, not after reading 4 KB+ into memory.
    expect(reads).toBe(0);
    expect(events).toEqual([`reject:${TOO_LARGE}`]);
  });

  it("a superseded read that fails reports nothing", async () => {
    const { sink, events, applied } = makeSink();
    const slow = deferred(VALID);

    const first = importChosenFile(slow.file, sink);
    await importChosenFile({ size: OTHER.length, text: async () => OTHER }, sink);
    slow.fail(new Error("boom"));
    await first;

    // B applied, and A's failure produced no event at all.
    expect(applied).toHaveLength(1);
    expect(applied[0].humans).toBe(9);
    expect(events).toEqual(["apply:Imported the configuration from a file."]);
  });
});
