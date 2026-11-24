import { expect, Locator } from "@playwright/test";
import { readFile } from "fs/promises";
import { interactWhenVisible, waitForElementToBeVisible } from "@/e2e/infra/utils";
import GraphPage from "./graphPage";

export default class QueryHistory extends GraphPage {

    public get queryList(): Locator {
        return this.page.getByTestId("queryList");
    }

    public get queryHistoryButton(): Locator {
        return this.page.getByTestId("queryHistory");
    }

    public selectQueryHistory(query: string): Locator {
        return this.page.getByTestId(`queryHistory${query}`);
    }

    public selectQueryHistoryText(query: string): Locator {
        return this.page.getByTestId(`queryHistory${query}Text`);
    }

    /** The clickable row button; unlike the row itself it is guaranteed to take the click. */
    public selectQueryHistoryButton(query: string): Locator {
        return this.page.getByTestId(`queryHistory${query}Button`);
    }

    public historyFavButton(query: string): Locator {
        return this.page.getByTestId(`queryHistory${query}Fav`);
    }

    public get historyFavFilter(): Locator {
        return this.historyPanel.getByTestId("queryHistoryFavFilter");
    }

    public get historyClearSelectedButton(): Locator {
        return this.historyPanel.getByTestId("queryHistoryClearSelected");
    }

    public get historyDeleteButton(): Locator {
        return this.historyPanel.getByTestId("queryHistoryDelete");
    }

    public get historyExportButton(): Locator {
        return this.historyPanel.getByTestId("queryHistoryExport");
    }

    public get historySelectAllButton(): Locator {
        return this.historyPanel.getByTestId("queryHistorySelectAll");
    }

    public get historySelectedCount(): Locator {
        return this.historyPanel.getByTestId("queryHistorySelectedCount");
    }

    public get historyWrapLinesCheckbox(): Locator {
        return this.historyPanel.getByTestId("queryHistoryEditorWrapLines");
    }

    /** The graph-name chip that narrows the history list to one graph. */
    public historyGraphFilter(graphName: string): Locator {
        return this.historyPanel.getByRole("button", { name: graphName, exact: true });
    }

    /** The "Add to Favorites" dialog opened by a row's star. */
    public get favoriteDialog(): Locator {
        return this.page.getByRole("dialog").filter({ hasText: "Add to Favorites" });
    }

    public get runQueryHistoryButton(): Locator {
        return this.page.getByTestId("queryHistoryEditorRun");
    }

    public get historyPanel(): Locator {
        return this.page.getByTestId("queryHistoryPanel");
    }

    public get historyProfileButton(): Locator {
        return this.historyPanel.getByRole("button", { name: "Profile", exact: true });
    }

    public get profileTree(): Locator {
        return this.historyPanel.getByTestId("profileTree");
    }

    public get closeHistoryButton(): Locator {
        return this.historyPanel.getByTestId("queryHistoryCloseButton");
    }

    /** A tab of the selected query in the history panel, e.g. "Metadata". */
    public historyTab(name: string): Locator {
        return this.historyPanel.getByRole('tab', { name });
    }

    /** The content of the history panel's active tab. */
    public get historyTabPanel(): Locator {
        return this.historyPanel.getByRole('tabpanel');
    }

    public tabButton(buttonName: string): Locator {
        return this.page.getByRole('button', { name: buttonName });
    }

    /** The Monaco editor inside the query history panel. */
    public get historyPanelEditor(): Locator {
        return this.historyPanel.locator('.monaco-editor').first();
    }

    /** The Monaco find widget (visible after pressing Ctrl+F). */
    public get monacoFindWidget(): Locator {
        return this.page.locator('.find-widget').first();
    }

    /** The Monaco suggest/autocomplete widget. Multiple editors on the page each
     * have their own `.suggest-widget`; only the active one gets the `visible`
     * class, so match that to avoid latching onto another editor's hidden widget. */
    public get monacoSuggestWidget(): Locator {
        return this.page.locator('.suggest-widget.visible').first();
    }

    /** Rows inside the visible Monaco suggest/autocomplete widget. */
    public get monacoSuggestRows(): Locator {
        return this.page.locator('.suggest-widget.visible .monaco-list-row');
    }
    
    async clickQueryHistoryButton(): Promise<void> {   
        await interactWhenVisible(this.queryHistoryButton, (el) => el.click(), `query history button`);
    }

    async clickSelectQueryInHistory(queryNumber: string): Promise<void> {           
        await interactWhenVisible(this.selectQueryHistory(queryNumber), (el) => el.click(), `query history button`);
    }

