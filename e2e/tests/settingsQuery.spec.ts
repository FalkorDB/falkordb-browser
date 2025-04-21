import { expect } from "@playwright/test";
import test from "playwright/test";
import ApiCalls from "../logic/api/apiCalls";
import BrowserWrapper from "../infra/ui/browserWrapper";
import urls from "../config/urls.json";
import QuerySettingsPage from "../logic/POM/settingsQueryPage";
import { getRandomString } from "../infra/utils";

test.describe("Query Settings", () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
        apiCall = new ApiCalls();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })

    test(`@admin Validate that running a query with timeout returns an error`, async () => {
        const graphName = getRandomString("settingsQuery");
        await apiCall.addGraph(graphName)
        const querySettings = await browser.createNewPage(QuerySettingsPage, urls.settingsUrl);
        const timeout = 1;
        await querySettings.addTimeout(timeout);
        await querySettings.clickOnGraph();
        await querySettings.selectExistingGraph(graphName)
        const query = `UNWIND range(1, 100000000) AS x RETURN count(x)`;
        await querySettings.insertQuery(query);
        await querySettings.clickRunQuery(false);
        await querySettings.waitForRunQueryToBeEnabled();
        expect(await querySettings.getErrorNotification()).toBe(true);
        await apiCall.removeGraph(graphName);
    });

    test(`@admin Validate that running a query with limit returns limited results`, async () => {
        const graphName = getRandomString("settingsQuery");
        await apiCall.addGraph(graphName)
        const querySettings = await browser.createNewPage(QuerySettingsPage, urls.settingsUrl);
        const limit = 5;
        await querySettings.addLimit(limit);
        await querySettings.clickOnGraph();
        await querySettings.selectExistingGraph(graphName);
        const query = `UNWIND range(1, 10) AS i CREATE (p:Person {id: i, name: 'Person ' + toString(i)}) RETURN p`;
        await querySettings.insertQuery(query);
        await querySettings.clickRunQuery()
        const res = await querySettings.getNodeScreenPositions('graph');
        expect(res.length).toBe(5);
    });
});