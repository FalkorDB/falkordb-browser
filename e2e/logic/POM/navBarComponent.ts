import { Locator, Page } from "@playwright/test";
import { BasePage } from "@/e2e/infra/ui/basePage";
import { waitForTimeOut } from "@/e2e/infra/utils";

export class navBarComponent extends BasePage {

    private get falkorDBLogo(): Locator {
        return this.page.locator("//a[@aria-label='FalkorDB']");
    }

    private get graphButton(): Locator {
        return this.page.getByRole("button", { name : "Graphs"});
    }

    private get helpButton(): Locator {
        return this.page.getByRole("button", { name : "help"})
    }

    private get documentationButton(): Locator {
        return this.page.locator("//a[@title='Documentation']")
    }

    private get supportButton(): Locator {
        return this.page.locator("//a[@title='Support']")
    }

    private get settingsButton(): Locator {
        return this.page.locator("//button[@title='Settings']")
    }

    private get DefaultButton(): Locator {
        return this.page.getByRole("button", { name : "Default"})
    }
    
    private get LogoutButton(): Locator {
        return this.page.locator("//div[contains(text(), 'Logout')]")
    }

    async clickOnFalkorLogo(): Promise<void> {
        await this.falkorDBLogo.click();
    }

    async clickOnGraphBtn(): Promise<void> {
        await this.graphButton.click();
    }

    async clickOnHelpBtn(): Promise<void> {
        await this.helpButton.click();
    }

    async clickOnDocumentationBtn(): Promise<void> {
        await this.documentationButton.click();
    }

    async clickOnSupportBtn(): Promise<void> {
        await this.supportButton.click();
    }

    async clickOnSettingsBtn(): Promise<void> {
        await this.settingsButton.click();
        await waitForTimeOut(this.page, 500);
    }

    async Logout(): Promise<void> {
        await this.DefaultButton.click()
        await this.LogoutButton.click()
        await waitForTimeOut(this.page, 2000);
    }
  
}