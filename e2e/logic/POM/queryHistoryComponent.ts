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

    public selectQueryHistory(index: string): Locator {
        return this.page.getByTestId(`queryHistory${index}`);
    }

    public get runQueryHistoryButton(): Locator {
        return this.page.getByTestId("queryHistoryEditorRun");
    }

    private get queryHistoryTextarea(): Locator {
        return this.page.locator('[data-testid="queryList"] li');
    }

    public get searchQueryInput(): Locator {
        return this.page.getByTestId("searchQuery");
    }

    public tabButton(buttonName: string): Locator {
        return this.page.getByRole('button', { name: buttonName });
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
        await interactWhenVisible(this.searchQueryInput, (el) => el.fill(searchInput), `search query input`);
    }

    async clickOnTabButton(button: string): Promise<void> {   
        await interactWhenVisible(this.tabButton(button), (el) => el.click(), `tab button ${button}`);
    }

    async isQueryHistoryListVisible(): Promise<boolean> {
        await waitForElementToBeVisible(this.queryList);
        return await this.queryList.isVisible();
    }

    async runAQueryFromHistory(queryNumber: string): Promise<void> {
        await this.clickQueryHistoryButton();
        await this.clickSelectQueryInHistory(queryNumber);
        await this.clickRunInQueryHistory();
        await this.waitForCanvasAnimationToEnd();
    }

    async getQueryHistory(queryNumber: string): Promise<boolean> {
        await waitForElementToBeVisible(this.selectQueryHistory(queryNumber));
        return await this.selectQueryHistory(queryNumber).isVisible();
    }

    async selectQueryInHistory(queryNumber: string): Promise<void> {
        await this.clickSelectQueryInHistory(queryNumber);
    }

    async getQueryHistoryEditorContent(): Promise<string[]> {
        return await this.queryHistoryTextarea.allTextContents();
    }
}
