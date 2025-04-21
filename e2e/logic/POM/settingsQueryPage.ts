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

    async addLimit(limit?: number): Promise<void> {
        await interactWhenVisible(this.limitInput, async (el) => {
            if (limit) {
                await el.fill(limit.toString())
            } else {
                await this.increaseLimitBtn.click();
            }
        }, "Limit input");
    }

    async addTimeout(timeout?: number): Promise<void> {
        await interactWhenVisible(this.timeoutInput, async (el) => {
            if (timeout) {
                await el.fill(timeout.toString())
            } else {
                await this.increaseTimeoutBtn.click();
            }
        }, "Timeout input");
    }
}