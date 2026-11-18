import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const key = "knowledge-spiral-workshop-draft-v1";
const example = {
  version: 1,
  task: "Sort synthetic cards / 練習用カードを分類する",
  conditions: "Desk exercise only",
  observations: '<img src="https://example.invalid/pixel" onerror="alert(1)">',
  sources: "Synthetic card set v1, card 2",
  reviewer: "Example Reviewer",
  status: "reviewed",
};

test.beforeEach(async ({ page, baseURL }) => {
  await page.context().route("**/*", (route) =>
    new URL(route.request().url()).origin === baseURL ? route.continue() : route.abort(),
  );
});

async function openWorkshop(page: Page) {
  const response = await page.goto("/workshop");
  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("heading", { name: /Manual knowledge transfer/ })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Task / 作業", exact: true })).toBeEnabled();
}

async function importJSON(page: Page, contents: string) {
  await page.getByLabel("Import JSON / JSONを読み込む", { exact: true }).setInputFiles({
    name: "synthetic-draft.json", mimeType: "application/json", buffer: Buffer.from(contents),
  });
}

test("unsaved editing and reviewing do not persist after reload", async ({ page }) => {
  await openWorkshop(page);
  await expect(page.getByText("Synthetic or sanitized examples only", { exact: true })).toBeVisible();
  await expect(page.getByText("架空または機密情報を除去した例のみ使用してください", { exact: true })).toBeVisible();
  await page.getByLabel("Task / 作業", { exact: true }).fill("Temporary synthetic task");
  await page.getByLabel("Reviewer / レビュー担当者", { exact: true }).fill("Example Reviewer");
  await page.getByLabel("Review status / レビュー状態", { exact: true }).selectOption("reviewed");
  expect(await page.evaluate(() => localStorage.getItem("knowledge-spiral-workshop-draft-v1"))).toBeNull();
  await page.reload();
  await expect(page.getByLabel("Task / 作業", { exact: true })).toBeEnabled();
  await expect(page.getByLabel("Task / 作業", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Review status / レビュー状態", { exact: true })).toHaveValue("draft");
});

test("save requires privacy acknowledgement, restores saved snapshot, and clear removes only workshop data", async ({ page }) => {
  await openWorkshop(page);
  await page.evaluate(() => localStorage.setItem("unrelated-example", "keep"));
  await page.getByLabel("Task / 作業", { exact: true }).fill("Explicitly saved synthetic task");
  await expect(page.getByRole("button", { name: "Save locally / このブラウザーに保存", exact: true })).toBeDisabled();
  await expect(page.getByText(/unencrypted and available to other users/)).toBeVisible();
  await page.getByRole("checkbox", { name: /I understand/ }).check();
  await page.getByRole("button", { name: "Save locally / このブラウザーに保存", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved locally");
  expect(JSON.parse((await page.evaluate((storageKey) => localStorage.getItem(storageKey), key))!).task).toBe("Explicitly saved synthetic task");
  await page.getByLabel("Task / 作業", { exact: true }).fill("Unsaved subsequent edit");
  await page.reload();
  await expect(page.getByLabel("Task / 作業", { exact: true })).toHaveValue("Explicitly saved synthetic task");
  await page.getByRole("button", { name: "Clear draft and saved copy / 下書きと保存済みデータを消去", exact: true }).click();
  await expect(page.getByLabel("Task / 作業", { exact: true })).toHaveValue("");
  expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("unrelated-example"))).toBe("keep");
  await page.reload();
  await expect(page.getByLabel("Task / 作業", { exact: true })).toBeEnabled();
  await expect(page.getByLabel("Task / 作業", { exact: true })).toHaveValue("");
});

test("invalid imports preserve all current fields, review status and saved copy", async ({ page }) => {
  await openWorkshop(page);
  await importJSON(page, JSON.stringify(example));
  await expect(page.getByRole("status")).toContainText("Imported");
  await page.getByRole("checkbox", { name: /I understand/ }).check();
  await page.getByRole("button", { name: "Save locally / このブラウザーに保存", exact: true }).click();
  const saved = await page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
  for (const bad of ["{broken", JSON.stringify({ ...example, version: 2 }), JSON.stringify({ version: 1 }), JSON.stringify({ ...example, reviewer: " " }), JSON.stringify({ ...example, observations: "x".repeat(100_000) })]) {
    await importJSON(page, bad);
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Import failed");
    for (const [field, label] of Object.entries({ task: "Task / 作業", conditions: "Conditions / 条件", observations: "Observations / 観察", sources: "Sources / 出典", reviewer: "Reviewer / レビュー担当者", status: "Review status / レビュー状態" })) {
      await expect(page.getByLabel(label, { exact: true })).toHaveValue(example[field as keyof typeof example].toString());
    }
    expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBe(saved);
  }
});

test("export and local import restore all fields without storage writes, HTML execution or data requests", async ({ page }) => {
  const requests: string[] = [];
  await openWorkshop(page);
  page.on("request", (request) => requests.push(request.url()));
  await importJSON(page, JSON.stringify(example));
  await expect(page.getByRole("status")).toContainText("Imported");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON / JSONを書き出す", exact: true }).click();
  const download = await downloadPromise;
  const exported = await readFile((await download.path())!, "utf8");
  expect(JSON.parse(exported)).toEqual(example);
  await page.getByRole("button", { name: "Clear draft and saved copy / 下書きと保存済みデータを消去", exact: true }).click();
  await importJSON(page, exported);
  await expect(page.getByRole("status")).toContainText("Imported");
  for (const [field, label] of Object.entries({ task: "Task / 作業", conditions: "Conditions / 条件", observations: "Observations / 観察", sources: "Sources / 出典", reviewer: "Reviewer / レビュー担当者", status: "Review status / レビュー状態" })) {
    await expect(page.getByLabel(label, { exact: true })).toHaveValue(example[field as keyof typeof example].toString());
  }
  expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBeNull();
  expect(requests.filter((url) => !url.startsWith("blob:"))).toEqual([]);
  await expect(page.locator("main img, main script")).toHaveCount(0);
});

test("review needs a task and reviewer; every subsequent edit resets review", async ({ page }) => {
  await openWorkshop(page);
  await page.getByLabel("Review status / レビュー状態", { exact: true }).selectOption("reviewed");
  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  await expect(page.getByLabel("Review status / レビュー状態", { exact: true })).toHaveValue("draft");
  await page.getByLabel("Task / 作業", { exact: true }).fill("Synthetic sorting");
  await page.getByLabel("Reviewer / レビュー担当者", { exact: true }).fill("　 ");
  await page.getByLabel("Review status / レビュー状態", { exact: true }).selectOption("reviewed");
  await expect(page.getByLabel("Review status / レビュー状態", { exact: true })).toHaveValue("draft");
  await page.getByLabel("Reviewer / レビュー担当者", { exact: true }).fill("Example Reviewer");
  await page.getByLabel("Review status / レビュー状態", { exact: true }).selectOption("reviewed");
  await expect(page.getByLabel("Review status / レビュー状態", { exact: true })).toHaveValue("reviewed");
  await page.getByLabel("Observations / 観察", { exact: true }).fill("Changed observation");
  await expect(page.getByLabel("Review status / レビュー状態", { exact: true })).toHaveValue("draft");
  await expect(page.getByText(/not operational approval/)).toBeVisible();
});

test("invalid saved data is reported without silently deleting it", async ({ page }) => {
  await page.addInitScript((storageKey) => localStorage.setItem(storageKey, "{broken"), key);
  await openWorkshop(page);
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Saved draft could not be loaded");
  await expect(page.getByLabel("Task / 作業", { exact: true })).toHaveValue("");
  expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBe("{broken");
});

test("storage failures report save and deletion limitations honestly", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new Error("Unavailable"); };
    Storage.prototype.removeItem = () => { throw new Error("Unavailable"); };
  });
  await openWorkshop(page);
  await page.getByLabel("Task / 作業", { exact: true }).fill("Synthetic task");
  await page.getByRole("checkbox", { name: /I understand/ }).check();
  await page.getByRole("button", { name: "Save locally / このブラウザーに保存", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Save failed");
  await expect(page.getByLabel("Task / 作業", { exact: true })).toHaveValue("Synthetic task");
  await page.getByRole("button", { name: "Clear draft and saved copy / 下書きと保存済みデータを消去", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Saved copy could not be removed");
  await expect(page.getByLabel("Task / 作業", { exact: true })).toHaveValue("");
});

for (const width of [1280, 375]) {
  test(`bilingual form is keyboard accessible and fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openWorkshop(page);
    const task = page.getByLabel("Task / 作業", { exact: true });
    await task.focus();
    await page.keyboard.type("Synthetic task");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Conditions / 条件", { exact: true })).toBeFocused();
    expect(await page.getByLabel("Conditions / 条件", { exact: true }).evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
    expect(await page.locator("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.getByRole("button", { name: "Clear draft and saved copy / 下書きと保存済みデータを消去", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(task).toHaveValue("");
  });
}
