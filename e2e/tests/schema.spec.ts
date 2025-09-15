/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import urls from '../config/urls.json'
import { getRandomString } from "../infra/utils";
import SchemaPage from "../logic/POM/schemaPage";
import { BATCH_CREATE_PERSONS } from "../config/constants";

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
    
    test(`@admin Validate that creating a node updates labels on the canvas`, async () => {
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        const schemaName = getRandomString('schema');
        await schema.addSchema(schemaName);
        const attributeRow = "1"
        await schema.addNode(attributeRow, "person", 'id', "Integer", "100", true, true);
        await schema.waitForCanvasAnimationToEnd();
        const labelContent = await schema.getLabelsButtonByNameContent("Labels", "person");
        expect(labelContent).toBe("person");
        await apicalls.removeSchema(schemaName);
    });
    
    test(`@admin Validate that a creating edge updates relationship types panel`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, BATCH_CREATE_PERSONS);
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        const attributeRow = "1"
        await schema.addEdge(attributeRow, "knows", 'id', "Integer", "100", true, true);
        const labelContent = await schema.getLabelsButtonByNameContent("Relationships", "knows");
        expect(labelContent).toBe("knows");
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin Validate that deleting a node removes updates the labels panel`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.searchElementInCanvasSelectFirst("0");
        await schema.deleteSchemaElement();;
        expect(await schema.isVisibleLabelsButtonByName("Labels", "person")).toBeFalsy();
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin Validate that deleting a relationship updates the relationship types panel`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}), (a)-[:knows]->(b) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.searchElementInCanvasSelectFirst("knows");
        await schema.deleteSchemaElement();;
        expect(await schema.isVisibleLabelsButtonByName("Relationships", "knows")).toBeFalsy();
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin Validate that toggling a category label updates edge visibility on the canvas`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (n:person1 {id: "1"}) RETURN n');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.clickLabelsButtonByLabel("Labels", "person1");
        const nodes1 = await schema.getNodesScreenPositions('schema');
        expect(nodes1[0].visible).toBeFalsy();
        await schema.clickLabelsButtonByLabel("Labels", "person1");
        const nodes2 = await schema.getNodesScreenPositions('schema');
        expect(nodes2[0].visible).toBeTruthy();
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin Validate that toggling a relationship label updates edge visibility on the canvas`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}), (a)-[:knows]->(b) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.clickLabelsButtonByLabel("Relationships", "knows");
        const links1 = await schema.getLinksScreenPositions('schema');
        expect(links1[0].visible).toBeFalsy();
        await schema.clickLabelsButtonByLabel("Relationships", "knows");
        const links2 = await schema.getLinksScreenPositions('schema');
        expect(links2[0].visible).toBeTruthy();
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
            await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
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
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
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
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
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
        const schemaName = getRandomString("graph");
        await apicalls.addSchema(schemaName);  
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.addSchema(schemaName);
        expect(await schema.getNotificationErrorToast()).toBeTruthy();
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that deleting a schema node decreases node count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
    const initialNodesCount = parseInt(await schema.getNodesCount() ?? "0", 10);
        await schema.searchElementInCanvasSelectFirst("0");
        await schema.deleteSchemaElement();
        const finalNodesCount = parseInt(await schema.getNodesCount() ?? "0", 10);
        expect(finalNodesCount).toBe(initialNodesCount - 1);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that adding a schema node increases node count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        const initialNodesCount = parseInt(await schema.getNodesCount() ?? "0", 10);
        const attributeRow = "1"
        await schema.addNode(attributeRow, "person", 'id', "Integer", "100", true, true);
        const finalNodesCount = parseInt(await schema.getNodesCount() ?? "0", 10);
        expect(finalNodesCount).toBe(initialNodesCount + 1);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that adding a schema edge increases edge count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, BATCH_CREATE_PERSONS);
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        const initialEdgesCount = parseInt(await schema.getEdgesCount() ?? "0", 10);
        const attributeRow = "1"
        await schema.addEdge(attributeRow, "knows", 'id', "Integer", "100", true, true);
        const finalEdgesCount = parseInt(await schema.getEdgesCount() ?? "0", 10);
        expect(finalEdgesCount).toBe(initialEdgesCount + 1);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that deleting a schema edge decreases edge count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}), (a)-[:knows]->(b) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        const initialEdgesCount = parseInt(await schema.getEdgesCount() ?? "0", 10);
        await schema.searchElementInCanvasSelectFirst("knows");
        await schema.deleteSchemaElement();
        const finalEdgesCount = parseInt(await schema.getEdgesCount() ?? "0", 10);
        expect(finalEdgesCount).toBe(initialEdgesCount - 1);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that deleting a schema edge doesn't decreases node count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}), (a)-[:knows]->(b) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        const initialNodesCount = parseInt(await schema.getNodesCount() ?? "0", 10);
        await schema.searchElementInCanvasSelectFirst("knows");
        await schema.deleteSchemaElement();
        const finalNodesCount = parseInt(await schema.getNodesCount() ?? "0", 10);
        expect(finalNodesCount).toBe(initialNodesCount);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that deleting a schema node doesn't decreases edges count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person {id: "1"}), (b:person {id: "2"}), (c:person {id: "3"}), (a)-[:knows]->(b) RETURN a, b, c');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        const initialEdgesCount = parseInt(await schema.getEdgesCount() ?? "0", 10);
        await schema.searchElementInCanvasSelectFirst("2");
        await schema.deleteSchemaElement();
        const finalEdgesCount = parseInt(await schema.getEdgesCount() ?? "0", 10);
        expect(finalEdgesCount).toBe(initialEdgesCount);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that deleting a connected schema node decreases edges count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}), (a)-[:knows]->(b) RETURN a, b');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        const initialEdgesCount = parseInt(await schema.getEdgesCount() ?? "0", 10);
        await schema.searchElementInCanvasSelectFirst("person1");
        await schema.deleteSchemaElement();
        const finalEdgesCount = parseInt(await schema.getEdgesCount() ?? "0", 10);
        expect(finalEdgesCount).toBeLessThan(initialEdgesCount);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that adding a node doesn't increases edges count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.addSchema(schemaName)
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        const initialEdgesCount = parseInt(await schema.getEdgesCount() ?? "0", 10);
        const attributeRow = "1"
        await schema.addNode(attributeRow, "person", 'id', "Integer", "100", true, true);
        const finalEdgesCount = parseInt(await schema.getEdgesCount() ?? "0", 10);
        expect(finalEdgesCount).toBe(initialEdgesCount);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate that adding edge doesn't increases node count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.addSchema(schemaName);
        await apicalls.runSchemaQuery(schemaName, BATCH_CREATE_PERSONS);
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        const initialNodesCount = parseInt(await schema.getNodesCount() ?? "0", 10);
        const attributeRow = "1"
        await schema.addEdge(attributeRow, "knows", 'id', "Integer", "100", true, true);
        const finalNodesCount = parseInt(await schema.getNodesCount() ?? "0", 10);
        expect(finalNodesCount).toBe(initialNodesCount);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate adding attribute value to existing node updates attributes count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.addSchema(schemaName);
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:person1 {id: "1"}) RETURN a');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.searchElementInCanvasSelectFirst("0");
        const initialAttributesCount = await schema.getContentDataPanelAttributesCount();
        await schema.clickAddValueButton();
        const attributeRow = "2"
        await schema.addValueToExistingElementDataPanel(attributeRow, 'age', "Integer", "25", true, true);
        const finalAttributesCount = await schema.getContentDataPanelAttributesCount();
        expect(finalAttributesCount).toBe(initialAttributesCount + 1);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin validate removing attribute value to existing node updates attributes count`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.addSchema(schemaName);
        await apicalls.runSchemaQuery(schemaName, 'CREATE (a:Person {id: "1", age: "30"}) RETURN a');
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectSchemaByName(schemaName);
        await schema.searchElementInCanvasSelectFirst("0");
        const initialAttributesCount = await schema.getContentDataPanelAttributesCount();
        const attributeRow = "2"
        await schema.removeAttributeByRow(attributeRow);
        const finalAttributesCount = await schema.getContentDataPanelAttributesCount();
        expect(finalAttributesCount).toBe(initialAttributesCount - 1);
        await apicalls.removeSchema(schemaName);
    });


    // add attribute value to existing edge
    // remove attribute value to existing edge
    // swap
    // clear
    // modify attribute value to existing node
    // modify attribute valie to existing edge
    // undo when removing update attriubute value
    // undo when deleting attriubute value
    // modify label of existing node
    // modify label of existing edge

})