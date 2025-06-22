import { Locator } from "@playwright/test";
import { interactWhenVisible, waitForURL } from "@/e2e/infra/utils";
import urls from '../../config/urls.json'
import HeaderComponent from "./headerComponent";

export default class LoginPage extends HeaderComponent {

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

    // TLS locators
    private get tlsCheckbox(): Locator {
        return this.page.getByTestId("tls-checkbox");
    }

    private get uploadCertificateInput(): Locator {
        return this.page.getByText("Upload Certificate");
    }

    private get certificateUploadedStatus(): Locator {
        return this.page.getByTestId("certificate-uploaded-status");
    }

    private get removeCertificateBtn(): Locator {
        return this.page.getByTestId("remove-certificate-btn");
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

    // TLS methods
    async clickEnableTLS(): Promise<void> {
        await interactWhenVisible(this.tlsCheckbox, el => el.click(), "TLS checkbox");
    }

    async isTLSEnabled(): Promise<boolean> {
        return await this.tlsCheckbox.getAttribute('data-state') === 'checked';
    }

    async clickUploadCA(): Promise<void> {
        await interactWhenVisible(this.uploadCertificateInput, el => el.click(), "upload certificate input");
    }

    async clickRemoveCertificateBtn(): Promise<void> {
        await interactWhenVisible(this.removeCertificateBtn, (el) => el.click(), "remove certificate button");
    }

    async isCertificateUploaded(): Promise<boolean> {
        try {
            // Wait for the certificate status to appear with a longer timeout
            await this.certificateUploadedStatus.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch (error) {
            console.log('Certificate uploaded status not visible within timeout');
            return false;
        }
    }

    async isCertificateRemoved(): Promise<boolean> {
        return await this.certificateUploadedStatus.isHidden();
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

    async uploadCertificate(filePath: string): Promise<void> {
        console.log(`Attempting to upload certificate from: ${filePath}`);
        
        // Check if file exists
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            throw new Error(`Certificate file does not exist: ${filePath}`);
        }
        console.log(`File exists at: ${filePath}`);
        
        // Wait for and handle file chooser
        const fileChooserPromise = this.page.waitForEvent('filechooser');
        console.log('Clicking upload certificate area...');
        await this.clickUploadCA();
        console.log('Waiting for file chooser...');
        const fileChooser = await fileChooserPromise;
        console.log('Setting file...');
        await fileChooser.setFiles(filePath);
        console.log('File set, waiting for upload to process...');
        
        // Wait longer for the upload to process and UI to update
        await this.page.waitForTimeout(2000);
        console.log(`Certificate upload completed for: ${filePath}`);
    }

    async waitForSuccessfulLogin(Url: string): Promise<void> {
        await this.page.waitForURL(Url, { timeout: 5000 });
    }
}