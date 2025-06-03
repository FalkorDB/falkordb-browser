/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import urls from '../config/urls.json'
import { getRandomString } from "../infra/utils";
import SchemaPage from "../logic/POM/schemaPage";

test.describe('Schema Tests', () => {
    let browser: BrowserWrapper;
    let apicalls: ApiCalls;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apicalls = new ApiCalls();
    })

    test.afterEach(async () => {
        await browser.closeBrowser();
    })

    test(`@admin Add schema via API and verify existing via UI`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.addSchema(schemaName);
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        expect(await schema.verifySchemaExists(schemaName)).toBe(true);
        await apicalls.removeGraph(schemaName);
    });

    test(`@admin Add schema via UI and verify existing via API`, async () => {
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        const schemaName = getRandomString('schema');
        await browser.setPageToFullScreen();
        await schema.addSchema(schemaName);
        const schemas = await apicalls.getSchemas();
        expect(schemas.opts.includes(schemaName)).toBe(true);
        await apicalls.removeGraph(schemaName);
    });

    test(`@admin Validate that modifying the schema name updates it correctly`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.addSchema(schemaName);
        const graph = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        const newSchemaName = getRandomString('schema');
        await graph.modifySchemaName(schemaName, newSchemaName);
        const response = await apicalls.getSchemas();
        expect(response.opts.includes(newSchemaName)).toBeTruthy();
        await apicalls.removeSchema(newSchemaName);
    });
    
    test(`@admin Validate that a creating a node updates labels on the canvas`, async () => {
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        const schemaName = getRandomString('schema');
        await schema.addSchema(schemaName);
        const attributeRow = "1"
        await schema.addNode(attributeRow, "person", 'id', "Integer", "100", true, true);
        expect(await schema.isVisibleLabelsButtonByName("Schema", "Labels", "person")).toBeTruthy();
        await apicalls.removeSchema(schemaName);
    });
    
    test(`@admin Validate that a creating edge updates relationship types panel`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.waitForCanvasAnimationToEnd();
        const nodes = await schema.getNodesScreenPositions('schema');
        const attributeRow = "1"
        await schema.addEdge(attributeRow, "knows", 'id', "Integer", "100", true, true, nodes[0].screenX, nodes[0].screenY, nodes[1].screenX, nodes[1].screenY);
        expect(await schema.isVisibleLabelsButtonByName("Schema", "RelationshipTypes", "knows")).toBeTruthy();
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin Validate that deleting a node removes updates the labels panel`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.waitForCanvasAnimationToEnd();
        await schema.searchElementInCanvas("Schema", "0");
        await schema.deleteSchemaElement();;
        expect(await schema.isVisibleLabelsButtonByName("Schema", "Labels", "person")).toBeFalsy();
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin Validate that deleting a relationship updates the relationship types panel`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}), (a)-[:knows]->(b) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.waitForCanvasAnimationToEnd();
        const links1 = await schema.getLinksScreenPositions('schema');
        await schema.searchElementInCanvasSelectFirst("knows");
        await schema.deleteSchemaElement();;
        expect(await schema.isVisibleLabelsButtonByName("Schema", "RelationshipTypes", "knows")).toBeFalsy();
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin Validate that toggling a category label updates edge visibility on the canvas`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (n:person1 {id: "Integer!*-1"}) RETURN n');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.clickLabelsButtonByLabel("Schema", "Labels", "person1");
        const nodes1 = await schema.getNodesScreenPositions('schema');
        expect(nodes1[0].visible).toBeFalsy();
        await schema.clickLabelsButtonByLabel("Schema", "Labels", "person1");
        const nodes2 = await schema.getNodesScreenPositions('schema');
        expect(nodes2[0].visible).toBeTruthy();
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin Validate that toggling a relationship label updates edge visibility on the canvas`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}), (a)-[:knows]->(b) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.clickLabelsButtonByLabel("Schema", "RelationshipTypes", "knows");
        const links1 = await schema.getLinksScreenPositions('schema');
        expect(links1[0].visible).toBeFalsy();
        await schema.clickLabelsButtonByLabel("Schema", "RelationshipTypes", "knows");
        const links2 = await schema.getLinksScreenPositions('schema');
        expect(links2[0].visible).toBeTruthy();
        await apicalls.removeSchema(schemaName);
    });

    test.skip(`@admin Validate that adding a node without a label is not allowed`, async () => {
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        const schemaName = getRandomString('schema');
        await schema.addSchema(schemaName);
        const attributeRow = "1"
        await schema.addNode(attributeRow, "", 'id', "Integer", "100", true, true);
        const nodes = await schema.getNodesScreenPositions('schema');
        expect(nodes.length).toBe(0);
        await apicalls.removeSchema(schemaName);
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
          await schema.clickElementCanvasAdd();
          await schema.clickElementCanvasAddNode();
          const initCount = await schema.getContentDataPanelAttributesCount();
          const attributeRow = "1"
          await schema.addAttribute(attributeRow, key, type, value, isRequired, isUnique);  
          expect(await schema.getContentDataPanelAttributesCount()).toEqual(initCount);
          await apicalls.removeSchema(schemaName);
        });
    });

    invalidNodeInputs.forEach(({ description, key, type, value, isRequired, isUnique }) => {
        test(`@admin Validate relation attribute with invalid input doesn't update list: ${description}`, async () => {
            const schemaName = getRandomString('schema');
            await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
            const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
            await browser.setPageToFullScreen();
            await schema.selectSchemaByName(schemaName);
            await schema.clickElementCanvasAdd();
            await schema.clickElementCanvasAddEdge();
            const initCount = await schema.getContentDataPanelAttributesCount();
            const attributeRow = "1"
            await schema.addAttribute(attributeRow, key, type, value, isRequired, isUnique);  
            expect(await schema.getContentDataPanelAttributesCount()).toEqual(initCount);
            await apicalls.removeSchema(schemaName);
        });
    });

    test(`@admin Validate that adding a relation without a label is not allowed`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.clickElementCanvasAdd();
        await schema.clickElementCanvasAddEdge();
        await schema.addLabelToNode("");
        await schema.clickCreateNewNodeButton();
        const links = await schema.getLinksScreenPositions('schema');
        expect(links.length).toBe(0);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin Attempt to add relation without selecting two nodes`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.clickElementCanvasAdd();
        await schema.clickElementCanvasAddEdge();
        const attributeRow = "1"
        await schema.addAttribute(attributeRow, 'id', "Integer", "100", true, true);
        await schema.clickCreateNewNodeButton();
        const links = await schema.getLinksScreenPositions('schema');
        expect(links.length).toBe(0);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin Validate that attempting to duplicate a schema with the same name displays an error notification`, async () => {
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        const schemaName = getRandomString('schema');
        await schema.addSchema(schemaName);
        await schema.addSchema(schemaName);
        expect(await schema.getErrorNotification()).toBe(true);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that deleting a schema node decreases node count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.searchElementInCanvas("Schema", "0");
        await schema.deleteSchemaElement();;
        const nodesCount = parseInt(await schema.getNodesCount() ?? "", 10);
        expect(nodesCount).toBe(1);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that adding a schema node increases node count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        const attributeRow = "1"
        await schema.addNode(attributeRow, "person", 'id', "Integer", "100", true, true);
        const nodesCount = parseInt(await schema.getNodesCount() ?? "", 10);
        expect(nodesCount).toBe(3);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that adding a schema edge increases edge count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.waitForCanvasAnimationToEnd();
        const nodes = await schema.getNodesScreenPositions('schema');
        const attributeRow = "1"
        await schema.addEdge(attributeRow, "knows", 'id', "Integer", "100", true, true, nodes[0].screenX, nodes[0].screenY, nodes[1].screenX, nodes[1].screenY);
        const edgesCount = parseInt(await schema.getEdgesCount() ?? "", 10);
        expect(edgesCount).toBe(1);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that deleting a schema edge decreases edge count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}), (a)-[:knows]->(b) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.waitForCanvasAnimationToEnd();
        await schema.searchElementInCanvasSelectFirst("knows");
        await schema.deleteSchemaElement();;
        const edgesCount = await schema.getEdgesCount();
        expect(expect(parseInt(edgesCount ?? "0", 10)).toBe(0));
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that deleting a schema edge doesn't decreases node count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}), (a)-[:knows]->(b) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.waitForCanvasAnimationToEnd();
        await schema.searchElementInCanvasSelectFirst("knows");
        await schema.deleteSchemaElement();;
        const nodesCount = await schema.getNodesCount();
        expect(expect(parseInt(nodesCount ?? "0", 10)).toBe(2));
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that deleting a schema node doesn't decreases edges count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}), (c:person3 {id: "Integer!*-3"}), (a)-[:knows]->(b) RETURN a, b, c');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.waitForCanvasAnimationToEnd();
        await schema.searchElementInCanvas("Schema", "2");
        await schema.deleteSchemaElement();
        const nodesCount = await schema.getNodesCount();
        expect(expect(parseInt(nodesCount ?? "0", 10)).toBe(2));
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that deleting a connected schema node decreases edges count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}), (a)-[:knows]->(b) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.waitForCanvasAnimationToEnd();
        await schema.searchElementInCanvas("Schema", "1");
        await schema.deleteSchemaElement();
        const edgesCount = await schema.getEdgesCount();
        expect(expect(parseInt(edgesCount ?? "0", 10)).toBe(0));
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that adding a node doesn't increases edges count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.addSchema(schemaName)
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        const attributeRow = "1"
        await schema.addNode(attributeRow, "person", 'id', "Integer", "100", true, true);
        const edgesCount = await schema.getEdgesCount();
        expect(expect(parseInt(edgesCount ?? "0", 10)).toBe(0));
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that adding edge doesn't increases node count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.addSchema(schemaName);
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.waitForCanvasAnimationToEnd();
        const nodes = await schema.getNodesScreenPositions('schema');
        const attributeRow = "1"
        await schema.addEdge(attributeRow, "knows", 'id', "Integer", "100", true, true, nodes[0].screenX, nodes[0].screenY, nodes[1].screenX, nodes[1].screenY);
        const nodesCount = await schema.getNodesCount();
        expect(expect(parseInt(nodesCount ?? "0", 10)).toBe(2));
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate adding attribute value to existing node updates attributes count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.addSchema(schemaName);
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.searchElementInCanvas("Schema", "1");
        await schema.clickAddValueButton();
        const attributeRow = "2"
        await schema.addValueToExistingElementDataPanel(attributeRow, 'id', "Integer", "100", true, true);
        expect(await schema.getContentDataPanelAttributesCount()).toBe(2);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate removing attribute value to existing node updates attributes count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.addSchema(schemaName);
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:Person {id: "1", age: "30"}) RETURN a');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.searchElementInCanvas("Schema", "0");
        const attributeRow = "2"
        await schema.removeAttributeByRow(attributeRow);
        expect(await schema.getContentDataPanelAttributesCount()).toBe(1);
        await apicalls.removeSchema(schemaName);
    });


    //add attribute value to existing edge
    //remove attribute value to existing edge
    //swap
    //clear
    //modify attribute value to existing node
    //modify attribute valie to existing edge
    // undo when removing update attriubute value
    // undo when deleting attriubute value
    //modify label of existing node
    //modify label of existing edge

})