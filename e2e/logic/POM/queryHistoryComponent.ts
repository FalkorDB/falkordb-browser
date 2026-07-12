import { Locator } from "@playwright/test";
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

    public get runQueryHistoryButton(): Locator {
        return this.page.getByTestId("queryHistoryEditorRun");
    }

    public get historyPanel(): Locator {
        return this.page.getByTestId("queryHistoryPanel");
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

    /** The Monaco suggest/autocomplete widget. */
    public get monacoSuggestWidget(): Locator {
        return this.page.locator('.suggest-widget').first();
    }

    /** Rows inside the Monaco suggest/autocomplete widget. */
    public get monacoSuggestRows(): Locator {
        return this.page.locator('.suggest-widget .monaco-list-row');
    }
    
    async clickQueryHistoryButton(): Promise<void> {   
        await interactWhenVisible(this.queryHistoryButton, (el) => el.click(), `query history button`);
    }

    async clickSelectQueryInHistory(queryNumber: string): Promise<void> {           
        await interactWhenVisible(this.selectQueryHistory(queryNumber), (el) => el.click(), `query history button`);
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
