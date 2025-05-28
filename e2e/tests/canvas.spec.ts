/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphPage from "../logic/POM/graphPage";
import urls from '../config/urls.json'
import { BATCH_CREATE_PERSONS } from "../config/constants";
import { CREATE_TWO_NODES_QUERY, getRandomString } from "../infra/utils";

test.describe('Canvas Tests', () => {
    let browser: BrowserWrapper;
    let apicalls: ApiCalls;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apicalls = new ApiCalls();
    })

    test.afterEach(async () => {
        await browser.closeBrowser();
    })

    const testNodes = [1, 5, 10];
    testNodes.forEach(async (node) => {
        test(`@admin Validate search for node: ${node} in the canvas and ensure focus on correct node`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            await browser.setPageToFullScreen();
            const graphName = getRandomString('canvas');
            await graph.addGraph(graphName);
            await graph.insertQuery(BATCH_CREATE_PERSONS);
            await graph.clickRunQuery();
            const searchQuery = `Person ${node}`;
            await graph.searchElementInCanvas(searchQuery);
            await graph.hoverAtCanvasCenter();
            expect(await graph.getNodeCanvasToolTip()).toBe(searchQuery);
            await apicalls.removeGraph(graphName);
        });
    });

    test(`@admin Validate zoom-in functionality upon clicking the zoom in button`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = getRandomString('canvas');
        await graph.addGraph(graphName);
        await graph.insertQuery(CREATE_TWO_NODES_QUERY);
        await graph.clickRunQuery();
        await graph.clickCenterControl();
        const initialGraph = await graph.getCanvasScaling();
        await graph.clickZoomInControl();
        await graph.clickZoomInControl();
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
        await graph.insertQuery(CREATE_TWO_NODES_QUERY);
        await graph.clickRunQuery();
        await graph.clickCenterControl();
        await graph.waitForCanvasAnimationToEnd();
        const initialGraph = await graph.getCanvasScaling();
        await graph.clickZoomOutControl();
        await graph.clickZoomOutControl();
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
        await graph.insertQuery(CREATE_TWO_NODES_QUERY);
        await graph.clickRunQuery();
        await graph.clickCenterControl();
        await graph.waitForCanvasAnimationToEnd();
        const initialGraph = await graph.getCanvasScaling();
        await graph.clickZoomOutControl();
        await graph.clickCenterControl();
        await graph.waitForCanvasAnimationToEnd();
        const updatedGraph = await graph.getCanvasScaling();
        expect(Math.abs(updatedGraph.scaleX)).toBeLessThan(initialGraph.scaleX);
        expect(Math.abs(updatedGraph.scaleY)).toBeLessThan(initialGraph.scaleY);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate that dragging a node on the canvas updates its position`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = getRandomString('canvas');
        await graph.addGraph(graphName);
        await graph.insertQuery(BATCH_CREATE_PERSONS);
        await graph.clickRunQuery();
        const initialGraph = await graph.getNodesScreenPositions('graph');
        const fromX = initialGraph[0].screenX;
        const fromY = initialGraph[0].screenY;
        const toX = fromX + 100;
        const toY = fromY + 50;
        await graph.changeNodePosition(fromX, fromY, toX, toY);
        const updateGraph = await graph.getNodesScreenPositions('graph');
        expect(updateGraph[0].x).not.toBe(initialGraph[0].x);
        expect(updateGraph[0].y).not.toBe(initialGraph[0].y);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Creating a node and confirming its display on the canvas`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = getRandomString('canvas');
        await graph.addGraph(graphName,);
        await graph.insertQuery('CREATE (p:Person {name: "Alice", age: 30}) return p');
        await graph.clickRunQuery();
        await graph.getNodesScreenPositions('graph');
        await graph.searchElementInCanvas("Alice");
        await graph.hoverAtCanvasCenter();
        expect(await graph.getNodeCanvasToolTip()).toBe("Alice");
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Deleting a node and ensuring its removed from the canvas`, async () => {
        const graphName = getRandomString('canvas');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery('CREATE (a:Person {name: "Alice"}), (b:Person {name: "Bob"}) return a, b');
        await graph.clickRunQuery();
        await graph.deleteElementByName("Bob", "Node");
        await graph.waitForCanvasAnimationToEnd();
        expect(await graph.isSearchElementInCanvasVisible("Bob")).toBe(false);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin validate hovering on a node display correct toolTip`, async () => {
        const graphName = getRandomString('canvas');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery('CREATE (a:Person {name: "Bob"}) return a');
        await graph.clickRunQuery();
        await graph.searchElementInCanvas("Bob");
        await graph.waitForCanvasAnimationToEnd();
        await graph.hoverAtCanvasCenter();
        expect(await graph.isNodeCanvasToolTipVisible())
        expect(await graph.getNodeCanvasToolTip()).toBe("Bob");
        await apicalls.removeGraph(graphName);
    });

})