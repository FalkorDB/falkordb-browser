
import { Locator, Page } from "playwright";
import BasePage from "@/e2e/infra/ui/basePage";
import { waitForTimeOut, waitForURL } from "@/e2e/infra/utils";
import urls  from '../../config/urls.json'

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

    private get settingsButton(): Locator {
        return this.page.locator("//button[@title='Settings']")
    }
    
    private get LogoutButton(): Locator {
        return this.page.locator("//button[@title='Log Out']")
    }

    async clickOnFalkorLogo(): Promise<void> {
        await this.falkorDBLogo.click();
    }

    async clickOnGraphsButton(): Promise<void> {
        await this.graphsButton.click();
    }
    
    async clickOnSchemasButton(): Promise<void> {
        await this.schemaButton.click();
        await waitForURL(this.page, urls.schemaUrl);
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
        await waitForURL(this.page, urls.settingsUrl);
    }

    async isSettingsButtonEnabled(): Promise<Boolean> {
        return await this.settingsButton.isEnabled();
    }

    async Logout(user: string): Promise<void> {
        await this.page.waitForLoadState('networkidle'); 
        await this.LogoutButton.click()
        await waitForURL(this.page, urls.loginUrl);
    }

    async clickOnFalkor(): Promise<Page> {
        await this.page.waitForLoadState('networkidle'); 
        const [newPage] = await Promise.all([
            this.page.waitForEvent('popup'),
            this.clickOnFalkorLogo(),
        ]);
        return newPage
    }

    async clickOnDocumentation(): Promise<Page> {
        await this.page.waitForLoadState('networkidle'); 
        const [newPage] = await Promise.all([
            this.page.waitForEvent('popup'),
            this.clickOnHelpBtn(),
            this.clickOnDocumentationBtn(),
        ]);
        return newPage
    }

    async clickOnSupport(): Promise<Page> {
        await this.page.waitForLoadState('networkidle'); 
        const [newPage] = await Promise.all([
            this.page.waitForEvent('popup'),
            this.clickOnHelpBtn(),
            this.clickOnSupportBtn(),
        ]);
        return newPage
    }

}