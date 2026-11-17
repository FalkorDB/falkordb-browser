import { type Route } from "@playwright/test";
import { expect, test } from "../infra/coverage";
import { getRandomString, initializeLocalStorage } from "../infra/utils";
import configuredUrls from "../config/urls.json";
import AiAssistComponent from "../logic/POM/aiAssistComponent";
import ChatComponent from "../logic/POM/chatComponent";

const baseUrl = process.env.E2E_BASE_URL ?? configuredUrls.localHost;
// Graphs to delete after the test, so a cleanup failure cannot mask the test's own error.
const createdGraphs: string[] = [];

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

test.afterEach(async ({ page }) => {
  for (const graphName of createdGraphs.splice(0)) {
    expect((await page.request.delete(`${baseUrl}/api/graph/${graphName}`, {
      headers: { Origin: new URL(baseUrl).origin },
    })).ok()).toBe(true);
  }
});

for (const dismissal of ["cancel", "edit", "tab-switch", "navigate"] as const) {
  test(`@admin Fix with AI aborts on ${dismissal}`, async ({ page }) => {
    const graphName = getRandomString("fixOwner");
    const pending = Promise.withResolvers<Route>();
    await page.route("**/api/chat/fix", route => { pending.resolve(route); });
    expect((await page.request.post(`${baseUrl}/api/graph/${graphName}`, {
      headers: { Origin: new URL(baseUrl).origin },
    })).ok()).toBe(true);
    createdGraphs.push(graphName);
    await page.goto(`${baseUrl}/graph?graph=${encodeURIComponent(graphName)}&query=RETURN%201`);
    const ai = new AiAssistComponent(page);
    await expect(ai.editorContainer).toHaveAttribute("data-value", "RETURN 1", { timeout: 30_000 });
    await ai.runInvalidQueryAndRequestFix("RETRUN 1");
    const request = await pending.promise;
    await expect(ai.fixCancelButton).toBeVisible();
    if (dismissal === "navigate") {
      await expect(page).toHaveURL(url => url.searchParams.get("query") === "RETRUN 1");
    }
    const aborted = page.waitForEvent("requestfailed", {
      predicate: failed => failed.url().endsWith("/api/chat/fix"),
    });
    if (dismissal === "cancel") await ai.fixCancelButton.click();
    else if (dismissal === "edit") await ai.insertQuery("RETURN 99");
    else if (dismissal === "tab-switch") await ai.addTabButton.click();
    else {
      await ai.settingsButton.click();
      await expect(page).toHaveURL(/\/settings/, { timeout: 30_000 });
    }
    await aborted;
    await request.fulfill({ json: { explanation: "Stale result", correctedQuery: "RETURN 2" } });
    await expect(ai.fixSettledMarker).toHaveAttribute("data-ai-fix-settled", "1");
    await expect(ai.fixCancelButton).toHaveCount(0);
    await expect(ai.fixResultPanel).toHaveCount(0);
  });
}

test("@admin an edit made while the failing query runs gets no Fix with AI", async ({ page }) => {
  const graphName = getRandomString("fixInFlight");
  expect((await page.request.post(`${baseUrl}/api/graph/${graphName}`)).ok()).toBe(true);
  createdGraphs.push(graphName);
  let held!: (route: Route) => void;
  const failingRun = new Promise<Route>(resolve => { held = resolve; });
  await page.route(
    url => url.pathname === `/api/graph/${graphName}` && url.searchParams.get("query")?.startsWith("RETURN missing") === true,
    route => held(route),
  );
  await page.goto(`${baseUrl}/graph?graph=${encodeURIComponent(graphName)}&query=RETURN%201`);
  const ai = new AiAssistComponent(page);
  await expect(ai.editorContainer).toHaveAttribute("data-value", "RETURN 1", { timeout: 30_000 });
  // Valid syntax, so the request goes out; the server rejects the unbound variable.
  await ai.insertQuery("RETURN missing");
  await ai.clickEditorRun();
  const route = await failingRun;

  // insertQuery's default focus presses Escape, which would dismiss the toast under test.
  await ai.editorContainer.click();
  await ai.insertQuery("RETURN 99", { focus: false });
  await expect(ai.editorContainer).toHaveAttribute("data-value", "RETURN 99");
  await route.continue();

  // The failure still reports, but its fix would overwrite the edit, so it is not offered.
  await expect(ai.errorToast).toBeVisible();
  await expect(ai.fixWithAiButton).toHaveCount(0);
  await expect(ai.errorToast).toBeVisible();
  await expect(ai.editorContainer).toHaveAttribute("data-value", "RETURN 99");
});

