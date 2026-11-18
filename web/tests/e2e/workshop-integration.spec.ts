import { expect, test } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";

// Invented desk exercise; no customer records or real reviewer identity.
const syntheticDraft = {
  version: 1,
  task: "Sort six synthetic training cards / 練習用カード6枚を分類する",
  conditions: "Paper mockups at a desk; no equipment or actual inventory.",
  observations: "Read the symbol, not the color. Put ambiguous symbols in unknown; do not guess.",
  sources: "Invented card set v1, cards 1–6; invented symbol key v1, rule 1.",
  reviewer: "Fictional Rehearsal Reviewer",
  status: "reviewed",
};
const labels = {
  task: "Task / 作業",
  conditions: "Conditions / 条件",
  observations: "Observations / 観察",
  sources: "Sources / 出典",
  reviewer: "Reviewer / レビュー担当者",
} as const;

for (const width of [1280, 375]) {
  test(`home → simulator → home → workshop round trip stays local at ${width}px`, async ({ page, context, baseURL }, testInfo) => {
    const started = performance.now();
    const phaseMs: Record<string, number> = {};
    const forbiddenRequests: string[] = [];
    const pageErrors: string[] = [];
    let localRequests = 0;
    const origin = new URL(baseURL!).origin;
    // Record attempts before aborting: blocking alone must not make this test pass.
    await context.route("**/*", (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.protocol === "blob:") return route.continue();
      if (url.origin !== origin || /^\/api(?:\/|$)/.test(url.pathname) || request.method() !== "GET") {
        forbiddenRequests.push(`${request.method()} ${request.url()}`);
        return route.abort();
      }
      localRequests += 1;
      return route.continue();
    });
    // Only Next's local development HMR socket is permitted.
    await context.routeWebSocket("**/*", (socket) => {
      const url = new URL(socket.url());
      if (url.host === new URL(origin).host && url.pathname === "/_next/hmr") {
        socket.connectToServer();
      } else {
        forbiddenRequests.push(`WebSocket ${socket.url()}`);
        socket.close();
      }
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.goto("/");
    await page.getByRole("navigation").getByRole("link", { name: "Simulator", exact: true }).click();
    await expect(page).toHaveURL(`${origin}/simulator`);
    await expect(page.getByRole("heading", { name: "Knowledge Spiral Lab", level: 1 })).toBeVisible();
    await expect(page.getByText("These outcomes are illustrative, not measurements of actual business performance or AI behavior.", { exact: true })).toBeVisible();
    await page.getByRole("navigation").getByRole("link", { name: "Home", exact: true }).click();
    await expect(page).toHaveURL(`${origin}/`);
    const workshopLink = page.getByRole("navigation").getByRole("link", { name: /Workshop/ });
    await expect(workshopLink).toBeVisible();
    await page.getByRole("navigation").getByRole("link", { name: "Simulator", exact: true }).focus();
    await page.keyboard.press("Tab");
    await expect(workshopLink).toBeFocused();
    expect(await workshopLink.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(`${origin}/workshop`);
    await expect(page.getByRole("heading", { name: /Manual knowledge transfer/ })).toBeVisible();
    await expect(page.getByText("Synthetic or sanitized examples only", { exact: true })).toBeVisible();
    await expect(page.getByLabel(labels.task, { exact: true })).toBeEnabled();
    phaseMs.navigation = performance.now() - started;

    let phaseStart = performance.now();
    for (const field of ["task", "conditions", "observations", "sources"] as const) {
      await page.getByLabel(labels[field], { exact: true }).fill(syntheticDraft[field]);
    }
    const status = page.getByLabel("Review status / レビュー状態", { exact: true });
    await expect(status).toHaveValue("draft");
    phaseMs.automatedCapture = performance.now() - phaseStart;

    phaseStart = performance.now();
    // This exercises the declaration UI; it performs no human/expert review.
    await page.getByLabel(labels.reviewer, { exact: true }).fill(syntheticDraft.reviewer);
    await status.selectOption("reviewed");
    await expect(status).toHaveValue("reviewed");
    await expect(page.getByText(/not operational approval or verified identity/)).toBeVisible();
    phaseMs.automatedReviewDeclaration = performance.now() - phaseStart;

    phaseStart = performance.now();
    await page.getByRole("checkbox", { name: /I understand/ }).check();
    await page.getByRole("button", { name: "Save locally / このブラウザーに保存", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Saved locally");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export JSON / JSONを書き出す", exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("synthetic-workshop-draft.json");
    const exported = await readFile((await download.path())!, "utf8");
    expect(JSON.parse(exported)).toEqual(syntheticDraft);
    await page.getByRole("button", { name: "Clear draft and saved copy / 下書きと保存済みデータを消去", exact: true }).click();
    for (const label of Object.values(labels)) {
      await expect(page.getByLabel(label, { exact: true })).toHaveValue("");
    }
    await expect(status).toHaveValue("draft");
    await expect(page.getByRole("checkbox", { name: /I understand/ })).not.toBeChecked();
    expect(await page.evaluate(() => localStorage.getItem("knowledge-spiral-workshop-draft-v1"))).toBeNull();
    await page.getByLabel("Import JSON / JSONを読み込む", { exact: true }).setInputFiles({
      name: download.suggestedFilename(), mimeType: "application/json", buffer: Buffer.from(exported),
    });
    await expect(page.getByRole("status")).toContainText("Imported into this tab only");
    for (const field of Object.keys(labels) as (keyof typeof labels)[]) {
      await expect(page.getByLabel(labels[field], { exact: true })).toHaveValue(syntheticDraft[field]);
    }
    await expect(status).toHaveValue("reviewed");
    expect(await page.evaluate(() => localStorage.getItem("knowledge-spiral-workshop-draft-v1"))).toBeNull();
    expect(await page.getByRole("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    phaseMs.automatedSaveExportClearImport = performance.now() - phaseStart;

    expect(forbiddenRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    const observation = {
      kind: "automated synthetic UI rehearsal; no human participants or customer evidence",
      width, phaseMs, totalMs: performance.now() - started, localRequests, forbiddenRequests, pageErrors,
      humanReviewTime: null, reviewerBurden: "not measured", participantQuestions: "not observed; no participants",
      roundTrip: "all five text fields and reviewed status restored; saved copy removed; import unsaved",
    };
    const observationPath = testInfo.outputPath("synthetic-rehearsal.json");
    await writeFile(observationPath, JSON.stringify(observation, null, 2));
    await testInfo.attach("automated-synthetic-rehearsal", { path: observationPath, contentType: "application/json" });
  });
}
