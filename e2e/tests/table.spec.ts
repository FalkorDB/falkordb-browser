import { test, expect } from "../infra/coverage";
import BrowserWrapper from "../infra/ui/browserWrapper";
import urls from '../config/urls.json';
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";
import TableView from "../logic/POM/tableView";

test.describe('Table View Tests', () => {

    let browser: BrowserWrapper;
    let apiCalls: ApiCalls;
    let cleanupGraph: string | undefined;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apiCalls = new ApiCalls();
        cleanupGraph = undefined;
    });

    test.afterEach(async () => {
        try {
            await browser.closeBrowser();
        } finally {
            if (cleanupGraph) {
                expect((await apiCalls.removeGraph(cleanupGraph, "admin")).message).toMatch(/deleted|empty key/i);
            }
        }
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

    test('@admin column expansion controls are independent and survive switching tabs', async () => {
        const graphName = getRandomString('table-expand');
        await apiCalls.addGraph(graphName);
        cleanupGraph = graphName;
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        await tableView.insertQuery("RETURN {outer: {leftLeaf: 'left-value'}} AS leftMap, {outer: {rightLeaf: 'right-value'}} AS rightMap");
        await tableView.clickRunQuery(false);
        await tableView.clickTableTab();
        await expect(tableView.dataRows).toHaveCount(1);
        await expect(tableView.cell(0, 0)).not.toContainText('leftLeaf');
        await expect(tableView.cell(0, 1)).not.toContainText('rightLeaf');

        await tableView.setExpansion(/^leftMap/, 'Expand Root');
        await expect(tableView.cell(0, 0)).toContainText('outer');
        await expect(tableView.cell(0, 0)).not.toContainText('leftLeaf');
        await expect(tableView.cell(0, 1)).not.toContainText('outer');
        await tableView.setExpansion(/^rightMap/, 'Expand All');
        await expect(tableView.cell(0, 1)).toContainText('rightLeaf');
        await expect(tableView.cell(0, 1)).toContainText('right-value');
        await expect(tableView.cell(0, 0)).not.toContainText('leftLeaf');
        await tableView.clickSchemaTab();
        await tableView.clickTableViewTab();
        await expect(tableView.cell(0, 0)).toContainText('outer');
        await expect(tableView.cell(0, 0)).not.toContainText('leftLeaf');
        await expect(tableView.cell(0, 1)).toContainText('rightLeaf');

        await tableView.setExpansion(/^rightMap/, 'Collapse All');
        await expect(tableView.cell(0, 1)).not.toContainText('outer');
        await expect(tableView.cell(0, 0)).toContainText('outer');
        await tableView.setExpansion(/^Index/, 'Expand All');
        await expect(tableView.cell(0, 0)).toContainText('leftLeaf');
        await expect(tableView.cell(0, 1)).toContainText('rightLeaf');
        await tableView.setExpansion(/^Index/, 'Expand Root');
        await expect(tableView.cell(0, 0)).toContainText('outer');
        await expect(tableView.cell(0, 1)).toContainText('outer');
        await expect(tableView.cell(0, 0)).not.toContainText('leftLeaf');
        await expect(tableView.cell(0, 1)).not.toContainText('rightLeaf');
        await tableView.setExpansion(/^Index/, 'Collapse All');
        await expect(tableView.cell(0, 0)).not.toContainText('outer');
        await expect(tableView.cell(0, 1)).not.toContainText('outer');
    });

    test('@admin exports null, nested and quoted result values as exact CSV', async () => {
        const graphName = getRandomString('table-export');
        await apiCalls.addGraph(graphName);
        cleanupGraph = graphName;
        const tableView = await browser.createNewPage(TableView);
        await tableView.disableSaveFilePicker();
        await browser.navigateTo(urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        await tableView.insertQuery(`RETURN null AS missing, 'Alice, "Bob"' AS quoted, {nested: [1, 2]} AS object, true AS enabled`);
        await tableView.clickRunQuery(false);
        await tableView.clickTableTab();
        const { filename, content } = await tableView.exportTableAsDownload();
        expect(filename).toBe(`${graphName}_table_export.csv`);
        expect(content).toBe(
            '"missing","quoted","object","enabled"\n"","Alice, ""Bob""","{""nested"":[1,2]}","true"'
        );
    });

    test('@admin a new query replaces old table columns and rows', async () => {
        const graphName = getRandomString('table-replace');
        await apiCalls.addGraph(graphName);
        cleanupGraph = graphName;
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        await tableView.insertQuery("UNWIND [1, 2, 3] AS previous RETURN previous");
        await tableView.clickRunQuery(false);
        await tableView.clickTableTab();
        await expect(tableView.tableViewTableRows).toHaveCount(3);
        await expect(tableView.lastColumnCells).toHaveText(['previous:1', 'previous:2', 'previous:3']);
        await tableView.insertQuery("RETURN 'replacement-value' AS replacement");
        await tableView.clickRunQuery(false);
        await tableView.clickTableTab();
        await expect(tableView.tableViewTableRows).toHaveCount(1);
        await expect(tableView.tableViewTabPanel).toContainText('replacement-value');
        await expect(tableView.columnHeader(/^previous/)).toHaveCount(0);
        await expect(tableView.columnHeader(/^replacement/)).toBeVisible();
        await expect(tableView.lastColumnCells).toHaveText(['replacement:"replacement-value"']);
    });

    test('@admin search narrows the rows, matches case-insensitively, and Escape restores them', async () => {
        const graphName = getRandomString('table-search');
        await apiCalls.addGraph(graphName);
        cleanupGraph = graphName;
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        await tableView.insertQuery("UNWIND ['apple', 'banana', 'cherry', 'blueberry', 'strawberry'] AS fruit RETURN {name: fruit} AS item");
        await tableView.clickRunQuery(false);
        await tableView.clickTableTab();
        await expect(tableView.dataRows).toHaveCount(5);
        await tableView.searchTable('BERRY');
        await expect(tableView.dataRows).toHaveCount(2);
        await expect(tableView.dataRow(3)).toBeVisible();
        await expect(tableView.dataRow(4)).toBeVisible();
        await expect(tableView.dataRow(0)).toHaveCount(0);
        await expect(tableView.rowNumber(tableView.dataRow(3))).toHaveText('1.');
        await expect(tableView.rowNumber(tableView.dataRow(4))).toHaveText('2.');
        await tableView.clearSearchWithEscape();
        await expect(tableView.searchInput).toHaveValue('');
        await expect(tableView.dataRows).toHaveCount(5);
    });

    test('@admin search with no match shows no rows until the search changes', async () => {
        const graphName = getRandomString('table-nomatch');
        await apiCalls.addGraph(graphName);
        cleanupGraph = graphName;
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        await tableView.insertQuery("UNWIND ['apple', 'banana', 'cherry'] AS fruit RETURN {name: fruit} AS item");
        await tableView.clickRunQuery(false);
        await tableView.clickTableTab();
        await expect(tableView.dataRows).toHaveCount(3);
        await tableView.searchTable('no-such-fruit');
        await expect(tableView.dataRows).toHaveCount(0);
        await expect(tableView.columnHeader(/^item/)).toBeVisible();
        await tableView.searchTable('banana');
        await expect(tableView.dataRows).toHaveCount(1);
        await expect(tableView.dataRow(1)).toBeVisible();
    });

    test('@admin the search term and scroll position survive a tab switch, and an Escape-cleared search does not come back', async () => {
        const graphName = getRandomString('table-search-keep');
        await apiCalls.addGraph(graphName);
        cleanupGraph = graphName;
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        await tableView.insertQuery("UNWIND range(1, 200) AS i RETURN {name: (CASE WHEN i % 2 = 0 THEN 'even-' ELSE 'odd-' END) + toString(i)} AS item");
        await tableView.clickRunQuery(false);
        await tableView.clickTableTab();
        await tableView.searchTable('even-20');
        await expect(tableView.dataRows).toHaveCount(2);
        await tableView.clickSchemaTab();
        await tableView.clickTableViewTab();
        await expect(tableView.searchInput).toHaveValue('even-20');
        await expect(tableView.dataRows).toHaveCount(2);
        await tableView.clearSearchWithEscape();
        await expect(tableView.dataRows).toHaveCount(60);
        await tableView.scrollTableTo('bottom');
        await expect(tableView.dataRow(199)).toBeVisible();
        await tableView.clickSchemaTab();
        await tableView.clickTableViewTab();
        // The remounted table restores scroll and search in the same step, so the deep row proves the restore ran.
        await expect(tableView.dataRow(199)).toBeVisible();
        await expect(tableView.searchInput).toHaveValue('');
        await expect(tableView.dataRow(0)).toHaveCount(0);
    });

    test('@admin search matches a primitive string column on any substring', async () => {
        const graphName = getRandomString('table-search-string');
        await apiCalls.addGraph(graphName);
        cleanupGraph = graphName;
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        await tableView.insertQuery("UNWIND ['apple', 'apricot', 'banana', 'cherry'] AS fruit RETURN fruit");
        await tableView.clickRunQuery(false);
        await tableView.clickTableTab();
        await expect(tableView.dataRows).toHaveCount(4);
        await tableView.searchTable('ap');
        await expect(tableView.dataRows).toHaveCount(2);
        await expect(tableView.dataRow(0)).toBeVisible();
        await expect(tableView.dataRow(1)).toBeVisible();
        await tableView.searchTable('apr');
        await expect(tableView.dataRows).toHaveCount(1);
        await expect(tableView.dataRow(1)).toBeVisible();
        await tableView.searchTable('ANA');
        await expect(tableView.dataRows).toHaveCount(1);
        await expect(tableView.dataRow(2)).toBeVisible();
    });

    test('@admin search matches number and boolean columns, including zero', async () => {
        const graphName = getRandomString('table-search-number');
        await apiCalls.addGraph(graphName);
        cleanupGraph = graphName;
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        await tableView.insertQuery("UNWIND [10, 205, 3, 0] AS n RETURN n, n > 5 AS big");
        await tableView.clickRunQuery(false);
        await tableView.clickTableTab();
        await expect(tableView.dataRows).toHaveCount(4);
        await tableView.searchTable('20');
        await expect(tableView.dataRows).toHaveCount(1);
        await expect(tableView.dataRow(1)).toBeVisible();
        await tableView.searchTable('0');
        await expect(tableView.dataRows).toHaveCount(3);
        await expect(tableView.dataRow(2)).toHaveCount(0);
        await expect(tableView.dataRow(3)).toBeVisible();
        await tableView.searchTable('fal');
        await expect(tableView.dataRows).toHaveCount(2);
        await expect(tableView.dataRow(2)).toBeVisible();
        await expect(tableView.dataRow(3)).toBeVisible();
    });

    test('@admin search still works when a map result holds a null value', async () => {
        const graphName = getRandomString('table-search-null');
        await apiCalls.addGraph(graphName);
        cleanupGraph = graphName;
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        await tableView.insertQuery("UNWIND ['apple', 'banana'] AS fruit RETURN {missing: null, name: fruit} AS item");
        await tableView.clickRunQuery(false);
        await tableView.clickTableTab();
        await expect(tableView.dataRows).toHaveCount(2);
        await tableView.searchTable('nan');
        await expect(tableView.dataRows).toHaveCount(1);
        await expect(tableView.dataRow(1)).toBeVisible();
    });

    test('@admin large results render a sliding window of rows that follows the scroll position', async () => {
        const graphName = getRandomString('table-window');
        await apiCalls.addGraph(graphName);
        cleanupGraph = graphName;
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        await tableView.insertQuery("UNWIND range(1, 200) AS x RETURN x");
        await tableView.clickRunQuery(false);
        await tableView.clickTableTab();
        await expect(tableView.dataRows).toHaveCount(60);
        await expect(tableView.rowNumber(tableView.dataRow(0))).toHaveText('1.');
        await expect(tableView.rowNumber(tableView.dataRow(59))).toHaveText('60.');
        await expect(tableView.dataRow(60)).toHaveCount(0);
        await tableView.scrollTableTo('bottom');
        await expect(tableView.dataRow(199)).toBeVisible();
        await expect(tableView.rowNumber(tableView.dataRow(199))).toHaveText('200.');
        await expect(tableView.dataRow(0)).toHaveCount(0);
        await tableView.scrollTableTo('top');
        await expect(tableView.dataRow(0)).toBeVisible();
        await expect(tableView.dataRow(199)).toHaveCount(0);
    });

    test('@admin a query with no rows disables the table tab', async () => {
        const graphName = getRandomString('table-empty');
        await apiCalls.addGraph(graphName);
        cleanupGraph = graphName;
        const tableView = await browser.createNewPage(TableView, urls.graphUrl);
        await tableView.selectGraphByName(graphName);
        await tableView.insertQuery("UNWIND range(1, 3) AS x RETURN x");
        await tableView.clickRunQuery(false);
        await expect(tableView.tableViewTab).toBeEnabled();
        await expect(tableView.tableViewTab).toHaveAttribute('aria-label', 'Table');
        await tableView.insertQuery("UNWIND [] AS x RETURN x");
        await tableView.clickRunQuery(false);
        await expect(tableView.tableViewTab).toBeDisabled();
        await expect(tableView.tableViewTab).toHaveAttribute('aria-label', 'No Data');
    });
});
