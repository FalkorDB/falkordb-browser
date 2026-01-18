/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphPage from "../logic/POM/graphPage";
import urls from '../config/urls.json';
import { BATCH_CREATE_PERSONS } from "../config/constants";
import { CREATE_NODE_QUERY, CREATE_QUERY, CREATE_TWO_NODES_QUERY, getRandomString } from "../infra/utils";

test.describe('Canvas Tests', () => {
    let browser: BrowserWrapper;
    let apicalls: ApiCalls;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apicalls = new ApiCalls();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

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
            await graph.searchElementInCanvas(searchQuery);
            await graph.hoverAtCanvasCenter();
            expect(await graph.getNodeCanvasToolTip()).toBe(`${node - 1}`);
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
        await graph.waitForScaleToStabilize();
        await graph.clickZoomInControl();
        await graph.waitForScaleToStabilize();
        const updatedGraph = await graph.getCanvasScaling();
        expect(updatedGraph.scaleX - initialGraph.scaleX).toBeGreaterThanOrEqual(1);
        expect(updatedGraph.scaleY - initialGraph.scaleY).toBeGreaterThanOrEqual(1);
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
        await graph.waitForScaleToStabilize();
        await graph.clickZoomOutControl();
        await graph.waitForScaleToStabilize();
        const updatedGraph = await graph.getCanvasScaling();
        expect(initialGraph.scaleX - updatedGraph.scaleX).toBeGreaterThanOrEqual(1);
        expect(initialGraph.scaleY - updatedGraph.scaleY).toBeGreaterThanOrEqual(1);

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
        expect(updatedGraph.scaleX - initialGraph.scaleX).toBeLessThanOrEqual(1);
        expect(updatedGraph.scaleY - initialGraph.scaleY).toBeLessThanOrEqual(1);
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

        expect(initialGraph.length).toBeGreaterThan(0);

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
        await graph.searchElementInCanvas("Alice");
        await graph.hoverAtCanvasCenter();
        expect(await graph.getNodeCanvasToolTip()).toBe("0");
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
        await graph.deleteElementByName("Bob");
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
        expect(await graph.isNodeCanvasToolTipVisible());
        expect(await graph.getNodeCanvasToolTip()).toBe("0");
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
        await graph.clickLabelsButtonByLabel("Labels", "person1");
        const nodes1 = await graph.getNodesScreenPositions('graph');
        expect(nodes1[0].visible).toBeFalsy();
        await graph.clickLabelsButtonByLabel("Labels", "person1");
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
        await graph.clickLabelsButtonByLabel("Relationships", "KNOWS");
        const links1 = await graph.getLinksScreenPositions('graph');
        expect(links1[0].visible).toBeFalsy();
        await graph.clickLabelsButtonByLabel("Relationships", "KNOWS");
        const links2 = await graph.getLinksScreenPositions('graph');
        expect(links2[0].visible).toBeTruthy();
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate label toggle does not hide multi-labeled node`, async () => {
        const graphName = getRandomString('graph');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery("CREATE (p:Person:Female {name: 'Alice'})-[r:KNOWS]->(c:Company {name: 'FalkorDB'}) RETURN p, r, c");
        await graph.clickRunQuery();
        await graph.clickLabelsButtonByLabel("Labels", "Person");
        let nodes = await graph.getNodesScreenPositions('graph');
        expect(nodes[0].visible).toBeTruthy();

        await graph.clickLabelsButtonByLabel("Labels", "Female");
        nodes = await graph.getNodesScreenPositions('graph');
        expect(nodes[0].visible).toBeFalsy();
        await apicalls.removeGraph(graphName);
    });

    const testLabels = ["Person", "Female"];
    testLabels.forEach(async (label) => {
        test(`@admin Multi-labeled node remains visible when toggling ${label}`, async () => {
            const graphName = getRandomString('graph');
            await apicalls.addGraph(graphName);
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            await browser.setPageToFullScreen();
            await graph.selectGraphByName(graphName);
            await graph.insertQuery(`CREATE (p:Childe:${label} {name: 'Alice'})-[r:KNOWS]->(c:Company {name: 'FalkorDB'}) RETURN p, r, c`);
            await graph.clickRunQuery();
            await graph.clickLabelsButtonByLabel("Labels", label);
            const nodes = await graph.getNodesScreenPositions('graph');
            expect(nodes[0].visible).toBeTruthy();
            await apicalls.removeGraph(graphName);
        });
    });

    test(`@admin Validate initial visibility with overlapping and multi labels`, async () => {
        const graphName = getRandomString('graph');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery(`CREATE (alice:Person:Female {name: 'Alice'}), (bob:Person:Male {name: 'Bob'}) RETURN alice, bob`);
        await graph.clickRunQuery();

        await graph.clickLabelsButtonByLabel("Labels", "Female");
        const nodes = await graph.getNodesScreenPositions('graph');
        // Alice has Female label, so should be visible
        const aliceNode = nodes.find(n => n.data?.name === 'Alice');
        expect(aliceNode.visible).toBeTruthy();
        // Bob does not have Female label, so should still be visible
        const bobNode = nodes.find(n => n.data?.name === 'Bob');
        expect(bobNode.visible).toBeTruthy();
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate progressive visibility changes when labels toggled off with overlapping and multi labels`, async () => {
        const graphName = getRandomString('graph');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery(`CREATE (alice:Person:Female {name: 'Alice'}), (bob:Person:Male {name: 'Bob'}) RETURN alice, bob`);
        await graph.clickRunQuery();

        await graph.clickLabelsButtonByLabel("Labels", "Female");
        // Toggle off 'Person' — now Alice should be hidden
        await graph.clickLabelsButtonByLabel("Labels", "Person");
        let nodes = await graph.getNodesScreenPositions('graph');
        expect(nodes.find(n => n.data?.name === 'Alice').visible).toBeFalsy();
        // Bob should still be visible
        expect(nodes.find(n => n.data?.name === 'Bob').visible).toBeTruthy();

        // Toggle 'Male' off — Alice should still be hidden and Bob should be hidden
        await graph.clickLabelsButtonByLabel("Labels", "Male");
        nodes = await graph.getNodesScreenPositions('graph');
        expect(nodes.find(n => n.data?.name === 'Alice').visible).toBeFalsy();
        expect(nodes.find(n => n.data?.name === 'Bob').visible).toBeFalsy();
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate progressive visibility restoration when labels toggled back on with overlapping and multi labels`, async () => {
        const graphName = getRandomString('graph');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery(`CREATE (alice:Person:Female {name: 'Alice'}), (bob:Person:Male {name: 'Bob'}) RETURN alice, bob`);
        await graph.clickRunQuery();

        await graph.clickLabelsButtonByLabel("Labels", "Female");
        await graph.clickLabelsButtonByLabel("Labels", "Person");
        await graph.clickLabelsButtonByLabel("Labels", "Male");
        // toggle female back on — Alice visible again
        await graph.clickLabelsButtonByLabel("Labels", "Female");
        let nodes = await graph.getNodesScreenPositions('graph');
        expect(nodes.find(n => n.data?.name === 'Alice').visible).toBeTruthy();
        expect(nodes.find(n => n.data?.name === 'Bob').visible).toBeFalsy();

        // Toggle 'Male' back on — Alice should and bob should be visible
        await graph.clickLabelsButtonByLabel("Labels", "Male");
        nodes = await graph.getNodesScreenPositions('graph');
        expect(nodes.find(n => n.data?.name === 'Alice').visible).toBeTruthy();
        expect(nodes.find(n => n.data?.name === 'Bob').visible).toBeTruthy();
        await apicalls.removeGraph(graphName);
    });

});