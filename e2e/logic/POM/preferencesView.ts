import { waitForElementCount, waitForElementToBeVisible } from "@/e2e/infra/utils";
import { Locator } from "@playwright/test";
import GraphPage from "./graphPage";

export default class PreferencesPage extends GraphPage {

    private get openPreferencesViewBtn(): Locator {
        return this.page.getByRole('button', { name: 'Preferences' });
    }

    private get preferencesViewDialog(): Locator {
        return this.page.getByRole('dialog', { name: 'Labels Legend' });
    }

    private get addColorBtn(): Locator {
        return this.page.locator("//button[contains(text(), 'Add Color')]");
    }

    private get resetColorsBtn(): Locator {
        return this.page.locator("//button[contains(text(), 'Reset')]");
    }

    private get saveColorBtn(): Locator {
        return this.page.locator("//button[@aria-label='Save']");
    }

    private get applyColorBtn(): Locator {
        return this.page.getByRole('button', { name: 'Apply' });
    }

    private get getColors(): Locator {
        return this.page.getByRole('listitem');
    }

    private get closePreferencesBtn(): Locator {
        return this.page.getByRole('button', { name: "Close" });
    }

    private get deleteColorBtn(): Locator {
        return this.page.getByRole('button', { name: "Delete" });
    }

    private get editColorBtn(): Locator {
        return this.page.getByRole('button', { name: "Edit" });
    }

    async clickOnPreferencesBtn(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.openPreferencesViewBtn);
        if (!isVisible) throw new Error("preferences button is not visible!");
        await this.openPreferencesViewBtn.click();
    }

    async clickOnAddColorBtn(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.addColorBtn);
        if (!isVisible) throw new Error("add color button is not visible!");
        await this.addColorBtn.click();
    }

    async clickOnSaveColorBtn(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.saveColorBtn);
        if (!isVisible) throw new Error("save color button is not visible!");
        await this.saveColorBtn.click();
    }

    async clickOnApplyColorBtn(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.applyColorBtn);
        if (!isVisible) throw new Error("apply color button is not visible!");
        await this.applyColorBtn.click();
    }

    async clickOnClosePreferencesBtn(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.closePreferencesBtn);
        if (!isVisible) throw new Error("close preferences button is not visible!");
        await this.closePreferencesBtn.click();
    }

    async getColorsCount(): Promise<number>{
        await this.clickOnPreferencesBtn();
        const isVisible = await waitForElementCount(this.getColors);
        if (!isVisible) throw new Error("get color list is not visible!");
        const count = await this.getColors.count();
        await this.clickOnClosePreferencesBtn();
        return count;
    }

    async clickOnDeleteColorBtn(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.deleteColorBtn);
        if (!isVisible) throw new Error("delete color button is not visible!");
        await this.deleteColorBtn.click();
    }

    async clickOnEditColorBtn(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.editColorBtn);
        if (!isVisible) throw new Error("edit color button is not visible!");
        await this.editColorBtn.click();
    }

    async clickOnResetColorBtn(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.resetColorsBtn);
        if (!isVisible) throw new Error("reset color button is not visible!");
        await this.resetColorsBtn.click();
    }

    async addColor(): Promise<void> {
        await this.clickOnPreferencesBtn();
        await this.clickOnAddColorBtn();
        await this.clickOnSaveColorBtn();
        await this.clickOnApplyColorBtn();
        await this.clickOnClosePreferencesBtn();
    }

    async removeColor(): Promise<void> {
        await this.clickOnPreferencesBtn();
        await this.getColors.last().hover();
        await this.clickOnDeleteColorBtn();
        await this.clickOnApplyColorBtn();
        await this.clickOnClosePreferencesBtn();
    }

    async getColorText(): Promise<string | null> {
        await this.clickOnPreferencesBtn();
        const color = this.getColors.last();
        const colorText = await color.textContent();
        await this.clickOnClosePreferencesBtn();
        return colorText;
    }

    async modifyColor(): Promise<void> {
        await this.clickOnPreferencesBtn();
        await this.getColors.last().hover();
        await this.clickOnEditColorBtn();
        await this.clickOnSaveColorBtn();
        await this.clickOnApplyColorBtn();
        await this.clickOnClosePreferencesBtn();
    }

    async resetColors(): Promise<void> {
        await this.clickOnPreferencesBtn();
        await this.clickOnResetColorBtn();
        await this.clickOnClosePreferencesBtn();
    }

    async isPreferencesViewOpen(): Promise<boolean> {
        const isVisible = await this.preferencesViewDialog.isVisible();
        return isVisible;
    }
}