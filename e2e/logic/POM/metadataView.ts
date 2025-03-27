import GraphPage from "@/e2e/logic/POM/graphPage";
import { waitForElementToBeEnabled } from "@/e2e/infra/utils";
import { Locator } from "@playwright/test";

export default class MetadataView extends GraphPage {

    private get metadataViewTab(): Locator {
        return this.page.getByRole('tab', { name: 'Metadata' });
    }

    private get profileButton(): Locator {
        return this.page.getByRole('button', { name: 'Profile' });
    }

    private get metadataViewTabPanel(): Locator {
        return this.page.getByRole('tabpanel', { name: 'Metadata' });
    }

    public async clickProfileButton(): Promise<void> {
        await this.profileButton.click();
    }

    public async clickMetadataViewTab(): Promise<void> {
        await this.metadataViewTab.click();
    }
    
    public async GetIsMetadataViewTabEnabled(): Promise<boolean> {
        const isEnabled = await waitForElementToBeEnabled(this.metadataViewTab);
        return isEnabled;
    }
    
    public async GetIsMetadataViewTabSelected(): Promise<boolean> {
        await waitForElementToBeEnabled(this.metadataViewTab);
        const isSelected = await this.metadataViewTabPanel.getAttribute('data-state') === 'active';
        return isSelected;
    }
}