import { Page } from "playwright";

export default class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async initPage() {
    await this.page.waitForLoadState();
  }

  getCurrentURL(): string {
    return this.page.url();
  }

  async refreshPage() {
    await this.page.reload({ waitUntil: "networkidle" });
  }

  async waitForPageIdle() {
    await this.page.waitForLoadState("networkidle");
  }

  async waitForResponse(url: string) {
    const response = await this.page.waitForResponse(url);
    return response;
  }

  async evaluate(expression: () => unknown) {
    return this.page.evaluate(expression);
  }
}
