import { type Route } from "@playwright/test";
import { expect, test } from "../infra/coverage";
import { getRandomString, initializeLocalStorage } from "../infra/utils";
import configuredUrls from "../config/urls.json";
import GraphPage from "../logic/POM/graphPage";

const baseUrl = process.env.E2E_BASE_URL ?? configuredUrls.localHost;

test.beforeEach(async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(initializeLocalStorage());
  await page.addInitScript(() => {
    localStorage.setItem("chatModelSource", "local");
    localStorage.setItem("model", "ollama::llama3.2");
  });
  await page.route("https://graphrag.falkordb.com/scripts/widget-chat.js*", route => route.abort());
  await page.addInitScript(() => {
    const originalFetch = window.fetch;
    let settled = 0;
    const markSettled = () => {
      // Run after the caller's promise handlers and React's resulting paint.
      setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(() => {
        document.documentElement.dataset.aiFixSettled = String(++settled);
      })), 0);
    };
    window.fetch = async (input, init) => {
      if (input !== "/api/chat/fix") return originalFetch(input, init);
      let response: Response;
      try {
        response = await originalFetch(input, init);
      } catch (error) {
        markSettled();
        throw error;
      }
      void response.clone().arrayBuffer().then(markSettled, markSettled);
      return response;
    };
  });
});

for (const dismissal of ["cancel", "edit", "tab-switch", "navigate"] as const) {
  test(`@admin Fix with AI aborts on ${dismissal}`, async ({ page }) => {
    const graphName = getRandomString("fixOwner");
    const pending = Promise.withResolvers<Route>();
    await page.route("**/api/chat/fix", route => { pending.resolve(route); });
    expect((await page.request.post(`${baseUrl}/api/graph/${graphName}`)).ok()).toBe(true);
    try {
      await page.goto(`${baseUrl}/graph?graph=${encodeURIComponent(graphName)}&query=RETURN%201`);
      const graph = new GraphPage(page);
      await expect(graph.editorContainer).toHaveAttribute("data-value", "RETURN 1", { timeout: 30_000 });
      await graph.insertQuery("RETRUN 1");
      await expect.poll(() => graph.hasEditorErrorMarker()).toBe(true);
      await graph.clickRunQuery(false);
      await page.getByTestId("fix-with-ai").click();
      const request = await pending.promise;
      await expect(page.getByTestId("aiFixCancel")).toBeVisible();
      if (dismissal === "navigate") {
        await expect(page).toHaveURL(url => url.searchParams.get("query") === "RETRUN 1");
      }
      const aborted = page.waitForEvent("requestfailed", {
        predicate: failed => failed.url().endsWith("/api/chat/fix"),
      });
      if (dismissal === "cancel") await page.getByTestId("aiFixCancel").click();
      else if (dismissal === "edit") await graph.insertQuery("RETURN 99");
      else if (dismissal === "tab-switch") await page.getByTestId("graphTabAdd").click();
      else {
        await page.getByRole("button", { name: "Adjust application settings", exact: true }).click();
        await expect(page).toHaveURL(/\/settings/, { timeout: 30_000 });
      }
      await aborted;
      await request.fulfill({ json: { explanation: "Stale result", correctedQuery: "RETURN 2" } });
      await expect(page.locator("html")).toHaveAttribute("data-ai-fix-settled", "1");
      await expect(page.getByTestId("aiFixCancel")).toHaveCount(0);
      await expect(page.getByTestId("aiFixResultPanel")).toHaveCount(0);
    } finally {
      expect((await page.request.delete(`${baseUrl}/api/graph/${graphName}`)).ok()).toBe(true);
    }
  });
}

