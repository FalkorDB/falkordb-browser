import { Locator } from "playwright";
import BasePage from "@/e2e/infra/ui/basePage";
import { interactWhenVisible } from "@/e2e/infra/utils";

export default class ConnectionManagerComponent extends BasePage {
    private get dropdownTrigger(): Locator {
        return this.page.getByTestId("connections-dropdown-trigger");
    }

    private get dropdownContent(): Locator {
        return this.page.getByTestId("connections-dropdown-content");
    }

    private get connectionItems(): Locator {
        return this.page.locator('[data-testid^="connection-item-"]');
    }

    private get addConnectionButton(): Locator {
        return this.page.getByText("Add Connection");
    }

    async openDropdown(): Promise<void> {
        await interactWhenVisible(this.dropdownTrigger, (el) => el.click(), "Open connections dropdown");
        await this.dropdownContent.waitFor({ state: "visible", timeout: 5000 });
    }

    async isDropdownVisible(): Promise<boolean> {
        return this.dropdownContent.isVisible();
    }

    async getConnectionCount(): Promise<number> {
        await this.waitForPageIdle();
        await this.openDropdown();
        const count = await this.connectionItems.count();
        return count;
    }

    async getConnectionLabels(): Promise<string[]> {
        await this.waitForPageIdle();
        // Dropdown should already be open from getConnectionCount or call openDropdown first
        if (!await this.dropdownContent.isVisible()) {
            await this.openDropdown();
        }
        const items = await this.connectionItems.all();
        const labels: string[] = [];
        for (const item of items) {
            const text = await item.innerText();
            labels.push(text.trim());
        }
        return labels;
    }

    async hasActiveConnection(): Promise<boolean> {
        if (!await this.dropdownContent.isVisible()) {
            await this.openDropdown();
        }
        // Active connection has a Check icon (svg with class text-primary)
        const activeMarker = this.page.locator('[data-testid^="connection-item-"] svg.text-primary');
        return activeMarker.count().then(c => c > 0);
    }

    async isTriggerVisible(): Promise<boolean> {
        return this.dropdownTrigger.isVisible();
    }
}
