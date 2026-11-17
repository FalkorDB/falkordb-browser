import { expect, test } from "../infra/coverage";
import type { Page } from "@playwright/test";
import { createServer } from "node:http";
import GraphPage from "../logic/POM/graphPage";
import AiAssistComponent from "../logic/POM/aiAssistComponent";
import { getRandomString, initializeLocalStorage, waitForChatKeyMigration } from "../infra/utils";
import configuredUrls from "../config/urls.json";

const baseUrl = process.env.E2E_BASE_URL ?? configuredUrls.localHost;
const urls = { graphUrl: `${baseUrl}/graph`, api: { graphUrl: `${baseUrl}/api/graph/` } };

const TEST_KEY = "sk-demo-not-a-real-api-key";

function holdSettingsResponse(page: Page) {
  let release!: () => void;
  let signalStarted!: () => void;
  const started = new Promise<void>(resolve => { signalStarted = resolve; });
  const gate = new Promise<void>(resolve => { release = resolve; });
  const installed = page.route(url => url.pathname === "/settings", async route => {
    const headers = route.request().headers();
    if (headers["next-router-prefetch"] === "1" || headers.purpose === "prefetch") return route.continue();
    signalStarted();
    await gate;
    await route.continue();
  });
  return { installed, started, release };
}

test("@admin a retained optimization toast cannot leak URL synchronization after unmount", async ({ page }) => {
  test.setTimeout(60_000);
  const graphName = getRandomString("retainedToast");
  let releaseSettingsResponse: (() => void) | undefined;
  let query = "RETURN 1";
  await page.addInitScript(initializeLocalStorage());
  await page.addInitScript(() => {
    localStorage.setItem("chatModelSource", "local");
    localStorage.setItem("localLlmProvider", "ollama");
    localStorage.setItem("model", "ollama::llama3.2");
  });
  await page.route("**/api/chat/optimize", route => route.fulfill({
    status: 422, json: { error: "Unable to reach the AI provider. Please try again." },
  }));
  const created = await page.request.post(`${urls.api.graphUrl}${graphName}`, {
    headers: { Origin: new URL(baseUrl).origin },
  });
  expect(created.ok()).toBe(true);
  try {
    await page.clock.install();
    await page.goto(`${urls.graphUrl}?graph=${graphName}&query=RETURN%201`);
    await expect(page.getByTestId("editorContainer")).toHaveAttribute("data-value", "RETURN 1", { timeout: 30000 });
    const ai = new AiAssistComponent(page);
    await ai.openOptimize();
    await ai.optimizeAnalyzeButton.click();
    await expect(page.getByTestId("toast-title")).toHaveText("Query optimization failed");
    await page.getByTestId("settings").click();
    await expect(page).toHaveURL(/\/settings/, { timeout: 30000 });
    await page.goBack();
    await expect(page.getByTestId("editorContainer")).toHaveAttribute("data-value", query);
    await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now() + 250)));
    query = "RETURN 4242 AS retained_toast_draft";
    await new GraphPage(page).insertQuery(query, { focus: false });
    const settingsResponse = holdSettingsResponse(page);
    releaseSettingsResponse = settingsResponse.release;
    await settingsResponse.installed;
    await page.getByRole("button", { name: "Go to Settings", exact: true }).evaluate(button => {
      (button as HTMLButtonElement).click();
    });
    await settingsResponse.started;
    await page.clock.runFor(350);
    settingsResponse.release();
    releaseSettingsResponse = undefined;
    await expect(page).toHaveURL(/\/settings/, { timeout: 30_000 });
    await page.clock.resume();
    await page.getByTestId("settingsTabConfigurations").click();
    await expect.poll(() => new URL(page.url()).searchParams.get("tab")).toBe("Configurations");
    await page.goBack();
    await expect(page.getByTestId("editorContainer")).toHaveAttribute("data-value", query);
    await page.goForward();
    await expect(page).toHaveURL(/\/settings/);
    await expect.poll(() => new URL(page.url()).searchParams.get("tab")).toBe("Configurations");
  } finally {
    releaseSettingsResponse?.();
    await page.close();
    const removed = await page.request.delete(`${urls.api.graphUrl}${graphName}`, {
      headers: { Origin: new URL(baseUrl).origin },
    });
    expect(removed.ok()).toBe(true);
  }
});