    /** Runs each query in turn from the main editor, leaving the history panel closed. */
    async runQueries(queries: string[]): Promise<void> {
        for (const query of queries) {
            await this.insertQuery(query);
            await this.clickRunQuery(false);
        }
    }

    /** Selects the rows with a plain click on the first and Ctrl/Cmd-clicks on the rest. */
    async selectHistoryQueries(queries: string[]): Promise<void> {
        const [first, ...rest] = queries;
        await interactWhenVisible(this.selectQueryHistoryButton(first), (el) => el.click(), `history row ${first}`);
        for (const query of rest) {
            await interactWhenVisible(
                this.selectQueryHistoryButton(query),
                (el) => el.click({ modifiers: ["ControlOrMeta"] }),
                `history row ${query}`
            );
        }
    }

    async addHistoryQueryToFavorites(query: string, name: string): Promise<void> {
        await interactWhenVisible(this.historyFavButton(query), (el) => el.click(), `favorite star of ${query}`);
        await interactWhenVisible(this.favoriteDialog.getByPlaceholder("Favorite name"), (el) => el.fill(name), "favorite name");
        await interactWhenVisible(this.favoriteDialog.getByRole("button", { name: "Save" }), (el) => el.click(), "save favorite");
    }

    async clickHistoryFavFilter(): Promise<void> {
        await interactWhenVisible(this.historyFavFilter, (el) => el.click(), "history favorites filter");
    }

    async clickHistoryClearSelected(): Promise<void> {
        await interactWhenVisible(this.historyClearSelectedButton, (el) => el.click(), "history clear selected favorites");
    }

    async clickHistoryDelete(): Promise<void> {
        await interactWhenVisible(this.historyDeleteButton, (el) => el.click(), "history delete selected");
    }

    async clickHistorySelectAll(): Promise<void> {
        await interactWhenVisible(this.historySelectAllButton, (el) => el.click(), "history select all");
    }

    async clickHistoryGraphFilter(graphName: string): Promise<void> {
        await interactWhenVisible(this.historyGraphFilter(graphName), (el) => el.click(), `history graph filter ${graphName}`);
    }

    async clickHistoryWrapLines(): Promise<void> {
        await interactWhenVisible(this.historyWrapLinesCheckbox, (el) => el.click(), "history wrap lines");
    }

    /** Clicks Export and returns the downloaded file's name and text. */
    async exportSelectedHistory(): Promise<{ filename: string; content: string }> {
        // The listener must exist before the click: the download starts synchronously with it.
        const downloadPromise = this.page.waitForEvent("download");
        await interactWhenVisible(this.historyExportButton, (el) => el.click(), "history export selected");
        const download = await downloadPromise;
        return { filename: download.suggestedFilename(), content: await readFile(await download.path(), "utf-8") };
    }

    /** The raw `query history` value persisted for the connection `initializeLocalStorage` seeds. */
    async getStoredQueryHistory(): Promise<string> {
        return this.page.evaluate(() => localStorage.getItem("localhost:6379:default:query history") ?? "");
    }

    /** Replaces the text of the history panel's editor through Monaco. */
    async setHistoryPanelQuery(query: string): Promise<void> {
        await expect.poll(() => this.page.evaluate(() => {
            const m = (window as unknown as { monaco?: typeof import("monaco-editor") }).monaco;
            const panel = document.querySelector('[data-testid="queryHistoryPanel"]');
            return !!m && !!panel && m.editor.getEditors().some((e) => panel.contains(e.getContainerDomNode()));
        }), { timeout: 10000 }).toBe(true);
        await this.page.evaluate((text) => {
            const m = (window as unknown as { monaco?: typeof import("monaco-editor") }).monaco;
            const panel = document.querySelector('[data-testid="queryHistoryPanel"]');
            const editor = m?.editor.getEditors().find((e) => panel?.contains(e.getContainerDomNode()));
            if (!editor) throw new Error("History panel editor not found");
            editor.setValue(text);
        }, query);
    }

    /** The `wordWrap` option ("on" | "off") the history panel's editor was configured with. */
    async getHistoryPanelWordWrap(): Promise<string | undefined> {
        return this.page.evaluate(() => {
            const m = (window as unknown as { monaco?: typeof import("monaco-editor") }).monaco;
            const panel = document.querySelector('[data-testid="queryHistoryPanel"]');
            const editor = m?.editor.getEditors().find((e) => panel?.contains(e.getContainerDomNode()));
            return editor?.getRawOptions().wordWrap;
        });
    }

