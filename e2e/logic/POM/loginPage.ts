import { Locator } from "@playwright/test";
import {
  interactWhenVisible,
  waitForElementToBeVisible,
  waitForElementToNotBeVisible,
  waitForURL,
} from "@/e2e/infra/utils";
import { existsSync } from "fs";
import { basename } from "path";
import urls from "../../config/urls.json";
import HeaderComponent from "./headerComponent";

// A certificate on disk, or one built in memory for tests that only need the bytes.
type CertificateFile = string | { name: string; contents: string };

export default class LoginPage extends HeaderComponent {
  private get connectBtn(): Locator {
    return this.page.getByRole("button", { name: "Log in" });
  }

  public get logInButton(): Locator {
    return this.connectBtn;
  }

  public get hostField(): Locator {
    return this.hostInput;
  }

  public get portField(): Locator {
    return this.portInput;
  }

  public get usernameField(): Locator {
    return this.usernameInput;
  }

  public get passwordField(): Locator {
    return this.passwordInput;
  }

  public get falkordbUrlField(): Locator {
    return this.falkordbUrlInput;
  }

  public get tlsToggle(): Locator {
    return this.tlsCheckbox;
  }

  // Preconfigured connection markers.
  public get autoConnecting(): Locator {
    return this.page.getByTestId("loginAutoConnecting");
  }

  public get autoConnectError(): Locator {
    return this.page.getByTestId("loginAutoConnectError");
  }

