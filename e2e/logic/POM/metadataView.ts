import GraphPage from "@/e2e/logic/POM/graphPage";
import { waitForElementToBeEnabled } from "@/e2e/infra/utils";
import { Locator } from "@playwright/test";

export default class MetadataView extends GraphPage {

    private get metadataViewTab(): Locator {
        return this.page.getByTestId("metadataTab");
    }

    public get profileButton(): Locator {
        return this.page.getByRole('button', { name: 'Profile', exact: true });
    }

    private get metadataViewTabPanel(): Locator {
        return this.page.getByRole('tabpanel', { name: 'Metadata', exact: true });
    }

    public get metadataLines(): Locator {
        return this.metadataViewTabPanel.getByTestId("metadataLines").getByRole('listitem');
    }

    public get profileTree(): Locator {
        return this.metadataViewTabPanel.getByTestId("profileTree");
    }

    public get profileReadOnlyNotice(): Locator {
        return this.metadataViewTabPanel.getByText('Only read-only Cypher is profiled.');
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