test("@admin Optimize identifies LM Studio as the local data recipient", async ({ page }) => {
  const graphName = getRandomString("aiOptimizeLmStudio");
  await page.addInitScript(initializeLocalStorage());
  await page.addInitScript(() => {
    localStorage.setItem("chatModelSource", "local");
    localStorage.setItem("localLlmProvider", "lmstudio");
    localStorage.setItem("model", "openai::local-test-model");
  });
  await page.route("https://graphrag.falkordb.com/scripts/widget-chat.js*", route => route.abort());
  expect((await page.request.post(`${urls.api.graphUrl}${graphName}`, {
    headers: { Origin: new URL(baseUrl).origin },
  })).ok()).toBe(true);
  try {
    await page.goto(`${urls.graphUrl}?graph=${encodeURIComponent(graphName)}&query=RETURN%201`);
    const ai = new AiAssistComponent(page);
    await expect(ai.editorContainer).toHaveAttribute("data-value", "RETURN 1", { timeout: 30_000 });
    await ai.openOptimize();
    await expect(ai.optimizeDialog).toContainText("will be sent to LM Studio");
    await expect(ai.optimizeDialog).not.toContainText("will be sent to OpenAI");
    await ai.optimizeCancelButton.click();
  } finally {
    expect((await page.request.delete(`${urls.api.graphUrl}${graphName}`, {
      headers: { Origin: new URL(baseUrl).origin },
    })).ok()).toBe(true);
  }
});

test("@admin query assistance routes preserve provider error status without leaking its body", async ({ page }) => {
  const graphName = getRandomString("aiProviderStatus");
  let providerStatus = 401;
  const server = createServer((request, response) => {
    request.resume();
    response.writeHead(providerStatus, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: { message: "private provider detail" } }));
  });
  await new Promise<void>(resolve => { server.listen(0, "127.0.0.1", resolve); });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing test provider address");
  try {
    expect((await page.request.post(`${urls.api.graphUrl}${graphName}`, {
      headers: { Origin: new URL(baseUrl).origin },
    })).ok()).toBe(true);
    try {
      for (const feature of ["fix", "optimize"]) {
        for (const status of [401, 429, 503]) {
          providerStatus = status;
          const response = await page.request.post(`${baseUrl}/api/chat/${feature}`, {
            headers: { Origin: new URL(baseUrl).origin },
            data: {
              query: "RETURN 1",
              errorMessage: "Syntax error",
              graphName,
              model: "ollama::test-model",
              modelSource: "local",
              localProvider: "ollama",
              localEndpoint: `http://127.0.0.1:${address.port}`,
            },
          });
          expect(response.status()).toBe(status === 401 ? 401 : 422);
          expect(response.headers()["x-session-invalid"]).toBeUndefined();
          const body = await response.json();
          expect(body.error).toMatch(status === 401 ? /API key/ : status === 429 ? /rate limit/ : /temporarily unavailable/);
          expect(body.error).not.toContain("private provider detail");
        }
      }
    } finally {
      expect((await page.request.delete(`${urls.api.graphUrl}${graphName}`, {
        headers: { Origin: new URL(baseUrl).origin },
      })).ok()).toBe(true);
    }
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close(error => { if (error) reject(error); else resolve(); });
    });
  }
});

