
import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import urls from '../config/urls.json';
import QueryHistory from "../logic/POM/queryHistoryComponent";
import { getRandomString } from "../infra/utils";

test.describe('Query history Tests', () => {
    let browser: BrowserWrapper;
    let apicalls: ApiCalls;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apicalls = new ApiCalls();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test(`@admin Validate that running a query in the UI saves it in the query history`, async () => {
        const graphName = getRandomString('queryhistory');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        const query = "CREATE (n:Person { name: 'Alice' }) RETURN n";
        await graph.insertQuery(query);
        await graph.clickRunQuery();
        await graph.clickQueryHistoryButton();
        expect(await graph.getQueryHistory(query)).toBe(true);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate that executing a query from the query history correctly displays the results in the canvas`, async () => {
        const graphName = getRandomString('queryhistory');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        const query = "MERGE (n:Person { name: 'Alice' }) RETURN n";
        await graph.insertQuery(query);
        await graph.clickRunQuery();
        await graph.runAQueryFromHistory(query);
        const searchQuery = `Alice`;
        await graph.searchElementInCanvas(searchQuery);
        await graph.hoverAtCanvasCenter();
        expect(await graph.getNodeCanvasToolTip()).toBe("0");
        await apicalls.removeGraph(graphName);        
    });

    test(`@admin verify query selection from history displays the correct query`, async () => {
        const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = getRandomString('queryhistory');
        await graph.addGraph(graphName);
        const query = "CREATE (n:Person { name: 'Alice' }) RETURN n";
        await graph.insertQuery(query);
        await graph.clickRunQuery(false);
        await graph.clickQueryHistoryButton();
        await graph.clickSelectQueryInHistory(query);
        expect(await graph.getQueryHistoryEditorContent(query)).toBe("CREATE (n:Person { name: 'Alice' }) RETURN n");
        await apicalls.removeGraph(graphName);
    });

});