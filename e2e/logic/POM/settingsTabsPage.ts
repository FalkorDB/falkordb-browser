import { Locator } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";
import { interactWhenVisible, waitForElementToBeVisible } from "@/e2e/infra/utils";

export default class SettingsTabsPage extends BasePage {

    private get browserTab(): Locator {
        return this.page.getByTestId("settingsTabBrowser");
    }

    private get configurationsTab(): Locator {
        return this.page.getByTestId("settingsTabConfigurations");
    }

    private get usersTab(): Locator {
        return this.page.getByTestId("settingsTabUsers");
    }

    private get tokensTab(): Locator {
        return this.page.getByTestId("settingsTabTokens");
    }

    private get currentTabLabel(): Locator {
        return this.page.getByTestId("settingsCurrentTab");
    }

    async clickBrowserTab(): Promise<void> {
        await interactWhenVisible(this.browserTab, (el) => el.click(), "Click Browser tab");
    }

    async clickConfigurationsTab(): Promise<void> {
        await interactWhenVisible(this.configurationsTab, (el) => el.click(), "Click Configurations tab");
    }

    async clickUsersTab(): Promise<void> {
        await interactWhenVisible(this.usersTab, (el) => el.click(), "Click Users tab");
    }

    async clickTokensTab(): Promise<void> {
        await interactWhenVisible(this.tokensTab, (el) => el.click(), "Click Tokens tab");
    }

    async getCurrentTabText(): Promise<string> {
        if (await waitForElementToBeVisible(this.currentTabLabel, 5000)) {
            return (await this.currentTabLabel.textContent()) ?? "";
        }
        throw new Error("Current tab label not visible");
    }

    async reload(): Promise<void> {
        await this.page.reload({ waitUntil: "networkidle" });
    }

    async navigateTo(url: string): Promise<void> {
        await this.page.goto(url);
        await this.page.waitForLoadState("networkidle");
    }
}
