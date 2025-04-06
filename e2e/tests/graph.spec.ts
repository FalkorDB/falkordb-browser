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
    let apicalls: ApiCalls;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
        apicalls = new ApiCalls();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })

    test(`@admin Add graph via API -> verify display in UI test -> remove graph via UI`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const apiCall = new ApiCalls();
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
        const apiCall = new ApiCalls();
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
        await apicalls.removeGraph(graphName);
    });

    queryData.queries[0].failedQueries.forEach((query) => {
        test(`@admin Validate failure & error message when any user runs an invalid queries: ${query.name}`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            const graphName = getRandomString('graph');
            await graph.addGraph(graphName);
            await graph.insertQuery(query.query);
            await graph.clickRunQuery(false);
            expect(await graph.getErrorNotification()).toBe(true);
            await apicalls.removeGraph(graphName);
        });
    })
    
    test(`@admin Validate that the reload graph list function works by adding a graph via API and testing the reload button`, async () => {
        const graphName = getRandomString('graph');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.reloadGraphList();
        expect(await graph.verifyGraphExists(graphName)).toBe(true);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate that modifying the graph name updates it correctly`, async () => {
        const graphName = getRandomString('graph');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const newGraphName = getRandomString('graph');
        await graph.modifyGraphName(graphName, newGraphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(newGraphName)).toBe(true);
        await apicalls.removeGraph(newGraphName);
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
        await apicalls.removeGraph(graphName);
    });

    test(`@readonly Validate failure & error message when RO user attempts to rename an existing graph via UI`, async () => {
        const graphName = getRandomString('graph');
        await apicalls.addGraph(graphName, "admin");
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const newGraphName = getRandomString('graph');
        await graph.modifyGraphName(graphName, newGraphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(newGraphName)).toBe(false);
        await apicalls.removeGraph(graphName, "admin");
    });

    test(`@readwrite Validate that creating a graph with an existing name is preventedI`, async () => {
        const graphName = getRandomString('graph');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.addGraph(graphName);
        expect(await graph.getErrorNotification()).toBe(true);
        const graphNames = await apicalls.getGraphs();
        const count = graphNames.result.filter(name => name === graphName).length;
        expect(count).toBe(1);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate that modifying a graph name to an existing name is prevented`, async () => {
        const graphName1 = getRandomString('graph');
        const graphName2 = getRandomString('graph');
        await apicalls.addGraph(graphName1);
        await apicalls.addGraph(graphName2);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.modifyGraphName(graphName2, graphName1);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(graphName1)).toBe(true);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(graphName2)).toBe(true);
        await apicalls.removeGraph(graphName1);
        await apicalls.removeGraph(graphName2);
    });

    test(`@readwrite Validate that running multiple queries updates the node and edge count correctly`, async () => {
        const graphName = getRandomString('graph');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery(CREATE_TEN_CONNECTED_NODES);
        await graph.clickRunQuery();
        const nodes = await graph.getNodesGraphStats();
        const edges = await graph.getEdgesGraphStats();
        expect(parseInt(nodes ?? "")).toBe(10);
        expect(parseInt(edges ?? "")).toBe(9)
        await apicalls.removeGraph(graphName);
    });
})