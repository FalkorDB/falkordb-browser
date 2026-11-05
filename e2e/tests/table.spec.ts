import { test, expect } from "../infra/coverage";
import { readFile } from "fs/promises";
import BrowserWrapper from "../infra/ui/browserWrapper";
import urls from '../config/urls.json';
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";
import TableView from "../logic/POM/tableView";

test.describe('Table View Tests', () => {

    let browser: BrowserWrapper;
    let apiCalls: ApiCalls;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apiCalls = new ApiCalls();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test('@admin Validate that table view is disabled when there is no data', async () => {
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        const isTableViewEnabled = await tableView.GetIsTableViewTabEnabled();
        expect(isTableViewEnabled).toBe(false);
    });

    test('@admin Validate that table view is enabled when there is data', async () => {
        const graphName = getRandomString('table');
        await apiCalls.addGraph(graphName);
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        await tableView.insertQuery("CREATE (n) RETURN n");
        await tableView.clickRunQuery(false);
        const isTableViewEnabled = await tableView.GetIsTableViewTabEnabled();
        expect(isTableViewEnabled).toBe(true);
    });

    test('@admin Validate that the data displayed in the table view is the same as the data returned by the query', async () => {
        const graphName = getRandomString('table');
        await apiCalls.addGraph(graphName);
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        const query = "UNWIND range(1, 10) AS x RETURN x";
        await tableView.insertQuery(query);
        await tableView.clickRunQuery(false);
        await tableView.clickTableTab();
        const data = await tableView.getRowsCount();
        expect(data).toBe(10);
    });

    test('@admin Validate that export button is visible in table view when there is data', async () => {
        const graphName = getRandomString('table');
        await apiCalls.addGraph(graphName);
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        await tableView.insertQuery("CREATE (n {name: 'test'}) RETURN n");
        await tableView.clickRunQuery(false);
        await tableView.clickTableTab();
        const isExportButtonVisible = await tableView.isExportButtonVisible();
        expect(isExportButtonVisible).toBe(true);
    });

    test('@admin PATH query result appears as a single row in table view', async () => {
        const graphName = getRandomString('path-table');
        await apiCalls.addGraph(graphName);
        try {
            await apiCalls.runQuery(graphName, "CREATE (:City {name:'start'})-[:ROAD]->(:City {name:'end'})");
            const tableView = await browser.createNewPage(TableView, urls.graphUrl);
            await tableView.selectGraphByName(graphName);
            await tableView.insertQuery("MATCH p=(a:City {name:'start'})-[:ROAD]->(b:City {name:'end'}) RETURN p");
            await tableView.clickRunQuery(false);
            await tableView.clickTableTab();
            const rowCount = await tableView.getRowsCount();
            expect(rowCount).toBe(1);
        } finally {
            await apiCalls.removeGraph(graphName);
        }
    });

    test('@admin PATH cell renders path data (nodes and edges keys) in table view', async () => {
        const graphName = getRandomString('path-cell');
        await apiCalls.addGraph(graphName);
        try {
            await apiCalls.runQuery(graphName, "CREATE (:City {name:'start'})-[:ROAD]->(:City {name:'end'})");
            const tableView = await browser.createNewPage(TableView, urls.graphUrl);
            await tableView.selectGraphByName(graphName);
            await tableView.insertQuery("MATCH p=(a:City {name:'start'})-[:ROAD]->(b:City {name:'end'}) RETURN p");
            await tableView.clickRunQuery(false);
            await tableView.clickTableTab();
            // Verify exactly one result row belongs to this query before inspecting content.
            expect(await tableView.getRowsCount()).toBe(1);
            // Object cells render collapsed; expand so the PATH's nodes/edges keys show.
            await tableView.expandAllCells();
            expect(await tableView.firstCellContains('nodes')).toBe(true);
            expect(await tableView.firstCellContains('edges')).toBe(true);
        } finally {
            await apiCalls.removeGraph(graphName);
        }
    });

    test('@admin exports null, nested and quoted result values as exact CSV', async () => {
        const graphName = getRandomString('table-export');
        await apiCalls.addGraph(graphName);
        try {
            const tableView = await browser.createNewPage(TableView, urls.graphUrl);
            const page = await browser.getPage();
            await page.evaluate(() => { Reflect.deleteProperty(window, 'showSaveFilePicker'); });
            await tableView.selectGraphByName(graphName);
            await tableView.insertQuery(`RETURN null AS missing, 'Alice, "Bob"' AS quoted, {nested: [1, 2]} AS object, true AS enabled`);
            await tableView.clickRunQuery(false);
            await tableView.clickTableTab();
            const downloadPromise = page.waitForEvent('download');
            await tableView.clickExportButton();
            const download = await downloadPromise;
            expect(download.suggestedFilename()).toBe(`${graphName}_table_export.csv`);
            const file = await download.path();
            expect(file).not.toBeNull();
            expect(await readFile(file!, 'utf8')).toBe(
                '"missing","quoted","object","enabled"\n"","Alice, ""Bob""","{""nested"":[1,2]}","true"'
            );
        } finally {
            await browser.closeBrowser();
            await apiCalls.removeGraph(graphName, "admin");
        }
    });

    test('@admin a new query replaces old table columns and rows', async () => {
        const graphName = getRandomString('table-replace');
        await apiCalls.addGraph(graphName);
        try {
            const tableView = await browser.createNewPage(TableView, urls.graphUrl);
            const page = await browser.getPage();
            await tableView.selectGraphByName(graphName);
            await tableView.insertQuery("UNWIND [1, 2, 3] AS previous RETURN previous");
            await tableView.clickRunQuery(false);
            await tableView.clickTableTab();
            const panel = page.getByRole('tabpanel', { name: 'Table', exact: true });
            await expect(panel.locator('tbody tr')).toHaveCount(3);
            await tableView.insertQuery("RETURN 'replacement-value' AS replacement");
            await tableView.clickRunQuery(false);
            await tableView.clickTableTab();
            await expect(panel.locator('tbody tr')).toHaveCount(1);
            await expect(panel).toContainText('replacement-value');
            await expect(panel.getByRole('columnheader').filter({ hasText: /^previous/ })).toHaveCount(0);
            await expect(panel.getByRole('columnheader').filter({ hasText: /^replacement/ })).toBeVisible();
        } finally {
            await browser.closeBrowser();
            await apiCalls.removeGraph(graphName, "admin");
        }
    });
});
