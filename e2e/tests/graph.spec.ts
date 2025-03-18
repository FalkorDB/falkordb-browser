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
import roles from '../config/user.json'

test.describe('Graph Tests', () => {
    let browser: BrowserWrapper;
    let apicalls: ApiCalls;
    const BATCH_CREATE_PERSONS = queryData.queries[0].testQueries[0].query;
    const FETCH_FIRST_TEN_NODES = queryData.queries[0].testQueries[1].query;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
        apicalls = new ApiCalls();
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
            apicalls.removeGraph(graphName);
        });
    });

    queryData.queries[0].failedQueries.forEach((query) => {
        test(`@admin Validate failure & error message when any user runs an invalid queries: ${query.name}`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            const graphName = `graph_${Date.now()}`;
            await graph.addGraph(graphName);
            await graph.insertQuery(query.query);
            await graph.clickRunQuery(false);
            expect(await graph.getErrorNotification()).toBe(true);
            apicalls.removeGraph(graphName);
        });
    })

    queryData.queries[0].failedQueries.forEach((query) => {
        test(`@readwrite Validate failure & error message when any user runs an invalid queries: ${query.name}`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            const graphName = `graph_${Date.now()}`;
            await graph.addGraph(graphName);
            await graph.insertQuery(query.query);
            await graph.clickRunQuery(false);
            expect(await graph.getErrorNotification()).toBe(true);
            apicalls.removeGraph(graphName);
        });
    })

    queryData.queries[0].failedQueries.slice(0,5).forEach((query) => {
        test(`@readonly Validate failure & error message when any user runs an invalid queries: ${query.name}`, async () => {
            const graphName = `graph_${Date.now()}`;
            await apicalls.addGraph(graphName, "admin");
            await apicalls.runQuery(graphName, queryData.queries[0].testQueries[0].apiReq || "", "admin");
            await new Promise(resolve => { setTimeout(resolve, 1000) });
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            await graph.selectExistingGraph(graphName, "readonly");
            await graph.insertQuery(query.query);
            await graph.clickRunQuery(false);
            expect(await graph.getErrorNotification()).toBe(true);
            await apicalls.removeGraph(graphName, "admin")
        });
    })
    
    roles.userRoles.forEach((role) => {
        test(`@${role.role} Validate that running a query in the UI saves it in the query history `, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            await browser.setPageToFullScreen();
            const graphName = `graph_${Date.now()}`;
            if (role.role !== "readonly") {
                await graph.addGraph(graphName);
            } else {
                await apicalls.addGraph(graphName, "admin");
                await graph.refreshPage();
                await graph.selectExistingGraph(graphName, "readonly");
            }
            await graph.insertQuery(FETCH_FIRST_TEN_NODES);
            await graph.clickRunQuery(false);
            await graph.clickOnQueryHistory();
            expect(await graph.getQueryHistory("1")).toBe(true);
            if (role.role !== "readonly") {
                await apicalls.removeGraph(graphName);
            } else {
                await apicalls.removeGraph(graphName, "admin");
            }           
        });
    })

    roles.userRoles.forEach((role) => {
        test(`@${role.role} Validate that running a query without selecting a graph displays the proper error notification`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            await browser.setPageToFullScreen();
            await graph.insertQuery(FETCH_FIRST_TEN_NODES);
            await graph.clickRunQuery(false);
            expect(await graph.getErrorNotification()).toBe(true);
        });
    })

    roles.userRoles.forEach((role) => {
        test(`@${role.role} Validate search for an element in the canvas and ensure focus on the searched node`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            await browser.setPageToFullScreen();
            const graphName = `graph_${Date.now()}`;
            if (role.role !== "readonly") {
                await graph.addGraph(graphName);
                await graph.insertQuery(BATCH_CREATE_PERSONS);
            } else {
                await apicalls.addGraph(graphName, "admin");
                await apicalls.runQuery(graphName, queryData.queries[0].testQueries[0].apiReq || "", "admin");
                await new Promise(resolve => { setTimeout(resolve, 1000) });
                await graph.refreshPage();
                await graph.selectExistingGraph(graphName, "readonly");
                await graph.insertQuery(FETCH_FIRST_TEN_NODES);
            }
            await graph.clickRunQuery();
            const testNodes = [1, 5, 10]; 
            for (const i of testNodes) {
                const searchQuery = `Person ${i}`;
                await graph.searchForElementInCanvas(searchQuery);
                await graph.hoverAtCanvasCenter();
                expect(await graph.getNodeCanvasToolTip()).toBe(searchQuery);
            }
            if (role.role !== "readonly") {
                await apicalls.removeGraph(graphName);
            } else {
                await apicalls.removeGraph(graphName, "admin");
            }
        });
    })

    roles.userRoles.forEach((role) => {
        test(`@${role.role} Validate zoom-in functionality upon clicking the zoom in button`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            await browser.setPageToFullScreen();
            const graphName = `graph_${Date.now()}`;
            if (role.role !== "readonly") {
                await graph.addGraph(graphName);
                await graph.insertQuery(BATCH_CREATE_PERSONS);
            } else {
                await apicalls.addGraph(graphName, "admin");
                await apicalls.runQuery(graphName, queryData.queries[0].testQueries[0].apiReq || "", "admin");
                await new Promise(resolve => { setTimeout(resolve, 1000) });
                await graph.refreshPage();
                await graph.selectExistingGraph(graphName, "readonly");
                await graph.insertQuery(FETCH_FIRST_TEN_NODES);
            }
            await graph.clickRunQuery();
            const initialGraph = await graph.getCanvasScaling();
            await graph.clickOnZoomIn();
            await graph.clickOnZoomIn();
            const updatedGraph = await graph.getCanvasScaling();
            expect(updatedGraph.scaleX).toBeGreaterThan(initialGraph.scaleX);
            expect(updatedGraph.scaleY).toBeGreaterThan(initialGraph.scaleY);
            if (role.role !== "readonly") {
                await apicalls.removeGraph(graphName);
            } else {
                await apicalls.removeGraph(graphName, "admin");
            }
        });
    })

    roles.userRoles.forEach((role) => {
        test(`@${role.role} Validate zoom-out functionality upon clicking the zoom in button`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            await browser.setPageToFullScreen();
            const graphName = `graph_${Date.now()}`;
            if (role.role !== "readonly") {
                await graph.addGraph(graphName);
                await graph.insertQuery(BATCH_CREATE_PERSONS);
            } else {
                await apicalls.addGraph(graphName, "admin");
                await apicalls.runQuery(graphName, queryData.queries[0].testQueries[0].apiReq || "", "admin");
                await new Promise(resolve => { setTimeout(resolve, 1000) });
                await graph.refreshPage();
                await graph.selectExistingGraph(graphName, "readonly");
                await graph.insertQuery(FETCH_FIRST_TEN_NODES);
            }
            await graph.clickRunQuery();
            const initialGraph = await graph.getCanvasScaling();
            await graph.clickOnZoomOut();
            await graph.clickOnZoomOut();
            const updatedGraph = await graph.getCanvasScaling();
            expect(updatedGraph.scaleX).toBeLessThan(initialGraph.scaleX);
            expect(updatedGraph.scaleY).toBeLessThan(initialGraph.scaleY);
            if (role.role !== "readonly") {
                await apicalls.removeGraph(graphName);
            } else {
                await apicalls.removeGraph(graphName, "admin");
            }
        });
    })

    roles.userRoles.forEach((role) => {
        test(`@${role.role} Validate fit to size functionality upon clicking the fit to size button`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            await browser.setPageToFullScreen();
            const graphName = `graph_${Date.now()}`;
            if (role.role !== "readonly") {
                await graph.addGraph(graphName);
                await graph.insertQuery(BATCH_CREATE_PERSONS);
            } else {
                await apicalls.addGraph(graphName, "admin");
                await apicalls.runQuery(graphName, queryData.queries[0].testQueries[0].apiReq || "", "admin");
                await graph.refreshPage();
                await graph.selectExistingGraph(graphName, "readonly");
                await graph.insertQuery(FETCH_FIRST_TEN_NODES);
            }
            await graph.clickRunQuery();
            await graph.clickOnFitToSize();
            const initialGraph = await graph.getCanvasScaling();
            await graph.clickOnZoomOut();
            await graph.clickOnZoomOut();
            await graph.clickOnFitToSize();
            const updatedGraph = await graph.getCanvasScaling();
            expect(Math.abs(initialGraph.scaleX - updatedGraph.scaleX)).toBeLessThanOrEqual(0.1);
            expect(Math.abs(initialGraph.scaleY - updatedGraph.scaleY)).toBeLessThanOrEqual(0.1);
            if (role.role !== "readonly") {
                await apicalls.removeGraph(graphName);
            } else {
                await apicalls.removeGraph(graphName, "admin");
            }
        });
    })

    roles.userRoles.slice(0,2).forEach((role) => {
        test(`@${role.role} Validate that the reload graph list function works by adding a graph via API and testing the reload button`, async () => {
            const graphName = `graph_${Date.now()}`;
            await apicalls.addGraph(graphName);
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            await browser.setPageToFullScreen();
            await graph.reloadGraphList();
            expect(await graph.verifyGraphExists(graphName)).toBe(true);
            await apicalls.removeGraph(graphName);
        });
    })

    test(`@admin Validate that modifying the graph name updates it correctly`, async () => {
        const graphName = `graph_${Date.now()}`;
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const newGraphName = `graph_${Date.now()}`;
        await graph.modifyGraphName(graphName, newGraphName);
        await graph.refreshPage();
        expect(await graph.verifyGraphExists(newGraphName)).toBe(true);
        await apicalls.removeGraph(newGraphName);
    });

    roles.userRoles.slice(1,3).forEach((role) => {
        test(`@${role.role} Validate that modifying a graph name fails and does not apply the change`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            await browser.setPageToFullScreen();
            const graphName = `graph_${Date.now()}`;
            if (role.role !== "readonly") {
                await graph.addGraph(graphName);
            } else {
                await apicalls.addGraph(graphName, "admin");
            }
            await graph.refreshPage();
            const newGraphName = `graph_${Date.now()}`;
            await graph.modifyGraphName(graphName, newGraphName);
            await graph.refreshPage();
            expect(await graph.verifyGraphExists(newGraphName)).toBe(false);
            if (role.role !== "readonly") {
                await apicalls.removeGraph(graphName);
            } else {
                await apicalls.removeGraph(graphName, "admin");
            }
        });
    })

    roles.userRoles.forEach((role) => {
        test(`@${role.role} Validate that dragging a node on the canvas updates its position`, async () => {
            const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
            await browser.setPageToFullScreen();
            const graphName = `graph_${Date.now()}`;
            if (role.role !== "readonly") {
                await graph.addGraph(graphName);
                await graph.insertQuery(BATCH_CREATE_PERSONS);
            } else {
                await apicalls.runQuery(graphName, queryData.queries[0].testQueries[0].apiReq || "", "admin");
                await graph.refreshPage();
                await graph.selectExistingGraph(graphName, "readonly");
                await graph.insertQuery(FETCH_FIRST_TEN_NODES);
            }
            await graph.clickRunQuery();
            const initialGraph = await graph.getGraphDetails();
            await graph.changeNodePosition(initialGraph[0].screenX, initialGraph[0].screenY);
            const updateGraph = await graph.getGraphDetails();
            expect(updateGraph[0].x).not.toBe(initialGraph[0].x);
            expect(updateGraph[0].y).not.toBe(initialGraph[0].y);
        });
    })

})