    async clickHistoryTab(name: string): Promise<void> {
        await interactWhenVisible(this.historyTab(name), (el) => el.click(), `history tab ${name}`);
    }

    async clickHistoryProfileButton(): Promise<void> {
        await interactWhenVisible(this.historyProfileButton, (el) => el.click(), "history Profile button");
    }

    async closeHistoryPanel(): Promise<void> {
        await interactWhenVisible(this.closeHistoryButton, (el) => el.click(), "close query history panel");
    }

    async clickRunInQueryHistory(): Promise<void> {   
        await interactWhenVisible(this.runQueryHistoryButton, (el) => el.click(), `query history run button`);
    }

    async insertSearchQueryInput(searchInput: string): Promise<void> {   
        await interactWhenVisible(this.search("Query"), (el) => el.fill(searchInput), `search query input`);
    }

    async clickOnTabButton(button: string): Promise<void> {   
        await interactWhenVisible(this.tabButton(button), (el) => el.click(), `tab button ${button}`);
    }

    async isQueryHistoryListVisible(): Promise<boolean> {
        await waitForElementToBeVisible(this.queryList);
        return this.queryList.isVisible();
    }

    async getContentSelectQueryHistoryText(query: string): Promise<string | null> {
        return interactWhenVisible(
            this.selectQueryHistoryText(query),
            (el) => el.textContent(),
            `Query History ${query} Text`
        )
    }

    async runAQueryFromHistory(query: string): Promise<void> {
        await this.clickQueryHistoryButton();
        await this.clickSelectQueryInHistory(query);
        await this.clickRunInQueryHistory();
        await this.waitForCanvasAnimationToEnd();
    }

    async getQueryHistory(query: string): Promise<boolean> {
        await waitForElementToBeVisible(this.selectQueryHistory(query));
        return this.selectQueryHistory(query).isVisible();
    }

    async selectQueryInHistory(query: string): Promise<void> {
        await this.clickSelectQueryInHistory(query);
    }

    async getQueryHistoryEditorContent(query: string): Promise<string> {
        return await this.selectQueryHistoryText(query).textContent() || "";
    }

    /** The Monaco editor inside the fullscreen dialog. */
    public get dialogEditor(): Locator {
        return this.page.locator('[role="dialog"] .monaco-editor').first();
    }

    /** The fullscreen dialog, opened by the editor's Maximize button. */
    public get editorDialog(): Locator {
        return this.page.getByRole("dialog");
    }

    async clickClearInEditorDialog(): Promise<void> {
        await interactWhenVisible(this.editorDialog.getByTestId("clearEditor"), (el) => el.click(), "Clear in editor dialog");
    }

    async clickMinimizeEditorDialog(): Promise<void> {
        await interactWhenVisible(this.editorDialog.getByTestId("editorMinimize"), (el) => el.click(), "Minimize editor dialog");
    }

    /** Press a key in the focused editor, e.g. ArrowUp to step back through history. */
    async pressEditorKey(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    /** Click inside the history panel Monaco editor to give it focus. */
    async clickHistoryPanelEditor(): Promise<void> {
        await interactWhenVisible(this.historyPanelEditor, (el) => el.click(), `history panel editor`);
    }

    /** Open the Monaco find widget in the focused editor via Ctrl+F. */
    async openFindWidget(): Promise<void> {
        await this.page.keyboard.press('Control+f');
    }

    /** Wait until the Monaco find widget is visible. Returns true if it appeared. */
    async waitForFindWidget(timeout = 5000): Promise<boolean> {
        try {
            await this.monacoFindWidget.waitFor({ state: 'visible', timeout });
            return true;
        } catch {
            return false;
        }
    }

    /** Trigger the autocomplete suggest widget with Ctrl+Space. */
    async triggerSuggestions(): Promise<void> {
        await this.page.keyboard.press('Control+Space');
    }

    /** Wait until the Monaco suggest widget is visible AND has a non-zero bounding box
     * (proving it is on-screen, not hidden behind a higher-z-index overlay). */
    async waitForSuggestWidget(timeout = 5000): Promise<boolean> {
        try {
            await this.monacoSuggestWidget.waitFor({ state: 'visible', timeout });
            const box = await this.monacoSuggestWidget.boundingBox();
            return box !== null && box.width > 0 && box.height > 0;
        } catch {
            return false;
        }
    }

    /** Return the number of suggestion rows shown in the suggest widget. */
    async getSuggestionCount(): Promise<number> {
        return this.monacoSuggestRows.count();
    }
}
