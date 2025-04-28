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

    private get decreaseLimitBtn(): Locator {
        return this.page.locator("#decreaseLimitBtn");
    }

    private get decreaseTimeoutBtn(): Locator {
        return this.page.locator("#decreaseTimeoutBtn");
    }

    async clickIncreaseLimit(): Promise<void> {
        await interactWhenVisible(this.increaseLimitBtn, el => el.click(), "increase Limit button");
    }

    async clickIncreaseTimeout(): Promise<void> {
        await interactWhenVisible(this.increaseTimeoutBtn, el => el.click(), "increase timeout button");
    }

    async clickDecreaseLimit(): Promise<void> {
        await interactWhenVisible(this.decreaseLimitBtn, el => el.click(), "decrease limit button");
    }

    async clickDecreaseTimeout(): Promise<void> {
        await interactWhenVisible(this.decreaseTimeoutBtn, el => el.click(), "decrease timeout button");
    }

    async fillTimeoutInput(input: string): Promise<void> {
        await interactWhenVisible(this.timeoutInput, el => el.fill(input), "time out input");
    }

    async fillLimitInput(input: string): Promise<void> {
        await interactWhenVisible(this.limitInput, el => el.fill(input), "limit input");
    }

    async fillLimit(limit: number): Promise<void> {
            await this.fillLimitInput(limit.toString())
    }

    async fillTimeout(timeout: number): Promise<void> {
        await this.fillTimeoutInput(timeout.toString())
    }
    
    async increaseLimit(): Promise<void> {
        await this.clickIncreaseLimit();
    }

    async increaseTimeout(): Promise<void> {
        await this.clickIncreaseTimeout();
    }

    async decreaseLimit(): Promise<void> {
        await this.clickDecreaseLimit();
    }

    async decreaseTimeout(): Promise<void> {
        await this.clickDecreaseTimeout();
    }

    async getLimit(): Promise<string> {
        const limit = await this.limitInput.inputValue();
        return limit;
    }

    async getTimeout(): Promise<string> {
        const timeout = await this.timeoutInput.inputValue();
        return timeout;
    }



}