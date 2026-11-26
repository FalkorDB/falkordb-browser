import { expect } from "@playwright/test";
import { test } from "../infra/coverage";
import { initializeLocalStorage } from "../infra/utils";
import GraphPage from "../logic/POM/graphPage";
import urls from "../config/urls.json";

test("@admin overlapping sync for the same connection preserves the graph list", async ({ page }) => {
  await page.addInitScript(initializeLocalStorage());
  const graph = new GraphPage(page);
  let releaseDiscovery!: () => void;
  const discoveryReleased = new Promise<void>(resolve => { releaseDiscovery = resolve; });
  let releaseSecondDiscovery!: () => void;
  const firstGraphStarted = new Promise<void>(resolve => { releaseSecondDiscovery = resolve; });
  let releaseGraphs!: () => void;
  const secondUpdateStarted = new Promise<void>(resolve => { releaseGraphs = resolve; });
  let releaseUpdates!: () => void;
  const updatesReleased = new Promise<void>(resolve => { releaseUpdates = resolve; });
  let connections = 0;
  let updates = 0;
  let graphRequests = 0;

  await page.route("**/api/connections", async route => {
    connections += 1;
    if (connections === 1) await discoveryReleased;
    if (connections === 2) await firstGraphStarted;
    await route.continue();
  });
  await page.route("**/api/graph", async route => {
    if (route.request().method() === "GET") {
      graphRequests += 1;
      releaseSecondDiscovery();
      await secondUpdateStarted;
    }
    await route.continue();
  });
  await page.route("**/api/auth/session", async route => {
    if (route.request().method() === "POST") {
      updates += 1;
      if (updates === 2) releaseGraphs();
      await updatesReleased;
    }
    await route.continue();
  });

  try {
    await page.goto(urls.graphUrl);
    await expect(graph.memoryValue).toBeVisible();
    releaseDiscovery();
    await expect.poll(() => updates).toBe(1);
    await expect(graph.memoryLoadingIndicator).toBeVisible();
    await page.evaluate(() => {
      const channel = new BroadcastChannel("next-auth");
      channel.postMessage({ event: "session", data: { trigger: "getSession" } });
      channel.close();
    });
    await expect.poll(() => updates).toBe(2);
    await expect.poll(() => graphRequests).toBeGreaterThan(0);
    await expect(graph.graphPage).toHaveAttribute("data-graph-names-ready", "true");
    expect(connections).toBeGreaterThanOrEqual(2);
  } finally {
    releaseDiscovery();
    releaseSecondDiscovery();
    releaseGraphs();
    releaseUpdates();
  }
});
