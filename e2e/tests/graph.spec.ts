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
import { getRandomString } from "../infra/utils";

test.describe('Graph Tests', () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
        apiCall = new ApiCalls();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })

    test(`@admin Add graph via API -> verify display in UI test -> remove graph via UI`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(graphName)).toBe(true);
        await graph.refreshPage();
        await graph.deleteGraph(graphName);
    });

    test(`@admin Add graph via UI -> remove graph via API -> Verify graph removal in UI test`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const graphName = getRandomString('graph');
        await graph.addGraph(graphName);
        await new Promise(resolve => { setTimeout(resolve, 1000) });
        await apiCall.removeGraph(graphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(graphName)).toBe(false);
    });

    test(`@admin Create graph -> click the Export Data button -> verify the file has been successfully downloaded`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const graphName = getRandomString('graph');
        await graph.addGraph(graphName);
        const download = await graph.exportGraph();
        const downloadPath = await download.path();
        expect(fs.existsSync(downloadPath)).toBe(true);
        await apiCall.removeGraph(graphName);
    });

    queryData.queries[0].failedQueries.forEach((query) => {
        test(`@admin Validate failure & error message when user runs an invalid queries: ${query.name}`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            const graphName = getRandomString('graph');
            await graph.addGraph(graphName);
            await graph.insertQuery(query.query);
            await graph.clickRunQuery(false);
            expect(await graph.getErrorNotification()).toBe(true);
            await apiCall.removeGraph(graphName);
        });
    })

    test(`@admin Validate that running a query with timeout returns an error`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const graphName = `graph_${Date.now()}`;
        await graph.addGraph(graphName);
        await graph.addTimeout();
        const query = `UNWIND range(1, 100000000) as x RETURN count(x)`;
        await graph.insertQuery(query);
        await graph.clickRunQuery(false);
        await graph.waitForRunQueryToBeEnabled();
        expect(await graph.getErrorNotification()).toBe(true);
        await apiCall.removeGraph(graphName);
    });
  
    test(`@admin Validate that the reload graph list function works by adding a graph via API and testing the reload button`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.reloadGraphList();
        expect(await graph.verifyGraphExists(graphName)).toBe(true);
        await apiCall.removeGraph(graphName);
    });

    test(`@admin Validate that modifying the graph name updates it correctly`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const newGraphName = getRandomString('graph');
        await graph.modifyGraphName(graphName, newGraphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(newGraphName)).toBe(true);
        await apiCall.removeGraph(newGraphName);
    });

    test(`@readwrite Validate that modifying a graph name fails and does not apply the change`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = getRandomString('graph');
        await graph.addGraph(graphName);
        await graph.refreshPage();
        const newGraphName = getRandomString('graph');
        await graph.modifyGraphName(graphName, newGraphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(newGraphName)).toBe(false);
        await apiCall.removeGraph(graphName);
    });

    test(`@readonly Validate failure & error message when RO user attempts to rename an existing graph via UI`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName, "admin");
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const newGraphName = getRandomString('graph');
        await graph.modifyGraphName(graphName, newGraphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(newGraphName)).toBe(false);
        await apiCall.removeGraph(graphName, "admin");
    });

    test(`@readwrite Validate that creating a graph with an existing name is prevented`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.addGraph(graphName);
        expect(await graph.getErrorNotification()).toBe(true);
        await apiCall.removeGraph(graphName);
    });

    test(`@admin Validate that modifying a graph name to an existing name is prevented`, async () => {
        const graphName1 = getRandomString('graph');
        const graphName2 = getRandomString('graph');
        await apiCall.addGraph(graphName1);
        await apiCall.addGraph(graphName2);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.modifyGraphName(graphName2, graphName1);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(graphName1)).toBe(true);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(graphName2)).toBe(true);
        await apiCall.removeGraph(graphName1);
        await apiCall.removeGraph(graphName2);
    });

    test(`@readwrite Validate that running multiple queries updates the node and edge count correctly`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery("UNWIND range(1, 10) as x CREATE (n:n)-[e:e]->(m:m) RETURN *");
        await graph.clickRunQuery();
        const nodes = await graph.getNodesGraphStats();
        const edges = await graph.getEdgesGraphStats();
        expect(parseInt(nodes ?? "", 10)).toBe(20);
        expect(parseInt(edges ?? "", 10)).toBe(10);
        await apiCall.removeGraph(graphName);
    });

    test(`@readwrite validate that attempting to duplicate a graph with the same name displays an error notification`, async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = getRandomString('graph');
        await graph.addGraph(graphName);
        await graph.addGraph(graphName);
        expect(await graph.getErrorNotification()).toBe(true);
        await apiCall.removeGraph(graphName);
    });

    test(`@readwrite validate that deleting a graph relation doesn't decreases node count`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}), (a)-[c:knows]->(b) RETURN a, b, c');
        await graph.clickRunQuery();
        const initCount = parseInt(await graph.getNodesGraphStats() ?? "", 10);
        const links = await graph.getLinksScreenPositions('graph');
        await graph.deleteRelation(links[0].midX, links[0].midY);
        expect(parseInt(await graph.getNodesGraphStats() ?? "", 10)).toBe(initCount);
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite validate that deleting a graph node doesn't decreases relation count`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}), (c:person3 {id: "3"}), (a)-[d:knows]->(b) RETURN a, b, c, d');
        await graph.clickRunQuery();
        const initCount = parseInt(await graph.getEdgesGraphStats() ?? "", 10);
        const nodes = await graph.getNodeScreenPositions('graph');
        await graph.deleteNode(nodes[2].screenX, nodes[2].screenY);
        expect(parseInt(await graph.getEdgesGraphStats() ?? "", 10)).toBe(initCount);
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite validate that deleting a graph relation decreases relation count`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}), (c:person3 {id: "3"}), (a)-[d:knows]->(b) RETURN a, b, c, d');
        await graph.clickRunQuery();
        const initCount = parseInt(await graph.getEdgesGraphStats() ?? "", 10);
        const links = await graph.getLinksScreenPositions('graph');
        await graph.deleteRelation(links[0].midX, links[0].midY);
        expect(parseInt(await graph.getEdgesGraphStats() ?? "", 10)).toBe(initCount -1);
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite validate that deleting a graph node decreases node count`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
        await graph.clickRunQuery();
        const initCount = parseInt(await graph.getNodesGraphStats() ?? "", 10);
        const nodes = await graph.getNodeScreenPositions('graph');
        await graph.deleteNode(nodes[0].screenX, nodes[0].screenY);
        expect(parseInt(await graph.getNodesGraphStats() ?? "", 10)).toBe(initCount -1);
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite Validate deleting node via the canvas panel`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
        await graph.clickRunQuery();
        const initCount = parseInt(await graph.getNodesGraphStats() ?? "", 10);
        const nodes = await graph.getNodeScreenPositions('graph');
        await graph.deleteNodeViaCanvasPanel(nodes[0].screenX, nodes[0].screenY);
        expect(parseInt(await graph.getNodesGraphStats() ?? "", 10)).toBe(initCount -1);
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite validate modifying node label updates label in data and canvas panels correctly`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
        await graph.clickRunQuery();
        await graph.modifyLabel("1", "artist");
        expect(await graph.getLabesCountlInDataPanel()).toBe(3)
        expect(await graph.getLastLabelInCanvas()).toBe("artist");
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite validate removing node label updates label in data and canvas panels correctly`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
        await graph.clickRunQuery();
        const labelsCountInCanvas = await graph.getLabesCountlInCanvas();
        await graph.deleteLabel("1");
        expect(await graph.getLabesCountlInDataPanel()).toBe(1);
        expect(await graph.getLabesCountlInCanvas()).toBe(labelsCountInCanvas - 1);
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite validate undo functionally after modifying node attributes update correctly`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
        await graph.clickRunQuery();
        await graph.openDataPanelForElementInCanvas("1");
        const valueAttribute = await graph.getLastAttributeValue();
        await graph.modifyAttribute("10");
        await graph.clickUndoBtnInNotification();
        expect(await graph.getLastAttributeValue()).toBe(valueAttribute);
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite validate adding attribute updates attributes stats in data panel`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
        await graph.clickRunQuery();
        await graph.addGraphAttribute("1", "name", "Naseem");
        expect(parseInt(await graph.getAttributesStatsInDataPanel() ?? "", 10)).toBe(2);
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite validate removing attribute updates attributes stats in data panel`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:Person {id: "1", name: "Alice"}) RETURN a');
        await graph.clickRunQuery();
        await graph.openDataPanelForElementInCanvas("Alice");
        await graph.deleteGraphAttribute();
        expect(parseInt(await graph.getAttributesStatsInDataPanel() ?? "", 10)).toBe(1);
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite validate modifying attribute via UI and verify via API`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
        await graph.clickRunQuery();
        await graph.openDataPanelForElementInCanvas("1");
        await graph.modifyAttribute("10");
        const response  = await apiCall.runQuery(graphName, "match (n) return n");
        expect(response.result.data[1].n.properties.id).toBe('10')
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite validate deleting attribute via UI and verify via API`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:Person {id: "1", name: "Alice"}) RETURN a');
        await graph.clickRunQuery();
        await graph.openDataPanelForElementInCanvas("Alice");
        await graph.deleteGraphAttribute();
        const response  = await apiCall.runQuery(graphName, "match (n) return n");
        expect(response.result.data[0].n.properties).not.toHaveProperty('name');
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite validate deleting connection between two nodes updates canvas panels`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:Person {id: "1"}), (b:Person {id: "2"}), (a)-[c:KNOWS]->(b) RETURN a, b, c');
        await graph.clickRunQuery();
        const initCount = parseInt(await graph.getEdgesGraphStats() ?? "", 10);
        const links = await graph.getLinksScreenPositions('graph');
        await graph.deleteGraphRelation(links[0].midX, links[0].midY);
        expect(parseInt(await graph.getEdgesGraphStats() ?? "", 10)).toBe(initCount - 1);
        expect(await graph.isRelationshipTypesPanelBtnHidden()).toBeTruthy();
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite validate adding connection between two nodes updates canvas panels`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:Person {id: "1"}), (b:Person {id: "2"}), (a)-[c:KNOWS]->(b) RETURN a, b, c');
        await graph.clickRunQuery();
        expect(await graph.getRelationshipTypesPanelBtn()).toBe('KNOWS');        
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite validate undo functionally after deleting attribute update correctly`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:Person {id: "1", name: "Alice"}) RETURN a');
        await graph.clickRunQuery();
        await graph.openDataPanelForElementInCanvas("Alice");
        await graph.deleteGraphAttribute();
        await graph.clickUndoBtnInNotification();
        expect(parseInt(await graph.getAttributesStatsInDataPanel() ?? "", 10)).toBe(2);
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite Attempting to add existing label name for a node display error`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:Person {id: "1", name: "Alice"}) RETURN a');
        await graph.clickRunQuery();
        await graph.modifyLabel("Alice", "Person");
        expect(await graph.getLabesCountlInDataPanel()).toBe(2)
        expect(await graph.getErrorNotification()).toBeTruthy();
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite moving a node to another node's position while animation is off should place them at the same position`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
        await graph.clickRunQuery();
        const initNodes = await graph.getNodeScreenPositions('graph');
        expect(await graph.getAnimationControlPanelState()).toBe("unchecked");

        const fromX = initNodes[0].screenX;
        const fromY = initNodes[0].screenY;
        const toX = initNodes[1].screenX;;
        const toY = initNodes[1].screenY;
        await graph.changeNodePosition(fromX, fromY, toX, toY);
        await graph.waitForCanvasAnimationToEnd();
        const nodes = await graph.getNodeScreenPositions('graph');
        
        expect(nodes[1].screenX - nodes[0].screenX).toBeLessThanOrEqual(2);
        expect(nodes[1].screenY - nodes[0].screenY).toBeLessThanOrEqual(2);
        await apiCall.removeSchema(graphName);
    });

    test(`@readwrite moving a node to another node's position while animation is on should push them apart`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b');
        await graph.clickRunQuery();
        const initNodes = await graph.getNodeScreenPositions('graph');
        await graph.clickAnimationControlPanelbtn();
        expect(await graph.getAnimationControlPanelState()).toBe("checked");

        const fromX = initNodes[0].screenX;
        const fromY = initNodes[0].screenY;
        const toX = initNodes[1].screenX;;
        const toY = initNodes[1].screenY;
        await graph.changeNodePosition(fromX, fromY, toX, toY);
        await graph.waitForCanvasAnimationToEnd();
        const nodes = await graph.getNodeScreenPositions('graph');
        
        expect(Math.abs(nodes[1].screenX - nodes[0].screenX)).toBeGreaterThan(2);
        expect(Math.abs(nodes[1].screenY - nodes[0].screenY)).toBeGreaterThan(2);
        await apiCall.removeSchema(graphName);
    });

    test(`@admin Validate that toggling a category label updates edge visibility on the canvas`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (n:person1 {id: "1"}) RETURN n');
        await graph.clickRunQuery();
        await graph.clickLabelsPanelBtn();
        expect(await graph.getLabelsPanelBtn()).toBe("person1")
        const nodes1 = await graph.getNodeScreenPositions('graph');
        expect(nodes1[0].visible).toBeFalsy();
        await graph.clickLabelsPanelBtn();
        const nodes2 = await graph.getNodeScreenPositions('graph');
        expect(nodes2[0].visible).toBeTruthy();
        await apiCall.removeGraph(graphName);
    });

    test(`@admin Validate that toggling a relationship label updates edge visibility on the canvas`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery('CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}), (a)-[c:knows]->(b) RETURN a, b, c');
        await graph.clickRunQuery();
        await graph.clickRelationshipTypesPanelBtn();
        expect(await graph.getRelationshipTypesPanelBtn()).toBe("knows");
        const links1 = await graph.getLinksScreenPositions('graph');
        expect(links1[0].visible).toBeFalsy();
        await graph.clickRelationshipTypesPanelBtn();
        const links2 = await graph.getLinksScreenPositions('graph'); 
        expect(links2[0].visible).toBeTruthy();
        await apiCall.removeGraph(graphName);
    });


    const invalidQueriesRO = [
        { query: "CREATE (n:Person { name: 'Alice' }) RETURN n", description: 'create node query' },
        { query: "MATCH (n:Person { name: 'Alice' }) SET n.age = 30 RETURN n", description: 'update node query' },
        { query: "MATCH (n:Person { name: 'Alice' }) DELETE n", description: 'delete node query' },
        { query: "CREATE INDEX ON :Person(name)", description: 'create index query' },
        { query: "MERGE (n:Person { name: 'Alice' }) RETURN n", description: 'merge query that creates node' },
        { query: "UNWIND [1,2,3] AS x CREATE (:Number {value: x})", description: 'unwind with create query' }
    ];
    
    invalidQueriesRO.forEach(({ query, description }) => {
        test(`@readonly Validate failure when RO user attempts to execute : ${description}`, async () => {
            const graphName = getRandomString('graph');
            await apiCall.addGraph(graphName, "admin");
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            await browser.setPageToFullScreen();
            await graph.selectExistingGraph(graphName, "readonly");
            await graph.insertQuery(query);
            await graph.clickRunQuery();
            expect(await graph.getErrorNotification()).toBeTruthy();
            await apiCall.removeGraph(graphName, "admin");
        });
    });
      
    test(`@readonly Validate success when RO user attempts to execute ro query`, async () => {
        const graphName = getRandomString('graph');
        await apiCall.addGraph(graphName, "admin");
        await apiCall.runQuery(graphName, "CREATE (:Person {name: 'Alice'})-[:KNOWS]->(:Person {name: 'Bob'})", "admin")
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName, "readonly");
        await graph.insertQuery("MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 10");
        await graph.clickRunQuery();
        expect(await graph.getErrorNotification()).toBeFalsy();
        await apiCall.removeGraph(graphName, "admin");
    });

    const queriesInput = [
        { query: "C", keywords: ['call', 'collect', 'count', 'create'] },
        { query: "M", keywords: ['max', 'min', 'match', 'merge'] },
    ]; 
    queriesInput.forEach(({query, keywords}) => {
        test(`@readwrite Validate auto complete in query search for: ${query}`, async () => {
            const graphName = getRandomString('graph');
            await apiCall.addGraph(graphName);
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            await browser.setPageToFullScreen();
            await graph.selectExistingGraph(graphName);
            await graph.insertQuery(query);
            const response = await graph.getQuerySearchListText();
            const hasAny = response.some(s => keywords.some(k => s.includes(k)));
            expect(hasAny).toBeTruthy();
            await apiCall.removeGraph(graphName);
        });
    })
})