import { Locator, Page } from "@playwright/test";
import { BasePage } from "@/e2e/infra/ui/basePage";

export class navBarComponent extends BasePage {

    private get falkorDBLogo(): Locator {
        return this.page.locator("//a[@aria-label='FalkorDB']");
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

    async clickOnFalkorLogo(): Promise<void> {
        await this.falkorDBLogo.click();
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

  
}