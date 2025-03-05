
import { Locator, Page } from "playwright";
import BasePage from "@/e2e/infra/ui/basePage";
import { waitForURL } from "@/e2e/infra/utils";
import urls from '../../config/urls.json'

export default class NavBarComponent extends BasePage {

    private get falkorDBLogo(): Locator {
        return this.page.getByLabel("FalkorDB");
    }

    private get graphsButton(): Locator {
        return this.page.locator("//button[contains(text(), 'Graphs')]");
    }

    private get schemaButton(): Locator {
        return this.page.getByRole("button", { name: "Schemas" });
    }

    private get helpButton(): Locator {
        return this.page.getByRole("button", { name: "Help" })
    }

    private get documentationButton(): Locator {
        return this.page.getByRole("link", { name: "Documentation" })
    }

    private get supportButton(): Locator {
        return this.page.getByRole("link", { name: "Support" })
    }

    private get aboutButton(): Locator {
        return this.page.getByRole("button", { name: "About" })
    }

    private get settingsButton(): Locator {
        return this.page.getByRole("button", { name: "Settings" })
    }

    private get LogoutButton(): Locator {
        return this.page.getByRole("button", { name: "Log Out" })
    }

    private get aboutPopUp(): Locator {
        return this.page.locator('//div[@id="about"]');
    }

    private get closeBtnForAboutPopUp(): Locator {
        return this.page.locator('//div[@id="about"]//button');
    }

    async clickOnFalkorLogo(): Promise<void> {
        await this.falkorDBLogo.click();
    }

    async clickOnGraphsButton(): Promise<void> {
        await this.graphsButton.click();
        await waitForURL(this.page, urls.graphUrl);
    }

    async clickOnSchemasButton(): Promise<void> {
        await this.schemaButton.click();
        await waitForURL(this.page, urls.schemaUrl);
    }

    async clickOnHelpBtn(): Promise<void> {
        await this.helpButton.click();
    }

    async clickOnAboutBtn(): Promise<void> {
        await this.aboutButton.click();
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

    async isSettingsButtonEnabled(): Promise<boolean> {
        const isEnabled = await this.settingsButton.isEnabled();
        return isEnabled;
    }

    async Logout(): Promise<void> {
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

    async isAboutPopUp(): Promise<boolean>{
        return await this.aboutPopUp.isVisible();
    }

    async clickOnClosepPopUpBtn(): Promise<void>{
        await this.closeBtnForAboutPopUp.click();
    }

    async clickOnAbout(): Promise<void> {
        await this.clickOnHelpBtn();
        await this.clickOnAboutBtn();
    }
}