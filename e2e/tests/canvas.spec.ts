/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphPage from "../logic/POM/graphPage";
import urls from '../config/urls.json'
import { BATCH_CREATE_PERSONS } from "../config/constants";
import { CREATE_NODE_QUERY, CREATE_QUERY, CREATE_TWO_NODES_QUERY, getRandomString } from "../infra/utils";

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
            const searchQuery = `Person${node}`;
            await graph.searchElementInCanvas("Graph", searchQuery);
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
        await graph.waitForScaleToStabilize();
        const initialGraph = await graph.getCanvasScaling();
        await graph.clickZoomInControl();
        await graph.clickZoomInControl();
        await graph.waitForScaleToStabilize();
        const updatedGraph = await graph.getCanvasScaling();
        expect(updatedGraph.scaleX - initialGraph.scaleX).toBeLessThanOrEqual(2);
        expect(updatedGraph.scaleY - initialGraph.scaleY).toBeLessThanOrEqual(2);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate zoom-out functionality upon clicking the zoom out button`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = getRandomString('canvas');
        await graph.addGraph(graphName);
        await graph.insertQuery(CREATE_TWO_NODES_QUERY);
        await graph.clickRunQuery();
        await graph.clickCenterControl();
        await graph.waitForScaleToStabilize();
        const initialGraph = await graph.getCanvasScaling();
        await graph.clickZoomOutControl();
        await graph.clickZoomOutControl();
        await graph.waitForScaleToStabilize();
        const updatedGraph = await graph.getCanvasScaling();
        expect(updatedGraph.scaleX - initialGraph.scaleX).toBeLessThanOrEqual(2);
        expect(updatedGraph.scaleY - initialGraph.scaleY).toBeLessThanOrEqual(2);
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
        await graph.waitForScaleToStabilize();
        const initialGraph = await graph.getCanvasScaling();
        await graph.clickZoomOutControl();
        await graph.clickCenterControl();
        await graph.waitForScaleToStabilize();
        const updatedGraph = await graph.getCanvasScaling();
        expect(updatedGraph.scaleX - initialGraph.scaleX).toBeLessThanOrEqual(2);
        expect(updatedGraph.scaleY - initialGraph.scaleY).toBeLessThanOrEqual(2);
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
        const toY = fromY + 100;
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
        await graph.searchElementInCanvas("Graph", "Alice");
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
        await graph.searchElementInCanvas("Graph", "Bob");
        await graph.waitForCanvasAnimationToEnd();
        await graph.hoverAtCanvasCenter();
        expect(await graph.isNodeCanvasToolTipVisible())
        expect(await graph.getNodeCanvasToolTip()).toBe("Bob");
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite moving a node to another node's position while animation is off should place them at the same position`, async () => {
        const graphName = getRandomString('graph');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery(CREATE_TWO_NODES_QUERY);
        await graph.clickRunQuery();
        await graph.waitForScaleToStabilize();
        const initNodes = await graph.getNodesScreenPositions('graph');
        const fromX = initNodes[0].screenX;
        const fromY = initNodes[0].screenY;
        const toX = initNodes[1].screenX;;
        const toY = initNodes[1].screenY;
        await graph.changeNodePosition(fromX, fromY, toX, toY);
        await graph.waitForScaleToStabilize();
        const nodes = await graph.getNodesScreenPositions('graph');
        expect(nodes[1].screenX - nodes[0].screenX).toBeLessThanOrEqual(2);
        expect(nodes[1].screenY - nodes[0].screenY).toBeLessThanOrEqual(2);
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite moving a node to another node's position while animation is on should push them apart`, async () => {
        const graphName = getRandomString('graph');
        await apicalls.addGraph(graphName);
        
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery(CREATE_TWO_NODES_QUERY);
        await graph.clickRunQuery();
        await graph.waitForScaleToStabilize();
        const initNodes = await graph.getNodesScreenPositions('graph');
        
        const fromX = initNodes[0].screenX;
        const fromY = initNodes[0].screenY;
        const toX = initNodes[1].screenX;;
        const toY = initNodes[1].screenY;
        await graph.changeNodePosition(fromX, fromY, toX, toY);
        await graph.waitForScaleToStabilize();
        
        const nodes = await graph.getNodesScreenPositions('graph');
        expect(Math.abs(nodes[1].screenX - nodes[0].screenX)).toBeLessThanOrEqual(2);
        expect(Math.abs(nodes[1].screenY - nodes[0].screenY)).toBeLessThanOrEqual(2);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate that toggling a category label updates node visibility on the canvas`, async () => {
        const graphName = getRandomString('graph');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery(CREATE_NODE_QUERY);
        await graph.clickRunQuery();
        await graph.clickLabelsButtonByLabel("Graph", "Labels", "person1");
        const nodes1 = await graph.getNodesScreenPositions('graph');
        expect(nodes1[0].visible).toBeFalsy();
        await graph.clickLabelsButtonByLabel("Graph", "Labels", "person1");
        const nodes2 = await graph.getNodesScreenPositions('graph');
        expect(nodes2[0].visible).toBeTruthy();
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate that toggling a relationship label updates edge visibility on the canvas`, async () => {
        const graphName = getRandomString('graph');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery(CREATE_QUERY);
        await graph.clickRunQuery();
        await graph.clickLabelsButtonByLabel("Graph", "Relationships", "KNOWS");
        const links1 = await graph.getLinksScreenPositions('graph');
        expect(links1[0].visible).toBeFalsy();
        await graph.clickLabelsButtonByLabel("Graph", "Relationships", "KNOWS");
        const links2 = await graph.getLinksScreenPositions('graph');
        expect(links2[0].visible).toBeTruthy();
        await apicalls.removeGraph(graphName);
    });

})