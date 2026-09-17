import { expect, Locator } from "@playwright/test";
import GraphPage from "./graphPage";

/**
 * Page object for the mobile (< 1100px) layout of /graph.
 *
 * The mobile tree is a restructure, not a reflow: the tab strip collapses into a
 * dropdown portalled beside the hamburger, the side panels become bottom sheets,
 * and the secondary toolbar buttons move behind an overflow menu. The stable
 * test ids are shared with the desktop layout, so only the *paths* to them
 * differ — which is exactly what this class encapsulates.
 */
export default class MobileGraphPage extends GraphPage {
  public get navToggle(): Locator {
    return this.page.getByTestId("mobileNavToggle");
  }

  public get headerDetails(): Locator {
    return this.page.getByTestId("headerDetails");
  }

  public get tabsMenuTrigger(): Locator {
    return this.page.getByTestId("graphTabsMenu");
  }

  public get graphInfoSheet(): Locator {
    return this.page.getByTestId("mobileGraphInfoSheet");
  }

  public get dataSheet(): Locator {
    return this.page.getByTestId("mobileDataSheet");
  }

  public get chatSheet(): Locator {
    return this.page.getByTestId("mobileChatSheet");
  }

  public get chatToggle(): Locator {
    return this.page.getByTestId("chatToggleButton");
  }

  public get canvasToolsToggle(): Locator {
    return this.page.getByTestId("canvasToolsToggle");
  }

  public get aboutButton(): Locator {
    return this.page.getByTestId("mobileAboutButton");
  }

  public get aboutPanel(): Locator {
    return this.page.getByTestId("mobileAboutPanel");
  }

  public get canvasToolsSheet(): Locator {
    return this.page.getByTestId("canvasToolsSheet");
  }

  public get canvasToolsSheetClose(): Locator {
    return this.page.getByTestId("canvasToolsSheetClose");
  }

  public get dataPanel(): Locator {
    return this.page.getByTestId("DataPanel");
  }

  public get multiSelectBar(): Locator {
    return this.page.getByTestId("multiSelectBar");
  }

  public get multiSelectCount(): Locator {
    return this.page.getByTestId("multiSelectCount");
  }

  public get multiSelectDone(): Locator {
    return this.page.getByTestId("multiSelectDone");
  }

