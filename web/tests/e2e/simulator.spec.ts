import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test.use({ reducedMotion: "reduce" });

const advance = async (page: import("@playwright/test").Page, ticks: number) => {
  await page.getByRole("button", { name: "Step", exact: true }).evaluate((button, count) => {
    for (let i = 0; i < count; i++) (button as HTMLButtonElement).click();
  }, ticks);
};

test("same-seed comparison, replay reset, seed sharing and CSV agree", async ({ page }) => {
  await page.goto("/simulator?seed=912");
  await expect(page.getByRole("spinbutton", { name: "Seed", exact: true })).toHaveValue("912");
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible();
  await page.getByRole("checkbox", { name: "Compare", exact: true }).check();
  await expect(page.locator("canvas")).toHaveCount(2);
  await advance(page, 600);
  await expect(page.getByText("Paused · 10.0 seconds", { exact: true })).toBeVisible();

  const csvDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV", exact: true }).click();
  const csv = await readFile((await (await csvDownload).path())!, "utf8");
  const rows = csv.trim().split("\n").slice(1).map(row => row.split(","));
  expect(rows.filter(row => row[2] === "A").map(row => row.slice(3))).toEqual(rows.filter(row => row[2] === "B").map(row => row.slice(3)));
  expect(rows.at(-1)?.[3]).toBe("600");

  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByText("Paused · 0.0 seconds", { exact: true })).toBeVisible();
  await advance(page, 600);
  const secondDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV", exact: true }).click();
  expect(await readFile((await (await secondDownload).path())!, "utf8")).toBe(csv);

  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  await expect(page).toHaveURL(/seed=912/);
  const replayDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  const replay = JSON.parse(await readFile((await (await replayDownload).path())!, "utf8"));
  expect(replay).toMatchObject({ schema: "nonaka-spiral-lab/run", version: 1, seed: 912, engineVersion: "1" });
});

test("language, inspector, guided notes, and empty population work on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/simulator");
  await page.getByRole("combobox", { name: "Select a particle to inspect it.", exact: true }).selectOption("0");
  await expect(page.getByText("Healthy", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Start workshop", exact: true }).click();
  await page.getByRole("textbox").fill("Watch externalization");
  await advance(page, 120);
  await page.getByRole("combobox", { name: "Language", exact: true }).selectOption("ja");
  await expect(page.getByRole("heading", { name: "知識スパイラル・ラボ" })).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveValue("Watch externalization");
  await expect(page.getByText("停止中 · 2.0 秒", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "次へ", exact: true }).click();
  await expect(page.getByRole("heading", { name: "2. 観察して詳しく調べる" })).toBeVisible();
  await page.getByRole("button", { name: "戻る", exact: true }).click();
  await expect(page.getByRole("textbox")).toHaveValue("Watch externalization");
  await page.getByRole("combobox", { name: "言語", exact: true }).selectOption("en");
  await page.getByRole("slider", { name: /^Humans/ }).fill("0");
  await page.getByRole("slider", { name: /^Agents/ }).fill("0");
  await expect(page.getByText("No particles in this run.", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("replay imports restore seed and invalid imports preserve the current run", async ({ page }) => {
  await page.goto("/simulator?seed=71");
  const fileDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  const content = await readFile((await (await fileDownload).path())!);
  await page.getByRole("spinbutton", { name: "Seed", exact: true }).fill("99");
  await page.getByRole("button", { name: "Apply seed", exact: true }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: "replay.json", mimeType: "application/json", buffer: content });
  await expect(page.getByRole("spinbutton", { name: "Seed", exact: true })).toHaveValue("71");
  await advance(page, 120);
  await page.locator('input[type="file"]').setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from("{}") });
  await expect(page.getByRole("alert").filter({ hasText: "Could not import" })).toBeVisible();
  await expect(page.getByText("Paused · 2.0 seconds", { exact: true })).toBeVisible();
});
