import { test, expect } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("comparison starts from the selected primary configuration and has accessible history", async ({ page }) => {
  await page.goto("/simulator");
  await page.getByRole("combobox", { name: "Preset", exact: true }).selectOption("green-milk");
  await page.getByRole("checkbox", { name: "Compare", exact: true }).check();
  await expect(page.getByRole("combobox", { name: "Comparison preset", exact: true })).toHaveValue("green-milk");
  const feedback = page.getByRole("slider", { name: /^Feedback rate/ });
  expect(await feedback.nth(0).inputValue()).toBe(await feedback.nth(1).inputValue());
  await feedback.nth(1).fill("0.8");
  await expect(feedback.nth(0)).toHaveValue("0.2");
  await expect(feedback.nth(1)).toHaveValue("0.8");
  await expect(page.getByRole("group", { name: "B · Comparison run history values", exact: true })).toContainText("Mean level");
  await page.getByRole("button", { name: "History data table", exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
});

test("a completed JSON import announces success", async ({ page }) => {
  await page.goto("/simulator");
  await page.locator('input[type="file"]').setInputFiles({
    name: "run.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({
      schema: "nonaka-spiral-lab/run", version: 1, engineVersion: "1", seed: 42,
      initial: { humans: 6, agents: 3, baRedundancy: .7, baChaos: .6, baAutonomy: .6, feedbackRate: .85, machineTransfer: .7, hallucinationRisk: .2 },
    })),
  });
  await expect(page.getByRole("status")).toContainText("Configuration imported.");
});
