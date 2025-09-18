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
}