for (const invalidation of ["edit", "tab-switch"] as const) {
  test(`@admin stale Fix with AI action clears on ${invalidation}`, async ({ page }) => {
    const graphName = getRandomString("fixFailureOwner");
    expect((await page.request.post(`${baseUrl}/api/graph/${graphName}`, {
      headers: { Origin: new URL(baseUrl).origin },
    })).ok()).toBe(true);
    createdGraphs.push(graphName);
    await page.goto(`${baseUrl}/graph?graph=${encodeURIComponent(graphName)}&query=RETURN%201`);
    const ai = new AiAssistComponent(page);
    await expect(ai.editorContainer).toHaveAttribute("data-value", "RETURN 1", { timeout: 30_000 });
    await ai.runInvalidQuery("RETRUN 1");
    await expect(ai.fixWithAiButton).toBeVisible();

    if (invalidation === "edit") {
      await ai.editQueryKeepingToast("RETURN 99");
      await expect(ai.editorContainer).toHaveAttribute("data-value", "RETURN 99");
    } else {
      await ai.addTabButton.click();
    }

    // The toast closes itself after a few seconds, taking the button with it; the toast must
    // still be open once the button is gone, or this would pass without the invalidation.
    await expect(ai.errorToast).toBeVisible();
    await expect(ai.fixWithAiButton).toHaveCount(0);
    await expect(ai.errorToast).toBeVisible();
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
    expect((await page.request.post(`${baseUrl}/api/graph/${graphName}`, {
      headers: { Origin: new URL(baseUrl).origin },
    })).ok()).toBe(true);
    createdGraphs.push(graphName);
    await page.goto(`${baseUrl}/graph?graph=${encodeURIComponent(graphName)}&query=RETURN%201`);
    const ai = new AiAssistComponent(page);
    await expect(ai.editorContainer).toHaveAttribute("data-value", "RETURN 1", { timeout: 30_000 });
    await ai.runInvalidQueryAndRequestFix("RETRUN 1");
    const oldRequest = await first.promise;
    await ai.fixCancelButton.click();
    await ai.runInvalidQueryAndRequestFix("RETRUN 3");
    const newRequest = await second.promise;
    await newRequest.fulfill({ json: { explanation: "Newest result", correctedQuery: "RETURN 3" } });
    await expect(ai.fixQuery).toHaveText("RETURN 3");
    await expect(ai.fixSettledMarker).toHaveAttribute("data-ai-fix-settled", "1");
    const response = page.waitForResponse("**/api/chat/fix");
    await oldRequest.fulfill({
      status: staleStatus,
      headers: staleStatus === 401 ? { "X-Session-Invalid": "1" } : {},
      json: staleStatus === 200
        ? { explanation: "Stale result", correctedQuery: "RETURN 2" }
        : { error: "Stale failure" },
    });
    await response;
    await expect(ai.fixSettledMarker).toHaveAttribute("data-ai-fix-settled", "2");
    await expect(ai.fixQuery).toHaveText("RETURN 3");
    await expect(page).toHaveURL(/\/graph/);
    await ai.fixInsertButton.click();
    await expect(ai.editorContainer).toHaveAttribute("data-value", "RETURN 3");
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
    expect((await page.request.post(`${baseUrl}/api/graph/${graphName}`, {
      headers: { Origin: new URL(baseUrl).origin },
    })).ok()).toBe(true);
    createdGraphs.push(graphName);
    await page.goto(`${baseUrl}/graph?graph=${encodeURIComponent(graphName)}&query=RETURN%201`);
    const chat = new ChatComponent(page);
    await expect(chat.chatToggleButton).toBeEnabled({ timeout: 30_000 });
    if (!await chat.chatInput.isVisible()) await chat.chatToggleButton.click();
    const originalTab = await chat.firstTabSelect.getAttribute("data-testid");
    if (!originalTab) throw new Error("Missing originating tab");
    await chat.chatInput.fill(draft);
    await chat.chatSendButton.click();
    const request = await pending.promise;
    await expect(chat.chatInput).toHaveValue("");
    if (scenario === "edited-clear") {
      await chat.chatInput.fill("Changed my mind");
      await chat.chatInput.fill("");
    } else if (scenario === "new-draft-success") {
      await chat.chatInput.fill("Keep this new draft");
    } else if (scenario === "switch-failure") {
      await chat.addTabButton.click();
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
      await chat.tabSelect(originalTab).click();
      await expect(chat.chatInput).toHaveValue(draft);
      await expect(chat.chatMessagesList).not.toContainText("Internal server error");
    } else {
      await expect(chat.chatMessagesList).toContainText(
        scenario === "edited-clear" ? "Internal server error" : "Here is your answer");
      await expect(chat.chatInput).toHaveValue(scenario === "edited-clear" ? "" : "Keep this new draft");
      await expect(chat.chatMessagesList.getByRole("link", { name: "Go to Settings" })).toHaveCount(0);
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
  expect((await page.request.post(`${baseUrl}/api/graph/${graphName}`, {
    headers: { Origin: new URL(baseUrl).origin },
  })).ok()).toBe(true);
  createdGraphs.push(graphName);
  await page.goto(`${baseUrl}/graph?graph=${encodeURIComponent(graphName)}&query=RETURN%201`);
  const chat = new ChatComponent(page);
  await expect(chat.chatToggleButton).toBeEnabled({ timeout: 30_000 });
  if (!await chat.chatInput.isVisible()) await chat.chatToggleButton.click();
  await chat.chatInput.fill(draft);
  await chat.chatSendButton.click();
  const oldRequest = await first.promise;
  await chat.chatCloseButton.click();
  await expect(chat.chatInput).toHaveCount(0);
  await chat.chatToggleButton.click();
  await expect(chat.chatInput).toHaveValue(draft);
  await chat.chatInput.fill("An intermediate edit");
  await chat.chatInput.fill(draft);
  await chat.chatSendButton.click();
  const newRequest = await second.promise;
  const oldResponse = page.waitForResponse(response => response.url().endsWith("/api/chat"));
  await oldRequest.fulfill({ json: { answer: "Old response" } });
  await oldResponse;
  await newRequest.fulfill({ status: 422, json: { error: "Internal server error" } });
  await expect(chat.chatMessagesList).toContainText("Internal server error");
  await expect(chat.chatInput).toHaveValue(draft);
  await chat.chatCloseButton.click();
  await chat.chatToggleButton.click();
  await expect(chat.chatInput).toHaveValue(draft);
});

for (const dismissal of ["tab-switch", "close"] as const) {
test(`@admin optimize cancels on ${dismissal} and allows a fresh request`, async ({ page }) => {
  const graphName = getRandomString("optimizeOwner");
  const pending = Promise.withResolvers<Route>();
  await page.route("**/api/chat/optimize", route => { pending.resolve(route); });
  expect((await page.request.post(`${baseUrl}/api/graph/${graphName}`, {
    headers: { Origin: new URL(baseUrl).origin },
  })).ok()).toBe(true);
  createdGraphs.push(graphName);
  await page.goto(`${baseUrl}/graph?graph=${encodeURIComponent(graphName)}&query=RETURN%201`);
  const ai = new AiAssistComponent(page);
  await expect(ai.editorContainer).toHaveAttribute("data-value", "RETURN 1", { timeout: 30_000 });
  const originalTab = await ai.firstTabSelect.getAttribute("data-testid");
  if (!originalTab) throw new Error("Missing originating tab");
  await ai.openOptimize();
  await ai.optimizeAnalyzeButton.click();
  const request = await pending.promise;
  const aborted = page.waitForEvent("requestfailed", {
    predicate: failed => failed.url().endsWith("/api/chat/optimize"),
  });
  if (dismissal === "tab-switch") {
    await ai.addTabButton.evaluate((element: HTMLButtonElement) => element.click());
  } else {
    await page.keyboard.press("Escape");
  }
  await aborted;
  await expect(ai.optimizeDialog).toHaveCount(0);
  if (dismissal === "tab-switch") await ai.tabSelect(originalTab).click();
  await request.fulfill({ json: {
    explanation: "Stale result", suggestions: [], optimizedQuery: "RETURN 2", executionPlan: ["Results"],
  } });
  await expect(ai.optimizeApplyButton).toHaveCount(0);
  await expect(ai.errorToast).toHaveCount(0);
  await expect(ai.optimizeButton).toBeEnabled();
  await expect(ai.editorContainer).toHaveAttribute("data-value", "RETURN 1");
  const freshRequestPromise = page.waitForRequest("**/api/chat/optimize");
  await page.route("**/api/chat/optimize", route => route.fulfill({ json: {
    explanation: "Fresh result", suggestions: [], optimizedQuery: "RETURN 3", executionPlan: ["Results"],
  } }));
  await ai.openOptimize();
  await expect(ai.optimizeGuidance).toHaveValue("");
  await ai.optimizeAnalyzeButton.click();
  expect((await freshRequestPromise).postDataJSON().graphName).toBe(graphName);
  await expect(ai.optimizeQuery).toHaveText("RETURN 3");
});
}

test("@admin optimize result closes when same-connection readiness is lost", async ({ page }) => {
  const graphName = getRandomString("optimizeReady");
  await page.route("**/api/chat/optimize", route => route.fulfill({ json: {
    explanation: "Result before readiness loss", suggestions: [], optimizedQuery: "RETURN 2", executionPlan: ["Results"],
  } }));
  expect((await page.request.post(`${baseUrl}/api/graph/${graphName}`, {
    headers: { Origin: new URL(baseUrl).origin },
  })).ok()).toBe(true);
  createdGraphs.push(graphName);
  let releaseConfig!: () => void;
  const configGate = new Promise<void>(resolve => { releaseConfig = resolve; });
  try {
    await page.goto(`${baseUrl}/graph?graph=${encodeURIComponent(graphName)}&query=RETURN%201`);
    const ai = new AiAssistComponent(page);
    await expect(ai.editorContainer).toHaveAttribute("data-value", "RETURN 1", { timeout: 30_000 });
    await ai.openOptimize();
    await ai.optimizeAnalyzeButton.click();
    await expect(ai.optimizeApplyButton).toBeVisible();

    const session = await (await page.request.get(`${baseUrl}/api/auth/session`)).json();
    await page.evaluate(() => localStorage.removeItem("timeout"));
    // Only the held config may restore readiness, not the production deadline.
    await page.evaluate(() => {
      const timeout = AbortSignal.timeout.bind(AbortSignal);
      AbortSignal.timeout = milliseconds => timeout(milliseconds === 5000 ? 60000 : milliseconds);
    });
    let configRequested = false;
    await page.route("**/api/graph/config", async route => {
      configRequested = true;
      await configGate;
      await route.fulfill({ json: { configs: [["TIMEOUT_MAX", 12000]] } });
    });
    await page.route("**/api/auth/session", route => route.fulfill({
      json: { ...session, user: { ...session.user, id: `${session.user.id}-restoration` } },
    }));
    await page.evaluate(() => {
      const channel = new BroadcastChannel("next-auth");
      channel.postMessage({ event: "session", data: { trigger: "getSession" } });
      channel.close();
    });
    await expect.poll(() => configRequested, { timeout: 15_000 }).toBe(true);
    await expect(page.getByTestId("graphPage")).toHaveAttribute("aria-busy", "true");
    await expect(ai.optimizeDialog).toHaveCount(0);
    await expect(ai.optimizeApplyButton).toHaveCount(0);
    await expect(ai.editorContainer).toHaveAttribute("data-value", "RETURN 1");

    releaseConfig();
    await expect(page.getByTestId("graphPage")).toHaveAttribute("aria-busy", "false");
    await expect(ai.optimizeDialog).toHaveCount(0);
    await expect(ai.editorContainer).toHaveAttribute("data-value", "RETURN 1");
  } finally {
    releaseConfig();
  }
});
