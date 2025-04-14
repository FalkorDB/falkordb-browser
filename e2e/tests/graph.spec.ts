/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import fs from 'fs';
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphPage from "../logic/POM/graphPage";
import urls from '../config/urls.json'
import queryData from '../config/queries.json'
import { CREATE_TEN_CONNECTED_NODES } from "../config/constants";
import { getRandomString } from "../infra/utils";

test.describe('Graph Tests', () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
        apiCall = new ApiCalls();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })

    test(`@admin Add graph via API -> verify display in UI test -> remove graph via UI`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(graphName)).toBe(true);
        await graph.refreshPage();
        await graph.deleteGraph(graphName);
    });


    test(`@admin Add graph via UI -> remove graph via API -> Verify graph removal in UI test`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const graphName = getRandomString('graph');
        await graph.addGraph(graphName);
        await new Promise(resolve => { setTimeout(resolve, 1000) });
        await apiCall.removeGraph(graphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(graphName)).toBe(false);
    });

    test(`@admin Create graph -> click the Export Data button -> verify the file has been successfully downloaded`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const graphName = getRandomString('graph');
        await graph.addGraph(graphName);
        const download = await graph.exportGraph();
        const downloadPath = await download.path();
        expect(fs.existsSync(downloadPath)).toBe(true);
        await apiCall.removeGraph(graphName);
    });

    queryData.queries[0].failedQueries.forEach((query) => {
        test(`@admin Validate failure & error message when any user runs an invalid queries: ${query.name}`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            const graphName = getRandomString('graph');
            await graph.addGraph(graphName);
            await graph.insertQuery(query.query);
            await graph.clickRunQuery(false);
            expect(await graph.getErrorNotification()).toBe(true);
            await apiCall.removeGraph(graphName);
        });
    })

    test(`@admin Validate that running a query with timeout returns an error`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const graphName = `graph_${Date.now()}`;
        await graph.addGraph(graphName);
        await graph.addTimeout();
        const query = `UNWIND range(1, 100000000) as x RETURN count(x)`;
        await graph.insertQuery(query);
        await graph.clickRunQuery(false);
        await graph.waitForRunQueryToBeEnabled();
        expect(await graph.getErrorNotification()).toBe(true);
        await apiCall.removeGraph(graphName);
    });
  
    test(`@admin Validate that the reload graph list function works by adding a graph via API and testing the reload button`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.reloadGraphList();
        expect(await graph.verifyGraphExists(graphName)).toBe(true);
        await apiCall.removeGraph(graphName);
    });

    test(`@admin Validate that modifying the graph name updates it correctly`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const newGraphName = getRandomString('graph');
        await graph.modifyGraphName(graphName, newGraphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(newGraphName)).toBe(true);
        await apiCall.removeGraph(newGraphName);
    });

    test(`@readwrite Validate that modifying a graph name fails and does not apply the change`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = getRandomString('graph');
        await graph.addGraph(graphName);
        await graph.refreshPage();
        const newGraphName = getRandomString('graph');
        await graph.modifyGraphName(graphName, newGraphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(newGraphName)).toBe(false);
        await apiCall.removeGraph(graphName);
    });

    test(`@readonly Validate failure & error message when RO user attempts to rename an existing graph via UI`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName, "admin");
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const newGraphName = getRandomString('graph');
        await graph.modifyGraphName(graphName, newGraphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(newGraphName)).toBe(false);
        await apiCall.removeGraph(graphName, "admin");
    });

    test(`@readwrite Validate that creating a graph with an existing name is prevented`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.addGraph(graphName);
        expect(await graph.getErrorNotification()).toBe(true);
        await apiCall.removeGraph(graphName);
    });

    test(`@admin Validate that modifying a graph name to an existing name is prevented`, async () => {
        const graphName1 = getRandomString('graph');
        const graphName2 = getRandomString('graph');
        await apiCall.addGraph(graphName1);
        await apiCall.addGraph(graphName2);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.modifyGraphName(graphName2, graphName1);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(graphName1)).toBe(true);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(graphName2)).toBe(true);
        await apiCall.removeGraph(graphName1);
        await apiCall.removeGraph(graphName2);
    });

    test(`@readwrite Validate that running multiple queries updates the node and edge count correctly`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery(CREATE_TEN_CONNECTED_NODES);
        await graph.clickRunQuery();
        const nodes = await graph.getNodesGraphStats();
        const edges = await graph.getEdgesGraphStats();
        expect(parseInt(nodes ?? "")).toBe(10);
        expect(parseInt(edges ?? "")).toBe(9)
        await apiCall.removeGraph(graphName);
    });

    test(`@admin validate that attempting to duplicate a graph with the same name displays an error notification`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = getRandomString('graph');
        await graph.addGraph(graphName);
        await graph.addGraph(graphName);
        expect(await graph.getErrorNotification()).toBe(true);
        await apiCall.removeGraph(graphName);
    });
})