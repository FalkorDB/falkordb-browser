import { Locator } from "playwright";
import BasePage from "@/e2e/infra/ui/basePage";
import { waitForTimeOut } from "@/e2e/infra/utils";

export default class NavBarComponent extends BasePage {

    private get falkorDBLogo(): Locator {
        return this.page.locator("//a[@aria-label='FalkorDB']");
    }
    
    private get graphsButton(): Locator {
        return this.page.getByRole("button", { name: "Graphs"});
    }
    
    private get schemaButton(): Locator {
        return this.page.getByRole("button", { name: "Schemas"});
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
    
    async clickOnGraphsButton(): Promise<void> {
        await this.graphsButton.click();
    }
    
    async clickOnSchemasButton(): Promise<void> {
        await this.schemaButton.click();
        await waitForTimeOut(this.page, 1000)
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