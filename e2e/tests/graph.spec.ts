import { expect, test } from "@playwright/test";
import fs from 'fs';
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphPage from "../logic/POM/graphPage";
import urls from '../config/urls.json'
import queryData from '../config/queries.json'
import roles from '../config/user.json'

test.describe('Graph Tests', () => {
    let browser: BrowserWrapper;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl)
        await graph.removeAllGraphs();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })

    roles.userRoles.slice(0, 2).forEach(role => {
        test(`@${role.role} Add graph via API -> verify display in UI test -> remove graph via UI`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            const apiCall = new ApiCalls();
            const graphName = `graph_${Date.now()}`;
            await apiCall.addGraph(graphName);
            await graph.refreshPage();
            expect(await graph.verifyGraphExists(graphName)).toBe(true);
            await graph.refreshPage();
            await graph.deleteGraph(graphName);
        });
    });

    roles.userRoles.slice(0, 2).forEach(role => {
        test(`@${role.role} Add graph via UI -> remove graph via API -> Verify graph removal in UI test`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            const graphName = `graph_${Date.now()}`;
            await graph.addGraph(graphName);
            await new Promise(resolve => { setTimeout(resolve, 1000) });
            const apiCall = new ApiCalls();
            await apiCall.removeGraph(graphName);
            await graph.refreshPage();
            expect(await graph.verifyGraphExists(graphName)).toBe(false);
        });
    });

    roles.userRoles.slice(0, 2).forEach(role => {
        test(`@${role.role} Create graph -> click the Export Data button -> verify the file has been successfully downloaded`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            const graphName = `graph_${Date.now()}`;
            await graph.addGraph(graphName);
            const download = await graph.exportGraph();
            const downloadPath = await download.path();
            expect(fs.existsSync(downloadPath)).toBe(true);
        });
    });

    roles.userRoles.slice(0, 2).forEach(role => {
        test(`@${role.role} Query Test: Create a graph via api -> run a query via api and validate that the response data is correct`, async () => {
            const apiCall = new ApiCalls()
            const graphName = `graph_${Date.now()}`
            await apiCall.addGraph(graphName)
            const query = graphName + queryData.queries[0].query
            const res = await apiCall.runQuery(query)
            expect(
                res.result &&
                Array.isArray(res.result.metadata) &&
                res.result.metadata.length >= 5 &&
                Array.isArray(res.result.data)
            ).toBe(true);
        })
    });
})