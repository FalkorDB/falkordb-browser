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

    private get manageGraphBtn(): Locator {
        return this.page.locator("//button[p[contains(text(), 'Manage Graphs')]]")
    }

    private get threeDotsBtn(): Locator {
        return this.page.locator("(//button[p[text()='...']])[1]")
    }

    private get deleteIconSvg(): Locator {
        return this.page.locator("//div[@role='menuitem'][2]//button")
    }

    private get confirmGraphDeleteBtn(): Locator {
        return this.page.locator("//button[contains(text(), 'Continue')]")
    }

    private get addGraphBtnInNavBar(): Locator {
        return this.page.getByRole("button", { name : "New Graph"});
    }

    private get graphNameInput(): Locator {
        return this.page.locator("//div/p[contains(text(), 'Name')]/following-sibling::input");
    }

    private get createGraphBtn(): Locator {
        return this.page.getByRole("button", { name : "Create"});
    }


    async countGraphsInMenu(): Promise<number> {
        await waitForTimeOut(this.page, 1000);
        await this.graphsMenu.click()
        return await this.dropDownMenuGraphs.count() - 1;
    }
    
    async removeGraph(): Promise<void> {
        await this.threeDotsBtn.click()
        await this.deleteIconSvg.click()
        await this.confirmGraphDeleteBtn.click()
    }

    async removeAllGraphs(): Promise<void> {
        await waitForTimeOut(this.page, 1000);
        const graphCount = await this.countGraphsInMenu();
        
        await this.manageGraphBtn.click()
        for(let i = graphCount; i >= 1; i--){
            await this.removeGraph();
        }
    }

    async addGraph(graphName : string): Promise<void>{
        await this.addGraphBtnInNavBar.click()
        await this.graphNameInput.fill(graphName);
        await this.createGraphBtn.click()
    }
}