/* eslint-disable @typescript-eslint/no-explicit-any */
import HeaderComponent from "./headerComponent";
import { Locator } from "@playwright/test";
import { interactWhenVisible } from "@/e2e/infra/utils";

export default class SettingsTokensPage extends HeaderComponent {
  // Navigation
  private get tokensTab(): Locator {
    return this.page.getByRole("button", { name: "Tokens" });
  }

  // Generate Token Dialog
  private get generateTokenButton(): Locator {
    return this.page.getByRole("button", { name: "Generate new token" });
  }

  private get tokenNameInput(): Locator {
    return this.page.locator("#token-name");
  }

  private get expirationSelect(): Locator {
    return this.page.locator("#expiration");
  }

  private get generateTokenConfirmButton(): Locator {
    return this.page.getByRole("button", { name: "Generate token" });
  }

  private get cancelGenerateButton(): Locator {
    return this.page.getByRole("button", { name: "Cancel" });
  }

  // Token Display
  private get generatedTokenInput(): Locator {
    return this.page.locator('input[readonly]').first();
  }

  private get copyTokenButton(): Locator {
    return this.page.getByRole("button", { name: /Copy/i });
  }

  private get dismissTokenButton(): Locator {
    return this.page.getByRole("button", { name: /I've saved my token/i });
  }

  // Token List
  private get tokenTable(): Locator {
    return this.page.getByRole("table");
  }

  private get tableHeaders(): Locator {
    return this.page.getByRole("columnheader");
  }

  private tokenRowByName(name: string): Locator {
    return this.page.getByRole("row").filter({ hasText: name });
  }

  private revokeButtonByName(name: string): Locator {
    return this.tokenRowByName(name).getByRole("button");
  }

  // Revoke Dialog
  private get revokeConfirmButton(): Locator {
    return this.page.getByRole("button", { name: "Revoke token" });
  }

  private get cancelRevokeButton(): Locator {
    return this.page.getByRole("button", { name: "Cancel" });
  }

  // Toast notifications
  private get successToast(): Locator {
    return this.page.getByText(/success/i);
  }

  private get errorToast(): Locator {
    return this.page.getByText(/error/i);
  }

  // Helper methods
  async waitFor(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  getRowByText(text: string): Locator {
    return this.page.getByRole("row").filter({ hasText: text });
  }

  // Locator interaction methods
  async clickTokensTab(): Promise<void> {
    await interactWhenVisible(
      this.tokensTab,
      (el) => el.click(),
      "tokens tab"
    );
  }

  async clickGenerateTokenButton(): Promise<void> {
    await interactWhenVisible(
      this.generateTokenButton,
      (el) => el.click(),
      "generate token button"
    );
  }

  async fillTokenNameInput(name: string): Promise<void> {
    await interactWhenVisible(
      this.tokenNameInput,
      (el) => el.fill(name),
      "token name input"
    );
  }

  async clickExpirationSelect(): Promise<void> {
    await interactWhenVisible(
      this.expirationSelect,
      (el) => el.click(),
      "expiration select"
    );
  }

  async clickExpirationOption(expiration: string): Promise<void> {
    await interactWhenVisible(
      this.page.getByRole("option", { name: expiration }),
      (el) => el.click(),
      `expiration option ${expiration}`
    );
  }

  async clickGenerateTokenConfirmButton(): Promise<void> {
    await interactWhenVisible(
      this.generateTokenConfirmButton,
      (el) => el.click(),
      "generate token confirm button"
    );
  }

  async clickCancelGenerateButton(): Promise<void> {
    await interactWhenVisible(
      this.cancelGenerateButton,
      (el) => el.click(),
      "cancel generate button"
    );
  }

  async getGeneratedTokenInputValue(): Promise<string> {
    return await interactWhenVisible(
      this.generatedTokenInput,
      (el) => el.inputValue(),
      "generated token input"
    );
  }

  async clickCopyTokenButton(): Promise<void> {
    await interactWhenVisible(
      this.copyTokenButton,
      (el) => el.click(),
      "copy token button"
    );
  }

  async clickDismissTokenButton(): Promise<void> {
    await interactWhenVisible(
      this.dismissTokenButton,
      (el) => el.click(),
      "dismiss token button"
    );
  }

  async clickRevokeButtonByName(name: string): Promise<void> {
    await interactWhenVisible(
      this.revokeButtonByName(name),
      (el) => el.click(),
      `revoke button ${name}`
    );
  }

  async clickRevokeConfirmButton(): Promise<void> {
    await interactWhenVisible(
      this.revokeConfirmButton,
      (el) => el.click(),
      "revoke confirm button"
    );
  }

  async clickCancelRevokeButton(): Promise<void> {
    await interactWhenVisible(
      this.cancelRevokeButton,
      (el) => el.click(),
      "cancel revoke button"
    );
  }

  async isTokenRowVisible(name: string): Promise<boolean> {
    return await interactWhenVisible(
      this.tokenRowByName(name),
      (el) => el.isVisible(),
      `token row ${name}`
    );
  }

  async isSuccessToastVisible(): Promise<boolean> {
    return await interactWhenVisible(
      this.successToast,
      (el) => el.isVisible(),
      "success toast"
    );
  }

  async isErrorToastVisible(): Promise<boolean> {
    return await interactWhenVisible(
      this.errorToast,
      (el) => el.isVisible(),
      "error toast"
    );
  }

  // Actions
  async navigateToTokensTab(): Promise<void> {
    await this.clickTokensTab();
    await this.waitFor(500);
  }

  async clickGenerateToken(): Promise<void> {
    await this.clickGenerateTokenButton();
    await this.waitFor(300);
  }

  async fillTokenName(name: string): Promise<void> {
    await this.fillTokenNameInput(name);
  }

  async selectExpiration(expiration: "30d" | "60d" | "90d" | "never"): Promise<void> {
    await this.clickExpirationSelect();
    await this.waitFor(300);
    
    const expirationMap = {
      "30d": "30 days",
      "60d": "60 days",
      "90d": "90 days",
      "never": "No expiration"
    };
    
    await this.clickExpirationOption(expirationMap[expiration]);
  }

  async confirmGenerateToken(): Promise<void> {
    await this.clickGenerateTokenConfirmButton();
    await this.waitFor(1000);
  }

  async cancelGenerateToken(): Promise<void> {
    await this.clickCancelGenerateButton();
    await this.waitFor(300);
  }

  async generateToken(name: string, expiration: "30d" | "60d" | "90d" | "never" = "never"): Promise<string | null> {
    await this.clickGenerateToken();
    await this.fillTokenName(name);
    await this.selectExpiration(expiration);
    await this.confirmGenerateToken();
    
    // Wait for token to be generated and displayed
    await this.waitFor(1000);
    
    const token = await this.getGeneratedToken();
    return token;
  }

  async getGeneratedToken(): Promise<string | null> {
    try {
      return await this.getGeneratedTokenInputValue();
    } catch {
      return null;
    }
  }

  async copyToken(): Promise<void> {
    await this.clickCopyTokenButton();
    await this.waitFor(300);
  }

  async dismissTokenDisplay(): Promise<void> {
    await this.clickDismissTokenButton();
    await this.waitFor(300);
  }

  async verifyTokenExists(name: string): Promise<boolean> {
    try {
      await this.isTokenRowVisible(name);
      return true;
    } catch {
      return false;
    }
  }

  async getTokenCount(): Promise<number> {
    try {
      const rows = await this.page.getByRole("row").all();
      // Subtract 1 for header row
      return Math.max(0, rows.length - 1);
    } catch {
      return 0;
    }
  }

  async revokeToken(name: string): Promise<void> {
    await this.clickRevokeButtonByName(name);
    await this.waitFor(300);
    await this.clickRevokeConfirmButton();
    await this.waitFor(1000);
  }

  async cancelRevokeToken(): Promise<void> {
    await this.clickCancelRevokeButton();
    await this.waitFor(300);
  }

  async isGenerateButtonDisabled(): Promise<boolean> {
    return await this.generateTokenButton.isDisabled();
  }

  async waitForSuccessToast(): Promise<boolean> {
    try {
      await this.isSuccessToastVisible();
      return true;
    } catch {
      return false;
    }
  }

  async waitForErrorToast(): Promise<boolean> {
    try {
      await this.isErrorToastVisible();
      return true;
    } catch {
      return false;
    }
  }

  async getAllTokenNames(): Promise<string[]> {
    try {
      const rows = await this.page.getByRole("row").all();
      const names: string[] = [];
      
      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        const cells = await rows[i].getByRole("cell").all();
        if (cells.length > 0) {
          const name = await cells[0].textContent();
          if (name) names.push(name.trim());
        }
      }
      
      return names;
    } catch {
      return [];
    }
  }

  async getTokenDetails(name: string): Promise<{
    name: string;
    created: string | null;
    lastUsed: string | null;
    expires: string | null;
  } | null> {
    try {
      const row = this.tokenRowByName(name);
      await this.isTokenRowVisible(name);
      
      const cells = await row.getByRole("cell").all();
      
      return {
        name: await cells[0]?.textContent() || "",
        created: await cells[1]?.textContent() || null,
        lastUsed: await cells[2]?.textContent() || null,
        expires: await cells[3]?.textContent() || null,
      };
    } catch {
      return null;
    }
  }

  async getTableColumnHeaders(): Promise<string[]> {
    try {
      const headers = await this.tableHeaders.allTextContents();
      return headers.filter(h => h.trim().length > 0);
    } catch {
      return [];
    }
  }

  async hasColumnHeader(headerName: string): Promise<boolean> {
    const headers = await this.getTableColumnHeaders();
    return headers.some(h => h.toLowerCase().includes(headerName.toLowerCase()));
  }
}

