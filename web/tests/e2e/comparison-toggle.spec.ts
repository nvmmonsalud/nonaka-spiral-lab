import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("revealing comparison preserves observed primary history and selection", async ({ page }) => {
  await page.goto("/simulator");
  await page.getByRole("button", { name: "Step", exact: true }).evaluate(button => { for (let i = 0; i < 120; i++) (button as HTMLButtonElement).click(); });
  await page.getByRole("combobox", { name: "Select a particle to inspect it.", exact: true }).selectOption("0");
  await page.getByRole("checkbox", { name: "Compare", exact: true }).check();
  await expect(page.getByText("Paused · 2.0 seconds", { exact: true })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Select a particle to inspect it.", exact: true }).nth(0)).toHaveValue("0");
});
