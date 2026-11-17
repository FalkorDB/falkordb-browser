import { Locator } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";

export default class AppDownloadRemovalPage extends BasePage {
    public get prompt(): Locator {
        return this.page.getByTestId("appDownloadPrompt");
    }

    public get downloadLink(): Locator {
        return this.page.getByTestId("appDownload");
    }

    public get alternateDownloadLink(): Locator {
        return this.page.getByTestId("appDownloadAlternate");
    }

    public releaseLink(tag: string, name: string): Locator {
        return this.page.getByTestId(`releaseNotes-${tag}`).getByRole("link", { name });
    }
}
