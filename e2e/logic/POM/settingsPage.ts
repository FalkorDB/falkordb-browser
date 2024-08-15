import { Locator, Page } from "@playwright/test";
import { waitForTimeOut } from '../../infra/utils'
import { BasePage } from "@/e2e/infra/ui/basePage";
import user from '../../config/user.json'

export class SettingsPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

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
        return this.page.getByRole("button", { name: "Select Role..." });
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
        return this.page.getByRole("button", {name: "Select Role..."})
    }

    private get DeleteUsersBtn(): Locator {
        return this.page.getByRole("button", {name: "Delete Users"})
    }

    async navigateToUserTab(): Promise<void> {
        await this.usersTabBtn.click();
    }

    async countUsersInTable(): Promise<number> {
        await waitForTimeOut(this.page, 1000);
        return await this.usersTable.count();
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
        return await this.newSecondUserRole.textContent();
    }

    async getThirdNewUserRole(): Promise<string | null> {
        return await this.newThirdUserRole.textContent();
    }

    async modifyOneUserRole(): Promise<void> {
        await this.secondUserRole.click();
        await this.thirdRoleBtnSecondUser.click();
    }

    async modifyTwoUsersRolesByCheckbox(): Promise<void> {
        await this.secondCheckboxInUsersTable.click()
        await this.thirdCheckboxInUsersTable.click()
        await this.selectRoleBtn.click()
    }

    async deleteTwoUsersByCheckbox(): Promise<void> {
        await this.secondCheckboxInUsersTable.click()
        await this.thirdCheckboxInUsersTable.click()
        await this.DeleteUsersBtn.click()
        await this.confirmSecondUserDeleteMsg.click()
    }

    async deleteAllUsers(): Promise<void> {
        const userCount = await this.countUsersInTable();
        for(let i = userCount - 1; i >= 1; i--){
            await this.removeOneUser()
        }
    }
}