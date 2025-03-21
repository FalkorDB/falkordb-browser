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
        const graphName = `graph_${Date.now()}`;
        await apiCall.addGraph(graphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(graphName)).toBe(true);
        await graph.refreshPage();
        await graph.deleteGraph(graphName);
    });


    test(`@admin Add graph via UI -> remove graph via API -> Verify graph removal in UI test`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const graphName = `graph_${Date.now()}`;
        await graph.addGraph(graphName);
        await new Promise(resolve => { setTimeout(resolve, 1000) });
        const apiCall = new ApiCalls();
        await apiCall.removeGraph(graphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(graphName)).toBe(false);
    });

    test(`@admin Create graph -> click the Export Data button -> verify the file has been successfully downloaded`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const graphName = `graph_${Date.now()}`;
        await graph.addGraph(graphName);
        const download = await graph.exportGraph();
        const downloadPath = await download.path();
        expect(fs.existsSync(downloadPath)).toBe(true);
        await apicalls.removeGraph(graphName);
    });

    queryData.queries[0].failedQueries.forEach((query) => {
        test(`@admin Validate failure & error message when any user runs an invalid queries: ${query.name}`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            const graphName = `graph_${Date.now()}`;
            await graph.addGraph(graphName);
            await graph.insertQuery(query.query);
            await graph.clickRunQuery(false);
            expect(await graph.getErrorNotification()).toBe(true);
            await apicalls.removeGraph(graphName);
        });
    })
    
    test(`@admin Validate that the reload graph list function works by adding a graph via API and testing the reload button`, async () => {
        const graphName = `graph_${Date.now()}`;
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.reloadGraphList();
        expect(await graph.verifyGraphExists(graphName)).toBe(true);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate that modifying the graph name updates it correctly`, async () => {
        const graphName = `graph_${Date.now()}`;
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const newGraphName = `graph_${Date.now()}`;
        await graph.modifyGraphName(graphName, newGraphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(newGraphName)).toBe(true);
        await apicalls.removeGraph(newGraphName);
    });

    test(`@readwrite Validate that modifying a graph name fails and does not apply the change`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = `graph_${Date.now()}`;
        await graph.addGraph(graphName);
        await graph.refreshPage();
        const newGraphName = `graph_${Date.now()}`;
        await graph.modifyGraphName(graphName, newGraphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(newGraphName)).toBe(false);
        await apicalls.removeGraph(graphName);
    });

})