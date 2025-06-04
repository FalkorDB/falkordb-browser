/* eslint-disable no-await-in-loop */

import test, { expect } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import urls from '../config/urls.json'
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";
import TableView from "../logic/POM/tableView";

test.describe('Table View Tests', () => {

    let browser: BrowserWrapper;
    let apiCalls: ApiCalls;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apiCalls = new ApiCalls();
    })

    test.afterEach(async () => {
        await browser.closeBrowser();
    })

    test('@admin Validate that table view is disabled when there is no data', async () => {
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        const isTableViewEnabled = await tableView.GetIsTableViewTabEnabled();
        expect(isTableViewEnabled).toBe(false);
    })

    test('@admin Validate that table view is enabled when there is data', async () => {
        const graphName = getRandomString('table');
        await apiCalls.addGraph(graphName);
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        await tableView.insertQuery("CREATE (n) RETURN n");
        await tableView.clickRunQuery(false);
        const isTableViewEnabled = await tableView.GetIsTableViewTabEnabled();
        expect(isTableViewEnabled).toBe(true);
    })

    test('@admin Validate that table view is selected when there is data', async () => {
        const graphName = getRandomString('table');
        await apiCalls.addGraph(graphName);
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        await tableView.insertQuery("UNWIND range(1, 10) AS x RETURN x");
        await tableView.clickRunQuery(false);
        const isTableViewSelected = await tableView.GetIsTableViewTabSelected();
        expect(isTableViewSelected).toBe(true);
    })

    test('@admin Validate that the data displayed in the table view is the same as the data returned by the query', async () => {
        const graphName = getRandomString('table');
        await apiCalls.addGraph(graphName);
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        const query = "UNWIND range(1, 10) AS x RETURN x";
        await tableView.insertQuery(query);
        await tableView.clickRunQuery(false);
        const data = await tableView.getRowsCount();
        expect(data).toBe(10);
    })
})