/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import apiCall from "../logic/api/apiCalls";
import urls from '../config/urls.json'
import { getRandomString } from "../infra/utils";
import SchemaPage from "../logic/POM/schemaPage";
import fs from 'fs';
import ApiCalls from "../logic/api/apiCalls";

test.describe('Schema Tests', () => {
    let browser: BrowserWrapper;
    let apiCall: apiCall;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apiCall = new ApiCalls();
    })

    test.afterEach(async () => {
        await browser.closeBrowser();
    })

    test(`@admin Validate that the reload schema list function works by adding a schema via API and testing the reload button`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.addSchema(schemaName);
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.reloadGraphList();
        expect(await schema.verifyGraphExists(schemaName)).toBe(true);
        await apiCall.removeGraph(schemaName);
    });

    test(`@admin Validate that a newly added node is rendered on the canvas and categorized correctly`, async () => {
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        const schemaName = getRandomString('schema');
        await schema.addSchema(schemaName);
        await schema.addNode("person", 'id', "Integer", "100", true, true);
        const graph = await schema.getNodeScreenPositions('schema');
        await schema.nodeClick(graph[0].screenX, graph[0].screenY);
        expect(await schema.getNodeCanvasToolTip()).toBe("person")
        expect(await schema.hasAttributeRows()).toBe(true);
        expect(await schema.getCategoriesPanelBtn()).toBe("person")
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin Validate that a created relationship appears in the canvas, opens the data panel, and updates the relationship types panel`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        await schema.prepareRelation("knows", 'id', "Integer", "100", true, true);
        await schema.clickRelationBetweenNodes();
        const links = await schema.getLinksScreenPositions('schema');
        await schema.nodeClick(links[0].midX, links[0].midY);
        expect(await schema.hasAttributeRows()).toBe(true);
        expect(await schema.isRelationshipTypesPanelBtnHidden()).toBeFalsy();
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin Validate that deleting a node removes it from the canvas and updates the category panel`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (n:person1 {id: "Integer!*-1"}) RETURN n');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        const nodes1 = await schema.getNodeScreenPositions('schema');
        await schema.deleteNode(nodes1[0].screenX, nodes1[0].screenY);
        const nodes2 = await schema.getNodeScreenPositions('schema');
        expect(nodes2.length).toEqual(nodes1.length - 1);
        expect(await schema.isCategoriesPanelBtnHidden()).toBeTruthy();
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin Validate that toggling a category label updates edge visibility on the canvas`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (n:person1 {id: "Integer!*-1"}) RETURN n');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        await schema.clickCategoriesPanelBtn();
        expect(await schema.getCategoriesPanelBtn()).toBe("person1")
        const nodes1 = await schema.getNodeScreenPositions('schema');
        expect(nodes1[0].visible).toBeFalsy();
        await schema.clickCategoriesPanelBtn();
        const nodes2 = await schema.getNodeScreenPositions('schema');
        expect(nodes2[0].visible).toBeTruthy();
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin Validate that toggling a relationship label updates edge visibility on the canvas`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}), (a)-[:knows]->(b) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        await schema.clickRelationshipTypesPanelBtn();
        expect(await schema.getRelationshipTypesPanelBtn()).toBe("knows");
        const links1 = await schema.getLinksScreenPositions('schema');
        expect(links1[0].visible).toBeFalsy();
        await schema.clickRelationshipTypesPanelBtn();
        const links2 = await schema.getLinksScreenPositions('schema'); 
        expect(links2[0].visible).toBeTruthy();
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin Validate that deleting a relationship removes it from the canvas and updates the relationship types panel`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}), (a)-[:knows]->(b) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        const links1 = await schema.getLinksScreenPositions('schema');
        await schema.deleteRelation(links1[0].midX, links1[0].midY);
        const links2 = await schema.getLinksScreenPositions('schema');
        expect(links2.length).toEqual(links1.length - 1);
        expect(await schema.isRelationshipTypesPanelBtnHidden()).toBeTruthy();
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin Validate that adding a node without a label is not allowed`, async () => {
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        const schemaName = getRandomString('schema');
        await schema.addSchema(schemaName);
        await schema.addNode("", 'id', "Integer", "100", true, true);
        const nodes = await schema.getNodeScreenPositions('schema');
        expect(nodes.length).toBe(0);
        await apiCall.removeSchema(schemaName);
    });

    const invalidNodeInputs = [
        { description: 'missing key', key: '', type: 'Integer', value: '100', isRequired: true, isUnique: true },
        { description: 'missing value', key: 'id', type: 'Integer', value: '', isRequired: true, isUnique: true }
    ];

    invalidNodeInputs.forEach(({ description, key, type, value, isRequired, isUnique }) => {
        test(`@admin Validate node attribute with invalid input doesn't update list: ${description}`, async () => {
          const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
          await browser.setPageToFullScreen();
          const schemaName = getRandomString('schema');
          await schema.addSchema(schemaName);
          await schema.clickAddNode();
          const initCount = await schema.getAttributeRowsCount();
          await schema.addAttribute(key, type, value, isRequired, isUnique);  
          expect(await schema.getAttributeRowsCount()).toEqual(initCount);
          await apiCall.removeSchema(schemaName);
        });
    });

    invalidNodeInputs.forEach(({ description, key, type, value, isRequired, isUnique }) => {
        test(`@admin Validate relation attribute with invalid input doesn't update list: ${description}`, async () => {
            const schemaName = getRandomString('schema');
            await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
            const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
            await browser.setPageToFullScreen();
            await schema.selectExistingGraph(schemaName);
            await schema.clickAddRelation();
            const initCount = await schema.getAttributeRowsCount();
            await schema.addAttribute(key, type, value, isRequired, isUnique);  
            expect(await schema.getAttributeRowsCount()).toEqual(initCount);
            await apiCall.removeSchema(schemaName);
        });
    });

    test(`@admin Validate that adding a relation without a label is not allowed`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        await schema.addRelationLabel("");
        await schema.clickCreateNewEdgeBtnInDataPanel();
        const links = await schema.getLinksScreenPositions('schema');
        expect(links.length).toBe(0);
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin Attempt to add relation without selecting two nodes`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        await schema.prepareRelation("knows", 'id', "Integer", "100", true, true);
        await schema.clickCreateNewEdgeBtnInDataPanel();
        const links = await schema.getLinksScreenPositions('schema');
        expect(links.length).toBe(0);
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin Validate that attempting to duplicate a schema with the same name displays an error notification`, async () => {
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        const schemaName = getRandomString('schema');
        await schema.addSchema(schemaName);
        await schema.addSchema(schemaName);
        expect(await schema.getErrorNotification()).toBe(true);
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin validate that deleting a schema node decreases node count`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        const nodes = await schema.getNodeScreenPositions('schema');
        const initCount = parseInt(await schema.getNodesGraphStats() ?? "", 10);
        await schema.deleteNode(nodes[0].screenX, nodes[0].screenY);
        expect(parseInt(await schema.getNodesGraphStats() ?? "", 10)).toBe(initCount - 1);
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin validate that adding a schema node increases node count`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        const initCount = parseInt(await schema.getNodesGraphStats() ?? "", 10);
        await schema.addNode("person", 'id', "Integer", "100", true, true);
        expect(parseInt(await schema.getNodesGraphStats() ?? "", 10)).toBe(initCount + 1);
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin validate that adding a schema relation increases edge count`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        const initCount = parseInt(await schema.getEdgesGraphStats() ?? "", 10);
        await schema.prepareRelation("knows", 'id', "Integer", "100", true, true);
        await schema.clickRelationBetweenNodes();
        expect(parseInt(await schema.getEdgesGraphStats() ?? "", 10)).toBe(initCount + 1);
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin validate that deleting a schema relation decreases edge count`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}), (a)-[:knows]->(b) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        const initCount = parseInt(await schema.getEdgesGraphStats() ?? "", 10);
        const links1 = await schema.getLinksScreenPositions('schema');
        await schema.deleteRelation(links1[0].midX, links1[0].midY);
        expect(parseInt(await schema.getEdgesGraphStats() ?? "", 10)).toBe(initCount - 1);
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin validate that deleting a schema relation doesn't decreases node count`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}), (a)-[:knows]->(b) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        const initCount = parseInt(await schema.getNodesGraphStats() ?? "", 10);
        const links = await schema.getLinksScreenPositions('schema');
        await schema.deleteRelation(links[0].midX, links[0].midY);
        expect(parseInt(await schema.getNodesGraphStats() ?? "", 10)).toBe(initCount);
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin validate that deleting a schema node doesn't decreases relations count`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}), (c:person3 {id: "Integer!*-3"}), (a)-[:knows]->(b) RETURN a, b, c');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        const initCount = parseInt(await schema.getEdgesGraphStats() ?? "", 10);
        const nodes = await schema.getNodeScreenPositions('schema');
        await schema.deleteNode(nodes[2].screenX, nodes[2].screenY);
        expect(parseInt(await schema.getEdgesGraphStats() ?? "", 10)).toBe(initCount);
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin validate that adding a node doesn't increases edges count`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.addSchema(schemaName)
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        const initCount = parseInt(await schema.getEdgesGraphStats() ?? "", 10);
        await schema.addNode("person", 'id', "Integer", "100", true, true);
        expect(parseInt(await schema.getEdgesGraphStats() ?? "", 10)).toBe(initCount);
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin validate that adding a relation doesn't increases node count`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.addSchema(schemaName);
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        const initCount = parseInt(await schema.getNodesGraphStats() ?? "", 10);
        await schema.prepareRelation("knows", 'id', "Integer", "100", true, true);
        await schema.clickRelationBetweenNodes();
        expect(parseInt(await schema.getNodesGraphStats() ?? "", 10)).toBe(initCount);
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin Validate that deleting a node with connection also removes the node and its connected edges`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}), (a)-[:knows]->(b) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        const initEdgeCount = parseInt(await schema.getEdgesGraphStats() ?? "", 10);
        const initNodeCount = parseInt(await schema.getNodesGraphStats() ?? "", 10);
        const nodes = await schema.getNodeScreenPositions('schema');
        await schema.deleteNode(nodes[0].screenX, nodes[0].screenY);
        expect(parseInt(await schema.getEdgesGraphStats() ?? "", 10)).toBe(initEdgeCount - 1);
        expect(parseInt(await schema.getNodesGraphStats() ?? "", 10)).toBe(initNodeCount - 1);
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin Validate that modifying a node label reflects the changes on the canvas`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}) RETURN a');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        const nodes = await schema.getNodeScreenPositions('schema');
        await schema.modifyNodeLabel(nodes[0].screenX, nodes[0].screenY, "person10");
        await schema.refreshPage();
        await schema.selectExistingGraph(schemaName);
        await schema.hoverAtCanvasCenter();
        expect(await schema.getNodeCanvasToolTip()).toBe("person10")
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin validate that duplicating a schema creates a new schema with same node and edges count`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}), (a)-[:knows]->(b) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        const newSchmaName = getRandomString('schema')
        await schema.duplicateGraph(newSchmaName);
        expect(parseInt(await schema.getNodesGraphStats() ?? "", 10)).toBe(2);
        expect(parseInt(await schema.getEdgesGraphStats() ?? "", 10)).toBe(1);
        expect(await schema.getRelationshipTypesPanelBtn()).toBe("knows");
        expect(await schema.getCategoriesPanelCount()).toBe(2);
        await apiCall.removeSchema(schemaName);
        await apiCall.removeSchema(newSchmaName);
    });

    test(`@readwrite add a relation between two nodes in UI and validate node and edge count via API`, async () => {
            const schemaName = getRandomString('schema');
            await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b')
            const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
            await browser.setPageToFullScreen();
            await schema.selectExistingGraph(schemaName);
            await schema.prepareRelation("knows", 'id', "Integer", "100", true, true);
            await schema.clickRelationBetweenNodes();
            await schema.waitForPageIdle();
            const count = await apiCall.getSchemaCount(schemaName);
            expect(count.result.edges).toBe(1);
            expect(count.result.nodes).toBe(2);
            await apiCall.removeSchema(schemaName);
    });

    test(`@readwrite delete node via API and validate node updates correctly in Ui via count`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b')
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        await apiCall.deleteSchemaNode(schemaName, "0", { "type" : "true"})
        await schema.refreshPage();
        await schema.selectExistingGraph(schemaName)
        expect(parseInt(await schema.getNodesGraphStats() ?? "", 10)).toBe(1);
        await apiCall.removeSchema(schemaName);
    });

    test(`@readwrite add node via API and validate node updates correctly in Ui via count`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.addSchema(schemaName);
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}) RETURN a')
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
          
        await apiCall.addSchemaNode(schemaName, {
            "type": true,
            "label": ["abcd"],
            "attributes": [["i", ["Integer", "10", "true", "true"]]],
            "selectedNodes": [null, null]
        });
        
        await schema.refreshPage();
        await schema.selectExistingGraph(schemaName)
        expect(parseInt(await schema.getNodesGraphStats() ?? "", 10)).toBe(2);
        await apiCall.removeSchema(schemaName);
    });

    test(`@readwrite add schema node label via API and validate categories count via UI`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}) RETURN a');
        await apiCall.addSchemaNodeLabel(schemaName, "0", { "label" : "artist"});
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        expect(await schema.getCategoriesPanelCount()).toBe(2);
        await apiCall.removeSchema(schemaName);
    });

    test(`@readwrite delete schema node label via API and validate categories count via UI`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, "CREATE (a:Person:Employee {name: 'Alice'}) RETURN a");
        await apiCall.deleteSchemaNodeLabel(schemaName, "0", { "label" : "Employee"})
        const graph = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(schemaName);
        expect(await graph.getCategoriesPanelCount()).toBe(1);
        await apiCall.removeSchema(schemaName);
    });

    test(`@readwrite add node schema attribute via API and validate attribute count via UI`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1"}) RETURN a');
        await apiCall.addSchemaNodeAttribute(schemaName, "0", "age", {"type": true, "attribute":["String", "12", "true", "true"]})
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        const nodes = await schema.getNodeScreenPositions('schema');
        await schema.nodeClick(nodes[0].screenX, nodes[0].screenY);
        expect( await schema.getAttributeRowsCount()).toBe(2);
        await apiCall.removeSchema(schemaName);
    });

    test(`@readwrite delete schema node attribute via API and validate attribute count via UI`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1", age: "30"}) RETURN a');
        await apiCall.deleteSchemaNodeAttribute(schemaName, "0", "age", { "type": true })
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        const nodes = await schema.getNodeScreenPositions('schema');
        await schema.nodeClick(nodes[0].screenX, nodes[0].screenY);
        expect( await schema.getAttributeRowsCount()).toBe(1);
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin Validate that the clear functionality works correctly when creating a relationship`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        await schema.clearNodeRelation();
        expect(await schema.findRelationshipNodes("1")).toBe("");
        expect(await schema.findRelationshipNodes("2")).toBe("");  
        await apiCall.removeSchema(schemaName);
    });

    test(`@admin Validate that the swap functionality works correctly when creating a relationship`, async () => {
        const schemaName = getRandomString('schema');
        await apiCall.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        await schema.swapNodesInRelation();
        expect(await schema.findRelationshipNodes("1")).toBe("person2");
        expect(await schema.findRelationshipNodes("2")).toBe("person1");  
        await apiCall.removeSchema(schemaName);
    });

    test(`@readwrite validate undo functionally after deleting attribute update correctly`, async () => {
        const graphName = getRandomString('schema');
        await apiCall.runSchemaQuery(graphName, 'CREATE (a:person1 {id: "Integer!*-1"}) RETURN a');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(graphName);
        const nodes = await schema.getNodeScreenPositions('schema');
        await schema.nodeClick(nodes[0].screenX, nodes[0].screenY);
        await schema.deleteAttriubute();
        await schema.clickUndoBtnInNotification();
        expect(await schema.getFirstDescInDataPanelAttr("1")).toBe("1")
        await apiCall.removeGraph(graphName);
    });

    test(`@readwrite validate undo functionally after modifying attribute update correctly`, async () => {
        const graphName = getRandomString('schema');
        await apiCall.runSchemaQuery(graphName, 'CREATE (a:person1 {id: "Integer!*-1"}) RETURN a');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(graphName);
        const nodes = await schema.getNodeScreenPositions('schema');
        await schema.nodeClick(nodes[0].screenX, nodes[0].screenY);
        await schema.modifyAttriubuteDesc("test");
        await schema.clickUndoBtnInNotification();
        expect(await schema.getFirstDescInDataPanelAttr("1")).toBe("1")
        await apiCall.removeGraph(graphName);
    });

    test(`@readwrite validate deleting attribute update attributes count correctly`, async () => {
        const graphName = getRandomString('schema');
        await apiCall.runSchemaQuery(graphName, 'CREATE (a:person1 {id: "Integer!*-1", name: "String!*-Alice"}) RETURN a');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(graphName);
        const nodes = await schema.getNodeScreenPositions('schema');
        await schema.nodeClick(nodes[0].screenX, nodes[0].screenY);
        await schema.deleteAttriubute();
        expect(parseInt(await schema.getAttributesStatsInSchemaDataPanel() ?? "", 10)).toBe(1)
        await apiCall.removeGraph(graphName);
    });
})