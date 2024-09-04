import { Locator, Page } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";

export default class SettingsConfigPage extends BasePage {

    private get roleContentValue() : (role : string) => Locator {
        return (role : string) => this.page.locator(`//tbody/tr[@data-id='${role}']/td/button/p`)
    }

    async getRoleContentValue(role : string): Promise<string | null>{
        return await this.roleContentValue(role).textContent()
    }   
}