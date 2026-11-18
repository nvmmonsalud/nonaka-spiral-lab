import { expect, test } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";

// Catches a missing simulator → workshop link, a lossy local round trip, or any
// attempted external/model/API request across navigation and draft actions.
for (const width of [1280, 375]) {
  test(`simulator links directly to a local workshop round trip at ${width}px`, async ({ page, context, baseURL }, testInfo) => {
    const origin = new URL(baseURL!).origin;
    const requests: { method: string; url: string; type: string; navigation: boolean }[] = [];
    const forbiddenAttempts: string[] = [];
    const pageErrors: string[] = [];
    context.on("request", (request) => requests.push({
      method: request.method(), url: request.url(), type: request.resourceType(), navigation: request.isNavigationRequest(),
    }));
    // Record every attempt before blocking it, so the guard cannot hide a leak.
    await context.route("**/*", (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.protocol === "blob:") return route.continue();
      if (url.origin !== origin || /^\/api(?:\/|$)/.test(url.pathname) || request.method() !== "GET") {
        forbiddenAttempts.push(`${request.method()} ${request.url()}`);
        return route.abort();
      }
      return route.continue();
    });
    await context.routeWebSocket("**/*", (socket) => {
      const url = new URL(socket.url());
      if (url.host === new URL(origin).host && url.pathname === "/_next/hmr") {
        socket.connectToServer();
      } else {
        forbiddenAttempts.push(`WebSocket ${socket.url()}`);
        socket.close();
      }
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    const draft = {
      version: 1,
      task: "Sort invented practice cards / 架空の練習カードを分類する",
      conditions: "Paper desk exercise; no live machinery or customer records.",
      observations: "Read the symbol; set unclear symbols aside and ask the facilitator.",
      sources: "Invented card key v1, rule 1; synthetic cards 1–6.",
      reviewer: "Fictional Integration Reviewer",
      status: "reviewed",
    };
    const labels = {
      task: "Task / 作業", conditions: "Conditions / 条件", observations: "Observations / 観察",
      sources: "Sources / 出典", reviewer: "Reviewer / レビュー担当者",
    } as const;
    try {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await page.getByRole("navigation").getByRole("link", { name: "Simulator", exact: true }).click();
      await expect(page).toHaveURL(`${origin}/simulator`);
      const workshopLink = page.getByRole("navigation").getByRole("link", { name: /Workshop/ });
      await expect(workshopLink).toBeVisible();
      await page.getByRole("navigation").getByRole("link", { name: "Home", exact: true }).focus();
      await page.keyboard.press("Tab");
      await expect(workshopLink).toBeFocused();
      expect(await workshopLink.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(`${origin}/workshop`);
      await expect(page.getByRole("heading", { name: /Manual knowledge transfer/ })).toBeVisible();
      await expect(page.getByText("Synthetic or sanitized examples only", { exact: true })).toBeVisible();
      for (const field of Object.keys(labels) as (keyof typeof labels)[]) {
        await page.getByLabel(labels[field], { exact: true }).fill(draft[field]);
      }
      const status = page.getByLabel("Review status / レビュー状態", { exact: true });
      await expect(status).toHaveValue("draft");
      // A UI declaration by automation is not a human review or approval.
      await status.selectOption("reviewed");
      await expect(status).toHaveValue("reviewed");
      await page.getByRole("checkbox", { name: /I understand/ }).check();
      await page.getByRole("button", { name: "Save locally / このブラウザーに保存", exact: true }).click();
      await expect(page.getByRole("status")).toContainText("Saved locally");
      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Export JSON / JSONを書き出す", exact: true }).click();
      const download = await downloadPromise;
      const exported = await readFile((await download.path())!, "utf8");
      expect(JSON.parse(exported)).toEqual(draft);
      await page.getByRole("button", { name: "Clear draft and saved copy / 下書きと保存済みデータを消去", exact: true }).click();
      for (const label of Object.values(labels)) await expect(page.getByLabel(label, { exact: true })).toHaveValue("");
      await expect(status).toHaveValue("draft");
      expect(await page.evaluate(() => localStorage.getItem("knowledge-spiral-workshop-draft-v1"))).toBeNull();
      await page.getByLabel("Import JSON / JSONを読み込む", { exact: true }).setInputFiles({
        name: download.suggestedFilename(), mimeType: "application/json", buffer: Buffer.from(exported),
      });
      await expect(page.getByRole("status")).toContainText("Imported into this tab only");
      for (const field of Object.keys(labels) as (keyof typeof labels)[]) {
        await expect(page.getByLabel(labels[field], { exact: true })).toHaveValue(draft[field]);
      }
      await expect(status).toHaveValue("reviewed");
      expect(await page.evaluate(() => localStorage.getItem("knowledge-spiral-workshop-draft-v1"))).toBeNull();
      expect(await page.getByRole("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      expect(requests.some((request) => request.navigation && request.url === `${origin}/`)).toBe(true);
      expect(requests.some((request) => new URL(request.url).pathname === "/simulator")).toBe(true);
      expect(requests.some((request) => new URL(request.url).pathname === "/workshop")).toBe(true);
      expect(requests.filter((request) => {
        const url = new URL(request.url);
        return url.protocol !== "blob:" && (url.origin !== origin || /^\/api(?:\/|$)/.test(url.pathname) || request.method !== "GET");
      })).toEqual([]);
      expect(forbiddenAttempts).toEqual([]);
      expect(pageErrors).toEqual([]);
    } finally {
      const networkPath = testInfo.outputPath("navigation-and-workshop-network.json");
      await writeFile(networkPath, JSON.stringify({ requests, forbiddenAttempts, pageErrors }, null, 2));
      await testInfo.attach("navigation-and-workshop-network", {
        path: networkPath, contentType: "application/json",
      });
    }
  });
}
