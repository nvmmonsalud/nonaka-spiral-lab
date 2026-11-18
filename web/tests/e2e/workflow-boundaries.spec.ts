import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("a later preset supersedes a slow file import in the actual component", async ({ page }) => {
  await page.goto("/simulator");
  await page.evaluate(() => {
    const original = File.prototype.text;
    File.prototype.text = function () {
      if (this.name !== "slow.json") return original.call(this);
      return new Promise<string>(resolve => {
        (window as unknown as { finishRead: () => Promise<void> }).finishRead = async () => resolve(await original.call(this));
      });
    };
  });
  await page.locator('input[type="file"]').setInputFiles({
    name: "slow.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({
      schema: "nonaka-spiral-lab/run", version: 1, engineVersion: "1", seed: 123,
      initial: { humans: 6, agents: 3, baRedundancy: .7, baChaos: .6, baAutonomy: .6, feedbackRate: .85, machineTransfer: .7, hallucinationRisk: .2 },
    })),
  });
  await page.getByRole("combobox", { name: "Preset", exact: true }).selectOption("matsushita");
  await page.evaluate(() => (window as unknown as { finishRead: () => Promise<void> }).finishRead());
  await expect(page.getByRole("combobox", { name: "Preset", exact: true })).toHaveValue("matsushita");
  await expect(page.getByRole("spinbutton", { name: "Seed", exact: true })).toHaveValue("42");
});

test("pause stops the clock and comparison configuration edits reset both runs", async ({ page }) => {
  await page.goto("/simulator");
  await page.getByRole("checkbox", { name: "Compare", exact: true }).check();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(page.getByText(/^Running · [1-9]/)).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const status = page.getByText(/^Paused ·/);
  const before = await status.textContent();
  await page.waitForTimeout(250);
  await expect(status).toHaveText(before!);
  await page.getByRole("slider", { name: /^Feedback rate/ }).nth(1).fill("0.3");
  await expect(status).toHaveText("Paused · 0.0 seconds");
});
