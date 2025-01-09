import { Locator } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";
import { waitForURL } from "@/e2e/infra/utils";
import urls from '../../config/urls.json'

export default class LoginPage extends BasePage {

    private get connectBtn(): Locator {
        return this.page.getByRole("button", { name: "Submit" });
    }

    private get usernameInput(): Locator {
        return this.page.locator("//input[@id='Username']");
    }

    private get passwordInput(): Locator {
        return this.page.locator("//input[@id='Password']");
    }

    async clickOnConnect(): Promise<void> {
        await this.connectBtn.click();
        await waitForURL(this.page, urls.graphUrl);
    }

    async connectWithCredentials(username: string, password: string): Promise<void> {
        await this.usernameInput.fill(username)
        await this.passwordInput.fill(password)
        await this.connectBtn.click();
        await waitForURL(this.page, urls.graphUrl);
    }

}