test("@admin optimize asks for per-request guidance without a remembered-consent checkbox", async ({ page }) => {
  const graphName = getRandomString("aiOptimizeGuidance");
  await page.addInitScript(initializeLocalStorage());
  await page.addInitScript(key => {
    localStorage.setItem("chatModelSource", "api-key");
    localStorage.setItem("model", "gpt-4o-mini");
    localStorage.setItem("secretKey", key);
  }, TEST_KEY);
  await page.route("https://graphrag.falkordb.com/scripts/widget-chat.js*", route => route.abort());
  const requests: Record<string, unknown>[] = [];
  await page.route("**/api/chat/optimize", route => {
    requests.push(route.request().postDataJSON());
    return route.fulfill({ json: { explanation: "Review complete.", suggestions: [], executionPlan: ["Results"] } });
  });
  expect((await page.request.post(`${urls.api.graphUrl}${graphName}`, {
    headers: { Origin: new URL(baseUrl).origin },
  })).ok()).toBe(true);
  try {
    await page.goto(`${urls.graphUrl}?graph=${encodeURIComponent(graphName)}&query=RETURN%201`);
    const ai = new AiAssistComponent(page);
    await expect(ai.editorContainer).toHaveAttribute("data-value", "RETURN 1", { timeout: 30_000 });
    await waitForChatKeyMigration(page);
    for (const guidance of ["Prioritize latency.", ""]) {
      await ai.openOptimize();
      await expect(ai.optimizeGuidance).toHaveValue("");
      await expect(ai.optimizeDontAskAgain).toHaveCount(0);
      await ai.optimizeGuidance.fill(guidance);
      const requestCount = requests.length;
      await ai.optimizeAnalyzeButton.click();
      await expect(ai.optimizeExplanation).toHaveText("Review complete.");
      expect(requests).toHaveLength(requestCount + 1);
      expect(requests.at(-1)?.guidance).toBe(guidance || undefined);
      expect(await page.evaluate(() => localStorage.getItem("aiOptimizeConsent-openai"))).toBeNull();
      await ai.optimizeCloseButton.click();
    }
  } finally {
    expect((await page.request.delete(`${urls.api.graphUrl}${graphName}`, {
      headers: { Origin: new URL(baseUrl).origin },
    })).ok()).toBe(true);
  }
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  for (const feature of ["chat", "fix", "optimize"] as const) {
    test(`@admin ${feature} copies and inserts without execution at ${viewport.width}px`, async ({ page }) => {
      test.setTimeout(60_000);
      const graphName = getRandomString("aiQueryCards");
      const query = "RETURN 4242 AS unsent_draft";
      const invalidQuery = "MATCH (n) RETsURN n";
      const suggestion = feature === "chat"
        ? `WITH 4242 AS unsent_draft\n${"WITH unsent_draft\n".repeat(30)}RETURN unsent_draft`
        : feature === "fix"
          ? `WITH 4242 AS unsent_draft\n${"WITH unsent_draft\n".repeat(40)}RETURN unsent_draft`
          : "WITH 4242 AS unsent_draft\nWITH unsent_draft\nRETURN unsent_draft";
      let providerPrompt = "";
      let queryRequests = 0;
      const server = createServer((request, response) => {
        let body = "";
        request.on("data", chunk => { body += chunk; });
        request.on("end", () => {
          providerPrompt = body;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({
            choices: [{ message: { content: JSON.stringify({
              explanation: "This query already has a simple execution plan.",
              suggestions: ["Review the execution plan before adding more traversals."],
              optimizedQuery: suggestion,
            }) } }],
          }));
        });
      });
      await new Promise<void>(resolve => { server.listen(0, "127.0.0.1", resolve); });
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Missing test provider address");

      try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.addInitScript(initializeLocalStorage());
        await page.addInitScript(endpoint => {
          localStorage.setItem("chatModelSource", "local");
          localStorage.setItem("localLlmProvider", "ollama");
          localStorage.setItem("localLlmEndpoint", endpoint);
          localStorage.setItem("model", "ollama::llama3.2");
        }, `http://127.0.0.1:${address.port}`);
        await page.route("https://graphrag.falkordb.com/scripts/widget-chat.js*", route => route.abort());
        await page.route("**/api/chat", route => route.fulfill({
          json: { cypherQuery: suggestion, answer: "Review this query before running it." },
        }));
        await page.route("**/api/chat/fix", route => route.fulfill({
          json: { explanation: "Use the corrected query.", correctedQuery: suggestion },
        }));
        await page.addInitScript(() => {
          Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText: async (value: string) => { sessionStorage.setItem("copiedQuery", value); } },
          });
        });
        const created = await page.request.post(`${urls.api.graphUrl}${graphName}`, {
          headers: { Origin: new URL(baseUrl).origin },
        });
        expect(created.ok()).toBe(true);
        try {
          await page.goto(`${urls.graphUrl}?graph=${encodeURIComponent(graphName)}&query=${encodeURIComponent(query)}`);
          const editor = page.getByTestId("editorContainer");
          await expect(editor).toHaveAttribute("data-value", query, { timeout: 30_000 });
          if (await page.getByTestId("chatCloseButton").isVisible()) await page.getByTestId("chatCloseButton").click();
          await page.setViewportSize(viewport);
          if (viewport.width < 1100) await expect(page.getByTestId("editorMore")).toBeVisible();
          page.on("request", request => {
            const url = new URL(request.url());
            if (decodeURIComponent(url.pathname) !== `/api/graph/${graphName}`) return;
            const executedQuery = request.method() === "POST" && request.postData()
              ? (request.postDataJSON() as { query?: string } | null)?.query ?? ""
              : url.searchParams.get("query") ?? "";
            if (["GET", "POST"].includes(request.method())
              && decodeURIComponent(url.pathname) === `/api/graph/${graphName}`
              && [query, suggestion, invalidQuery].some(testedQuery => executedQuery.includes(testedQuery))) queryRequests += 1;
          });
          const ai = new AiAssistComponent(page);
          if (feature === "optimize") {
            if (viewport.width < 1100) await page.getByTestId("editorMore").click();
            await page.getByTestId("editorOptimize").click();
            const result = page.getByTestId("aiOptimizeContent");
            await expect(ai.optimizeGuidance).toHaveValue("");
            await expect(ai.optimizeGuidance).toBeInViewport();
            expect(providerPrompt).toBe("");
            await ai.optimizeGuidance.fill("Focus on reducing scans without changing the returned rows.");
            await ai.optimizeAnalyzeButton.click();
            await expect(page.getByTestId("aiOptimizeQuery")).toHaveText(suggestion);
            await page.getByTestId("aiOptimizePlan").getByText("EXPLAIN execution plan", { exact: true }).click();
            await expect(page.getByTestId("aiOptimizePlanText")).toContainText("Results");
            expect(providerPrompt).toContain("FalkorDB EXPLAIN plan");
            expect(providerPrompt).toContain("Results");
            expect(providerPrompt).toContain("Focus on reducing scans without changing the returned rows.");
            const bounds = await result.boundingBox();
            if (!bounds) throw new Error("Missing Optimize dialog bounds");
            expect(bounds.x).toBeGreaterThanOrEqual(0);
            expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
            expect(await result.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
            await page.getByTestId("aiOptimizeCopy").click();
            await expect(page.getByTestId("aiOptimizeCopy")).toHaveText("Copied!");
            expect(await page.evaluate(() => sessionStorage.getItem("copiedQuery"))).toBe(suggestion);
            await expect(editor).toHaveAttribute("data-value", query);
            await page.getByTestId("aiOptimizeApply").click();
            await ai.openOptimize(viewport.width < 1100);
            await expect(ai.optimizeGuidance).toHaveValue("");
            await ai.optimizeGuidance.fill("Discard this goal on cancel");
            await ai.optimizeCancelButton.click();
            await ai.openOptimize(viewport.width < 1100);
            await expect(ai.optimizeGuidance).toHaveValue("");
            await ai.optimizeAnalyzeButton.click();
            await expect(ai.optimizeExplanation).toContainText("This query already has a simple execution plan.");
            expect(providerPrompt).not.toContain("User optimization goal:");
            expect(providerPrompt).not.toContain("Discard this goal on cancel");
            await ai.optimizeCloseButton.click();
          } else if (feature === "fix") {
            const graph = new GraphPage(page);
            await graph.insertQuery(invalidQuery);
            await graph.clickRunQuery(false);
            queryRequests = 0;
            await page.getByTestId("fix-with-ai").click();
            await expect(page.getByTestId("aiFixQuery")).toHaveText(suggestion);
            await page.getByTestId("aiFixCopy").click();
            await expect(page.getByTestId("aiFixCopy")).toHaveText("Copied!");
            expect(await page.evaluate(() => sessionStorage.getItem("copiedQuery"))).toBe(suggestion);
            await expect(editor).toHaveAttribute("data-value", invalidQuery);
            await ai.fixInsertButton.scrollIntoViewIfNeeded();
            await expect(ai.fixInsertButton).toBeInViewport();
            expect(await ai.fixResultCard.evaluate(element => element.scrollHeight <= element.clientHeight)).toBe(true);
            await ai.fixInsertButton.click();
          } else {
            await page.getByTestId("chatToggleButton").click();
            await page.getByTestId("chatInput").fill("Suggest a query");
            await page.getByTestId("chatSendButton").click();
            const suggestedQuery = page.getByTestId("chatSuggestedQuery");
            await expect(suggestedQuery).toHaveText(suggestion);
            await expect(page.getByRole("group", { name: "Suggested query", exact: true })).toHaveText(suggestion);
            await expect(page.getByTestId("chatSuggestedQuery")).toHaveCSS("word-break", "normal");
            await expect(page.getByTestId("chatSuggestedQuery")).toHaveCSS("overflow-wrap", "break-word");
            expect(await page.getByTestId("chatSuggestedQuery").evaluate(element =>
              parseFloat(getComputedStyle(element).fontSize))).toBeLessThanOrEqual(14);
            expect(await suggestedQuery.evaluate(element =>
              element.scrollWidth <= element.clientWidth)).toBe(true);
            await expect(suggestedQuery).toHaveAttribute("tabindex", "0");
            expect(await suggestedQuery.evaluate(element =>
              element.scrollHeight > element.clientHeight && element.clientHeight <= 288)).toBe(true);
            await suggestedQuery.focus();
            await page.keyboard.press("End");
            await expect.poll(() => suggestedQuery.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
            const collapseButton = page.getByRole("button", { name: "Collapse query" });
            await expect(collapseButton).toBeVisible();
            await collapseButton.click();
            await expect(page.getByRole("button", { name: "Expand query" })).toHaveAttribute("aria-expanded", "false");
            await page.getByRole("button", { name: "Expand query" }).click();
            await page.getByTestId("chatCopyQueryButton").click();
            expect(await page.evaluate(() => sessionStorage.getItem("copiedQuery"))).toBe(suggestion);
            await expect(editor).toHaveAttribute("data-value", query);
            await page.getByTestId("chatInsertQueryButton").click();
            if (viewport.width < 1100) await page.getByTestId("chatCloseButton").click();
          }
          await expect(editor).toHaveAttribute("data-value", suggestion);
          expect(queryRequests).toBe(0);
        } finally {
          const removed = await page.request.delete(`${urls.api.graphUrl}${graphName}`, {
            headers: { Origin: new URL(baseUrl).origin },
          });
          expect(removed.ok()).toBe(true);
        }
      } finally {
        await new Promise<void>((resolve, reject) => {
          server.close(error => { if (error) reject(error); else resolve(); });
        });
      }
    });
  }
}

