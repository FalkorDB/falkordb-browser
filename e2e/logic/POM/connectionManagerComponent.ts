import { Locator, Response } from "playwright";
import BasePage from "@/e2e/infra/ui/basePage";
import { interactWhenVisible } from "@/e2e/infra/utils";

export default class ConnectionManagerComponent extends BasePage {
    private get dropdownTrigger(): Locator {
        return this.page.getByTestId("connections-dropdown-trigger");
    }

    private get dropdownContent(): Locator {
        return this.page.getByTestId("connections-dropdown-content");
    }

    public get connectionItems(): Locator {
        return this.page.locator('[data-testid^="connection-item-"]');
    }

    public get logoutDialog(): Locator {
        return this.page.getByTestId("connectionLogoutDialog");
    }

    public get addDialog(): Locator {
        return this.page.getByRole("dialog");
    }

    public get addConnectionSubmit(): Locator {
        return this.addDialog.getByRole("button", { name: "Add Connection", exact: true });
    }

    connectionForUser(username: string): Locator {
        const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return this.connectionItems.filter({ hasText: new RegExp(`^${escapedUsername}@`) });
    }

    activeMarkerForUser(username: string): Locator {
        return this.connectionForUser(username).locator("svg.text-primary");
    }

    feedbackMessage(text: string): Locator {
        return this.page.getByText(text, { exact: true });
    }

    async selectConnection(username: string): Promise<void> {
        await this.connectionForUser(username).click();
    }

    async requestRemoval(username: string): Promise<void> {
        await this.connectionForUser(username).getByRole("button", { name: /Sign out of connection/ }).click();
    }

    async requestFirstRemoval(): Promise<void> {
        await this.page.getByTestId(/^connection-logout-/).first().click();
    }

    async confirmRemoval(): Promise<void> {
        await this.page.getByTestId("connectionLogoutConfirm").click();
    }

    async cancelRemoval(): Promise<void> {
        await this.page.getByTestId("connectionLogoutCancel").click();
    }

    async closeDropdown(): Promise<void> {
        await this.page.keyboard.press("Escape");
    }

    async fillAdditionalPassword(password: string): Promise<void> {
        await this.addDialog.locator("#Password").fill(password);
    }

    async submitConnectionForm(): Promise<void> {
        await this.addConnectionSubmit.click();
    }

    private get addConnectionButton(): Locator {
        return this.page.getByText("Add Connection");
    }

    async openDropdown(): Promise<void> {
        await interactWhenVisible(this.dropdownTrigger, (el) => el.click(), "Open connections dropdown");
        await this.dropdownContent.waitFor({ state: "visible", timeout: 5000 });
    }

    async submitAdditionalConnection(username: string, password: string): Promise<Locator> {
        await this.openDropdown();
        await this.page.getByRole("menuitem", { name: "Add Connection" }).click();
        const dialog = this.addDialog;
        await dialog.locator("#Username").fill(username);
        await this.fillAdditionalPassword(password);
        await this.submitConnectionForm();
        return dialog;
    }

    waitForSessionUpdate(): Promise<Response> {
        return this.page.waitForResponse(response =>
            new URL(response.url()).pathname === "/api/auth/session" && response.request().method() === "POST");
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
