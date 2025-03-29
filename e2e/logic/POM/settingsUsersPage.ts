import { Locator } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";
import { waitForElementToBeVisible, waitForTimeOut } from '../../infra/utils'

export default class SettingsUsersPage extends BasePage {

    private get usersTabBtn(): Locator {
        return this.page.getByRole("button", { name: "Users" });
    }

    private get addUserButton(): Locator {
        return this.page.locator("//button[contains(text(), 'Add User')]");
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
        return (selectedUser: string) => this.page.locator(`//tbody/tr[@data-id='${selectedUser}']/td[3]//button`).first();
    }

    private get selectUserRole(): (role: string) => Locator {
        return (role: string) => this.page.locator(`//ul//div[@role='option'][span[contains(text(), '${role}')]]`)
    }
    private get confirmModifyingUserRole(): Locator {
        return this.page.locator("//button[text()='Set User']");
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
        return this.page.locator("//button[contains(text(), 'Delete Users')]")
    }

    private get searchBtn(): Locator {
        return this.page.locator("//div[@id='tableComponent']/button");
    }

    private get searchInput(): Locator {
        return this.page.locator("//div[@id='tableComponent']/input");
    }

    private get tableRoles(): Locator {
        return this.page.locator("//table//tbody//tr");
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

    async clickOnAddUserBtn(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.addUserButton);
        if (!isVisible) throw new Error("add user button is not visible!");
        await this.addUserButton.click();
    }

    async fillUserNameField(userName: string): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.userNameField);
        if (!isVisible) throw new Error("user name input is not visible!");
        await this.userNameField.fill(userName);
    }

    async fillPasswordField(password: string): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.passwordField);
        if (!isVisible) throw new Error("password input is not visible!");
        await this.passwordField.fill(password);
    }

    async fillConfirmPasswordField(confirmPassword: string): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.passwordField);
        if (!isVisible) throw new Error("confirm password input is not visible!");
        await this.confirmPasswordField.fill(confirmPassword);
    }

    async clickOnSelectRoleBtnInAddUser(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.selectRoleBtnInAddUser);
        if (!isVisible) throw new Error("select role button is not visible!");
        await this.selectRoleBtnInAddUser.click();
    }

    async clickOnSelectUserRole(role: string): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.selectRoleBtnInAddUser);
        if (!isVisible) throw new Error("select role button is not visible!");
        await this.selectUserRole(role).click();
    }

    async clickOnSubmitUserAddition(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.submitUserAddition);
        if (!isVisible) throw new Error("submit user addition button is not visible!");
        await this.submitUserAddition.click();
    }

    async addUser(userDetails: { [key: string]: string }): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.clickOnAddUserBtn();
        await this.fillUserNameField(userDetails.userName);
        await this.fillPasswordField(userDetails.password);
        await this.fillConfirmPasswordField(userDetails.confirmPassword);
        if (userDetails.role) {
            await this.clickOnSelectRoleBtnInAddUser();
            await this.clickOnSelectUserRole(userDetails.role);
        }
        await this.clickOnSubmitUserAddition();
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
        await this.clickOnConfirmModifyingUserRole();
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

    async searchForElement(element: string):  Promise<void>{
        await this.searchBtn.click();
        await this.searchInput.fill(element);
        await this.page.keyboard.press('Enter');
    }

    async getTableRolesCount(): Promise<number>{
        await this.page.waitForTimeout(1000);
        const count = await this.tableRoles.count();
        return count;
    }

    async clickOnConfirmModifyingUserRole():  Promise<void>{
        await this.confirmModifyingUserRole.click();
    }
}