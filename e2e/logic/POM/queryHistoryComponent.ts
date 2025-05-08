import { Locator } from "@playwright/test";
import { waitForElementToBeVisible } from "@/e2e/infra/utils";
import GraphPage from "./graphPage";

export default class QueryHistory extends GraphPage {

    private get queryHistoryList(): Locator {
        return this.page.getByTestId("queryHistoryList");
    }

    

    async clickOnQueryHistory(): Promise<void> {
        const isVisible = await waitForElementToBeVisible(this.queryHistoryList);
        if (!isVisible) throw new Error("query history button is not visible!");
        await this.queryHistoryList.click();
    }

    async selectQueryInHistory(query: string): Promise<void> {
        await this.queryInHistory(query).click();
    }

    async getQueryHistory(query: string): Promise<boolean> {
        try {
            return await this.queryInHistory(query).isVisible();
        } catch (error) {
            return false;
        }
    }

    async clickOnRunBtnInQueryHistory(): Promise<void> {
        await this.runBtnInQueryHistory.click();
    }

    async isQueryHistoryDialog(): Promise<boolean> {
        const isVisible = await this.queryHistoryDialog.isVisible();
        return isVisible;
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
        await this.waitForCanvasAnimationToEnd();
    }

    async getQueryHistoryEditor(): Promise<string | null> {
        await this.page.waitForTimeout(500);
        const text = await this.queryHistoryTextarea.inputValue();
        return text;
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
