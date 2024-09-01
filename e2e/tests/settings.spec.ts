import { expect, test } from "@playwright/test";
import urls  from '../config/urls.json'
import  BrowserWrapper  from "../infra/ui/browserWrapper";
import  SettingsPage  from "../logic/POM/settingsPage";

test.describe('Settings Tests', () => {
    let browser : BrowserWrapper;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })

    test("Add one new user -> validating user exists in the users list", async () => {
        const settingsPage = await browser.createNewPage(SettingsPage, urls.settingsUrl)
        await settingsPage.navigateToUserTab();
        const username = `user_${Date.now()}`
        await settingsPage.addUser({userName: username, role: 'Read-Write', password: "Pass123@", confirmPassword: "Pass123@"});
        const isVisible = await settingsPage.verifyUserExists(username)
        await settingsPage.removeUserByHover(username)
        expect(isVisible).toBe(true)
    })

    test("Add one user -> remove one user by hover -> Validate that the user has been removed", async () => {
        // Adding one user
        const settingsPage = await browser.createNewPage(SettingsPage, urls.settingsUrl)
        await settingsPage.navigateToUserTab();
        const username = `user_${Date.now()}`
        await settingsPage.addUser({userName: username, role: 'Read-Write', password: "Pass123@", confirmPassword: "Pass123@"});
        // Deleting one user
        await settingsPage.removeUserByHover(username)
        await settingsPage.refreshPage()
        await settingsPage.navigateToUserTab()
        const isVisible = await settingsPage.verifyUserExists(username)
        expect(isVisible).toBe(false)
        
    })

    test("Add one user -> change the role -> Validate that the user role have been changed", async () => {
        // Adding one user
        const settingsPage = await browser.createNewPage(SettingsPage, urls.settingsUrl)
        await settingsPage.navigateToUserTab();
        const username = `user_${Date.now()}`
        await settingsPage.addUser({userName: username, role: 'Read-Write', password: "Pass123@", confirmPassword: "Pass123@"});
        
        // modify user role
        await settingsPage.modifyUserRole(username, '3')
        const newUserRole = await settingsPage.getUserRole(username)
        await settingsPage.removeUserByHover(username)
        expect(newUserRole).toBe("Read-Only")
            
    })

    test("Add two users -> change their roles via checkbox -> Validate that the users roles have been changed", async () => {
        // Adding two user
        const settingsPage = await browser.createNewPage(SettingsPage, urls.settingsUrl)
        await settingsPage.navigateToUserTab();
        const username1 = `user_${Date.now()}`
        await settingsPage.addUser({userName: username1, role: 'Read-Write', password: "Pass123@", confirmPassword: "Pass123@"});
        const username2 = `user_${Date.now()}`
        await settingsPage.addUser({userName: username2, role: 'Read-Write', password: "Pass123@", confirmPassword: "Pass123@"});
        
        // modify users roles
        await settingsPage.modifyTwoUsersRolesByCheckbox(username1, username2)
        await settingsPage.refreshPage()
        await settingsPage.navigateToUserTab()
        const userName1Role = await settingsPage.getUserRole(username1)
        const userName2Role = await settingsPage.getUserRole(username2)
        await settingsPage.deleteTwoUsersByCheckbox(username1, username2)
        expect([userName1Role, userName2Role]).toEqual(["Read-Only", "Read-Only"])   
    })

    test("Add two users -> delete the two users by checkbox -> Validate that the users have been deleted", async () => {
        // Adding two user
        const settingsPage = await browser.createNewPage(SettingsPage, urls.settingsUrl)
        await settingsPage.navigateToUserTab();
        const username1 = `user_${Date.now()}`
        await settingsPage.addUser({userName: username1, role: 'Read-Write', password: "Pass123@", confirmPassword: "Pass123@"});
        await settingsPage.refreshPage()
        await settingsPage.navigateToUserTab()
        const username2 = `user_${Date.now()}`
        await settingsPage.addUser({userName: username2, role: 'Read-Write', password: "Pass123@", confirmPassword: "Pass123@"});
        
        // delete two users
        await settingsPage.deleteTwoUsersByCheckbox(username1, username2)
        const isVisible1 = await settingsPage.verifyUserExists(username1)
        const isVisible2 = await settingsPage.verifyUserExists(username2)
        expect([isVisible1, isVisible2]).toEqual([false, false])
            
    })

    const searchData = [
        { invalidPassword: 'Test123', description: "short password"},
        { invalidPassword: 'Test1234', description: "without special character"},
        { invalidPassword: 'Testtes@', description: "without digits"},
        { invalidPassword: 'TESTES1@', description: "without lowercase letters"},
        { invalidPassword: 'testte1@', description: "without uppercase letters"},
        { invalidPassword: '', description: "without password"}
    ];

    searchData.forEach(({ invalidPassword, description }) => {
        test(`Enter password for new user: ${invalidPassword} reason: ${description} `, async () => {
            const settingsPage = await browser.createNewPage(SettingsPage, urls.settingsUrl)
            await settingsPage.navigateToUserTab();
            const username = `user_${Date.now()}`
            await settingsPage.addUser({userName: username, role: 'Read-Write', password: invalidPassword, confirmPassword: invalidPassword});
            await settingsPage.refreshPage()
            await settingsPage.navigateToUserTab();
            const isVisible = await settingsPage.verifyUserExists(username)
            expect(isVisible).toEqual(false)
        });
    })

    test("Add a user without assigning a role -> Verify that the user has not been added", async () => {
        const settingsPage = await browser.createNewPage(SettingsPage, urls.settingsUrl)
        await settingsPage.navigateToUserTab();
        const username = `user_${Date.now()}`
        await settingsPage.attemptToAddUserWithoutRole({userName: username, password: "Pass123@", confirmPassword: "Pass123@"});
        await settingsPage.refreshPage()
        await settingsPage.navigateToUserTab()
        const isVisible = await settingsPage.verifyUserExists(username)
        expect(isVisible).toBe(false)
    })

    test("Attempt to delete the default admin user -> Verify that the user has not been deleted.", async () => {
        const settingsPage = await browser.createNewPage(SettingsPage, urls.settingsUrl)
        await settingsPage.navigateToUserTab();
        await settingsPage.removeUserByCheckbox('default')
        await settingsPage.refreshPage()
        await settingsPage.navigateToUserTab()
        const isVisible = await settingsPage.verifyUserExists('default');
        expect(isVisible).toBe(true)
    })


})
