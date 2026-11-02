import { expect, test } from "@playwright/test";
import type { FalkorDBCanvas } from "@falkordb/canvas";
import { getRandomString } from "../infra/utils";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphPage from "../logic/POM/graphPage";
import urls from "../config/urls.json";

// Regression coverage for the connection/graph ownership guards (idea-6): a
// query captured for one graph must NOT apply its (stale) result after the user
// switched to a different graph while it was in flight.
test.describe("Graph operation race conditions", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test("@admin a deletion updates the replacement canvas after a responsive remount", async () => {
    test.setTimeout(90000);
    const graphName = getRandomString("delete-remount");
    let releaseDelete: () => void = () => {};
    const heldDelete = new Promise<void>(resolve => { releaseDelete = resolve; });
    const reachedDelete = Promise.withResolvers<void>();
    try {
      const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
      const page = await browser.getPage();
      await browser.setPageToFullScreen();
      await graph.addGraph(graphName);
      await graph.insertQuery("CREATE (a:DeleteRace {name:'delete-me'}), (b:DeleteRace {name:'keep-me'}) RETURN a,b");
      await graph.clickRunQuery();
      await graph.searchElementInCanvas("delete-me");
      const canvas = page.locator("falkordb-canvas");
      const original = await canvas.elementHandle();
      await page.route(`**/api/graph/${graphName}/*`, async route => {
        if (route.request().method() === "DELETE") {
          reachedDelete.resolve();
          await heldDelete;
        }
        await route.continue();
      });
      await graph.clickDeleteElement();
      await graph.clickDeleteElementConfirm();
      await reachedDelete.promise;
      await page.setViewportSize({ width: 900, height: 1000 });
      await expect.poll(() => canvas.evaluate((element, old) => element !== old, original)).toBe(true);
      await expect.poll(() => canvas.evaluate(element => (element as FalkorDBCanvas).getGraphData().nodes.length)).toBe(2);
      releaseDelete();
      await expect.poll(() => canvas.evaluate(element => (element as FalkorDBCanvas).getGraphData().nodes.length), { timeout: 15000 }).toBe(1);
      await expect(page.getByTestId("toast")).toContainText("deleted");
    } finally {
      releaseDelete();
      await apiCall.removeGraph(graphName);
    }
  });

  test(`@admin a query held in-flight is discarded after switching graph (no stale apply)`, async () => {
    const graphA = getRandomString("raceA");
    const graphB = getRandomString("raceB");

    try {
      // Distinct node counts so a stale apply is detectable: A=3, B=1.
      await apiCall.addGraph(graphA);
      await apiCall.runQuery(graphA, "CREATE (:N), (:N), (:N)");
      await apiCall.addGraph(graphB);
      await apiCall.runQuery(graphB, "CREATE (:N)");

      const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
      const page = await browser.getPage();

      // Hold graph A's runQuery at its /explain step — a regular fetch (reliably
      // interceptable, unlike the SSE query). At that point A's result has NOT
      // been applied yet, so A is genuinely in-flight when we switch to B.
      let releaseA: () => void = () => { };
      const heldA = new Promise<void>((resolve) => { releaseA = resolve; });
      const holdPattern = `**/api/graph/${graphA}/explain**`;
      await page.route(holdPattern, async (route) => {
        await heldA;
        // The page may be tearing down by the time we release — ignore that.
        await route.continue().catch(() => undefined);
      });

      // Select A (no auto-run), then fire a query and let it block at /explain.
      await graph.selectGraphByName(graphA);
      await graph.insertQuery("MATCH (n) RETURN n");
      await graph.clickEditorRun(); // fire-and-forget — the result is held at /explain
      // Wait until A's runQuery has actually reached (and is paused at) /explain.
      await page.waitForRequest(holdPattern, { timeout: 30000 });

      // Switch to B while A is still in-flight — B's node count (1) loads.
      await graph.selectGraphByName(graphB);
      expect(await graph.getNodesCount()).toBe("1");

      // Release A's stale (3-node) result; the guard must discard it rather than
      // apply it over B.
      const responsePromise = page.waitForResponse((response) => response.url().includes(`/api/graph/${graphA}/explain`));
      releaseA();
      await responsePromise;
      // Small buffer to allow client-side state update scheduling.
      await page.waitForTimeout(200);

      // Still B's data — A's stale result was NOT applied.
      expect(await graph.getNodesCount()).toBe("1");
      await page.unroute(holdPattern).catch(() => undefined);
    } finally {
      await apiCall.removeGraph(graphA).catch(() => undefined);
      await apiCall.removeGraph(graphB).catch(() => undefined);
    }
  });
});
