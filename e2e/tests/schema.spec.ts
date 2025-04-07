/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import urls from '../config/urls.json'
import { getRandomString, waitForApiSuccess } from "../infra/utils";
import SchemaPage from "../logic/POM/schemaPage";

test.describe('Schema Tests', () => {
    let browser: BrowserWrapper;
    let apicalls: ApiCalls;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
        apicalls = new ApiCalls();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })

    test(`@admin Validate that the reload schema list function works by adding a schema via API and testing the reload button`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.addSchema(schemaName);
        await waitForApiSuccess(() => apicalls.getSchemas(), res => res.opts.includes(schemaName));
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.reloadGraphList();
        expect(await schema.verifyGraphExists(schemaName)).toBe(true);
        await apicalls.removeGraph(schemaName);
    });

    test(`@admin Validate that adding a new node correctly displays it on the canvas`, async () => {
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        const schemaName = getRandomString('schema');
        await schema.addSchema(schemaName);
        await schema.addNode("person", 'id', "Integer", "100", true, true);
        const graph = await schema.getNodeScreenPositions();
        await schema.nodeClick(graph[0].screenX, graph[0].screenY);
        expect(await schema.getAttributeRowsCount()).toBe(true);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin Validate that creating a relationship updates the canvas display`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.addSchemaNode(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}) RETURN a, b');
        await waitForApiSuccess(() => apicalls.getSchemas(), res => res.opts.includes(schemaName));
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        await schema.addRelation("knows", 'id', "Integer", "100", true, true);
        const links = await schema.getLinkScreenPositions();
        await schema.nodeClick(links[0].midX, links[0].midY);
        expect(await schema.getAttributeRowsCount()).toBe(true);
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin Validate that the delete button removes the selected node from the graphs`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.addSchemaNode(schemaName, 'CREATE (n:person1 {id: "Integer!*-1"}) RETURN n');
        await waitForApiSuccess(() => apicalls.getSchemas(), res => res.opts.includes(schemaName));
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        const nodes1 = await schema.getNodeScreenPositions();
        await schema.deleteNode(nodes1[0].screenX, nodes1[0].screenY);
        const nodes2 = await schema.getNodeScreenPositions();
        expect(nodes2.length).toEqual(nodes1.length - 1);
        await apicalls.removeSchema(schemaName);
    });

    test.skip(`@admin Validate that adding a node label reflects the changes on the canvas`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.addSchemaNode(schemaName, 'CREATE (n:person1 {id: "Integer!*-1"}) RETURN n');
        await waitForApiSuccess(() => apicalls.getSchemas(), res => res.opts.includes(schemaName));
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        await schema.clickCategoriesPanelBtn();
        expect(await schema.getCategoriesPanelBtn()).toBe("person1")
        const nodes = await schema.getNodeScreenPositions();
        expect(nodes[0].isVisible).toBeFalsy();
        await apicalls.removeSchema(schemaName);
    });

    test(`@admin Validate that adding a relation label reflects the changes on the canvas`, async () => {
        const schemaName = getRandomString('schema');
        await apicalls.addSchemaNode(schemaName, 'CREATE (a:person1 {id: "Integer!*-1"}), (b:person2 {id: "Integer!*-2"}), (a)-[:knows]->(b) RETURN a, b');
        await waitForApiSuccess(() => apicalls.getSchemas(), res => res.opts.includes(schemaName));
        const schema = await browser.createNewPage(SchemaPage, urls.schemaUrl);
        await browser.setPageToFullScreen();
        await schema.selectExistingGraph(schemaName);
        await schema.clickRelationshipTypesPanelBtn();
        expect(await schema.getRelationshipTypesPanelBtn()).toBe("knows")
        const nodes = await schema.getNodeScreenPositions();
        expect(nodes[0].isVisible).toBeFalsy();
        await apicalls.removeSchema(schemaName);
    });

    

})