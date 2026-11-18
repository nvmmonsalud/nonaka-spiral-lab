import { describe, expect, test } from "vitest";
import { parseDraft, serializeDraft, type WorkshopDraft } from "../src/lib/workshop/draft";

const draft: WorkshopDraft = {
  version: 1,
  task: "Sort synthetic training cards / 練習用カードを分類する",
  conditions: "Desk exercise only",
  observations: "<script>alert('plain text')</script>\nCompare the printed symbols.",
  sources: "Synthetic card set v1, card 2",
  reviewer: "Example Reviewer",
  status: "draft",
};

describe("versioned workshop drafts", () => {
  test("round-trips every field and preserves plain text exactly", () => {
    expect(parseDraft(serializeDraft(draft))).toEqual(draft);
    expect(JSON.parse(serializeDraft(draft))).toEqual(draft);
    expect(parseDraft(serializeDraft({ ...draft, status: "reviewed" }))).toEqual({ ...draft, status: "reviewed" });
  });

  test.each(["{broken", "", "null", "[]", "42", '"text"'])("rejects malformed or non-object JSON: %s", (input) => {
    expect(() => parseDraft(input)).toThrow();
  });

  test.each([0, 2, "1", null])("rejects unsupported version %s", (version) => {
    expect(() => parseDraft(JSON.stringify({ ...draft, version }))).toThrow();
  });

  for (const field of Object.keys(draft)) {
    test(`rejects a missing ${field}`, () => {
      const incomplete: Record<string, unknown> = { ...draft };
      delete incomplete[field];
      expect(() => parseDraft(JSON.stringify(incomplete))).toThrow();
    });
  }

  for (const field of ["task", "conditions", "observations", "sources", "reviewer"]) {
    test.each([null, 12, {}, []])(`rejects a non-string ${field}: %s`, (value) => {
      expect(() => parseDraft(JSON.stringify({ ...draft, [field]: value }))).toThrow();
    });
  }

  test.each(["approved", "", null, true])("rejects invalid status %s", (status) => {
    expect(() => parseDraft(JSON.stringify({ ...draft, status }))).toThrow();
  });

  test.each([{ reviewer: "" }, { reviewer: " \n\t" }, { task: "　\n" }])("rejects reviewed drafts without task and named reviewer: %j", (fields) => {
    expect(() => parseDraft(JSON.stringify({ ...draft, ...fields, status: "reviewed" }))).toThrow();
  });

  test("allows an incomplete unreviewed draft", () => {
    expect(parseDraft(JSON.stringify({ ...draft, task: "", reviewer: "" })).status).toBe("draft");
  });

  test("accepts exactly 100,000 input characters and rejects 100,001", () => {
    const json = JSON.stringify(draft);
    expect(parseDraft(json + " ".repeat(100_000 - json.length))).toEqual(draft);
    expect(() => parseDraft(json + " ".repeat(100_001 - json.length))).toThrow();
  });

  test("serialization rejects oversize output and invalid reviewed data", () => {
    expect(() => serializeDraft({ ...draft, observations: "x".repeat(100_000) })).toThrow();
    expect(() => serializeDraft({ ...draft, reviewer: "", status: "reviewed" })).toThrow();
  });

  test("only returns the defined contract fields from an import", () => {
    expect(parseDraft(JSON.stringify({ ...draft, extra: "ignored" }))).toEqual(draft);
  });
});
