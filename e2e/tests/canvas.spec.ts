/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphPage from "../logic/POM/graphPage";
import urls from '../config/urls.json'
import { BATCH_CREATE_PERSONS } from "../config/constants";
import { getRandomString } from "../infra/utils";

test.describe('Canvas Tests', () => {
    let browser: BrowserWrapper;
    let apicalls: ApiCalls;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
        apicalls = new ApiCalls();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })
    
    const testNodes = [1, 5, 10];
    for (const node of testNodes) {
        test(`@admin Validate search for Person ${node} in the canvas and ensure focus`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            await browser.setPageToFullScreen();
            const graphName = getRandomString('canvas');
            await graph.addGraph(graphName);
            await graph.insertQuery(BATCH_CREATE_PERSONS);
            await graph.clickRunQuery();

            const searchQuery = `Person ${node}`;
            await graph.searchForElementInCanvas(searchQuery);
            await graph.hoverAtCanvasCenter();
            expect(await graph.getNodeCanvasToolTip()).toBe(searchQuery);

            await apicalls.removeGraph(graphName);
        });
    }

    test(`@admin Validate zoom-in functionality upon clicking the zoom in button`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = getRandomString('canvas');
        await graph.addGraph(graphName);
        await graph.insertQuery(BATCH_CREATE_PERSONS);
        await graph.clickRunQuery();
        const initialGraph = await graph.getCanvasScaling();
        await graph.clickOnZoomIn();
        await graph.clickOnZoomIn();
        const updatedGraph = await graph.getCanvasScaling();
        expect(updatedGraph.scaleX).toBeGreaterThan(initialGraph.scaleX);
        expect(updatedGraph.scaleY).toBeGreaterThan(initialGraph.scaleY);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate zoom-out functionality upon clicking the zoom in button`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = getRandomString('canvas');
        await graph.addGraph(graphName);
        await graph.insertQuery(BATCH_CREATE_PERSONS);
        await graph.clickRunQuery();
        const initialGraph = await graph.getCanvasScaling();
        await graph.clickOnZoomOut();
        await graph.clickOnZoomOut();
        const updatedGraph = await graph.getCanvasScaling();
        expect(updatedGraph.scaleX).toBeLessThan(initialGraph.scaleX);
        expect(updatedGraph.scaleY).toBeLessThan(initialGraph.scaleY);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate fit to size functionality upon clicking the fit to size button`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = getRandomString('canvas');
        await graph.addGraph(graphName);
        await graph.clickRunQuery();
        await graph.clickOnFitToSize();
        const initialGraph = await graph.getCanvasScaling();
        await graph.clickOnZoomOut();
        await graph.clickOnZoomOut();
        await graph.clickOnFitToSize();
        const updatedGraph = await graph.getCanvasScaling();
        expect(Math.abs(initialGraph.scaleX - updatedGraph.scaleX)).toBeLessThanOrEqual(0.2);
        expect(Math.abs(initialGraph.scaleY - updatedGraph.scaleY)).toBeLessThanOrEqual(0.2);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate that dragging a node on the canvas updates its position`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = getRandomString('canvas');
        await graph.addGraph(graphName);
        await graph.insertQuery(BATCH_CREATE_PERSONS);
        await graph.clickRunQuery();
        const initialGraph = await graph.getGraphDetails();
        await graph.changeNodePosition(initialGraph[0].screenX, initialGraph[0].screenY);
        const updateGraph = await graph.getGraphDetails();
        expect(updateGraph[0].x).not.toBe(initialGraph[0].x);
        expect(updateGraph[0].y).not.toBe(initialGraph[0].y);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate success when creating a node and confirming its display on the canvas`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = getRandomString('canvas');
        await graph.addGraph(graphName,);
        await graph.insertQuery('CREATE (p:Person {name: "Alice", age: 30}) return p');
        await graph.clickRunQuery();
        await graph.getGraphDetails();
        await graph.searchForElementInCanvas("Alice");
        await graph.hoverAtCanvasCenter();
        expect(await graph.getNodeCanvasToolTip()).toBe("Alice");
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate success when updating node properties and seeing the update on the canvas`, async () => {
        const graphName = getRandomString('canvas');
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (:Person {name: "Bob", age: 40})');
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('MATCH (p:Person {name: "Bob"}) RETURN p');
        await graph.clickRunQuery();
        await graph.getGraphDetails();
        await graph.searchForElementInCanvas("bob");
        await graph.rightClickAtCanvasCenter();
        expect(await graph.getDataCellByAttrInDataPanel("age")).toBe("40");
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate success when deleting a node and ensuring its removed from the canvas`, async () => {
        const graphName = getRandomString('canvas');
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (:Person {name: "Alice"}), (:Person {name: "Bob"}) WITH * MATCH (p:Person {name: "Bob"}) DELETE p');
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('MATCH (n) RETURN n');
        await graph.clickRunQuery();
        await graph.getGraphDetails();
        await graph.searchForElementInCanvas("bob");
        await graph.rightClickAtCanvasCenter();
        expect(await graph.getNodeCanvasToolTip()).not.toBe("bob");
        await apicalls.removeGraph(graphName);
    });

})