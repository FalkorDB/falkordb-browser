import { Locator } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";
import { interactWhenVisible, waitForElementToBeVisible, waitForTimeOut } from "../../infra/utils";

export default class SettingsUsersPage extends BasePage {
  private get usersTabBtn(): Locator {
    return this.page.getByRole("button", { name: "Users" });
  }

  private get addUserButton(): Locator {
    return this.page.locator("button#add-user");
  }

  private get editUserButton(): Locator {
    return this.page.locator("button#edit-user");
  }

  private get submitUserAddition(): Locator {
    return this.page.getByRole("button", { name: "Submit" });
  }

  private get submitEditUser(): Locator {
    return this.page.getByRole("button", { name: "Save", exact: true });
  }

  private get selectRoleBtn(): Locator {
    return this.page.getByTestId("selectRole");
  }

  private get userRow(): (selectedUser: string) => Locator {
    return (selectedUser: string) =>
      this.page.getByTestId(`tableRowUsers${selectedUser}`);
  }

  private get selectUserRole(): (role: string) => Locator {
    return (role: string) =>
      this.page.locator(
        `//ul//div[@role='option'][span[contains(text(), '${role}')]]`
      );
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

  private get editNewPasswordField(): Locator {
    return this.page.locator("//input[@id='New Password']");
  }

  private get editConfirmPasswordField(): Locator {
    return this.page.locator("//input[@id='Confirm Password']");
  }

  private get editSelectRoleBtn(): Locator {
    return this.page.getByTestId("selectRole");
  }

  private get editKeysField(): Locator {
    return this.page.locator("//input[@id='Key / Graph Permissions']");
  }

  private get confirmUserDeleteMsg(): Locator {
    return this.page.getByRole("button", { name: "Continue" });
  }

  private get userRoleContent(): (selectedUser: string) => Locator {
    return (selectedUser: string) =>
      this.page.getByTestId(`contentUsers${selectedUser}Role`);
  }

  private get userKeysContent(): (selectedUser: string) => Locator {
    return (selectedUser: string) =>
      this.page.getByTestId(`contentUsers${selectedUser}Key / Graph Permissions`);
  }

  private get userCheckboxBtn(): (selectedUser: string) => Locator {
    return (selectedUser: string) =>
      this.page.getByTestId(`tableCheckboxUsers${selectedUser}`);
  }

  private get findUserNameInTable(): (selectedUser: string) => Locator {
    return (selectedUser: string) =>
      this.page.getByTestId(`tableRowUsers${selectedUser}`);
  }

  private get deleteUsersBtn(): Locator {
    return this.page.locator("button#delete-user");
  }

  private get searchBtn(): Locator {
    return this.page.locator("//div[@id='tableComponent']/button");
  }

  private get searchInput(): Locator {
    return this.page.getByTestId('searchInputUsers');
  }

  private get tableRoles(): Locator {
    return this.page.locator("//table//tbody//tr");
  }

  private get fakeRow(): Locator {
    return this.page.locator("//table//tbody//tr[@class='fakeRow']");
  }

  async navigateToUserTab(): Promise<void> {
    await this.waitForPageIdle();
    await this.usersTabBtn.click();
  }

  async verifyUserExists(selectedUser: string): Promise<boolean> {
    await this.waitForPageIdle();
    await this.searchForElement(selectedUser);
    const isVisible = await waitForElementToBeVisible(this.findUserNameInTable(selectedUser));
    return isVisible;
  }

  async clickOnAddUserBtn(): Promise<void> {
    await interactWhenVisible(
      this.addUserButton,
      (el) => el.click(),
      "add user button"
    );
  }

  async fillUserNameField(userName: string): Promise<void> {
    await interactWhenVisible(
      this.userNameField,
      (el) => el.fill(userName),
      "user name input"
    );
  }

  async fillPasswordField(password: string): Promise<void> {
    await interactWhenVisible(
      this.passwordField,
      (el) => el.fill(password),
      "password input"
    );
  }

  async fillConfirmPasswordField(confirmPassword: string): Promise<void> {
    await interactWhenVisible(
      this.confirmPasswordField,
      (el) => el.fill(confirmPassword),
      "confirm password input"
    );
  }

  async clickOnSelectRoleBtnInAddUser(): Promise<void> {
    await interactWhenVisible(
      this.selectRoleBtn,
      (el) => el.click(),
      "select role button"
    );
  }

  async clickOnSelectUserRole(role: string): Promise<void> {
    await interactWhenVisible(
      this.selectUserRole(role),
      (el) => el.click(),
      `select user role: ${role}`
    );
  }

  async clickOnSubmitUserAddition(): Promise<void> {
    await interactWhenVisible(
      this.submitUserAddition,
      (el) => el.click(),
      "submit user addition button"
    );
  }

  async clickUserRow(selectedUser: string): Promise<void> {
    await interactWhenVisible(
      this.userRow(selectedUser),
      (el) => el.hover(),
      `user row ${selectedUser}`
    );
  }

  async clickDeleteUsersBtn(): Promise<void> {
    await interactWhenVisible(
      this.deleteUsersBtn,
      (el) => el.click(),
      "delete users button"
    );
  }

  async clickConfirmUserDeleteMsg(): Promise<void> {
    await interactWhenVisible(
      this.confirmUserDeleteMsg,
      (el) => el.click(),
      "confirm user delete message button"
    );
  }

  async clickUserCheckboxBtn(selectedUser: string): Promise<void> {
    await interactWhenVisible(
      this.userCheckboxBtn(selectedUser),
      (el) => el.click(),
      `checkbox button for ${selectedUser}`
    );
  }

  async fillSearchInput(value: string): Promise<void> {
    await interactWhenVisible(
      this.searchInput,
      (el) => el.fill(value),
      "search input"
    );
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
    await waitForTimeOut(this.page, 1500);
  }

  async getUserRole(selectedUser: string): Promise<string | null> {
    await this.waitForPageIdle();
    const role = await this.userRoleContent(selectedUser).textContent();
    return role;
  }

  async modifyUserRole(selectedUser: string, role: string): Promise<void> {
    await this.waitForPageIdle();
    await this.searchForElement(selectedUser);
    await this.clickUserCheckboxBtn(selectedUser);
    await this.clickOnEditUserBtn();
    await this.clickEditSelectRoleBtn();
    await this.clickOnSelectUserRole(role);
    await this.clickOnSubmitEditUser();
    await waitForTimeOut(this.page, 1500);
  }

  async editUser(selectedUser: string, options: { role?: string, keys?: string, password?: string, confirmPassword?: string }): Promise<void> {
    await this.waitForPageIdle();
    await this.searchForElement(selectedUser);
    await this.clickUserCheckboxBtn(selectedUser);
    await this.clickOnEditUserBtn();
    if (options.password) {
      await this.fillEditNewPasswordField(options.password);
      await this.fillEditConfirmPasswordField(options.confirmPassword || options.password);
    }
    if (options.role) {
      await this.clickEditSelectRoleBtn();
      await this.clickOnSelectUserRole(options.role);
    }
    if (options.keys !== undefined) {
      await this.fillEditKeysField(options.keys);
    }
    await this.clickOnSubmitEditUser();
    await waitForTimeOut(this.page, 1500);
  }

  async clickOnEditUserBtn(): Promise<void> {
    await interactWhenVisible(
      this.editUserButton,
      (el) => el.click(),
      "edit user button"
    );
  }

  async clickOnSubmitEditUser(): Promise<void> {
    await interactWhenVisible(
      this.submitEditUser,
      (el) => el.click(),
      "submit edit user button"
    );
  }

  async clickEditSelectRoleBtn(): Promise<void> {
    await interactWhenVisible(
      this.editSelectRoleBtn,
      (el) => el.click(),
      "edit select role button"
    );
  }

  async fillEditNewPasswordField(password: string): Promise<void> {
    await interactWhenVisible(
      this.editNewPasswordField,
      (el) => el.fill(password),
      "edit new password input"
    );
  }

  async fillEditConfirmPasswordField(confirmPassword: string): Promise<void> {
    await interactWhenVisible(
      this.editConfirmPasswordField,
      (el) => el.fill(confirmPassword),
      "edit confirm password input"
    );
  }

  async fillEditKeysField(keys: string): Promise<void> {
    // Remove all existing tags by clicking their remove buttons (scoped to tag input container)
    const keysContainer = this.editKeysField.locator('..');
    const removeButtons = keysContainer.locator("button[aria-label^='Remove ']");
    while (await removeButtons.count() > 0) {
      await removeButtons.first().click();
    }
    // Type the new key and press Enter to commit the tag
    await interactWhenVisible(
      this.editKeysField,
      async (el) => {
        await el.fill(keys);
        await el.press("Enter");
      },
      "edit keys input"
    );
  }

  async isEditUserButtonDisabled(): Promise<boolean> {
    await this.waitForPageIdle();
    const disabled = await this.editUserButton.isDisabled();
    return disabled;
  }

  async isDeleteUserButtonDisabled(): Promise<boolean> {
    await this.waitForPageIdle();
    const disabled = await this.deleteUsersBtn.isDisabled();
    return disabled;
  }

  async getUserKeys(selectedUser: string): Promise<string | null> {
    await this.waitForPageIdle();
    await this.searchForElement(selectedUser);
    const keys = await this.userKeysContent(selectedUser).textContent();
    return keys;
  }

  async deleteTwoUsers(
    selectedUser1: string,
    selectedUser2: string
  ): Promise<void> {
    await this.waitForPageIdle();
    await this.clickUserCheckboxBtn(selectedUser1);
    await this.clickUserCheckboxBtn(selectedUser2);
    await this.clickDeleteUsersBtn();
    await this.clickConfirmUserDeleteMsg();
    await waitForTimeOut(this.page, 1500);
  }

  async removeUser(selectedUser: string): Promise<void> {
    await this.waitForPageIdle();
    // Search for user to bring into viewport (virtual scrolling)
    await this.searchForElement(selectedUser);
    await this.clickUserCheckboxBtn(selectedUser);
    await this.clickDeleteUsersBtn();
    await this.clickConfirmUserDeleteMsg();
  }

  async searchForElement(element: string): Promise<void> {
    await this.fillSearchInput(element);
    await this.page.keyboard.press("Enter");
  }

  async getTableRolesCount(): Promise<number> {
    await this.page.waitForTimeout(1000);
    const count = await this.tableRoles
      .filter({ hasNot: this.fakeRow })
      .count();
    return count;
  }
}
