import BasePage from "@/e2e/infra/ui/basePage";
import { Locator } from "@playwright/test";

export default class PreferencesPage extends BasePage {

    private get preferencesView(): Locator {
        return this.page.getByRole('button', { name: 'Preferences' })
    }

    private get preferencesViewDialog(): Locator {
        return this.page.getByRole('dialog', { name: 'Labels Legend' })
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
        return this.page.getByRole('button', { name: 'Apply' })
    }

    private get getColors(): Locator {
        return this.page.getByRole('listitem')
    }

    private get closePreferencesBtn(): Locator {
        return this.page.getByRole('button', { name: "Close" })
    }

    private get deleteColorBtn(): Locator {
        return this.page.getByRole('button', { name: "Delete" });
    }

    private get editColorBtn(): Locator {
        return this.page.getByRole('button', { name: "Edit" });
    }

    async addColor(): Promise<void> {
        await this.preferencesView.click();
        await this.addColorBtn.click();
        await this.saveColorBtn.click();
        await this.applyColorBtn.click();
        await this.closePreferencesBtn.click();
    }

    async getColorsCount(): Promise<number> {
        await this.preferencesView.click();
        const count = await this.getColors.count();
        await this.closePreferencesBtn.click();
        return count;
    }

    async removeColor(): Promise<void> {
        await this.preferencesView.click();
        const color = this.getColors.last();
        await color.hover();
        await this.deleteColorBtn.click();
        await this.applyColorBtn.click();
        await this.closePreferencesBtn.click();
    }

    async getColor(): Promise<string | null> {
        await this.preferencesView.click();
        const color = this.getColors.last();
        const colorText = await color.textContent();
        await this.closePreferencesBtn.click();
        return colorText;
    }

    async modifyColor(): Promise<void> {
        await this.preferencesView.click();
        const color = this.getColors.last();
        await color.hover();
        await this.editColorBtn.click();
        await this.saveColorBtn.click();
        await this.applyColorBtn.click();
        await this.closePreferencesBtn.click();
    }

    async resetColors(): Promise<void> {
        await this.preferencesView.click();
        await this.resetColorsBtn.click();
        await this.closePreferencesBtn.click();
    }

    async openPreferencesView(): Promise<void> {
        await this.preferencesView.click();
    }

    async isPreferencesViewOpen(): Promise<boolean> {
        const isVisible = await this.preferencesViewDialog.isVisible();
        return isVisible;
    }
}