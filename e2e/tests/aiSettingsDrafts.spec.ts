import { expect, test } from "../infra/coverage";
import { createServer } from "node:http";
import GraphPage from "../logic/POM/graphPage";
import { getRandomString, initializeLocalStorage } from "../infra/utils";
import configuredUrls from "../config/urls.json";

const baseUrl = process.env.E2E_BASE_URL ?? configuredUrls.localHost;
const urls = { graphUrl: `${baseUrl}/graph`, api: { graphUrl: `${baseUrl}/api/graph/` } };

const TEST_KEY = "sk-demo-not-a-real-api-key";

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
    expect((await page.request.post(`${urls.api.graphUrl}${graphName}`)).ok()).toBe(true);
    try {
      for (const feature of ["fix", "optimize"]) {
        for (const status of [401, 429, 503]) {
          providerStatus = status;
          const response = await page.request.post(`${baseUrl}/api/chat/${feature}`, {
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
      expect((await page.request.delete(`${urls.api.graphUrl}${graphName}`)).ok()).toBe(true);
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
  expect((await page.request.post(`${urls.api.graphUrl}${graphName}`)).ok()).toBe(true);
  try {
    await page.goto(`${urls.graphUrl}?graph=${encodeURIComponent(graphName)}&query=RETURN%201`);
    await expect(page.getByTestId("editorContainer")).toHaveAttribute("data-value", "RETURN 1", { timeout: 30_000 });
    for (const guidance of ["Prioritize latency.", ""]) {
      await page.getByTestId("editorOptimize").click();
      await expect(page.getByTestId("aiOptimizeGuidance")).toHaveValue("");
      await expect(page.getByTestId("aiOptimizeDontAskAgain")).toHaveCount(0);
      await page.getByTestId("aiOptimizeGuidance").fill(guidance);
      const requestCount = requests.length;
      await page.getByTestId("aiOptimizeConsentConfirm").click();
      await expect(page.getByTestId("aiOptimizeExplanation")).toHaveText("Review complete.");
      expect(requests).toHaveLength(requestCount + 1);
      expect(requests.at(-1)?.guidance).toBe(guidance || undefined);
      expect(await page.evaluate(() => localStorage.getItem("aiOptimizeConsent-openai"))).toBeNull();
      await page.getByTestId("closeAiOptimize").click();
    }
  } finally {
    expect((await page.request.delete(`${urls.api.graphUrl}${graphName}`)).ok()).toBe(true);
  }
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  for (const feature of ["chat", "fix", "optimize"] as const) {
    test(`@admin ${feature} copies and inserts without execution at ${viewport.width}px`, async ({ page }) => {
      test.setTimeout(60_000);
      const graphName = getRandomString("aiQueryCards");
      const query = "RETURN 4242 AS unsent_draft";
      const invalidQuery = "MATCH (n) RETsURN n";
      const suggestion = feature === "fix"
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
        const created = await page.request.post(`${urls.api.graphUrl}${graphName}`);
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
            const executedQuery = url.searchParams.get("query") ?? "";
            if (request.method() === "GET"
              && decodeURIComponent(url.pathname) === `/api/graph/${graphName}`
              && [query, suggestion, invalidQuery].some(testedQuery => executedQuery.includes(testedQuery))) queryRequests += 1;
          });
          if (feature === "optimize") {
            if (viewport.width < 1100) await page.getByTestId("editorMore").click();
            await page.getByTestId("editorOptimize").click();
            const result = page.getByTestId("aiOptimizeContent");
            const guidance = page.getByTestId("aiOptimizeGuidance");
            await expect(guidance).toHaveValue("");
            await expect(guidance).toBeInViewport();
            expect(providerPrompt).toBe("");
            await guidance.fill("Focus on reducing scans without changing the returned rows.");
            await page.getByTestId("aiOptimizeConsentConfirm").click();
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
            if (viewport.width < 1100) await page.getByTestId("editorMore").click();
            await page.getByTestId("editorOptimize").click();
            await expect(page.getByTestId("aiOptimizeGuidance")).toHaveValue("");
            await page.getByTestId("aiOptimizeGuidance").fill("Discard this goal on cancel");
            await page.getByRole("button", { name: "Cancel", exact: true }).click();
            if (viewport.width < 1100) await page.getByTestId("editorMore").click();
            await page.getByTestId("editorOptimize").click();
            await expect(page.getByTestId("aiOptimizeGuidance")).toHaveValue("");
            await page.getByTestId("aiOptimizeConsentConfirm").click();
            await expect(page.getByTestId("aiOptimizeExplanation")).toContainText("This query already has a simple execution plan.");
            expect(providerPrompt).not.toContain("User optimization goal:");
            expect(providerPrompt).not.toContain("Discard this goal on cancel");
            await page.getByTestId("closeAiOptimize").click();
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
            await page.getByTestId("aiFixInsert").scrollIntoViewIfNeeded();
            await expect(page.getByTestId("aiFixInsert")).toBeInViewport();
            const card = page.getByTestId("aiFixInsert").locator("xpath=ancestor::section");
            expect(await card.evaluate(element => element.scrollHeight <= element.clientHeight)).toBe(true);
            await page.getByTestId("aiFixInsert").click();
          } else {
            await page.getByTestId("chatToggleButton").click();
            await page.getByTestId("chatInput").fill("Suggest a query");
            await page.getByTestId("chatSendButton").click();
            await page.getByRole("button", { name: "Collapse query", exact: true }).click();
            await expect(page.getByRole("button", { name: "Expand query", exact: true })).toHaveAttribute("aria-expanded", "false");
            await page.getByRole("button", { name: "Expand query", exact: true }).click();
            await page.getByTestId("chatCopyQueryButton").click();
            expect(await page.evaluate(() => sessionStorage.getItem("copiedQuery"))).toBe(suggestion);
            await expect(editor).toHaveAttribute("data-value", query);
            await page.getByTestId("chatInsertQueryButton").click();
            if (viewport.width < 1100) await page.getByTestId("chatCloseButton").click();
          }
          await expect(editor).toHaveAttribute("data-value", suggestion);
          expect(queryRequests).toBe(0);
        } finally {
          const removed = await page.request.delete(`${urls.api.graphUrl}${graphName}`);
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
    const query = feature === "fix" ? "MATCH (n) RETsURN n" : "RETURN 4242 AS unsent_draft";
    const chatDraft = "Find the person with the largest order";
    let aiRequests = 0;

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

    const created = await page.request.post(`${urls.api.graphUrl}${graphName}`);
    expect(created.ok()).toBe(true);
    try {
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
        await page.getByTestId("editorOptimize").click();
        if (scenario === "provider-error") await page.getByTestId("aiOptimizeConsentConfirm").click();
      }

      if (scenario === "missing-key") {
        await expect(page.getByTestId("toast-title")).toHaveText("No API Key Provided");
        await page.getByRole("button", { name: "Go to Settings", exact: true }).click();
      } else if (feature === "optimize") {
        await expect(page.getByTestId("toast-title")).toHaveText("Query optimization failed");
        await expect(page.getByTestId("toast-description")).toContainText("Unable to reach the AI provider");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(page.getByTestId("toast-destructive")).toHaveCount(1);
        await page.getByRole("button", { name: "Go to Settings", exact: true }).click();
      } else {
        const errorContainer = page.getByTestId(feature === "chat" ? "chatMessagesList" : "aiFixResultBody");
        await expect(errorContainer).toContainText("Unable to reach the AI provider");
        await errorContainer.getByRole("link", { name: "Go to Settings", exact: true }).click();
      }
      await expect(page).toHaveURL(/\/settings/, { timeout: 30_000 });
      if (scenario === "missing-key") {
        await page.getByTestId("chatSectionHeader").click();
        await page.getByTestId("chatApiKeyInput").fill(TEST_KEY);
        await page.getByTestId("addChatApiKeyButton").click();
        await expect(page.getByTestId("chatApiKeyCard")).toHaveCount(1, { timeout: 30_000 });
      }

      await page.goBack();
      await expect(graph.editorContainer).toHaveAttribute("data-value", query);
      if (feature === "chat") {
        await expect(page.getByTestId("chatInput")).toHaveValue(chatDraft);
        await page.getByTestId("chatCloseButton").click();
        await page.getByTestId("chatToggleButton").click();
        await expect(page.getByTestId("chatInput")).toHaveValue(chatDraft);
      }
      expect(aiRequests).toBe(scenario === "missing-key" ? 0 : 1);
    } finally {
      const removed = await page.request.delete(`${urls.api.graphUrl}${graphName}`);
      expect(removed.ok()).toBe(true);
    }
  });
}
