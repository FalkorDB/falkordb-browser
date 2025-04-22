import { Locator } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";
import { waitForElementToBeVisible } from "@/e2e/infra/utils";

export default class SettingsConfigPage extends BasePage {

    private get dbConfigurationTabBtn(): Locator {
        return this.page.getByRole("button", { name: "Configure database settings" });
    }

    private get roleContentValue(): (role: string) => Locator {
        return (role: string) => this.page.locator(`//tbody/tr[@data-id='${role}']/td[3]/div/p`)
    }

    private get EditRoleButton(): (role: string) => Locator {
        return (role: string) => this.page.locator(`//tbody//tr[@data-id='${role}']/td[3]/div/div/button`)
    }

    private get roleValueInput(): (role: string) => Locator {
        return (role: string) => this.page.locator(`//tbody//tr[@data-id='${role}']/td[3]/div/input`)
    }

    private get confirmValueInputBtn(): (role: string) => Locator {
        return (role: string) => this.page.locator(`//tbody//tr[@data-id='${role}']/td[3]/div/div/button[1]`)
    }

    private get toastCloseBtn(): Locator {
        return this.page.locator("//li[@role='status']/button");
    }

    private get tableContent(): Locator {
        return this.page.locator("//div[@id='tableContent']");
    }

    private get searchBtn(): Locator {
        return this.page.locator("//div[@id='tableComponent']/button");
    }

    private get searchInput(): Locator {
        return this.page.locator("//div[@id='tableComponent']/input");
    }

    private get tableRoles(): Locator {
        return this.page.locator("//table//tbody//tr");
    }

    private get undoBtnInToastMsg(): Locator {
        return this.page.locator("//button[contains(text(), 'Undo')]");
    }

    async navigateToDBConfigurationTab(): Promise<void> {
        await this.dbConfigurationTabBtn.click();
    }

    async hoverOnRoleContentValue(role: string): Promise<void> {
        const isVisible = await waitForElementToBeVisible(this.roleContentValue(role));
        if (!isVisible) throw new Error("role content value is not visible!");
        await this.roleContentValue(role).hover();
    }

    async clickEditRoleButton(role: string): Promise<void> {
        const isVisible = await waitForElementToBeVisible(this.EditRoleButton(role));
        if (!isVisible) throw new Error("edit role button is not visible!");
        await this.EditRoleButton(role).click();
    }

    async fillRoleValueInput(role: string, input: string): Promise<void> {
        const isVisible = await waitForElementToBeVisible(this.roleValueInput(role));
        if (!isVisible) throw new Error("role value input is not visible!");
        await this.roleValueInput(role).fill(input);
    }

    async clickConfirmValueInputBtn(role: string): Promise<void> {
        const isVisible = await waitForElementToBeVisible(this.confirmValueInputBtn(role));
        if (!isVisible) throw new Error("confirm value input button is not visible!");
        await this.confirmValueInputBtn(role).click();
    }

    async getRoleContentValue(role: string): Promise<string | null> {
        const isVisible = await waitForElementToBeVisible(this.roleContentValue(role));
        if (!isVisible) throw new Error("role content value is not visible!");
        const value = await this.roleContentValue(role).textContent();
        return value
    }

    async clickOnUndoBtnInToastMsg(): Promise<void> {
        const isVisible = await waitForElementToBeVisible(this.undoBtnInToastMsg);
        if (!isVisible) throw new Error("undo button in toast is not visible!");
        await this.undoBtnInToastMsg.click();
    }

    async isUndoBtnInToastMsg(): Promise<void> {
        await this.page.waitForTimeout(500);
        await this.undoBtnInToastMsg.isVisible();
    }

    async modifyRoleValue(role: string, input: string): Promise<string | null> {
        await this.hoverOnRoleContentValue(role);
        await this.clickEditRoleButton(role);
        await this.roleValueInput(role).fill(input);
        await this.clickConfirmValueInputBtn(role);
        const value = await this.getRoleContentValue(role);
        return value
    }

    async clickOnToastCloseBtn(): Promise<void> {
        await this.toastCloseBtn.click();
    }

    async scrollToBottomInTable(): Promise<void> {
        await this.tableContent.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    }

    async searchForElement(element: string): Promise<void> {
        await this.searchBtn.click();
        await this.searchInput.fill(element);
        await this.page.keyboard.press('Enter');
    }

    async getTableRolesCount(): Promise<number> {
        await this.page.waitForTimeout(1500);
        const count = await this.tableRoles.count();
        return count;
    }

    async refreshPage(): Promise<void> {
        await this.page.reload({ waitUntil: 'networkidle' });
        await this.navigateToDBConfigurationTab();
    }

}