import { Locator } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";
import { interactWhenVisible, waitForTimeOut } from '../../infra/utils'

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

    private get undoBtnInNotification(): Locator {
        return this.page.locator('//ol//li//button[contains(text(), "Undo")]');
    }

    async navigateToUserTab(): Promise<void> {
        await this.waitForPageIdle();
        await this.clickUserTab();
    }

    async verifyUserExists(selectedUser: string): Promise<boolean> {
        await this.waitForPageIdle();
        const isVisible = await this.findUserNameInTable(selectedUser).isVisible();
        return isVisible;
    }

    async clickUserTab(): Promise<void>{
        await interactWhenVisible(this.usersTabBtn, el => el.click(), "user tab button");
    }

    async clickOnAddUserBtn(): Promise<void>{
        await interactWhenVisible(this.addUserButton, el => el.click(), "add user button");
    }

    async fillUserNameField(userName: string): Promise<void>{
        await interactWhenVisible(this.userNameField, el => el.fill(userName), "username input");
    }

    async fillPasswordField(password: string): Promise<void>{
        await interactWhenVisible(this.passwordField, el => el.fill(password), "password input");
    }

    async fillConfirmPasswordField(confirmPassword: string): Promise<void>{
        await interactWhenVisible(this.confirmPasswordField, el => el.fill(confirmPassword), "confirm password input");
    }

    async clickOnSelectRoleBtnInAddUser(): Promise<void>{
        await interactWhenVisible(this.selectRoleBtnInAddUser, el => el.click(), "select role button");
    }

    async clickOnSelectUserRole(role: string): Promise<void>{
        await interactWhenVisible(this.selectUserRole(role), el => el.click(), "select role button");
    }

    async clickOnSubmitUserAddition(): Promise<void>{
        await interactWhenVisible(this.submitUserAddition, el => el.click(), "submit user addition button");
    }

    async clickUndoBtnInNotification(): Promise<void> {
        await interactWhenVisible(this.undoBtnInNotification, el => el.click(), "undo button in notification");
    }

    async hoverUserRow(selectedUser: string): Promise<void> {
        await interactWhenVisible(this.userRow(selectedUser), el => el.hover(), "hover on user row");
    }

    async clickUserSelectRoleEditBtn(selectedUser: string): Promise<void> {
        await interactWhenVisible(this.userSelectRoleEditBtn(selectedUser), el => el.click(), "user select role edit button");
    }

    async clickUserSelectRoleBtn(selectedUser: string): Promise<void> {
        await interactWhenVisible(this.userSelectRoleBtn(selectedUser), el => el.click(), "user select first role button");
    }

    async clickUserCheckboxBtn(selectedUser: string): Promise<void> {
        await interactWhenVisible(this.userCheckboxBtn(selectedUser), el => el.click(), "user checkbox button");
    }

    async clickDeleteUsersBtn(): Promise<void> {
        await interactWhenVisible(this.deleteUsersBtn, el => el.click(), "delete user button");
    }

    async clickConfirmUserDeleteMsg(): Promise<void> {
        await interactWhenVisible(this.confirmUserDeleteMsg, el => el.click(), "confirm user delete button");
    }

    async clickOnConfirmModifyingUserRole():  Promise<void>{
        await interactWhenVisible(this.confirmModifyingUserRole, el => el.click(), "confirm modify user role button");
    }

    async clickSearchBtn(): Promise<void>{
        await interactWhenVisible(this.searchBtn, el => el.click(), "search button");
    }

    async fillSearchInput(input: string): Promise<void>{
        await interactWhenVisible(this.searchInput, el => el.fill(input), "search input button");
    }

    async addUser(userDetails: { [key: string]: string }): Promise<void> {
        await this.waitForPageIdle();
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
        await this.waitForPageIdle();
        await this.page.waitForTimeout(500);
        const role = await this.userRoleContent(selectedUser).textContent();
        return role;
    }

    async modifyUserRole(selectedUser: string, role: string): Promise<void> {
        await this.waitForPageIdle();
        await this.hoverUserRow(selectedUser);
        await this.clickUserSelectRoleEditBtn(selectedUser);
        await this.clickUserSelectRoleBtn(selectedUser);
        await this.clickOnSelectUserRole(role);
        await this.clickOnConfirmModifyingUserRole();
        await waitForTimeOut(this.page, 1500);
    }

    async deleteTwoUsers(selectedUser1: string, selectedUser2: string): Promise<void> {
        await this.waitForPageIdle();
        await this.clickUserCheckboxBtn(selectedUser1);
        await this.clickUserCheckboxBtn(selectedUser2);
        await this.clickDeleteUsersBtn();
        await this.clickConfirmUserDeleteMsg();
        await waitForTimeOut(this.page, 1500)
    }

    async removeUser(selectedUser: string): Promise<void> {
        await this.waitForPageIdle();
        await this.clickUserCheckboxBtn(selectedUser);
        await this.clickDeleteUsersBtn();
        await this.clickConfirmUserDeleteMsg();
    }

    async searchForElement(element: string):  Promise<void>{
        await this.clickSearchBtn();
        await this.fillSearchInput(element);
        await this.page.keyboard.press('Enter');
    }

    async getTableRolesCount(): Promise<number>{
        await this.page.waitForTimeout(1000);
        const count = await this.tableRoles.count();
        return count;
    }
}