  public get preconfiguredError(): Locator {
    return this.page.getByTestId("loginPreconfiguredError");
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

  private get skipTutorial(): Locator {
    return this.page.getByTestId("skipTutorial");
  }

  private get tutorialSpotlight(): Locator {
    return this.page.getByTestId("tutorialSpotlight");
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

  private get uploadClientCertInput(): Locator {
    return this.page.getByText("Upload Client Certificate");
  }

  private get clientCertUploadedStatus(): Locator {
    return this.page.getByTestId("client-cert-uploaded-status");
  }

  private get uploadClientKeyInput(): Locator {
    return this.page.getByText("Upload Client Key");
  }

  private get clientKeyUploadedStatus(): Locator {
    return this.page.getByTestId("client-key-uploaded-status");
  }

  private get removeClientCertBtn(): Locator {
    return this.page.getByTestId("remove-client-cert-btn");
  }

  private get removeClientKeyBtn(): Locator {
    return this.page.getByTestId("remove-client-key-btn");
  }

  // TLS upload markers.
  public get tlsSection(): Locator {
    return this.page.locator("#tls-section");
  }

  public get certificateDropzone(): Locator {
    return this.uploadCertificateInput;
  }

  public get certificateStatus(): Locator {
    return this.certificateUploadedStatus;
  }

  public get clientCertificateDropzone(): Locator {
    return this.uploadClientCertInput;
  }

  public get clientCertificateStatus(): Locator {
    return this.clientCertUploadedStatus;
  }

  public get clientKeyDropzone(): Locator {
    return this.uploadClientKeyInput;
  }

  public get clientKeyStatus(): Locator {
    return this.clientKeyUploadedStatus;
  }

  public get missingClientKeyError(): Locator {
    return this.page.getByText("Upload the client private key to use this client certificate.");
  }

  public get missingClientCertificateError(): Locator {
    return this.page.getByText("Upload the client certificate that matches this private key.");
  }

  public fileReadError(fileName: string): Locator {
    return this.page.getByText(`Could not read ${fileName}`, { exact: true });
  }

  // URL mode locators
  private get manualConfigRadio(): Locator {
    return this.page.getByRole("radio", { name: "Manual Configuration" });
  }

  private get urlModeRadio(): Locator {
    return this.page.getByRole("radio", { name: "FalkorDB URL" });
  }

  private get falkordbUrlInput(): Locator {
    return this.page.locator("//input[@id='FalkorDB URL']");
  }

  async openApiDocumentation(): Promise<string> {
    await interactWhenVisible(this.page.getByRole("link", { name: "API Documentation" }), (el) => el.click(), "API Documentation link");
    await this.page.waitForURL("**/docs");
    return new URL(this.page.url()).pathname;
  }

  async clickConnect(): Promise<void> {
    await interactWhenVisible(
      this.connectBtn,
      (el) => el.click(),
      "connect button"
    );
  }

  async fillUsername(username: string): Promise<void> {
    await interactWhenVisible(
      this.usernameInput,
      (el) => el.fill(username),
      "username input"
    );
  }

  async fillPassword(password: string): Promise<void> {
    await interactWhenVisible(
      this.passwordInput,
      (el) => el.fill(password),
      "password input"
    );
  }

  async fillHost(host: string): Promise<void> {
    await interactWhenVisible(
      this.hostInput,
      (el) => el.fill(host),
      "host input"
    );
  }

  async getHost(): Promise<string | null> {
    return interactWhenVisible(
      this.hostInput,
      (el) => el.inputValue(),
      "host input"
    );
  }

  async clickSkipTutorial(): Promise<void> {
    await interactWhenVisible(
      this.skipTutorial,
      (el) => el.click(),
      "skip tutorial"
    );
  }

  async fillPort(port: string): Promise<void> {
    await interactWhenVisible(
      this.portInput,
      (el) => el.fill(port),
      "port input"
    );
  }

  async fillFalkorDBUrl(falkordbUrl: string): Promise<void> {
    await interactWhenVisible(
      this.falkordbUrlInput,
      (el) => el.fill(falkordbUrl),
      "falkordb url input"
    );
  }

  async getPort(): Promise<string | null> {
    return interactWhenVisible(
      this.portInput,
      (el) => el.inputValue(),
      "port input"
    );
  }

  // TLS methods
  async clickEnableTLS(): Promise<void> {
    await interactWhenVisible(
      this.tlsCheckbox,
      (el) => el.click(),
      "TLS checkbox"
    );
  }

  async isTLSEnabled(): Promise<boolean> {
    return (await this.tlsCheckbox.getAttribute("data-state")) === "checked";
  }

  async isCertificateRemoved(): Promise<boolean> {
    return this.certificateUploadedStatus.isHidden();
  }

  async clickRemoveCertificateBtn(): Promise<void> {
    await interactWhenVisible(
      this.removeCertificateBtn,
      (el) => el.click(),
      "remove certificate button"
    );
  }

  async clickRemoveClientCertificateBtn(): Promise<void> {
    await interactWhenVisible(
      this.removeClientCertBtn,
      (el) => el.click(),
      "remove client certificate button"
    );
  }

  async clickRemoveClientKeyBtn(): Promise<void> {
    await interactWhenVisible(
      this.removeClientKeyBtn,
      (el) => el.click(),
      "remove client key button"
    );
  }

  // Makes the browser's next certificate read fail, as an unreadable file would.
  async failNextFileRead(): Promise<void> {
    await this.page.evaluate(() => {
      const original = FileReader.prototype.readAsDataURL;
      FileReader.prototype.readAsDataURL = function readOnce() {
        FileReader.prototype.readAsDataURL = original;
        this.dispatchEvent(new ProgressEvent("error"));
      };
    });
  }

  async isCertificateUploaded(): Promise<boolean> {
    return this.isUploaded(this.certificateUploadedStatus);
  }

  private async isUploaded(status: Locator): Promise<boolean> {
    try {
      await status.waitFor({
        state: "visible",
        timeout: 5000,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async handleSkipTutorial(): Promise<void> {
    const isVisible = await waitForElementToBeVisible(this.skipTutorial);
    if (!isVisible) return;
    await this.clickSkipTutorial();
    await waitForElementToNotBeVisible(this.tutorialSpotlight);
  }

  async clickOnConnect(): Promise<void> {
    await this.clickConnect();
    await waitForURL(this.page, urls.graphUrl);
  }

  async connectWithCredentials(
    username: string,
    password: string,
    host?: string,
    port?: string
  ): Promise<void> {
    if (host) {
      await this.fillHost(host);
    }
    if (port) {
      await this.fillPort(port);
    }
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickConnect();
  }

  async connectWithQueryParams(
    credentials: { username?: string; password?: string; host?: string; port?: string; tls?: boolean }
  ): Promise<void> {
    const params = new URLSearchParams();
    if (credentials.host) params.set("host", credentials.host);
    if (credentials.port) params.set("port", credentials.port);
    if (credentials.username) params.set("username", credentials.username);
    if (credentials.tls !== undefined) params.set("tls", String(credentials.tls));

    const loginUrlWithParams = `${urls.loginUrl}?${params.toString()}`;
    await this.page.goto(loginUrlWithParams);
    await this.page.waitForLoadState("domcontentloaded");

    if (credentials.password) {
      await this.fillPassword(credentials.password);
    }
    // Wait for the redirect: connecting only works if the URL prefilled the form.
    await this.clickOnConnect();
  }

  async uploadCertificate(file: CertificateFile): Promise<void> {
    await this.uploadThroughDropzone(
      file,
      this.uploadCertificateInput,
      this.certificateUploadedStatus
    );
  }

  async uploadClientCertificate(file: CertificateFile): Promise<void> {
    await this.uploadThroughDropzone(
      file,
      this.uploadClientCertInput,
      this.clientCertUploadedStatus
    );
  }

  async uploadClientKey(file: CertificateFile): Promise<void> {
    await this.uploadThroughDropzone(
      file,
      this.uploadClientKeyInput,
      this.clientKeyUploadedStatus
    );
  }

  async isClientCertificateUploaded(): Promise<boolean> {
    return this.isUploaded(this.clientCertUploadedStatus);
  }

  async isClientKeyUploaded(): Promise<boolean> {
    return this.isUploaded(this.clientKeyUploadedStatus);
  }

  private async uploadThroughDropzone(
    file: CertificateFile,
    trigger: Locator,
    status: Locator
  ): Promise<void> {
    if (typeof file === "string" && !existsSync(file)) {
      throw new Error(`Certificate file does not exist: ${file}`);
    }
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await interactWhenVisible(trigger, (el) => el.click(), "upload input");
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(typeof file === "string" ? file : {
      name: file.name,
      mimeType: "application/x-pem-file",
      buffer: Buffer.from(file.contents),
    });

    const fileName = typeof file === "string" ? basename(file) : file.name;
    try {
      await status.or(this.fileReadError(fileName)).waitFor({
        state: "visible",
        timeout: 10000,
      });
    } catch (error) {
      console.log(
        "Certificate upload status not visible, it might be already uploaded or the upload failed."
      );
    }
  }

  async waitForSuccessfulLogin(Url: string): Promise<void> {
    await this.page.waitForURL(Url, { timeout: 10000 });
    // Wait for the page to fully load after navigation
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForLoadState("networkidle");
  }

  // URL mode methods
  async clickUrlMode(): Promise<void> {
    await interactWhenVisible(
      this.urlModeRadio,
      (el) => el.click(),
      "URL mode radio button"
    );
  }

  async clickManualMode(): Promise<void> {
    await interactWhenVisible(
      this.manualConfigRadio,
      (el) => el.click(),
      "Manual mode radio button"
    );
  }

  async isUrlModeSelected(): Promise<boolean> {
    return (await this.urlModeRadio.getAttribute("data-state")) === "checked";
  }

  async isManualModeSelected(): Promise<boolean> {
    return (
      (await this.manualConfigRadio.getAttribute("data-state")) === "checked"
    );
  }

  private get errorMessage(): Locator {
    return this.page.locator("text=Invalid URL format");
  }

  private get credentialsError(): Locator {
    return this.page.locator("text=Invalid credentials");
  }

  public get credentialsErrorMessage(): Locator {
    return this.credentialsError;
  }

  async connectWithUrl(url: string): Promise<void> {
    await this.clickUrlMode();
    await this.fillFalkorDBUrl(url);
    await this.clickConnect();
  }

  async submitUrlWithoutWait(url: string): Promise<void> {
    await this.clickUrlMode();
    await this.fillFalkorDBUrl(url);
    await this.clickConnect();
  }

  async isFormatErrorVisible(): Promise<boolean> {
    try {
      await this.errorMessage.waitFor({ state: "visible", timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  async isCredentialsErrorVisible(): Promise<boolean> {
    try {
      await this.credentialsError.waitFor({ state: "visible", timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  async getErrorText(): Promise<string> {
    const errorEl = this.page.locator(".text-destructive").first();
    return (await errorEl.textContent()) ?? "";
  }
}
