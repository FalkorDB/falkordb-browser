import { Locator, Page } from "@playwright/test";
import { BasePage } from "@/e2e/infra/ui/basePage";
import { waitForTimeOut } from "@/e2e/infra/utils";

export class graphPage extends BasePage {

    private get graphsMenu(): Locator {
        return this.page.getByRole("button", { name : "Select Graph"});
    }

    private get dropDownMenuGraphs(): Locator {
        return this.page.locator("//div[@role='menuitem']");
    }

    async countGraphsInMenu(): Promise<number> {
        await waitForTimeOut(this.page, 1000);
        await this.graphsMenu.click()
        return await this.dropDownMenuGraphs.count();
    }
  
}