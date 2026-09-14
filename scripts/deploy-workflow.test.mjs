import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflow = await readFile(
  new URL("../.github/workflows/deploy.yml", import.meta.url),
  "utf8",
);

test("production deployment can only be started manually", () => {
  const triggers = workflow.match(/on:\n([\s\S]*?)\n\npermissions:/)?.[1] ?? "";

  assert.match(triggers, /workflow_dispatch:/);
  assert.doesNotMatch(triggers, /push:|pull_request:|schedule:/);
});

test("all Vercel credentials are checked before build or deployment", () => {
  const preflight = workflow.indexOf("name: Validate Vercel credentials");
  const install = workflow.indexOf("name: Install dependencies");
  const deploy = workflow.indexOf("name: Deploy to Vercel (production)");

  assert.ok(preflight > -1 && preflight < install && install < deploy);
  assert.match(
    workflow,
    /for name in VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID; do/,
  );
  assert.match(workflow, /\$name is required for a production deployment/);
  assert.match(workflow, /exit "\$missing"/);
});

test("deployment passes the token through the environment", () => {
  assert.match(workflow, /--token="\$VERCEL_TOKEN"/);
  assert.doesNotMatch(workflow, /--token=\$\{\{ secrets\.VERCEL_TOKEN \}\}/);
});
