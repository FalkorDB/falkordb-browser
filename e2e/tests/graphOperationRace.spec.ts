import { expect, test } from "@playwright/test";
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

  test(`@admin a query held in-flight is discarded after switching graph (no stale apply)`, async () => {
    const graphA = getRandomString("raceA");
    const graphB = getRandomString("raceB");
    // Distinct node counts so a stale apply is detectable: A=3, B=1.
    await apiCall.addGraph(graphA);
    await apiCall.runQuery(graphA, "CREATE (:N), (:N), (:N)");
    await apiCall.addGraph(graphB);
    await apiCall.runQuery(graphB, "CREATE (:N)");

    try {
      const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
      const page = await browser.getPage();

      // Hold graph A's query in-flight until we release it, so it is still
      // pending when we switch to graph B.
      let releaseA: () => void = () => { };
      const heldA = new Promise<void>((resolve) => { releaseA = resolve; });
      const holdPattern = `**/api/graph/${graphA}?query=**`;
      await page.route(holdPattern, async (route) => {
        await heldA;
        await route.continue();
      });

      // Selecting A auto-runs its default query, which is now held in-flight.
      await graph.selectGraphByName(graphA);

      // Switch to B while A's query is still pending — B loads normally (1 node).
      await graph.selectGraphByName(graphB);
      expect(await graph.getNodesCount()).toBe("1");

      // Release A's stale (3-node) result; the guard must discard it rather than
      // apply it over B.
      releaseA();
      await page.unroute(holdPattern);
      await page.waitForTimeout(2000);

      // Still B's data — A's stale result was NOT applied.
      expect(await graph.getNodesCount()).toBe("1");
    } finally {
      await apiCall.removeGraph(graphA).catch(() => undefined);
      await apiCall.removeGraph(graphB).catch(() => undefined);
    }
  });
});