for (const staleStatus of [200, 422, 401]) {
  test(`@admin stale Fix with AI ${staleStatus} cannot replace a newer result`, async ({ page }) => {
    // Simulate a transport that completes despite cancellation to exercise ownership.
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = (input, init) => originalFetch(input,
        input === "/api/chat/fix" ? { ...init, signal: undefined } : init);
    });
    const graphName = getRandomString("fixStale");
    const first = Promise.withResolvers<Route>();
    const second = Promise.withResolvers<Route>();
    let requests = 0;
    await page.route("**/api/chat/fix", route => { (requests++ === 0 ? first : second).resolve(route); });
    expect((await page.request.post(`${baseUrl}/api/graph/${graphName}`)).ok()).toBe(true);
    try {
      await page.goto(`${baseUrl}/graph?graph=${encodeURIComponent(graphName)}&query=RETURN%201`);
      const graph = new GraphPage(page);
      await expect(graph.editorContainer).toHaveAttribute("data-value", "RETURN 1", { timeout: 30_000 });
      await graph.insertQuery("RETRUN 1");
      await expect.poll(() => graph.hasEditorErrorMarker()).toBe(true);
      await graph.clickRunQuery(false);
      await page.getByTestId("fix-with-ai").click();
      const oldRequest = await first.promise;
      await page.getByTestId("aiFixCancel").click();
      await graph.insertQuery("RETRUN 3");
      await expect.poll(() => graph.hasEditorErrorMarker()).toBe(true);
      await graph.clickRunQuery(false);
      await page.getByTestId("fix-with-ai").click();
      const newRequest = await second.promise;
      await newRequest.fulfill({ json: { explanation: "Newest result", correctedQuery: "RETURN 3" } });
      await expect(page.getByTestId("aiFixQuery")).toHaveText("RETURN 3");
      await expect(page.locator("html")).toHaveAttribute("data-ai-fix-settled", "1");
      const response = page.waitForResponse("**/api/chat/fix");
      await oldRequest.fulfill({
        status: staleStatus,
        headers: staleStatus === 401 ? { "X-Session-Invalid": "1" } : {},
        json: staleStatus === 200
          ? { explanation: "Stale result", correctedQuery: "RETURN 2" }
          : { error: "Stale failure" },
      });
      await response;
      await expect(page.locator("html")).toHaveAttribute("data-ai-fix-settled", "2");
      await expect(page.getByTestId("aiFixQuery")).toHaveText("RETURN 3");
      await expect(page).toHaveURL(/\/graph/);
      await page.getByTestId("aiFixInsert").click();
      await expect(graph.editorContainer).toHaveAttribute("data-value", "RETURN 3");
    } finally {
      expect((await page.request.delete(`${baseUrl}/api/graph/${graphName}`)).ok()).toBe(true);
    }
  });
}

for (const scenario of ["edited-clear", "new-draft-success", "switch-failure", "session-invalid"] as const) {
  test(`@admin chat protects pending drafts during ${scenario}`, async ({ page }) => {
    const graphName = getRandomString("chatDraftRace");
    const draft = "Find my customers";
    if (scenario === "session-invalid") {
      await page.route("**/api/auth/signout", route => route.fulfill({ json: { url: `${baseUrl}/login` } }));
      await page.route("**/login", route => route.fulfill({ body: "Signed out" }));
    }
    const pending = Promise.withResolvers<Route>();
    await page.route("**/api/chat", route => { pending.resolve(route); });
    expect((await page.request.post(`${baseUrl}/api/graph/${graphName}`)).ok()).toBe(true);
    try {
      await page.goto(`${baseUrl}/graph?graph=${encodeURIComponent(graphName)}&query=RETURN%201`);
      await expect(page.getByTestId("chatToggleButton")).toBeEnabled({ timeout: 30_000 });
      if (!await page.getByTestId("chatInput").isVisible()) await page.getByTestId("chatToggleButton").click();
      const originalTab = await page.locator('[data-testid^="graphTabSelect-"]').first().getAttribute("data-testid");
      if (!originalTab) throw new Error("Missing originating tab");
      await page.getByTestId("chatInput").fill(draft);
      await page.getByTestId("chatSendButton").click();
      const request = await pending.promise;
      await expect(page.getByTestId("chatInput")).toHaveValue("");
      if (scenario === "edited-clear") {
        await page.getByTestId("chatInput").fill("Changed my mind");
        await page.getByTestId("chatInput").fill("");
      } else if (scenario === "new-draft-success") {
        await page.getByTestId("chatInput").fill("Keep this new draft");
      } else if (scenario === "switch-failure") {
        await page.getByTestId("graphTabAdd").click();
      }
      await request.fulfill(scenario === "session-invalid"
        ? { status: 401, headers: { "X-Session-Invalid": "1" }, json: { error: "Session expired" } }
        : scenario === "new-draft-success"
          ? { json: { answer: "Here is your answer" } }
          : { status: 422, json: { error: "Internal server error" } });
      if (scenario === "session-invalid") {
        await expect(page).toHaveURL(/\/login/);
        expect(await page.evaluate(name => Object.entries(localStorage).some(([key, value]) =>
          key.endsWith(`chatDraft-${name}`) && value === "Find my customers"), graphName)).toBe(true);
      } else if (scenario === "switch-failure") {
        await page.getByTestId(originalTab).click();
        await expect(page.getByTestId("chatInput")).toHaveValue(draft);
        await expect(page.getByTestId("chatMessagesList")).not.toContainText("Internal server error");
      } else {
        await expect(page.getByTestId("chatMessagesList")).toContainText(
          scenario === "edited-clear" ? "Internal server error" : "Here is your answer");
        await expect(page.getByTestId("chatInput")).toHaveValue(scenario === "edited-clear" ? "" : "Keep this new draft");
        await expect(page.getByTestId("chatMessagesList").getByRole("link", { name: "Go to Settings" })).toHaveCount(0);
      }
    } finally {
      expect((await page.request.delete(`${baseUrl}/api/graph/${graphName}`)).ok()).toBe(true);
    }
  });
}

