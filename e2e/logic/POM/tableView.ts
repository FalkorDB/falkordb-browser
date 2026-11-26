import { interactWhenVisible, waitForElementToBeEnabled } from "@/e2e/infra/utils";
import { Locator } from "@playwright/test";
import { readFile } from "fs/promises";
import GraphPage from "./graphPage";

export default class TableView extends GraphPage {

    public get tableViewTab(): Locator {
        return this.page.getByTestId("tableTab");
    }

    public get selectAllManagedGraphs(): Locator {
        return this.manageContent.getByRole('checkbox', { name: 'Select all Graphs' });
    }

    public get tableViewTabPanel(): Locator {
        return this.page.getByRole('tabpanel', { name: 'Table' });
    }

    public get tableViewTableRows(): Locator {
        return this.tableViewTabPanel.locator('tbody tr');
    }

    public get lastColumnCells(): Locator {
        return this.tableViewTableRows.locator('td:last-child');
    }

    /** Rendered data rows only: the virtualised table's spacer rows have no test id. */
    public get dataRows(): Locator {
        return this.tableViewTabPanel.locator('[data-testid^="tableRowTableView"]');
    }

    public dataRow(index: number): Locator {
        return this.tableViewTabPanel.getByTestId(`tableRowTableViewrow-${index}`);
    }

    /** The row-number cell ("1.", "2.", ...) of a rendered row. */
    public rowNumber(row: Locator): Locator {
        return row.locator('td').first();
    }

    public async cancelManagedGraphEdit(name: string): Promise<void> {
        await this.graphNameEditor(name).press('Escape');
    }

    public get searchInput(): Locator {
        return this.page.getByTestId('searchInputTableView');
    }

    public async searchTable(text: string): Promise<void> {
        await this.searchInput.fill(text);
    }

    public async clearSearchWithEscape(): Promise<void> {
        await this.searchInput.press('Escape');
    }

    private get scrollContainer(): Locator {
        return this.tableViewTabPanel.locator('#tableContent');
    }

    public async scrollTableTo(position: 'top' | 'bottom'): Promise<void> {
        await this.scrollContainer.evaluate((el, target) => {
            el.scrollTo(0, target === 'top' ? 0 : el.scrollHeight);
        }, position);
    }

    columnHeader(name: RegExp): Locator {
        return this.tableViewTabPanel.getByRole('columnheader').filter({ hasText: name });
    }

    public cell(row: number, column: number): Locator {
        return this.dataRow(row).locator('td').nth(column + 1);
    }

    public async setExpansion(header: RegExp, level: 'Expand Root' | 'Expand All' | 'Collapse All'): Promise<void> {
        await this.columnHeader(header).getByRole('button', { name: level, exact: true }).click();
    }

    public async clickTableViewTab(): Promise<void> {
        await interactWhenVisible(this.tableViewTab, async (el: Locator) => {
            await el.click();
        }, 'Table View Tab');
    }

    public async GetIsTableViewTabEnabled(): Promise<boolean> {
        const isEnabled = await waitForElementToBeEnabled(this.tableViewTab);
        return isEnabled;
    }

    public async GetIsTableViewTabSelected(): Promise<boolean> {
        await waitForElementToBeEnabled(this.tableViewTab);
        const isSelected = await this.tableViewTabPanel.getAttribute('data-state') === 'active';
        return isSelected;
    }

    public async getRowsCount(): Promise<number> {
        await this.tableViewTabPanel.waitFor({ state: 'visible', timeout: 10000 });
        const rows = await this.tableViewTableRows.count();
        return rows;
    }

    private get exportTableViewButton(): Locator {
        return this.page.getByTestId("exportTableViewButton");
    }

    public async isExportButtonVisible(): Promise<boolean> {
        try {
            await this.exportTableViewButton.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    public async clickExportButton(): Promise<void> {
        await interactWhenVisible(this.exportTableViewButton, async (el: Locator) => {
            await el.click();
        }, 'Export Table View Button');
    }

    /** Must run before navigation: without the File System Access API the export falls back to a browser download. */
    public async disableSaveFilePicker(): Promise<void> {
        await this.page.addInitScript(() => { Reflect.deleteProperty(window, 'showSaveFilePicker'); });
    }

    public async exportTableAsDownload(): Promise<{ filename: string; content: string }> {
        const downloadPromise = this.page.waitForEvent('download');
        await this.clickExportButton();
        const download = await downloadPromise;
        const file = await download.path();
        return { filename: download.suggestedFilename(), content: await readFile(file, 'utf8') };
    }

    private get expandAllCellsButton(): Locator {
        return this.tableViewTabPanel.getByRole('button', { name: 'Expand All' }).first();
    }

    /**
     * Expands every JSON-tree cell in the table so nested keys (e.g. a PATH
     * value's `nodes`/`edges`) become visible for text assertions. Object cells
     * render collapsed by default (showing only "N keys").
     */
    public async expandAllCells(): Promise<void> {
        await interactWhenVisible(this.expandAllCellsButton, async (el: Locator) => {
            await el.click();
        }, 'Table Expand All Cells');
    }

    /**
     * Returns true if the first data cell in the first table row contains `text`.
     * For PATH results the JSONTree renders nodes/edges keys, so checking for
     * `'nodes'` or `'edges'` confirms the cell holds a PATH value.
     *
     * The first `<td>` is the row-index column (e.g. "1."), so the first data
     * cell is `td` index 1. Call `expandAllCells()` first so nested keys render.
     */
    public async firstCellContains(text: string): Promise<boolean> {
        await this.tableViewTabPanel.waitFor({ state: 'visible', timeout: 10000 });
        const firstCell = this.tableViewTableRows.first().locator('td').nth(1);
        await firstCell.waitFor({ state: 'visible', timeout: 5000 });
        const content = await firstCell.textContent();
        return (content ?? '').includes(text);
    }
}
