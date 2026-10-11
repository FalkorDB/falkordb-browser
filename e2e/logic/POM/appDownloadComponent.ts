import { Locator } from "playwright";
import BasePage from "@/e2e/infra/ui/basePage";

/**
 * The "Get the app" popup (AppDownloadPrompt) and the matching link on the
 * login page and in the navigation menus (AppDownloadLink).
 */
export default class AppDownloadComponent extends BasePage {
    public get prompt(): Locator {
        return this.page.getByTestId("appDownloadPrompt");
    }

    public get promptTitle(): Locator {
        return this.prompt.getByRole("heading");
    }

    public get promptDownload(): Locator {
        return this.page.getByTestId("appDownloadPromptDownload");
    }

    /** The other build for the same OS, e.g. the Intel one next to Apple silicon. */
    public get promptAlternate(): Locator {
        return this.page.getByTestId("appDownloadPromptAlternate");
    }

    public get promptClose(): Locator {
        return this.page.getByTestId("appDownloadPromptClose");
    }

    public get promptDontShowAgain(): Locator {
        return this.page.getByTestId("appDownloadPromptDontShow");
    }

    /** The always-available link: login page footer, help menu, mobile drawer. */
    public get link(): Locator {
        return this.page.getByTestId("appDownload");
    }

    async dismiss(dontShowAgain = false): Promise<void> {
        if (dontShowAgain) await this.promptDontShowAgain.click();
        await this.promptClose.click();
    }
}