test("@admin old Chat success cannot clear a resubmitted draft after reopening", async ({ page }) => {
  const graphName = getRandomString("chatReopen");
  const draft = "Keep this submitted draft";
  const first = Promise.withResolvers<Route>();
  const second = Promise.withResolvers<Route>();
  let requests = 0;
  await page.route("**/api/chat", route => {
    requests += 1;
    (requests === 1 ? first : second).resolve(route);
  });
  expect((await page.request.post(`${baseUrl}/api/graph/${graphName}`)).ok()).toBe(true);
  try {
    await page.goto(`${baseUrl}/graph?graph=${encodeURIComponent(graphName)}&query=RETURN%201`);
    await expect(page.getByTestId("chatToggleButton")).toBeEnabled({ timeout: 30_000 });
    if (!await page.getByTestId("chatInput").isVisible()) await page.getByTestId("chatToggleButton").click();
    await page.getByTestId("chatInput").fill(draft);
    await page.getByTestId("chatSendButton").click();
    const oldRequest = await first.promise;
    await page.getByTestId("chatCloseButton").click();
    await expect(page.getByTestId("chatInput")).toHaveCount(0);
    await page.getByTestId("chatToggleButton").click();
    await expect(page.getByTestId("chatInput")).toHaveValue(draft);
    await page.getByTestId("chatInput").fill("An intermediate edit");
    await page.getByTestId("chatInput").fill(draft);
    await page.getByTestId("chatSendButton").click();
    const newRequest = await second.promise;
    const oldResponse = page.waitForResponse(response => response.url().endsWith("/api/chat"));
    await oldRequest.fulfill({ json: { answer: "Old response" } });
    await oldResponse;
    await newRequest.fulfill({ status: 422, json: { error: "Internal server error" } });
    await expect(page.getByTestId("chatMessagesList")).toContainText("Internal server error");
    await expect(page.getByTestId("chatInput")).toHaveValue(draft);
    await page.getByTestId("chatCloseButton").click();
    await page.getByTestId("chatToggleButton").click();
    await expect(page.getByTestId("chatInput")).toHaveValue(draft);
  } finally {
    expect((await page.request.delete(`${baseUrl}/api/graph/${graphName}`)).ok()).toBe(true);
  }
});

for (const dismissal of ["tab-switch", "close"] as const) {
test(`@admin optimize cancels on ${dismissal} and allows a fresh request`, async ({ page }) => {
  const graphName = getRandomString("optimizeOwner");
  const pending = Promise.withResolvers<Route>();
  await page.route("**/api/chat/optimize", route => { pending.resolve(route); });
  expect((await page.request.post(`${baseUrl}/api/graph/${graphName}`)).ok()).toBe(true);
  try {
    await page.goto(`${baseUrl}/graph?graph=${encodeURIComponent(graphName)}&query=RETURN%201`);
    await expect(page.getByTestId("editorContainer")).toHaveAttribute("data-value", "RETURN 1", { timeout: 30_000 });
    const originalTab = await page.locator('[data-testid^="graphTabSelect-"]').first().getAttribute("data-testid");
    if (!originalTab) throw new Error("Missing originating tab");
    await page.getByTestId("editorOptimize").click();
    await page.getByTestId("aiOptimizeConsentConfirm").click();
    const request = await pending.promise;
    const aborted = page.waitForEvent("requestfailed", {
      predicate: failed => failed.url().endsWith("/api/chat/optimize"),
    });
    if (dismissal === "tab-switch") {
      await page.getByTestId("graphTabAdd").evaluate((element: HTMLButtonElement) => element.click());
    } else {
      await page.keyboard.press("Escape");
    }
    await aborted;
    await expect(page.getByTestId("aiOptimizeContent")).toHaveCount(0);
    if (dismissal === "tab-switch") await page.getByTestId(originalTab).click();
    await request.fulfill({ json: {
      explanation: "Stale result", suggestions: [], optimizedQuery: "RETURN 2", executionPlan: ["Results"],
    } });
    await expect(page.getByTestId("aiOptimizeApply")).toHaveCount(0);
    await expect(page.getByTestId("toast-destructive")).toHaveCount(0);
    await expect(page.getByTestId("editorOptimize")).toBeEnabled();
    await expect(page.getByTestId("editorContainer")).toHaveAttribute("data-value", "RETURN 1");
    const freshRequestPromise = page.waitForRequest("**/api/chat/optimize");
    await page.route("**/api/chat/optimize", route => route.fulfill({ json: {
      explanation: "Fresh result", suggestions: [], optimizedQuery: "RETURN 3", executionPlan: ["Results"],
    } }));
    await page.getByTestId("editorOptimize").click();
    await expect(page.getByTestId("aiOptimizeGuidance")).toHaveValue("");
    await page.getByTestId("aiOptimizeConsentConfirm").click();
    expect((await freshRequestPromise).postDataJSON().graphName).toBe(graphName);
    await expect(page.getByTestId("aiOptimizeQuery")).toHaveText("RETURN 3");
  } finally {
    expect((await page.request.delete(`${baseUrl}/api/graph/${graphName}`)).ok()).toBe(true);
  }
});
}
