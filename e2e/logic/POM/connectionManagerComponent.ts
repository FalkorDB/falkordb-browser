import { APIResponse, Locator, Response } from "playwright";
import BasePage from "@/e2e/infra/ui/basePage";
import { interactWhenVisible } from "@/e2e/infra/utils";

export default class ConnectionManagerComponent extends BasePage {
    private get dropdownTrigger(): Locator {
        return this.page.getByTestId("connections-dropdown-trigger");
    }

    private get dropdownContent(): Locator {
        return this.page.getByTestId("connections-dropdown-content");
    }

    private get addConnectionButton(): Locator {
        return this.dropdownContent.getByRole("menuitem", { name: "Add Connection" });
    }

    private get addDialogUsername(): Locator {
        return this.addDialog.locator("#Username");
    }

    private get addDialogPassword(): Locator {
        return this.addDialog.locator("#Password");
    }

    private get logoutConfirm(): Locator {
        return this.logoutDialog.getByTestId("connectionLogoutConfirm");
    }

    private get logoutCancel(): Locator {
        return this.logoutDialog.getByTestId("connectionLogoutCancel");
    }

    public get connectionItems(): Locator {
        return this.page.locator('[data-testid^="connection-item-"]');
    }

    public get logoutDialog(): Locator {
        return this.page.getByTestId("connectionLogoutDialog");
    }

    public get addDialog(): Locator {
        return this.page.getByRole("dialog", { name: "Add Connection" });
    }

    public get addConnectionSubmit(): Locator {
        return this.addDialog.getByRole("button", { name: "Add Connection", exact: true });
    }

    private static activeMarkerIn(scope: Locator): Locator {
        // The active connection carries a Check icon (svg with class text-primary).
        return scope.locator("svg.text-primary");
    }

    connectionForUser(username: string): Locator {
        const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return this.connectionItems.filter({ hasText: new RegExp(`^${escapedUsername}@`) });
    }

    activeMarkerForUser(username: string): Locator {
        return ConnectionManagerComponent.activeMarkerIn(this.connectionForUser(username));
    }

    errorToast(text: string): Locator {
        return this.page.getByTestId("toast-destructive").filter({ hasText: text });
    }

    async openDropdown(): Promise<void> {
        await interactWhenVisible(this.dropdownTrigger, (el) => el.click(), "Open connections dropdown");
        await this.dropdownContent.waitFor({ state: "visible", timeout: 5000 });
    }

    async closeDropdown(): Promise<void> {
        await this.page.keyboard.press("Escape");
    }

    async selectConnection(username: string): Promise<void> {
        await interactWhenVisible(this.connectionForUser(username), (el) => el.click(), `Select connection ${username}`);
    }

    async requestRemoval(username: string): Promise<void> {
        await interactWhenVisible(
            this.connectionForUser(username).getByRole("button", { name: /Sign out of connection/ }),
            (el) => el.click(),
            `Sign out of connection ${username}`
        );
    }

    async confirmRemoval(): Promise<void> {
        await interactWhenVisible(this.logoutConfirm, (el) => el.click(), "Confirm connection logout");
    }

    async cancelRemoval(): Promise<void> {
        await interactWhenVisible(this.logoutCancel, (el) => el.click(), "Cancel connection logout");
    }

    async fillAdditionalPassword(password: string): Promise<void> {
        await interactWhenVisible(this.addDialogPassword, (el) => el.fill(password), "Add connection password");
    }

    async submitConnectionForm(): Promise<void> {
        await interactWhenVisible(this.addConnectionSubmit, (el) => el.click(), "Submit add connection");
    }

    async submitAdditionalConnection(username: string, password: string): Promise<void> {
        await this.openDropdown();
        await interactWhenVisible(this.addConnectionButton, (el) => el.click(), "Add Connection menu item");
        await interactWhenVisible(this.addDialogUsername, (el) => el.fill(username), "Add connection username");
        await this.fillAdditionalPassword(password);
        await this.submitConnectionForm();
    }

    waitForSessionUpdate(): Promise<Response> {
        return this.page.waitForResponse(response =>
            new URL(response.url()).pathname === "/api/auth/session" && response.request().method() === "POST");
    }

    waitForAddConnectionResponse(): Promise<Response> {
        return this.page.waitForResponse(response =>
            new URL(response.url()).pathname === "/api/connections" && response.request().method() === "POST");
    }

    async getConnectionId(username: string): Promise<string | undefined> {
        const testId = await interactWhenVisible(
            this.connectionForUser(username),
            (el) => el.getAttribute("data-testid"),
            `Connection ${username}`
        );
        return testId?.replace("connection-item-", "");
    }

    async getSession(): Promise<APIResponse> {
        return this.page.request.get(new URL("/api/auth/session", this.page.url()).href);
    }

    async getLastActiveConnectionId(): Promise<string | null> {
        return (await this.evaluate(() => localStorage.getItem("lastActiveConnectionId"))) as string | null;
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
        return ConnectionManagerComponent.activeMarkerIn(this.connectionItems).count().then(c => c > 0);
    }

    async isTriggerVisible(): Promise<boolean> {
        return this.dropdownTrigger.isVisible();
    }
}
