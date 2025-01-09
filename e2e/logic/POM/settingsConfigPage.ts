import { Locator } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";

export default class SettingsConfigPage extends BasePage {

    private get roleContentValue(): (role: string) => Locator {
        return (role: string) => this.page.locator(`//tbody/tr[@data-id='${role}']/td/button`)
    }

    async getRoleContentValue(role: string): Promise<string | null> {
        const value = await this.roleContentValue(role).getAttribute('title')
        return value
    }

    private get clickOnRoleValue(): (role: string) => Locator {
        return (role: string) => this.page.locator(`//tbody//tr[@data-id='${role}']/td[3]/button`)
    }

    private get roleValueInput(): (role: string) => Locator {
        return (role: string) => this.page.locator(`//tbody//tr[@data-id='${role}']/td[3]/div/input`)
    }

    private get confirmValueInputBtn(): (role: string) => Locator {
        return (role: string) => this.page.locator(`//tbody//tr[@data-id='${role}']/td[3]/div/button[2]`)
    }

    private get getRoleValue(): (role: string) => Locator {
        return (role: string) => this.page.locator(`//tbody//tr[@data-id='${role}']/td[3]/button/p`)
    }

    async modifyRoleValue(role: string, input: string): Promise<string | null> {
        await this.clickOnRoleValue(role).click();
        await this.roleValueInput(role).fill(input);
        await this.confirmValueInputBtn(role).click();
        const value = await this.getRoleValue(role).getAttribute('title')
        return value
    }

}