import { Locator, expect } from "@playwright/test";
import GraphPage from "./graphPage";

// Fix with AI and Optimize: the editor's AI query-assistance surfaces.
export default class AiAssistComponent extends GraphPage {
  public get fixWithAiButton(): Locator {
    return this.page.getByTestId("fix-with-ai");
  }

  public get fixCancelButton(): Locator {
    return this.page.getByTestId("aiFixCancel");
  }

  public get fixResultPanel(): Locator {
    return this.page.getByTestId("aiFixResultPanel");
  }

  public get fixQuery(): Locator {
    return this.page.getByTestId("aiFixQuery");
  }

  public get fixInsertButton(): Locator {
    return this.page.getByTestId("aiFixInsert");
  }

  public get fixResultCard(): Locator {
    return this.fixInsertButton.locator("xpath=ancestor::section");
  }

  public get optimizeButton(): Locator {
    return this.page.getByTestId("editorOptimize");
  }

  private get editorMoreButton(): Locator {
    return this.page.getByTestId("editorMore");
  }

  public get optimizeDialog(): Locator {
    return this.page.getByTestId("aiOptimizeContent");
  }

  public get optimizeGuidance(): Locator {
    return this.page.getByTestId("aiOptimizeGuidance");
  }

  public get optimizeDontAskAgain(): Locator {
    return this.page.getByTestId("aiOptimizeDontAskAgain");
  }

  public get optimizeAnalyzeButton(): Locator {
    return this.page.getByTestId("aiOptimizeConsentConfirm");
  }

  public get optimizeCancelButton(): Locator {
    return this.optimizeDialog.getByRole("button", { name: "Cancel", exact: true });
  }

  public get optimizeExplanation(): Locator {
    return this.page.getByTestId("aiOptimizeExplanation");
  }

  public get optimizeQuery(): Locator {
    return this.page.getByTestId("aiOptimizeQuery");
  }

  public get optimizeApplyButton(): Locator {
    return this.page.getByTestId("aiOptimizeApply");
  }

  public get optimizeCloseButton(): Locator {
    return this.page.getByTestId("closeAiOptimize");
  }

  public get settingsButton(): Locator {
    return this.page.getByRole("button", { name: "Adjust application settings", exact: true });
  }

  // Set by the spec's fetch wrapper once a /api/chat/fix response has been handled and painted.
  public get fixSettledMarker(): Locator {
    return this.page.locator("html");
  }

  async openOptimize(isMobile = false): Promise<void> {
    if (isMobile) await this.editorMoreButton.click();
    await this.optimizeButton.click();
  }

  async runInvalidQuery(query: string): Promise<void> {
    await this.insertQuery(query);
    await expect.poll(() => this.hasEditorErrorMarker()).toBe(true);
    await this.clickRunQuery(false);
  }

  async runInvalidQueryAndRequestFix(query: string): Promise<void> {
    await this.runInvalidQuery(query);
    await this.fixWithAiButton.click();
  }
}
