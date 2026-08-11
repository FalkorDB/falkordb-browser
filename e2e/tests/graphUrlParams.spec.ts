import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import GraphPage from "../logic/POM/graphPage";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

// The working context (graph, query, selection, viewport) lives on the active
// tab, not in the URL. All the URL carries is which tab to open, so these tests
// assert the handover: state → ?tab=, and ?tab= → rebuilt context.
test.describe("@admin Graph URL params", () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;
    let graphName: string;

    test.beforeAll(async () => {
        apiCall = new ApiCalls();
        graphName = getRandomString("urlparams");
        await apiCall.addGraph(graphName);
    });

    test.afterAll(async () => {
        await apiCall.removeGraph(graphName);
    });

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    const tabParam = (graph: GraphPage) =>
        new URL(graph.getCurrentURL()).searchParams.get("tab");

    test("Selecting a graph updates URL with ?tab= param", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.selectGraphByName(graphName);
        await graph.waitForPageIdle();

        await expect.poll(() => tabParam(graph), { timeout: 15000 }).toBeTruthy();
    });

    test("Working context is kept off the URL", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.selectGraphByName(graphName);
        await graph.waitForPageIdle();
        await graph.insertQuery("MATCH (n) RETURN n LIMIT 5");
        await graph.clickRunQuery();

        const params = new URL(graph.getCurrentURL()).searchParams;
        expect(params.get("graph")).toBeNull();
        expect(params.get("query")).toBeNull();
        expect(params.get("selected")).toBeNull();
    });

    test("Refreshing rebuilds the tab's graph and query", async () => {
        const query = "MATCH (n) RETURN n LIMIT 5";
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();

        await graph.selectGraphByName(graphName);
        await graph.waitForPageIdle();
        await graph.insertQuery(query);
        await graph.clickRunQuery();

        await expect.poll(() => tabParam(graph), { timeout: 15000 }).toBeTruthy();
        const tabId = tabParam(graph);

        await graph.refreshPage();
        await graph.waitForPageIdle();

        // Same tab, and its context is back without any of it being in the URL.
        await expect.poll(() => tabParam(graph), { timeout: 15000 }).toBe(tabId);
        await expect(page.getByTestId("selectGraph")).toContainText(graphName, { timeout: 15000 });
        // The query is the other half of the context — a reload that only
        // restored the graph would otherwise pass.
        await expect.poll(() => graph.getEditorInput(), { timeout: 15000 }).toBe(query);
    });

    test("URL naming an unknown tab falls back to a usable strip", async () => {
        const graph = await browser.createNewPage(GraphPage, `${urls.graphUrl}?tab=does-not-exist`);
        await graph.waitForPageIdle();

        // The stored strip wins; we must never be left pointing at a dead tab.
        await expect
            .poll(() => tabParam(graph), { timeout: 15000 })
            .not.toBe("does-not-exist");

        // …and what it points at has to be a tab that is actually in the strip.
        const active = tabParam(graph);
        expect(active).toBeTruthy();
        expect(await graph.getStripTabIds()).toContain(active!);
    });

    test("A tab naming a dropped graph does not resurrect it", async () => {
        const doomed = getRandomString("dropped");
        await apiCall.addGraph(doomed);

        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();

        await graph.selectGraphByName(doomed);
        await graph.waitForPageIdle();

        // Park the page before dropping the graph. An open graph view keeps
        // polling the graph's counts and metadata, and those reads run as
        // writable queries — which is enough to make FalkorDB re-create a graph
        // that was just deleted. Parking first is what "behind the tab's back"
        // has to mean for the tab restore to be what is under test.
        await page.goto("about:blank");
        await apiCall.removeGraph(doomed);

        // Back to a cold page, so the tab is rebuilt from storage.
        await page.goto(urls.graphUrl);
        await graph.waitForPageIdle();

        // Anchor the negative assertion on a settled state: on a cold load the
        // strip is empty for a moment, and asserting then would pass without the
        // restore having run at all.
        await expect.poll(() => graph.getStripTabIds(), { timeout: 15000 }).not.toHaveLength(0);
        await expect(page.getByTestId("selectGraph")).not.toContainText(doomed, { timeout: 15000 });
        const graphs = await apiCall.getGraphs();
        expect(JSON.stringify(graphs)).not.toContain(doomed);
    });

    test("A rebuilt tab does not re-run its stored write query", async () => {
        // Two full page loads plus a write and two count round-trips — the
        // heaviest test here, and it tips over 30s under load.
        test.setTimeout(60_000);

        const query = "CREATE (n:Planted) RETURN n";
        const target = getRandomString("readonly");
        await apiCall.addGraph(target);

        try {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            const page = await browser.getPage();

            await graph.selectGraphByName(target);
            await graph.waitForPageIdle();
            // Running it once is the user's own doing. What it leaves behind is a
            // tab carrying a write query — which is what a shared ?tab= link
            // hands to whoever opens it next.
            await graph.insertQuery(query);
            await graph.clickRunQuery();
            await expect
                .poll(async () => (await apiCall.getGraphCount(target)).result.nodes, { timeout: 15000 })
                .toBe(1);

            // The tab is written to storage off a state update, so reloading too
            // eagerly would race that write and come back to an empty tab.
            await expect
                .poll(() => page.evaluate(() => JSON.stringify(window.localStorage)), { timeout: 15000 })
                .toContain(query);

            await graph.refreshPage();
            await graph.waitForPageIdle();

            // The tab is back with its query…
            await expect.poll(() => graph.getEditorInput(), { timeout: 15000 }).toBe(query);
            // …but rebuilding it re-issues that query read-only, so the write is
            // refused and the graph is left exactly as the user left it.
            expect((await apiCall.getGraphCount(target)).result.nodes).toBe(1);
        } finally {
            await apiCall.removeGraph(target);
        }
    });
});
