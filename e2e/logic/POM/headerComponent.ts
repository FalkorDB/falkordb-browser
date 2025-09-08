import { Locator, Page } from "playwright";
import BasePage from "@/e2e/infra/ui/basePage";
import { interactWhenVisible, waitForURL } from "@/e2e/infra/utils";
import urls from '../../config/urls.json'

export default class HeaderComponent extends BasePage {
    private get falkorDBLogo(): Locator {
        return this.page.getByLabel("FalkorDB");
    }

    private get graphsButton(): Locator {
        return this.page.getByTestId("GraphsButton");
    }

    private get schemaButton(): Locator {
        return this.page.getByTestId("SchemasButton");
    }

    private get helpButton(): Locator {
        return this.page.getByRole("button", { name: "Help" })
    }

    private get documentationButton(): Locator {
        return this.page.getByRole("link", { name: "Documentation", exact: true })
    }

    private get apiDocumentationButton(): Locator {
        return this.page.getByRole("link", { name: "API Documentation" })
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
        return this.page.getByTestId("logoutButton")
    }

    private get aboutPopUp(): Locator {
        return this.page.locator('//div[@id="about"]');
    }

    async clickFalkorDBLogo(): Promise<void> {
        await interactWhenVisible(this.falkorDBLogo, (el) => el.click(), "Click FalkorDB Logo");
    }

    async clickOnGraphsButton(): Promise<void> {
        await interactWhenVisible(this.graphsButton, (el) => el.click(), "Click Graphs Button");
        await waitForURL(this.page, urls.graphUrl);
    }

    async clickOnSchemasButton(): Promise<void> {
        await interactWhenVisible(this.schemaButton, (el) => el.click(), "Click Schemas Button");
        await waitForURL(this.page, urls.schemaUrl);
    }

    async clickOnHelpBtn(): Promise<void> {
        await interactWhenVisible(this.helpButton, (el) => el.click(), "Click Help Button");
    }

    async clickOnAboutBtn(): Promise<void> {
        await interactWhenVisible(this.aboutButton, (el) => el.click(), "Click About Button");
    }

    async clickOnDocumentationBtn(): Promise<void> {
        await interactWhenVisible(this.documentationButton, (el) => el.click(), "Click Documentation Button");
    }

    async clickOnApiDocumentationBtn(): Promise<void> {
        await interactWhenVisible(this.apiDocumentationButton, (el) => el.click(), "Click API Documentation Button");
    }

    async clickOnSupportBtn(): Promise<void> {
        await interactWhenVisible(this.supportButton, (el) => el.click(), "Click Support Button");
    }

    async clickOnSettingsBtn(): Promise<void> {
        await interactWhenVisible(this.settingsButton, (el) => el.click(), "Click Settings Button");
        await waitForURL(this.page, urls.settingsUrl);
    }

    async isSettingsButtonEnabled(): Promise<boolean> {
        const isEnabled = await this.settingsButton.isVisible();
        return isEnabled;
    }

    async Logout(): Promise<void> {
        await this.waitForPageIdle();
        await interactWhenVisible(this.LogoutButton, (el) => el.click(), "Click Logout Button");
        await waitForURL(this.page, urls.loginUrl);
    }

    async clickOnFalkor(): Promise<Page> {
        await this.waitForPageIdle();
        const [newPage] = await Promise.all([
            this.page.waitForEvent('popup'),
            this.clickFalkorDBLogo()
        ]);
        return newPage;
    }

    async clickOnDocumentation(): Promise<Page> {
        await this.waitForPageIdle();
        const [newPage] = await Promise.all([
            this.page.waitForEvent('popup'),
            this.clickOnHelpBtn(),
            this.clickOnDocumentationBtn()
        ]);
        return newPage;
    }

    async clickOnApiDocumentation(): Promise<Page> {
        await this.waitForPageIdle();
        await this.clickOnHelpBtn();
        await this.clickOnApiDocumentationBtn();
        await this.page.waitForURL('**/docs**', { timeout: 5000 });
        return this.page;
    }

    async clickOnSupport(): Promise<Page> {
        await this.waitForPageIdle();
        const [newPage] = await Promise.all([
            this.page.waitForEvent('popup'),
            this.clickOnHelpBtn(),
            this.clickOnSupportBtn()
        ]);
        return newPage;
    }

    async isAboutPopUp(): Promise<boolean> {
        const isVisible = await this.aboutPopUp.isVisible();
        return isVisible;
    }

    async closePopUp(): Promise<void> {
        await this.page.mouse.click(10, 10);
        await this.page.waitForTimeout(1000);
    }

    async clickOnAbout(): Promise<void> {
        await this.clickOnHelpBtn();
        await this.clickOnAboutBtn();
    }
}