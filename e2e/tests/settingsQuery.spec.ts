import { expect } from "@playwright/test";
import test from "playwright/test";
import { prepareArg } from "@/lib/utils";
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
        const querySettings = await browser.createNewPage(QuerySettingsPage, urls.settingsUrl);
        const timeout = 1;
        await querySettings.addTimeout(timeout);
        await browser.navigateTo(urls.graphUrl);
        const graphName = getRandomString("settingsQuery");
        await querySettings.addGraph(graphName);
        const query = `UNWIND range(1, 100000000) as x RETURN count(x)`;
        await querySettings.insertQuery(query);
        await querySettings.clickRunQuery(false);
        await querySettings.waitForRunQueryToBeEnabled();
        expect(await querySettings.getErrorNotification()).toBe(true);
        await apiCall.removeGraph(graphName);
    });

    test(`@admin Validate that running a query with limit returns limited results`, async () => {
        const querySettings = await browser.createNewPage(QuerySettingsPage, urls.settingsUrl);
        const limit = 5;
        await querySettings.addLimit(limit);
        await browser.navigateTo(urls.graphUrl);
        const graphName = getRandomString("settingsQuery");
        await querySettings.addGraph(graphName);
        const query = `UNWIND range(1, 10) as x CREATE (n:Person {name: x})`;
        await querySettings.insertQuery(query);
        await querySettings.clickRunQuery(false);
        await querySettings.waitForRunQueryToBeEnabled();
        let [result] = await Promise.all([
            querySettings.waitForResponse(`${urls.api.graphUrl}${graphName}?query=${prepareArg(query)}`),
            querySettings.clickRunQuery(false),
        ]);
        let json = await result.json();

        if (typeof json.result === "number") {

            [result] = await Promise.all([
                querySettings.waitForResponse(`${urls.api.graphUrl}${graphName}/query?id=${json.result}`),
            ])
            json = await result.json();
        }

        expect(json.result.data.length).toBe(limit);
        await apiCall.removeGraph(graphName);
    });
});