import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import GraphPage from "../logic/POM/graphPage";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

// The tab strip in the /graph sub-header. Each tab is an independent working
// context (graph, query, view, canvas state), so these tests assert both the
// strip mechanics and the isolation between contexts.
test.describe("@admin Graph tabs", () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;
    let graphOne: string;
    let graphTwo: string;

    test.beforeAll(async () => {
        apiCall = new ApiCalls();
        graphOne = getRandomString("tabone");
        graphTwo = getRandomString("tabtwo");
        await apiCall.addGraph(graphOne);
        await apiCall.addGraph(graphTwo);
    });

    test.afterAll(async () => {
        await apiCall.removeGraph(graphOne);
        await apiCall.removeGraph(graphTwo);
    });

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test("A fresh connection opens on a single blank tab", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);
        await expect(graph.stripTab("New tab")).toBeVisible();
    });

    test("A tab is labelled by the graph it holds", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await expect(graph.stripTab(graphOne)).toBeVisible({ timeout: 15000 });
    });

    test("Adding a tab opens a blank context next to the current one", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await graph.addStripTab();
        await graph.waitForPageIdle();

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(2);
        // The new tab is the active one and carries no graph yet.
        await expect(graph.stripTab("New tab")).toHaveAttribute("data-active", "true");
        await expect(graph.stripTab(graphOne)).toHaveAttribute("data-active", "false");
    });

    test("Each tab keeps its own graph", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await graph.addStripTab();
        await graph.waitForPageIdle();
        await graph.selectGraphByName(graphTwo);
        await graph.waitForPageIdle();

        await expect(page.getByTestId("selectGraph")).toContainText(graphTwo, { timeout: 15000 });

        // Switching back brings the first context along with it.
        await graph.selectStripTab(graphOne);
        await graph.waitForPageIdle();
        await expect(page.getByTestId("selectGraph")).toContainText(graphOne, { timeout: 15000 });

        await graph.selectStripTab(graphTwo);
        await graph.waitForPageIdle();
        await expect(page.getByTestId("selectGraph")).toContainText(graphTwo, { timeout: 15000 });
    });

    test("Switching tabs points the URL at the active tab", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const tabParam = () => new URL(graph.getCurrentURL()).searchParams.get("tab");

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();
        await expect.poll(tabParam, { timeout: 15000 }).toBeTruthy();
        const firstTabId = tabParam();

        await graph.addStripTab();
        await graph.waitForPageIdle();
        await expect.poll(tabParam, { timeout: 15000 }).not.toBe(firstTabId);

        await graph.selectStripTab(graphOne);
        await expect.poll(tabParam, { timeout: 15000 }).toBe(firstTabId);
    });

    test("Renaming a tab replaces its label, and clearing it restores the graph name", async () => {
        const custom = getRandomString("renamed");
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await graph.renameStripTab(graphOne, custom);
        await expect(graph.stripTab(custom)).toBeVisible({ timeout: 15000 });
        await expect(graph.stripTab(graphOne)).toBeHidden();

        // An empty name is the way back to the graph name.
        await graph.renameStripTab(custom, "");
        await expect(graph.stripTab(graphOne)).toBeVisible({ timeout: 15000 });
    });

    test("A renamed tab survives a reload", async () => {
        const custom = getRandomString("persisted");
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();
        await graph.renameStripTab(graphOne, custom);
        await expect(graph.stripTab(custom)).toBeVisible({ timeout: 15000 });

        await graph.refreshPage();
        await graph.waitForPageIdle();

        await expect(graph.stripTab(custom)).toBeVisible({ timeout: 15000 });
    });

    test("Closing a tab drops it and falls back to a neighbour", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();
        await graph.addStripTab();
        await graph.waitForPageIdle();
        await graph.selectGraphByName(graphTwo);
        await graph.waitForPageIdle();

        await graph.closeStripTab(graphTwo);
        await graph.waitForPageIdle();

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);
        await expect(page.getByTestId("selectGraph")).toContainText(graphOne, { timeout: 15000 });
    });

    test("The last tab cannot be closed", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await expect(graph.stripTabClose(graphOne)).toBeDisabled({ timeout: 15000 });
    });

    test("The strip stops growing at the max-tabs limit", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();
        await graph.waitForPageIdle();

        // Read the limit actually in force instead of assuming the default, so
        // the assertion below can be exact. Mirrors clampMaxTabs (lib/graphTabs).
        const limit = await page.evaluate(() => {
            const stored = Number(window.localStorage.getItem("maxTabs"));
            return Number.isFinite(stored) && stored > 0 ? Math.min(10, Math.max(4, Math.round(stored))) : 8;
        });

        for (let i = 0; i < limit + 2; i += 1) {
            if (await page.getByTestId("graphTabAdd").isDisabled()) break;
            await graph.addStripTab();
        }

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(limit);
        await expect(page.getByTestId("graphTabAdd")).toBeDisabled();
    });

    // A share link carries the tab's graph and query, not its id, so it opens
    // for anyone — including a browser that has never seen the tab.
    const shareLink = (graphName: string, query: string, view = "Graph") => {
        const url = new URL(urls.graphUrl);
        url.searchParams.set("graph", graphName);
        url.searchParams.set("query", query);
        url.searchParams.set("view", view);
        return url.toString();
    };

    test("A share link opens its graph in a tab of its own, and the address bar names that tab", async () => {
        const graph = await browser.createNewPage(GraphPage, shareLink(graphOne, "MATCH (n) RETURN n LIMIT 1"));
        const page = await browser.getPage();
        await graph.waitForPageIdle();

        await expect(graph.stripTab(graphOne)).toHaveAttribute("data-active", "true", { timeout: 15000 });
        await expect(page.getByTestId("selectGraph")).toContainText(graphOne, { timeout: 15000 });
        // The untouched tab the visitor already had takes the link — no leftover "New tab".
        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);

        // The address bar names the user's own tab, still carrying what it shows.
        await expect.poll(() => new URL(graph.getCurrentURL()).searchParams.get("tab"), { timeout: 15000 }).toBeTruthy();
        const params = new URL(graph.getCurrentURL()).searchParams;
        expect(params.get("graph")).toBe(graphOne);
        expect(params.get("query")).toBe("MATCH (n) RETURN n LIMIT 1");
    });

    test("A URL copied straight out of the address bar opens for someone else", async () => {
        // People share by copying the address bar, not by finding the link
        // button — and `?tab=` alone names an entry in the sender's storage.
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();
        await expect.poll(() => new URL(graph.getCurrentURL()).searchParams.get("graph"), { timeout: 15000 }).toBe(graphOne);
        const copied = graph.getCurrentURL();

        const other = new BrowserWrapper();
        try {
            const otherGraph = await other.createNewPage(GraphPage, copied);
            const otherPage = await other.getPage();
            await otherGraph.waitForPageIdle();

            await expect(otherGraph.stripTab(graphOne)).toHaveAttribute("data-active", "true", { timeout: 15000 });
            await expect(otherPage.getByTestId("selectGraph")).toContainText(graphOne, { timeout: 15000 });
        } finally {
            await other.closeBrowser();
        }
    });

    test("Reloading keeps the tab as it is now, not the URL's snapshot of it", async () => {
        const graph = await browser.createNewPage(GraphPage, shareLink(graphOne, "MATCH (n) RETURN n LIMIT 1"));
        const page = await browser.getPage();
        await graph.waitForPageIdle();
        await expect.poll(() => new URL(graph.getCurrentURL()).searchParams.get("tab"), { timeout: 15000 }).toBeTruthy();

        // A stale query next to the user's own tab id must not win.
        const url = new URL(graph.getCurrentURL());
        url.searchParams.set("query", "MATCH (n) RETURN n LIMIT 9");
        await browser.navigateTo(url.toString());
        await graph.waitForPageIdle();

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);
        await expect.poll(() => new URL(page.url()).searchParams.get("query"), { timeout: 15000 }).toBe("MATCH (n) RETURN n LIMIT 1");
    });

    test("A share link opens on a first visit instead of the tutorial", async () => {
        // The suite marks the tutorial as seen for every page. A real first
        // visit has not, and the tour would otherwise take over the page.
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const page = await browser.getPage();
        await page.evaluate(() => localStorage.setItem("tutorial", "true"));

        await browser.navigateTo(shareLink(graphOne, "MATCH (n) RETURN n LIMIT 3"));
        await graph.waitForPageIdle();

        await expect(graph.stripTab(graphOne)).toHaveAttribute("data-active", "true", { timeout: 15000 });
        await expect(page.getByTestId("selectGraph")).toContainText(graphOne, { timeout: 15000 });
        await expect(page.getByTestId("skipTutorial")).toBeHidden();
        // Deferred, not skipped: the next regular visit still gets the tour.
        expect(await page.evaluate(() => localStorage.getItem("tutorial"))).toBe("true");
    });

    test("Opening a link to a tab you already have reuses it", async () => {
        const query = "MATCH (n) RETURN n LIMIT 2";
        const graph = await browser.createNewPage(GraphPage, shareLink(graphOne, query));
        await graph.waitForPageIdle();
        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);

        await browser.navigateTo(shareLink(graphOne, query));
        await graph.waitForPageIdle();

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);
        await expect(graph.stripTab(graphOne)).toHaveAttribute("data-active", "true");
    });

    test("A share link shows its query but leaves running it to the user", async () => {
        test.setTimeout(60_000);

        // Distinctive enough to pick this query's requests out of the page's own.
        const marker = getRandomString("sharedmarker");
        const query = `MATCH (n) WHERE n.\`${marker}\` IS NULL RETURN n LIMIT 1`;
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();
        await graph.waitForPageIdle();

        const runs: string[] = [];
        // The share link's own page load (and every reload) carries the query
        // too — only a query request to the graph API counts as running it.
        page.on("request", (request) => {
            if (request.method() !== "GET") return;
            const url = new URL(request.url());
            if (!url.pathname.startsWith("/api/graph/")) return;
            if (url.searchParams.get("query")?.includes(marker)) runs.push(request.url());
        });

        await browser.navigateTo(shareLink(graphOne, query));
        await graph.waitForPageIdle();

        // The graph and the query are loaded…
        await expect(graph.stripTab(graphOne)).toHaveAttribute("data-active", "true", { timeout: 15000 });
        await expect(page.getByTestId("selectGraph")).toContainText(graphOne, { timeout: 15000 });
        await expect.poll(() => graph.getEditorInput(), { timeout: 15000 }).toBe(query);
        // …but nothing ran them.
        expect(runs).toHaveLength(0);

        // The tab is stored off a state update — reloading too eagerly would
        // race that write and test nothing.
        await expect
            .poll(() => page.evaluate(() => JSON.stringify(window.localStorage)), { timeout: 15000 })
            .toContain(marker);

        // A reload restores the tab without running it either.
        await graph.refreshPage();
        await graph.waitForPageIdle();
        await expect.poll(() => graph.getEditorInput(), { timeout: 15000 }).toBe(query);
        expect(runs).toHaveLength(0);

        // Running it is the user's call.
        await graph.clickRunQuery(false);
        await expect.poll(() => runs.length, { timeout: 15000 }).toBeGreaterThan(0);
    });

    test("A tab without a graph puts nothing to share on the URL", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        await expect.poll(() => new URL(graph.getCurrentURL()).searchParams.get("tab"), { timeout: 15000 }).toBeTruthy();
        expect(new URL(graph.getCurrentURL()).searchParams.get("graph")).toBeNull();
    });
});
