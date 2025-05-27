
import { expect, test } from "@playwright/test";
import { BATCH_CREATE_PERSONS } from "@/e2e/config/constants";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import urls from '../config/urls.json'
import QueryHistory from "../logic/POM/queryHistoryComponent";
import { getRandomString } from "../infra/utils";

test.describe('Query history Tests', () => {
    let browser: BrowserWrapper;
    let apicalls: ApiCalls;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apicalls = new ApiCalls();
    })

    test.afterEach(async () => {
        await browser.closeBrowser();
    })

    test(`@admin Validate that running a query in the UI saves it in the query history`, async () => {
        const graphName = getRandomString('queryhistory');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery("CREATE (n:Person { name: 'Alice' }) RETURN n");
        await graph.clickRunQuery();
        await graph.clickQueryHistoryButton();
        expect(await graph.getQueryHistory("0")).toBe(true);
        await apicalls.removeGraph(graphName);         
    });

    test(`@admin Validate that executing a query from the query history correctly displays the results in the canvas`, async () => {
        const graphName = getRandomString('queryhistory');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery("CREATE (n:Person { name: 'Alice' }) RETURN n");
        await graph.clickRunQuery();
        await graph.refreshPage();
        await graph.selectGraphByName(graphName);
        await graph.runAQueryFromHistory("0")
        const searchQuery = `Alice`;
        await graph.searchElementInCanvas(searchQuery);
        await graph.hoverAtCanvasCenter();
        expect(await graph.getNodeCanvasToolTip()).toBe(searchQuery);
        await apicalls.removeGraph(graphName);        
    });

    test.only(`@admin verify query selection from history displays the correct query`, async () => {
        const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = getRandomString('queryhistory');
        await graph.addGraph(graphName);
        await graph.insertQuery("CREATE (n:Person { name: 'Alice' }) RETURN n");
        await graph.clickRunQuery(false);
        await graph.clickQueryHistoryButton();
        await graph.clickSelectQueryInHistory("0");
        expect((await graph.getQueryHistoryEditorContent())[0]).toBe("CREATE (n:Person { name: 'Alice' }) RETURN n");
        await apicalls.removeGraph(graphName);
    });

})