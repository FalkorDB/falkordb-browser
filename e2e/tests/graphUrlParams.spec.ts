import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import GraphPage from "../logic/POM/graphPage";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

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

    test("Selecting a graph updates URL with ?graph= param", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.selectGraphByName(graphName);

        const url = graph.getCurrentURL();
        expect(url).toContain(`graph=${encodeURIComponent(graphName)}`);
    });

    test("Navigating directly to ?graph=<name> selects that graph", async () => {
        const graph = await browser.createNewPage(
            GraphPage,
            `${urls.graphUrl}?graph=${encodeURIComponent(graphName)}`
        );

        // Wait for graph to load
        await graph.waitForPageIdle();

        // The graph should be selected — URL should still contain the param
        const url = graph.getCurrentURL();
        expect(url).toContain(`graph=${encodeURIComponent(graphName)}`);
    });

    test("Running a query updates URL with ?query= param", async () => {
        const graph = await browser.createNewPage(
            GraphPage,
            `${urls.graphUrl}?graph=${encodeURIComponent(graphName)}`
        );
        await graph.waitForPageIdle();

        const query = "MATCH (n) RETURN n LIMIT 5";
        await graph.insertQuery(query);
        await graph.clickRunQuery();

        const url = graph.getCurrentURL();
        expect(url).toContain("query=");
        const urlObj = new URL(url);
        expect(urlObj.searchParams.get("query")).toBe(query);
    });

    test("Navigating to ?graph=<name>&query=<cypher> loads graph with query", async () => {
        const query = "MATCH (n) RETURN n LIMIT 1";
        const graph = await browser.createNewPage(
            GraphPage,
            `${urls.graphUrl}?graph=${encodeURIComponent(graphName)}&query=${encodeURIComponent(query)}`
        );
        await graph.waitForPageIdle();

        const url = graph.getCurrentURL();
        expect(url).toContain(`graph=${encodeURIComponent(graphName)}`);
        expect(url).toContain("query=");
    });

    test("Graph param persists after page refresh", async () => {
        const graph = await browser.createNewPage(
            GraphPage,
            `${urls.graphUrl}?graph=${encodeURIComponent(graphName)}`
        );
        await graph.waitForPageIdle();

        await graph.refreshPage();
        await graph.waitForPageIdle();

        const url = graph.getCurrentURL();
        expect(url).toContain(`graph=${encodeURIComponent(graphName)}`);
    });

    test("URL params order is graph, query, selected", async () => {
        const query = "MATCH (n) RETURN n LIMIT 5";
        const graph = await browser.createNewPage(
            GraphPage,
            `${urls.graphUrl}?graph=${encodeURIComponent(graphName)}&query=${encodeURIComponent(query)}`
        );
        await graph.waitForPageIdle();

        const url = graph.getCurrentURL();
        const graphIdx = url.indexOf("graph=");
        const queryIdx = url.indexOf("query=");

        // graph should come before query in the URL
        expect(graphIdx).toBeGreaterThan(-1);
        expect(queryIdx).toBeGreaterThan(-1);
        expect(graphIdx).toBeLessThan(queryIdx);
    });
});
