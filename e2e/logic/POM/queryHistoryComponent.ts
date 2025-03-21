import { Locator } from "playwright";
import GraphPage from "./graphPage";
import { waitForElementToBeVisible } from "@/e2e/infra/utils";

export default class QueryHistory extends GraphPage {

    private get queryHistoryDialog(): Locator {
        return this.page.locator("//div[contains(@id, 'queryHistory')]");
    }

    private get queryHistory(): Locator {
        return this.page.locator("//button[contains(text(), 'Query History')]");
    }

    private get queryInHistory(): (query: string) => Locator {
        return (query: string) => this.page.locator(`//div[contains(@id, 'queryHistory')]//ul//li[${query}]`);
    }

    private get selectQueryInHistoryBtn(): (query: string) => Locator {
        return (query: string) => this.page.locator(`//div[contains(@id, 'queryHistory')]//ul//li[${query}]/button`);
    }

    private get runBtnInQueryHistory(): Locator {
        return this.page.locator("//div[contains(@id, 'queryHistory')]//button[contains(text(), 'Run')]");
    }

    private get queryHistoryTextarea(): Locator {
        return this.page.locator("#queryHistoryEditor textarea");
    }

    private get queryHistoryPanel(): Locator {
        return this.page.locator("//div[@id='queryHistoryPanel']//ul");
    }

    async clickOnQueryHistory(): Promise<void> {
        const isVisible = await waitForElementToBeVisible(this.queryHistory);
        if (!isVisible) throw new Error("query history button is not visible!");
        await this.queryHistory.click();
    }

    async selectQueryInHistory(query: string): Promise<void> {
        await this.queryInHistory(query).click();
    }

    async getQueryHistory(query: string): Promise<boolean> {
        const isVisible = await this.queryInHistory(query).isVisible();
        return isVisible;
    }

    async clickOnRunBtnInQueryHistory(): Promise<void> {
        await this.runBtnInQueryHistory.click();
    }

    async isQueryHistoryDialog(): Promise<void> {
        await this.queryHistoryDialog.isVisible();
    }

    async ClickOnSelectQueryInHistoryBtn(queryNumber: string): Promise<void> {
        await this.selectQueryInHistoryBtn(queryNumber).click();
    }

    async getSelectQueryInHistoryText(queryNumber: string): Promise<string | null> {
        const text = await this.selectQueryInHistoryBtn(queryNumber).textContent();
        return text;
    }

    async runAQueryFromHistory(queryNumber: string): Promise<void> {
        await this.clickOnQueryHistory();
        await this.ClickOnSelectQueryInHistoryBtn(queryNumber);
        await this.clickOnRunBtnInQueryHistory();
    }

    async getQueryHistoryEditor(): Promise<string | null> {
        return await this.queryHistoryTextarea.inputValue();
    }

    async getQueryHistoryPanel(): Promise<string[]> {
        const rawText = await this.queryHistoryPanel.allTextContents();
    
        if (!rawText || rawText.length === 0) {
            return [];
        }

        const formattedText = rawText[0]
            .replace(/Query internal execution time:.*/, '')
            .replace(/([a-z]+: \d+)/gi, '$1\n')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
    
        return formattedText;
    }
}
