import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("desktop and Japanese mobile layouts render without browser errors", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/simulator");
  await page.getByRole("checkbox", { name: "Compare", exact: true }).check();
  await page.getByRole("button", { name: "Start workshop", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Step", exact: true }).evaluate(button => { for (let i = 0; i < 1200; i++) (button as HTMLButtonElement).click(); });
  await expect(page.getByText("Paused · 20.0 seconds", { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("combobox", { name: "Language", exact: true }).selectOption("ja");
  await expect(page.getByRole("heading", { name: "知識スパイラル・ラボ" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("mobile.png"), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
