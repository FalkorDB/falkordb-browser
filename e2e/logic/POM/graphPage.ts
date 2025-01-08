import { Locator, Download  } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";
import { waitForTimeOut } from "@/e2e/infra/utils";

export class graphPage extends BasePage {

    private get graphsMenu(): Locator {
        return this.page.locator("//button[@data-type='selectGraph']");
    }

    private graphsMenuByName(graph: string): Locator {
        return this.page.getByRole("button", { name : `${graph}`});
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
        return this.page.locator("//nav//button[@title='Create New Graph']");
    }

    private get graphNameInput(): Locator {
        return this.page.locator("//div[@role='dialog']//form//input");
    }

    private get createGraphBtn(): Locator {
        return this.page.locator("//div[@role='dialog']//form//button[@title='Create your Graph']");
    }

    private get dissmissDialogCheckbox(): Locator {
        return this.page.locator("//div[p[text()=\"Don't show this again\"]]//button");
    }

    private get exportDataBtn(): Locator {
        return this.page.getByRole("button", { name : "Export Data"});
    }

    private get findGraphInMenu(): (graph: string) => Locator {
        return (graph: string) => this.page.locator(`//tbody//tr/td[1][contains(text(), '${graph}')]`);
    }

    private get deleteGraphInMenu(): (graph: string) => Locator {
        return (graph: string) => this.page.locator(`//tbody//tr/td[1][contains(text(), '${graph}')]/parent::tr//td[3]/button`);
    }

    private get graphMenuElements(): Locator {
        return this.page.locator("//tbody/tr");
    }

    async countGraphsInMenu(): Promise<number> {
        await waitForTimeOut(this.page, 1000);
        await this.graphsMenu.click();
        await this.manageGraphBtn.click();
        const count = await this.graphMenuElements.count();
        await this.refreshPage();
        return count;
    }
    
    async removeGraph(): Promise<void> {
        await this.threeDotsBtn.click()
        await this.deleteIconSvg.click()
        await this.confirmGraphDeleteBtn.click()
    }

    async removeAllGraphs(): Promise<void> {
        await waitForTimeOut(this.page, 1000);
        const graphCount = await this.countGraphsInMenu();
        await this.graphsMenu.click();
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

    async clickOnExportDataBtn(): Promise<Download> {
        await this.page.waitForLoadState('networkidle'); 
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.exportDataBtn.click()
        ]);

        return download;
    }

    async verifyGraphExists(graph : string): Promise<Boolean>{
        await this.graphsMenu.click();
        await this.manageGraphBtn.click();
        return await this.findGraphInMenu(graph).isVisible();
    }

    async verifyGraphExistsByName(graph : string): Promise<Boolean>{
        await this.graphsMenuByName(graph).click();
        await this.manageGraphBtn.click();
        return await this.findGraphInMenu(graph).isVisible();
    }

    async deleteGraph(graph : string): Promise<void> {
        await this.graphsMenuByName(graph).click();
        await this.manageGraphBtn.click();
        await this.deleteGraphInMenu(graph).click();
        await this.deleteIconSvg.click()
        await this.confirmGraphDeleteBtn.click()
    }

    async dismissDialogAtStart(): Promise<void>{
        await this.dissmissDialogCheckbox.click();
        await this.page.mouse.click(10, 10);
    }
}