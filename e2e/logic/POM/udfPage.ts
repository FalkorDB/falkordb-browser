import { Download, Locator } from "playwright";
import { interactWhenVisible, waitForURL } from "@/e2e/infra/utils";
import urls from "../../config/urls.json";
import HeaderComponent from "./headerComponent";

export default class UdfPage extends HeaderComponent {
  private get udfNavButton(): Locator {
    return this.page.getByTestId("UdfButton");
  }

  private get loadTrigger(): Locator {
    return this.page.getByTestId("loadUdfTrigger");
  }

  private get loadDialog(): Locator {
    return this.page.getByRole("dialog");
  }

  private get nameInput(): Locator {
    return this.page.getByTestId("udfNameInput");
  }

  private get fileInput(): Locator {
    return this.loadDialog.locator('input[type="file"]');
  }

  private get loadButton(): Locator {
    return this.page.getByTestId("udfLoadButton");
  }

  private get libraryNames(): Locator {
    return this.page.getByTestId("udfLibraryName");
  }

  private get functionNames(): Locator {
    return this.page.getByTestId("udfFunctionName");
  }

  private get editor(): Locator {
    return this.page.getByTestId("udfEditor");
  }

  private get exportButton(): Locator {
    return this.page.getByRole("button", { name: "Export the selected UDF Library" });
  }

  public get errorToast(): Locator {
    return this.page.getByTestId("toast-destructive");
  }

  /** The server's own message; the toast only shows it after "See more". */
  public get errorToastDetails(): Locator {
    return this.errorToast.getByTestId("toast-raw-message");
  }

  private libraryByName(name: string): Locator {
    return this.libraryNames.filter({ hasText: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) });
  }

  /** Reaches /udf through the navbar, so the Functions entry itself is exercised. */
  async openUdfPage(): Promise<void> {
    // Without the File System Access API the export falls back to a browser download.
    await this.page.addInitScript(() => { Reflect.deleteProperty(window, "showSaveFilePicker"); });
    await this.page.goto(urls.graphUrl);
    await this.page.waitForLoadState("networkidle");
    await interactWhenVisible(this.udfNavButton, (el) => el.click(), "UDF Navbar Button", 500, 30);
    await waitForURL(this.page, urls.udfUrl);
  }

  /** Fills the Load Library dialog and submits it, without waiting for the outcome. */
  async submitLibrary(name: string, code: string): Promise<void> {
    await interactWhenVisible(this.loadTrigger, (el) => el.click(), "Load Library Trigger");
    await interactWhenVisible(this.nameInput, (el) => el.fill(name), "UDF Name Input");
    await this.fileInput.setInputFiles({
      name: `${name}.js`,
      mimeType: "application/javascript",
      buffer: Buffer.from(code),
    });
    // The button stays disabled until the file has been read, and click waits for it to enable.
    await this.loadButton.click();
  }

  /** Loads a library through the dialog and waits for it to close. */
  async loadLibrary(name: string, code: string): Promise<void> {
    await this.submitLibrary(name, code);
    await this.loadDialog.waitFor({ state: "hidden" });
  }

  async expandErrorDetails(): Promise<void> {
    await interactWhenVisible(this.errorToast.getByTestId("toast-see-more"), (el) => el.click(), "Toast See More");
  }

  async selectLibrary(name: string): Promise<void> {
    await interactWhenVisible(this.libraryByName(name), (el) => el.click(), `UDF Library ${name}`);
  }

  async getLibraryNames(): Promise<string[]> {
    return this.libraryNames.allTextContents();
  }

  /** Functions of the library that is currently expanded. */
  async getFunctionNames(): Promise<string[]> {
    return this.functionNames.allTextContents();
  }

  /** The text Monaco renders; its non-breaking spaces are turned back into plain ones. */
  async getEditorText(): Promise<string> {
    const text = await this.editor.locator(".view-lines").textContent();
    return (text ?? "").replace(/\u00a0/g, " ");
  }

  async exportSelected(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      interactWhenVisible(this.exportButton, (el) => el.click(), "UDF Export Button"),
    ]);
    return download;
  }
}
