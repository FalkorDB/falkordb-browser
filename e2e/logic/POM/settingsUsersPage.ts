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

    private get selectRoleBtnInAddUser(): Locator {
        return this.page.locator("//div[@role='dialog']//button[span[text()='Select Role']]")
    }

    private get userSelectRoleEditBtn(): (selectedUser: string) => Locator {
        return (selectedUser: string) => this.page.locator(`//tbody/tr[@data-id='${selectedUser}']/td[3]//button`)
    }

    private get userRow(): (selectedUser: string) => Locator {
        return (selectedUser: string) => this.page.locator(`//tbody/tr[@data-id='${selectedUser}']`)
    }
    
    private get userSelectRoleBtn(): (selectedUser: string) => Locator {
        return (selectedUser: string) => this.page.locator(`//tbody/tr[@data-id='${selectedUser}']/td[3]/button`)
    }

    private get selectUserRole(): (role: string) => Locator {
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

    private get userRoleContent(): (selectedUser: string) => Locator {
        return (selectedUser: string) => this.page.locator(`//tbody/tr[@data-id='${selectedUser}']/td[3]/div/p`);
    }

    private get userCheckboxBtn(): (selectedUser: string) => Locator {
        return (selectedUser: string) => this.page.locator(`//tbody/tr[@data-id='${selectedUser}']/td[1]/button`);
    }

    private get findUserNameInTable(): (selectedUser: string) => Locator {
        return (selectedUser: string) => this.page.locator(`//tbody/tr[@data-id='${selectedUser}']/td[2]`)
    }

    private get deleteUsersBtn(): Locator {
        return this.page.getByRole("button", { name: "Delete Users" })
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
        if (userDetails.role) {
            await this.selectRoleBtnInAddUser.click();
            await this.selectUserRole(userDetails.role).click();
        }
        await this.submitUserAddition.click();
        await waitForTimeOut(this.page, 1500)
    }

    async getUserRole(selectedUser: string): Promise<string | null> {
        await this.page.waitForLoadState('networkidle');
        const role = await this.userRoleContent(selectedUser).textContent();
        return role;
    }

    async modifyUserRole(selectedUser: string, role: string): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.userRow(selectedUser).hover();
        await this.userSelectRoleEditBtn(selectedUser).waitFor({ state: "visible" });
        await this.userSelectRoleEditBtn(selectedUser).click();
        await this.userSelectRoleBtn(selectedUser).click();
        await this.selectUserRole(role).click();
        await waitForTimeOut(this.page, 1500)
    }

    async deleteTwoUsers(selectedUser1: string, selectedUser2: string): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.userCheckboxBtn(selectedUser1).click()
        await this.userCheckboxBtn(selectedUser2).click()
        await this.deleteUsersBtn.click()
        await this.confirmUserDeleteMsg.click()
        await waitForTimeOut(this.page, 1500)
    }

    async removeUser(selectedUser: string): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.userCheckboxBtn(selectedUser).click();
        await this.deleteUsersBtn.click();
        await this.confirmUserDeleteMsg.click();
    }
}