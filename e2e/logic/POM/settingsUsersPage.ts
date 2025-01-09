import { Locator } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";
import { waitForTimeOut } from '../../infra/utils'

export default class SettingsUsersPage extends BasePage {

    private get usersTabBtn(): Locator {
        return this.page.getByRole("button", { name: "Users" });
    }

    private get addUserButton(): Locator {
        return this.page.getByRole("button", { name: "Add User" });
    }

    private get submitUserAddition(): Locator {
        return this.page.getByRole("button", { name: "Submit" });
    }

    private get selectRoleBtn(): Locator {
        return this.page.locator("//div[@role='dialog']//button[span[text()='Select Role']]")
    }

    private get selectUserRoleInAddUser(): (role: string) => Locator {
        return (role: string) => this.page.locator(`//ul//div[@role='option'][span[contains(text(), '${role}')]]`)
    }

    private get userNameField(): Locator {
        return this.page.locator("//input[@id='Username']");
    }

    private get passwordField(): Locator {
        return this.page.locator("//input[@id='Password']");
    }

    private get confirmPasswordField(): Locator {
        return this.page.locator("//input[@id='Confirm Password']");
    }

    private get confirmUserDeleteMsg(): Locator {
        return this.page.getByRole("button", { name: "Continue" });
    }

    private get userRoleBtnInTable(): (selectedUser: string) => Locator {
        return (selectedUser: string) => this.page.locator(`//tbody/tr[@data-username='${selectedUser}']/td[3]/button`);
    }

    private get selectUserRoleDropDownInTable(): (role: number) => Locator {
        return (role: number) => this.page.locator(`//div[@role='menu']//div[@role='menuitem'][${role}]//button`);
    }

    private get userRoleContentInTable(): (selectedUser: string) => Locator {
        return (selectedUser: string) => this.page.locator(`//tbody/tr[@data-username='${selectedUser}']/td[3]/button/p`);
    }

    private get userCheckboxBtn(): (selectedUser: string) => Locator {
        return (selectedUser: string) => this.page.locator(`//tbody/tr[@data-username='${selectedUser}']/td[1]/button`);
    }

    private get findUserNameInTable(): (selectedUser: string) => Locator {
        return (selectedUser: string) => this.page.locator(`//tbody/tr[@data-username='${selectedUser}']/td[2]`)
    }

    private get hoverDeleteBtnPerUserInTable(): (selectedUser: string) => Locator {
        return (selectedUser: string) => this.page.locator(`//tbody/tr[@data-username='${selectedUser}']/td[4]/button`)
    }

    private get deleteUsersBtn(): Locator {
        return this.page.getByRole("button", { name: "Delete Users" })
    }

    private get selectRoleInTable(): (role: string) => Locator {
        return (role: string) => this.page.getByRole("button", { name: role })
    }

    async navigateToUserTab(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.usersTabBtn.click();
    }

    async verifyUserExists(selectedUser: string): Promise<boolean> {
        await this.page.waitForLoadState('networkidle');
        const isVisible = await this.findUserNameInTable(selectedUser).isVisible();
        return isVisible;
    }

    async addUser(userDetails: { [key: string]: string }): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.addUserButton.click();
        await this.userNameField.fill(userDetails.userName);
        await this.passwordField.fill(userDetails.password);
        await this.confirmPasswordField.fill(userDetails.confirmPassword);
        await this.selectRoleBtn.click();
        await this.selectUserRoleInAddUser(userDetails.role).click();
        await this.submitUserAddition.click();
        await waitForTimeOut(this.page, 1500)
    }

    async getUserRole(selectedUser: string): Promise<string | null> {
        await this.page.waitForLoadState('networkidle');
        const role = await this.userRoleContentInTable(selectedUser).textContent();
        return role;
    }

    async modifyUserRole(selectedUser: string, role: number): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.userRoleBtnInTable(selectedUser).click();
        await this.selectUserRoleDropDownInTable(role).click();
        await waitForTimeOut(this.page, 1500)
    }

    async modifyTwoUsersRolesByCheckbox(selectedUser1: string, selectedUser2: string, role: string): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.userCheckboxBtn(selectedUser1).click();
        await this.userCheckboxBtn(selectedUser2).click();
        await this.selectRoleBtn.click();
        await this.selectRoleInTable(role).click()
    }

    async deleteTwoUsersByCheckbox(selectedUser1: string, selectedUser2: string): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.userCheckboxBtn(selectedUser1).click()
        await this.userCheckboxBtn(selectedUser2).click()
        await this.deleteUsersBtn.click()
        await this.confirmUserDeleteMsg.click()
        await waitForTimeOut(this.page, 1500)
    }

    async attemptToAddUserWithoutRole(userDetails: { [key: string]: string }): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.addUserButton.click();
        await this.userNameField.fill(userDetails.userName);
        await this.passwordField.fill(userDetails.password);
        await this.confirmPasswordField.fill(userDetails.confirmPassword);
        await this.addUserButton.click();
    }

    async removeUserByCheckbox(selectedUser: string): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.userCheckboxBtn(selectedUser).click();
        await this.deleteUsersBtn.click();
        await this.confirmUserDeleteMsg.click();
    }

    async removeUserByHover(selectedUser: string): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.findUserNameInTable(selectedUser).hover();
        await this.hoverDeleteBtnPerUserInTable(selectedUser).click();
        await this.confirmUserDeleteMsg.click();
    }

}