import { Locator } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";

export default class SettingsConfigPage extends BasePage {

    private get roleContentValue(): (role: string) => Locator {
        return (role: string) => this.page.locator(`//tbody/tr[@data-id='${role}']/td[3]/div/p`)
    }

    async getRoleContentValue(role: string): Promise<string | null> {
        const value = await this.roleContentValue(role).getAttribute('title')
        return value
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

    async modifyRoleValue(role: string, input: string): Promise<string | null> {
        await this.roleContentValue(role).hover();
        await this.EditRoleButton(role).click();
        await this.roleValueInput(role).fill(input);
        await this.confirmValueInputBtn(role).click();
        const value = await this.getRoleContentValue(role)
        return value
    }

    async clickOnToastCloseBtn(): Promise<void>{
        await this.toastCloseBtn.click();
    }

    async scrollToBottomInTable(): Promise<void> {
        await this.tableContent.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    }
}