const cases = (["chat", "fix", "optimize"] as const).flatMap(feature =>
  (["missing-key", "provider-error"] as const).map(scenario => ({ feature, scenario })));

for (const { feature, scenario } of cases) {
  test(`@admin ${feature} preserves drafts through ${scenario} Settings navigation`, async ({ page }) => {
    test.setTimeout(60_000);
    const graphName = getRandomString("aiSettingsDraft");
    let query = feature === "fix" ? "MATCH (n) RETsURN n" : "RETURN 4242 AS unsent_draft";
    const chatDraft = "Find the person with the largest order";
    let aiRequests = 0;
    let releaseSettingsResponse: (() => void) | undefined;
    let chatClosedWhileNavigationPending = false;

    await page.addInitScript(initializeLocalStorage());
    await page.addInitScript(providerError => {
      localStorage.setItem("chatModelSource", providerError ? "local" : "api-key");
      localStorage.setItem("model", providerError ? "ollama::llama3.2" : "gpt-4o-mini");
      localStorage.setItem("localLlmProvider", "ollama");
      localStorage.removeItem("secretKey");
      for (let index = localStorage.length - 1; index >= 0; index -= 1) {
        const key = localStorage.key(index);
        if (key && (key.endsWith("chatApiKeys") || key.endsWith("selectedChatApiKeyId"))) {
          localStorage.removeItem(key);
        }
      }
    }, scenario === "provider-error");
    await page.route("**/api/chat/models", route => route.fulfill({
      json: { models: ["gpt-4o-mini"] },
    }));
    await page.route("https://graphrag.falkordb.com/scripts/widget-chat.js*", route => route.abort());
    await page.route(/\/api\/chat(?:\/(?:fix|optimize))?$/, async route => {
      aiRequests += 1;
      await route.fulfill({ json: { error: "Unable to reach the AI provider. Please try again." }, status: 422 });
    });

    const created = await page.request.post(`${urls.api.graphUrl}${graphName}`, {
      headers: { Origin: new URL(baseUrl).origin },
    });
    expect(created.ok()).toBe(true);
    try {
      if (feature === "fix" && scenario === "missing-key") await page.clock.install();
      await page.goto(`${urls.graphUrl}?graph=${encodeURIComponent(graphName)}&query=${encodeURIComponent(query)}`);
      const graph = new GraphPage(page);
      await expect(graph.editorContainer).toHaveAttribute("data-value", query, { timeout: 30_000 });

      if (feature === "chat") {
        await page.getByTestId("chatToggleButton").click();
        await page.getByTestId("chatInput").fill(chatDraft);
        await page.getByTestId("chatSendButton").click();
      } else if (feature === "fix") {
        await expect.poll(() => graph.hasEditorErrorMarker()).toBe(true);
        await graph.clickRunQuery(false);
        await page.getByTestId("fix-with-ai").click();
      } else {
        if (scenario === "missing-key") {
          await expect.poll(() => new URL(page.url()).searchParams.get("tab")).not.toBeNull();
          // Fire the pending draft debounce while the Settings response is held.
          await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
          await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
          query += "\n";
          await graph.insertQuery(query);
          await page.route(url => url.pathname === "/settings", async route => {
            await page.clock.runFor(350);
            await route.continue();
          });
        }
        await page.getByTestId("editorOptimize").click();
        if (scenario === "provider-error") await new AiAssistComponent(page).optimizeAnalyzeButton.click();
      }

      if (scenario === "missing-key") {
        await expect(page.getByTestId("toast-title")).toHaveText("No API Key Provided");
        if (feature === "fix") {
          await page.getByTestId("settings").click();
          await expect(page).toHaveURL(/\/settings/, { timeout: 30_000 });
          await page.goBack();
          await expect(graph.editorContainer).toHaveAttribute("data-value", query);
          await expect(page.getByRole("button", { name: "Go to Settings", exact: true })).toBeVisible();
          await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now() + 250)));
          query = "RETURN 4242 AS retained_fix_draft";
          await graph.insertQuery(query, { focus: false });
          const settingsResponse = holdSettingsResponse(page);
          releaseSettingsResponse = settingsResponse.release;
          await settingsResponse.installed;
          await page.getByRole("button", { name: "Go to Settings", exact: true }).evaluate(button => {
            (button as HTMLButtonElement).click();
          });
          await settingsResponse.started;
          await page.clock.runFor(350);
          settingsResponse.release();
          releaseSettingsResponse = undefined;
        } else {
          await page.getByRole("button", { name: "Go to Settings", exact: true }).click();
        }
      } else if (feature === "optimize") {
        await expect(page.getByTestId("toast-title")).toHaveText("Query optimization failed");
        await expect(page.getByTestId("toast-description")).toContainText("Unable to reach the AI provider");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(page.getByTestId("toast-destructive")).toHaveCount(1);
        await page.getByRole("button", { name: "Go to Settings", exact: true }).click();
      } else {
        const errorContainer = page.getByTestId(feature === "chat" ? "chatMessagesList" : "aiFixResultBody");
        await expect(errorContainer).toContainText("Unable to reach the AI provider");
        if (feature === "chat" && scenario === "provider-error") {
          await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
          await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
          query += "\n";
          await graph.insertQuery(query);
          const settingsResponse = holdSettingsResponse(page);
          releaseSettingsResponse = settingsResponse.release;
          await settingsResponse.installed;
          await errorContainer.getByRole("link", { name: "Go to Settings", exact: true }).evaluate(link => {
            (link as HTMLAnchorElement).click();
          });
          await settingsResponse.started;
          await page.clock.runFor(350);
          await page.getByTestId("chatCloseButton").click();
          chatClosedWhileNavigationPending = true;
          settingsResponse.release();
          releaseSettingsResponse = undefined;
        } else {
          await errorContainer.getByRole("link", { name: "Go to Settings", exact: true }).click();
        }
      }
      await expect(page).toHaveURL(/\/settings/, { timeout: 30_000 });
      if ((feature === "optimize" && scenario === "missing-key")
        || (feature === "fix" && scenario === "missing-key")
        || (feature === "chat" && scenario === "provider-error")) await page.clock.resume();
      if (scenario === "missing-key") {
        await page.getByTestId("chatSectionHeader").click();
        await page.getByTestId("chatApiKeyInput").fill(TEST_KEY);
        await page.getByTestId("addChatApiKeyButton").click();
        await expect(page.getByTestId("chatApiKeyCard")).toHaveCount(1, { timeout: 30_000 });
      }

      await page.goBack();
      await expect(graph.editorContainer).toHaveAttribute("data-value", query);
      if (feature === "chat") {
        if (chatClosedWhileNavigationPending && !(await page.getByTestId("chatInput").isVisible())) {
          await page.getByTestId("chatToggleButton").click();
        }
        await expect(page.getByTestId("chatInput")).toHaveValue(chatDraft);
        await page.getByTestId("chatCloseButton").click();
        await page.getByTestId("chatToggleButton").click();
        await expect(page.getByTestId("chatInput")).toHaveValue(chatDraft);
      }
      expect(aiRequests).toBe(scenario === "missing-key" ? 0 : 1);
    } finally {
      releaseSettingsResponse?.();
      const removed = await page.request.delete(`${urls.api.graphUrl}${graphName}`, {
        headers: { Origin: new URL(baseUrl).origin },
      });
      expect(removed.ok()).toBe(true);
    }
  });
}