  /**
   * Presses and holds on the canvas — the gesture that turns multi select on.
   * Playwright's touchscreen only taps, so the hold is driven over CDP; a mouse
   * press would not do, the gesture ignoring pointers that have a Ctrl key.
   */
  async longPressCanvas(x: number, y: number): Promise<void> {
    const cdp = await this.page.context().newCDPSession(this.page);
    try {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
      });
      await this.page.waitForTimeout(800);
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
    } finally {
      await cdp.detach();
    }
    await this.page.waitForTimeout(400);
  }

  public get editorMore(): Locator {
    return this.page.getByTestId("editorMore");
  }

  public get tooltip(): Locator {
    return this.page.getByRole("tooltip");
  }

  /** Press and hold an element — touch's stand-in for hovering a tooltip. */
  async longPressElement(locator: Locator): Promise<void> {
    const box = await locator.boundingBox();
    if (!box) throw new Error("the element has no box to press");
    await this.longPressCanvas(box.x + box.width / 2, box.y + box.height / 2);
  }

  public get layoutMenu(): Locator {
    return this.page.getByTestId("layoutDropdownContent");
  }

  public get selectorResultStats(): Locator {
    return this.page.getByTestId("selectorResultStats");
  }

  /** Named `infoToggle` because `graphInfoToggle` is private on the desktop page object. */
  public get infoToggle(): Locator {
    return this.page.getByTestId("graphInfoToggle");
  }

  /** The nav row's overflow menu: upload, query history and the canvas tips. */
  public get selectorMore(): Locator {
    return this.page.getByTestId("selectorMore");
  }

  public get uploadTrigger(): Locator {
    return this.page.getByTestId("uploadGraphToolbarTrigger");
  }

  public get queryHistoryTrigger(): Locator {
    return this.page.getByTestId("queryHistory");
  }

  public get graphsCountValue(): Locator {
    return this.page.getByTestId("graphsCountValue");
  }

  public get navGraphsButton(): Locator {
    return this.page.getByTestId("GraphsButton");
  }

  public get navSettingsButton(): Locator {
    return this.page.getByTestId("settings");
  }

  /** The popover panel holding the tab rows. Only present while the menu is open. */
  public get tabsMenu(): Locator {
    return this.page.getByTestId("graphTabsMenuContent");
  }

  async openTabsMenu(): Promise<void> {
    if (await this.tabsMenu.isVisible()) return;
    await this.tabsMenuTrigger.click();
    await this.tabsMenu.waitFor({ state: "visible" });
  }

  /** Label shown on the collapsed trigger — the active tab's name. */
  async getActiveTabLabel(): Promise<string> {
    return (await this.tabsMenuTrigger.innerText()).split("\n")[0].trim();
  }

  async getMenuTabLabels(): Promise<string[]> {
    await this.openTabsMenu();
    return this.tabsMenu.locator('[data-testid^="graphTabSelect-"]').allInnerTexts();
  }

  async addTabFromMenu(): Promise<void> {
    await this.openTabsMenu();
    await this.page.getByTestId("graphTabAdd").click();
  }

  /**
   * New tabs are all called "New tab" until renamed, so the label is not unique.
   * Acting on the first match matches what a user would do from the top of the list.
   */
  private tabRow(label: string): Locator {
    return this.tabsMenu
      .locator(`[data-tab-label=${JSON.stringify(label)}]`)
      .first();
  }

  async selectTabFromMenu(label: string): Promise<void> {
    await this.openTabsMenu();
    await this.tabRow(label)
      .locator('[data-testid^="graphTabSelect-"]')
      .click();
  }

  /** Rename happens in place, inside the menu row. */
  async renameTabFromMenu(label: string, name: string): Promise<void> {
    await this.openTabsMenu();
    await this.renameFromRow(
      this.tabRow(label),
      name
    );
  }

  /** Untitled tabs share a label, so this targets the one marked active. */
  async renameActiveTabFromMenu(name: string): Promise<void> {
    await this.openTabsMenu();
    await this.renameFromRow(
      this.tabsMenu.locator('[data-active="true"]').first(),
      name
    );
  }

  private async renameFromRow(row: Locator, name: string): Promise<void> {
    await row.locator('[data-testid^="graphTabRenameTrigger-"]').click();

    const input = row.locator('[data-testid^="graphTabRename-"]');
    await input.waitFor({ state: "visible" });
    await input.fill(name);
    await input.press("Enter");
  }

  async openGraphInfoSheet(): Promise<void> {
    if (await this.isSheetOpen(this.graphInfoSheet)) return;
    await this.infoToggle.click();
    await expect
      .poll(() => this.isSheetOpen(this.graphInfoSheet))
      .toBe(true);
  }

  /**
   * The graph picker lives inside the info panel, which on mobile is a sheet
   * rather than a docked panel, so it has to be opened before the inherited
   * desktop flow can reach `selectGraph`.
   */
  async selectGraphByName(graphName: string): Promise<void> {
    await this.openGraphInfoSheet();
    await super.selectGraphByName(graphName);
    // The picker's popover can outlive the selection, and while it is up it
    // covers the toolbar and swallows clicks meant for the sheet behind it.
    await this.page.keyboard.press("Escape");
    await this.page
      .locator("[data-radix-popper-content-wrapper]")
      .waitFor({ state: "detached" });
  }

  /** The toggle is a toggle: the same button closes the sheet. */
  async closeGraphInfoSheet(): Promise<void> {
    await this.infoToggle.click();
  }

  /** Closes a tab from the dropdown. */
  async closeTabFromMenu(label: string): Promise<void> {
    await this.openTabsMenu();
    await this.tabRow(label)
      .locator('[data-testid^="graphTabClose-"]')
      .click();
  }

  /**
   * A sheet is always in the DOM — closing only translates it out of the host
   * region, which is what keeps its state alive. So "open" is a state attribute,
   * not presence.
   */
  async isSheetOpen(sheet: Locator): Promise<boolean> {
    return (await sheet.getAttribute("data-state")) === "open";
  }

  /** Where a sheet sits in the stack — the newest one opened is the highest. */
  async sheetZIndex(sheet: Locator): Promise<number> {
    return Number(await sheet.evaluate(el => getComputedStyle(el).zIndex));
  }
}
