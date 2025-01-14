import { Locator, Download } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";
import { waitForTimeOut } from "@/e2e/infra/utils";

export default class GraphPage extends BasePage {

    private get graphsMenu(): Locator {
        return this.page.getByRole("combobox");
    }

    private get manageGraphBtn(): Locator {
        return this.page.getByRole("button", { name: "Manage Graphs" })
    }

    private get deleteGraphBtn(): Locator {
        return this.page.getByRole('button', { name: 'Delete' })
    }

    private get addGraphBtnInNavBar(): Locator {
        return this.page.getByText("Create New Graph");
    }

    private get graphNameInput(): Locator {
        return this.page.getByRole("textbox");
    }

    private get createGraphBtn(): Locator {
        return this.page.getByRole("button", { name: "Create your Graph" });
    }

    private get exportDataBtn(): Locator {
        return this.page.getByRole("button", { name: "Export Data" });
    }
    
    private get exportDataConfirmBtn(): Locator {
        return this.page.getByRole("button", { name: "Download" });
    }

    private get findGraphInMenu(): (graph: string) => Locator {
        return (graph: string) => this.page.getByRole('row', { name: graph, exact: true });
    }

    private get checkGraphInMenu(): (graph: string) => Locator {
        return (graph: string) => this.findGraphInMenu(graph).getByRole('checkbox')
    }

    private get deleteAllGraphInMenu(): Locator {
        return this.page.getByRole('row', { name: 'Name', exact: true }).getByRole('checkbox')
    }

    private get graphMenuElements(): Locator {
        return this.page.getByRole('row');
    }

    private get deleteGraphConfirmBtn(): Locator {
        return this.page.getByRole('button', { name: 'Delete Graph' })
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
        if (await this.graphsMenu.isEnabled()) {
            await this.graphsMenu.click();
            await this.manageGraphBtn.click();
            await this.deleteAllGraphInMenu.click()
            await this.deleteGraphBtn.click()
            await this.deleteGraphConfirmBtn.click();
        }
    }

    async addGraph(graphName: string): Promise<void> {
        await this.addGraphBtnInNavBar.click()
        await this.graphNameInput.fill(graphName);
        await this.createGraphBtn.click()
    }

    async exportGraph(): Promise<Download> {
        await this.page.waitForLoadState('networkidle');
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.exportDataBtn.click(),
            this.exportDataConfirmBtn.click()
        ]);

        return download;
    }

    async verifyGraphExists(graph: string): Promise<boolean> {
        if (await this.graphsMenu.isDisabled()) return false;
        
        await this.graphsMenu.click();
        await this.manageGraphBtn.click();
        const isVisible = await this.findGraphInMenu(graph).isVisible();
        
        return isVisible;
    }

    async deleteGraph(graph: string): Promise<void> {
        await this.graphsMenu.click();
        await this.manageGraphBtn.click();
        await this.checkGraphInMenu(graph).click();
        await this.deleteGraphBtn.click();
        await this.deleteGraphConfirmBtn.click();
    }

}