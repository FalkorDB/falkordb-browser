import { interactWhenVisible, waitForElementToBeEnabled } from "@/e2e/infra/utils";
import { Locator } from "@playwright/test";
import GraphPage from "./graphPage";

export default class TableView extends GraphPage {

    private get tableViewTab(): Locator {
        return this.page.getByTestId("tableTab");
    }

    private get tableViewTabPanel(): Locator {
        return this.page.getByRole('tabpanel', { name: 'Table' });
    }

    private get tableViewTableRows(): Locator {
        return this.tableViewTabPanel.locator('tbody tr');
    }

    public async clickTableViewTab(): Promise<void> {
        await interactWhenVisible(this.tableViewTab, async (el: Locator) => {
            await el.click();
        }, 'Table View Tab');
    }

    public async GetIsTableViewTabEnabled(): Promise<boolean> {
        const isEnabled = await waitForElementToBeEnabled(this.tableViewTab);
        return isEnabled;
    }

    public async GetIsTableViewTabSelected(): Promise<boolean> {
        await waitForElementToBeEnabled(this.tableViewTab);
        const isSelected = await this.tableViewTabPanel.getAttribute('data-state') === 'active';
        return isSelected;
    }

    public async getRowsCount(): Promise<number> {
        await this.tableViewTabPanel.waitFor({ state: 'visible', timeout: 10000 });
        const rows = await this.tableViewTableRows.count();
        return rows;
    }
}