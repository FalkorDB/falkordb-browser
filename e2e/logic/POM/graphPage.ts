import { Locator, Download } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";
import { waitForTimeOut } from "@/e2e/infra/utils";

export default class GraphPage extends BasePage {

    private get graphsMenu(): Locator {
        return this.page.getByRole("combobox");
    }

    private graphsMenuByName(graph: string): Locator {
        return this.page.getByRole("combobox", { name: `${graph}` });
    }

    private get dropDownMenuGraphs(): Locator {
        return this.page.locator("//div[@role='menuitem']");
    }

    private get manageGraphBtn(): Locator {
        return this.page.getByRole("button", { name: "Manage Graphs" })
    }

    private get threeDotsBtn(): Locator {
        return this.page.locator("(//button[p[text()='...']])[1]")
    }

    private get deleteGraphBtn(): Locator {
        return this.page.getByRole('button', { name: 'Delete' })
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
        return this.page.getByRole("button", { name: "Export Data" });
    }

    private get findGraphInMenu(): (graph: string) => Locator {
        return (graph: string) => this.page.locator(`//tbody//tr/td[1][contains(text(), '${graph}')]`);
    }

    private get deleteGraphInMenu(): (graph: string) => Locator {
        return (graph: string) => this.page.getByRole('row', { name: graph }).getByRole('checkbox')
    }

    private get deleteAllGraphInMenu(): Locator {
        return this.page.getByRole('row', { name: 'Name' }).getByRole('checkbox')
    }

    private get graphMenuElements(): Locator {
        return this.page.locator("//tbody/tr");
    }

    async countGraphsInMenu(): Promise<number> {
        await waitForTimeOut(this.page, 1000);
        if (await this.graphsMenu.isEnabled()) {
            await this.graphsMenu.click();
            await this.manageGraphBtn.click();
            const count = await this.graphMenuElements.count();
            await this.refreshPage();
            return count;
        }
        return 0;
    }

    async removeAllGraphs(): Promise<void> {
        await waitForTimeOut(this.page, 1000);
        await this.graphsMenu.click();
        await this.manageGraphBtn.click();
        await this.deleteAllGraphInMenu.click()
        await this.deleteGraphBtn.click()
        await this.confirmGraphDeleteBtn.click()
    }

    async addGraph(graphName: string): Promise<void> {
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

    async verifyGraphExists(graph: string): Promise<boolean> {
        await this.graphsMenu.click();
        await this.manageGraphBtn.click();
        const isVisible = await this.findGraphInMenu(graph).isVisible();
        return isVisible;
    }

    async verifyGraphExistsByName(graph: string): Promise<boolean> {
        await this.graphsMenuByName(graph).click();
        await this.manageGraphBtn.click();
        const isVisible = await this.findGraphInMenu(graph).isVisible();
        return isVisible;
    }

    async deleteGraph(graph: string): Promise<void> {
        await this.graphsMenuByName(graph).click();
        await this.manageGraphBtn.click();
        await this.deleteGraphInMenu(graph).click();
        await this.deleteGraphBtn.click();
        await this.confirmGraphDeleteBtn.click()
    }

    async dismissDialogAtStart(): Promise<void> {
        await this.dissmissDialogCheckbox.click();
        await this.page.mouse.click(10, 10);
    }
}