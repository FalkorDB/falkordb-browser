import { Locator } from "playwright";
import BasePage from "../../infra/ui/basePage";
import { waitForTimeOut } from '../../infra/utils'
import user from '../../config/user.json'

export default class SettingsPage extends BasePage {

    private get usersTabBtn(): Locator {
        return this.page.getByRole("button", { name: "Users" });
    }

    private get usersTable(): Locator {
        return this.page.locator("//table[.//th[2][contains(text(),'USERNAME')]]/tbody/tr");
    }

    private get addUserButton(): Locator {
        return this.page.getByRole("button", { name: "Add User" });
    }

    private get userRoleBtnPopUp(): Locator {
        return this.page.getByRole("button", { name: "Select Role" });
    }

    private get selectUserRoleBtnPopUp(): Locator {
        return this.page.getByRole("button", { name: user.user1.role });
    }

    private get userNameField(): Locator {
        return this.page.locator("//p[contains(text(), 'Username')]/following-sibling::input");
    }

    private get passwordField(): Locator {
        return this.page.locator("//p[normalize-space(text()) = 'Password']/following::input[1]");
    }

    private get confirmPasswordField(): Locator {
        return this.page.locator("//p[contains(text(), 'Confirm Password')]/following-sibling::input");
    }

    private get addUserBtnPopUp(): Locator {
        return this.page.getByRole("button", { name: "Add User" });
    }

    private get secondUserInTable(): Locator {
        return this.page.locator("//tbody/tr[2]");
    }

    private get deleteSecondUserBtn(): Locator {
        return this.page.locator("//tbody/tr[2]/td[4]/button");
    }

    private get confirmSecondUserDeleteMsg(): Locator {
        return this.page.getByRole("button", { name: "Continue" });
    }

    private get secondUserRole(): Locator {
        return this.page.getByRole("button", { name: user.user1.role });
    }

    private get thirdRoleBtnSecondUser(): Locator {
        return this.page.locator("//div[@role='menu']//div[@role='menuitem'][3]//button");
    }

    private get newSecondUserRole(): Locator {
        return this.page.locator("//tbody/tr[2]/td[3]/button/p");
    }

    private get newThirdUserRole(): Locator {
        return this.page.locator("//tbody/tr[3]/td[3]/button/p");
    }

    private get secondCheckboxInUsersTable(): Locator {
        return this.page.locator("//tbody/tr[2]//button[@role='checkbox']")
    }

    private get thirdCheckboxInUsersTable(): Locator {
        return this.page.locator("//tbody/tr[3]//button[@role='checkbox']")
    }

    private get selectRoleBtn(): Locator {
        return this.page.getByRole("button", { name: "Select Role" })
    }

    private get DeleteUsersBtn(): Locator {
        return this.page.getByRole("button", { name: "Delete Users" })
    }

    private get selectReadOnlyRole(): Locator {
        return this.page.getByRole("button", { name: "Read-Only" })
    }
    
    private get configurationValueButton (): Locator {
        return this.page.locator(`tr[key="MAX_QUEUED_QUERIES"] button`)
    }
    
    private get configurationValueInput (): Locator {
        return this.page.locator(`tr[key="MAX_QUEUED_QUERIES"] input`)
    }

    async navigateToUserTab(): Promise<void> {
        await this.usersTabBtn.click();
    }

    async countUsersInTable(): Promise<number> {
        await waitForTimeOut(this.page, 1000);
        const count = await this.usersTable.count();
        return count;
    }

    async addOneUser(userDetails: { [key: string]: string }): Promise<void> {
        await this.addUserButton.click();
        await this.userRoleBtnPopUp.click();
        await this.selectUserRoleBtnPopUp.click();
        await this.userNameField.fill(userDetails.userName);
        await this.passwordField.fill(userDetails.password);
        await this.confirmPasswordField.fill(userDetails.confirmPassword);
        await this.addUserBtnPopUp.click();
    }

    async removeOneUser(): Promise<void> {
        await this.secondUserInTable.hover();
        await this.deleteSecondUserBtn.click();
        await this.confirmSecondUserDeleteMsg.click();
    }

    async getSecondNewUserRole(): Promise<string | null> {
        const content = await this.newSecondUserRole.textContent();
        return content;
    }

    async getThirdNewUserRole(): Promise<string | null> {
        const content = await this.newThirdUserRole.textContent();
        return content;
    }

    async modifyOneUserRole(): Promise<void> {
        await this.secondUserRole.click();
        await this.thirdRoleBtnSecondUser.click();
    }

    async modifyTwoUsersRolesByCheckbox(): Promise<void> {
        await this.secondCheckboxInUsersTable.click()
        await this.thirdCheckboxInUsersTable.click()
        await this.selectRoleBtn.click()
        await this.selectReadOnlyRole.click()
    }

    async deleteTwoUsersByCheckbox(): Promise<void> {
        await this.secondCheckboxInUsersTable.click()
        await this.thirdCheckboxInUsersTable.click()
        await this.DeleteUsersBtn.click()
        await this.confirmSecondUserDeleteMsg.click()
    }

    async deleteAllUsers(): Promise<void> {
        const userCount = await this.countUsersInTable();
        for (let i = userCount - 1; i >= 1; i -= 1) {
            // eslint-disable-next-line no-await-in-loop
            await this.removeOneUser();
        }
    }

    async setConfiguration(): Promise<string> {
        await this.configurationValueButton.click()
        const value = "10"
        await this.configurationValueInput.fill(value)
        await this.page.keyboard.press("Enter")
        return value
    }
    
    async getConfigurationValue(): Promise<string | null> {
        await this.refreshPage()
        const value = await this.configurationValueInput.getAttribute("value")
        return value
    }
}