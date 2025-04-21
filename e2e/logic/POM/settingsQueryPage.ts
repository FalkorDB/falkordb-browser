import { Locator } from "@playwright/test";
import { interactWhenVisible } from "@/e2e/infra/utils";
import GraphPage from "./graphPage";

export default class SettingsQueryPage extends GraphPage {

    private get limitInput(): Locator {
        return this.page.locator("#limitInput");
    }

    private get timeoutInput(): Locator {
        return this.page.locator("#timeoutInput");
    }

    private get increaseLimitBtn(): Locator {
        return this.page.locator("#increaseLimitBtn");
    }

    private get increaseTimeoutBtn(): Locator {
        return this.page.locator("#increaseTimeoutBtn");
    }

    private get graphsButton(): Locator {
        return this.page.locator("//button[contains(text(), 'Graphs')]");
    }

    async clickOnGraph(): Promise<void> {
        await interactWhenVisible(this.graphsButton, el => el.click(), "graph button");
    }

    async clickIncreaseLimit(): Promise<void> {
        await interactWhenVisible(this.increaseLimitBtn, el => el.click(), "increase Limit button");
    }

    async clickIncreaseTimeout(): Promise<void> {
        await interactWhenVisible(this.increaseTimeoutBtn, el => el.click(), "increase timeout button");
    }

    async fillTimeoutInput(input: string): Promise<void> {
        await interactWhenVisible(this.timeoutInput, el => el.fill(input), "time out input");
    }

    async fillLimitInput(input: string): Promise<void> {
        await interactWhenVisible(this.limitInput, el => el.fill(input), "limit input");
    }

    async addLimit(limit?: number): Promise<void> {
        if (limit) {
            await this.fillTimeoutInput(limit.toString())
        } else {
            await this.clickIncreaseLimit();
        }
    }

    async addTimeout(timeout?: number): Promise<void> {
        if (timeout) {
            await this.fillTimeoutInput(timeout.toString())
        } else {
            await this.clickIncreaseTimeout();
        }
    }
}