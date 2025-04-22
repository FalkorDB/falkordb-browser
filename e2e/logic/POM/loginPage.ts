import { Locator } from "@playwright/test";
import { interactWhenVisible, waitForURL } from "@/e2e/infra/utils";
import urls from '../../config/urls.json'
import NavBarComponent from "./navBarComponent";

export default class LoginPage extends NavBarComponent {

    private get connectBtn(): Locator {
        return this.page.getByRole("button", { name: "Log in" });
    }

    private get usernameInput(): Locator {
        return this.page.locator("//input[@id='Username']");
    }

    private get passwordInput(): Locator {
        return this.page.locator("//input[@id='Password']");
    }

    private get hostInput(): Locator {
        return this.page.locator("//input[@id='Host']");
    }

    private get portInput(): Locator {
        return this.page.locator("//input[@id='Port']");
    }

    private get dissmissDialogCheckbox(): Locator {
        return this.page.locator("//div[p[text()=\"Don't show this again\"]]//button");
    }

    async clickConnect(): Promise<void> {
        await interactWhenVisible(this.connectBtn, el => el.click(), "connect button");
    }

    async fillUsername(username: string): Promise<void> {
        await interactWhenVisible(this.usernameInput, el => el.fill(username), "username input");
    }

    async fillPassword(password: string): Promise<void> {
        await interactWhenVisible(this.passwordInput, el => el.fill(password), "password input");
    }

    async fillHost(host: string): Promise<void> {
        await interactWhenVisible(this.hostInput, el => el.fill(host), "host input");
    }

    async fillPort(port: string): Promise<void> {
        await interactWhenVisible(this.portInput, el => el.fill(port), "port input");
    }

    async disableTutorial(): Promise<void> {
        await interactWhenVisible(this.dissmissDialogCheckbox, el => el.click(), "disable tutorial");
    }

    async clickOnConnect(): Promise<void> {
        await this.clickConnect();
        await waitForURL(this.page, urls.graphUrl);
    }

    async connectWithCredentials(username: string, password: string, host?: string, port?: string): Promise<void> {
        if(host){ await this.fillHost(host) }
        if(port){ await this.fillPort(port) }
        await this.fillUsername(username)
        await this.fillPassword(password)
        await this.clickConnect();
    }

    async dismissDialogAtStart(): Promise<void>{
        await this.disableTutorial();
        await this.page.mouse.click(10, 10);
    }

}