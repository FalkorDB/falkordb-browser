import { Locator, Page } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";
import { waitForTimeOut } from '../../infra/utils'

export default class SettingsPage extends BasePage {

    private get usersTabBtn(): Locator {
        return this.page.getByRole("button", { name: "Users" });
    }

    private get addUserButton(): Locator {
        return this.page.getByRole("button", { name: "Add User" });
    }

    private get userRoleBtnPopUp(): Locator {
        return this.page.getByRole("button", { name: "Select Role" });
    }

    private get selectUserRoleBtnPopUp(): Locator {
        return this.page.getByRole("button", { name: "Read-Write" });
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

    private get confirmUserDeleteMsg(): Locator {
        return this.page.getByRole("button", { name: "Continue" });
    }

    private get currentUserRole(): (selectedUser: string) => Locator {
        return (selectedUser: string) => this.page.locator(`//tbody/tr[@data-username='${selectedUser}']/td[3]/button`);
    }

    private get selectUserRole(): (role : string) => Locator {
        return (role: string) => this.page.locator(`//div[@role='menu']//div[@role='menuitem'][${role}]//button`);
    }

    private get userRoleContent(): (selectedUser: string) => Locator {
        return (selectedUser: string) => this.page.locator(`//tbody/tr[@data-username='${selectedUser}']/td[3]/button/p`);
    }

    private get userCheckboxBtn(): (selectedUser: string) => Locator {
        return (selectedUser: string) => this.page.locator(`//tbody/tr[@data-username='${selectedUser}']/td[1]/button`);
    }

    private get findUserName() : (selectedUser : string) => Locator { 
        return (selectedUser : string) => this.page.locator(`//tbody/tr[@data-username='${selectedUser}']/td[2]`)
    }

    private get hoverDeleteBtn() : (selectedUser : string) => Locator {
        return (selectedUser : string) => this.page.locator(`//tbody/tr[@data-username='${selectedUser}']/td[4]/button`)
    }

    private get selectRoleBtn(): Locator {
        return this.page.getByRole("button", {name: "Select Role"})
    }

    private get deleteUsersBtn(): Locator {
        return this.page.getByRole("button", {name: "Delete Users"})
    }

    private get selectReadOnlyRole(): Locator {
        return this.page.getByRole("button", {name: "Read-Only"})
    }
    
    async navigateToUserTab(): Promise<void> {
        await this.usersTabBtn.click();
    }

    async verifyUserExists(selectedUser : string): Promise<Boolean>{
        await waitForTimeOut(this.page, 2000)// time for response
        return await this.findUserName(selectedUser).isVisible();
    }

    async addUser(userDetails: { [key: string]: string }): Promise<void> {
        await this.page.waitForLoadState('networkidle'); 
        await this.addUserButton.click();
        await this.userRoleBtnPopUp.click();
        await this.selectUserRoleBtnPopUp.click();
        await this.userNameField.fill(userDetails.userName);
        await this.passwordField.fill(userDetails.password);
        await this.confirmPasswordField.fill(userDetails.confirmPassword);
        await this.addUserBtnPopUp.click();
        await waitForTimeOut(this.page, 1500)
    }

    async getUserRole(selectedUser : string): Promise<string | null> {
        await this.page.waitForLoadState('networkidle'); 
        return await this.userRoleContent(selectedUser).textContent();
    }

    async modifyUserRole(selectedUser : string, role : string): Promise<void> {
        await this.page.waitForLoadState('networkidle'); 
        await this.currentUserRole(selectedUser).click();
        await this.selectUserRole(role).click();
        await waitForTimeOut(this.page, 1500)
    }

    async modifyTwoUsersRolesByCheckbox(selectedUser1 : string, selectedUser2 : string): Promise<void> {
        await this.page.waitForLoadState('networkidle'); 
        await this.userCheckboxBtn(selectedUser1).click()
        await this.userCheckboxBtn(selectedUser2).click();
        await this.selectRoleBtn.click()
        await this.selectReadOnlyRole.click()
    }

    async deleteTwoUsersByCheckbox(selectedUser1 : string, selectedUser2 : string): Promise<void> {
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
        await this.addUserBtnPopUp.click();
    }

    async removeUserByCheckbox(selectedUser : string): Promise<void>{
        await this.page.waitForLoadState('networkidle'); 
        await this.userCheckboxBtn(selectedUser).click();
        await this.deleteUsersBtn.click();
        await this.confirmUserDeleteMsg.click();
        await waitForTimeOut(this.page, 1500)
    }

    async removeUserByHover(selectedUser : string): Promise<void> {
        await this.page.waitForLoadState('networkidle'); 
        await this.findUserName(selectedUser).hover();
        await this.hoverDeleteBtn(selectedUser).click();
        await this.confirmUserDeleteMsg.click();
    }
    
}