import { Locator } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";
import { interactWhenVisible } from "@/e2e/infra/utils";

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
        return this.page.locator('input[data-testid="searchInputConfigs"]');
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
        await interactWhenVisible(this.roleContentValue(role), (el) => el.hover(), `role content value ${role}`);
    }
    
    async clickEditRoleButton(role: string): Promise<void> {
        await interactWhenVisible(this.EditRoleButton(role), (el) => el.click(), `edit role button ${role}`);
    }
    
    async fillRoleValueInput(role: string, input: string): Promise<void> {
        await interactWhenVisible(this.roleValueInput(role), (el) => el.fill(input), `role value input ${role}`);
    }
    
    async clickConfirmValueInputBtn(role: string): Promise<void> {
        await interactWhenVisible(this.confirmValueInputBtn(role), (el) => el.click(), `confirm value input button ${role}`);
    }
    
    async getRoleContentValue(role: string): Promise<string | null> {
        return interactWhenVisible(this.roleContentValue(role), (el) => el.textContent(), `role content value ${role}`);
    }
    
    async clickOnUndoBtnInToastMsg(): Promise<void> {
        await interactWhenVisible(this.undoBtnInToastMsg, (el) => el.click(), "undo button in toast");
    }

    async clickToastCloseBtn(): Promise<void> {
        await interactWhenVisible(this.toastCloseBtn, (el) => el.click(), "toast close button");
    }
    
    async fillSearchInput(value: string): Promise<void> {
        await interactWhenVisible(this.searchInput, (el) => el.fill(value), "search input");
    }
    
    async isUndoBtnInToastMsg(): Promise<void> {
        await this.page.waitForTimeout(500);
        await this.undoBtnInToastMsg.isVisible();
    }

    async modifyRoleValue(role: string, input: string): Promise<string | null> {
        await this.hoverOnRoleContentValue(role);
        await this.clickEditRoleButton(role);
        await this.fillRoleValueInput(role, input);
        await this.clickConfirmValueInputBtn(role);
        const value = await this.getRoleContentValue(role);
        return value
    }

    async clickOnToastCloseBtn(): Promise<void> {
        await this.clickToastCloseBtn();
    }

    async scrollToBottomInTable(): Promise<void> {
        await this.tableContent.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    }

    async searchForElement(element: string): Promise<void> {
        await this.fillSearchInput(element);
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