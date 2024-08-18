import { expect, test } from "@playwright/test";
import urls  from '../config/urls.json'
import user from '../config/user.json'
import { BrowserWrapper } from "../infra/ui/browserWrapper";
import { SettingsPage } from "../logic/POM/settingsPage";

test.describe('Settings Tests', () => {
    let browser : BrowserWrapper;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })

    test.afterEach(async () => {
        const settingsPage = await browser.createNewPage(SettingsPage, urls.settingsUrl)
        await settingsPage.navigateToUserTab();
        await settingsPage.deleteAllUsers()
    })

    test("Add one new user -> validating one user exists in the users list", async () => {
        const settingsPage = await browser.createNewPage(SettingsPage, urls.settingsUrl)
        await settingsPage.navigateToUserTab();
        const preUsersCount = await settingsPage.countUsersInTable();
        await settingsPage.addOneUser(user.user1);
        const postUserCount = await settingsPage.countUsersInTable();
        expect(postUserCount).toEqual(preUsersCount + 1)
    })

    test("Add one user -> remove one user -> Validate that the user has been removed", async () => {
        // Adding one user
        const settingsPage = await browser.createNewPage(SettingsPage, urls.settingsUrl)
        await settingsPage.navigateToUserTab();
        const preUsersCount = await settingsPage.countUsersInTable();
        await settingsPage.addOneUser(user.user1);
       
        await settingsPage.refreshPage();
        await settingsPage.navigateToUserTab();
        // Deleting one user
        await settingsPage.removeOneUser();
        const currentUserCount = await settingsPage.countUsersInTable()
        expect(currentUserCount).toEqual(preUsersCount)
        
    })

    // test("Add one user -> change the role -> Validate that the user role have been changed", async () => {
    //     // Adding one user
    //     const settingsPage = await browser.createNewPage(SettingsPage, urls.settingsUrl)
    //     await settingsPage.navigateToUserTab();
    //     await settingsPage.addOneUser(user.user1);
        
    //     // modify user role
    //     await settingsPage.modifyOneUserRole()
    //     await settingsPage.refreshPage()
    //     await settingsPage.navigateToUserTab()
    //     const newUserRole = await settingsPage.getSecondNewUserRole()
    //     console.log("newRole: ",newUserRole);
        
    //     expect(newUserRole).toBe("Read-Only")
            
    // })

    // test("Add two users -> change their roles via checkbox -> Validate that the users roles have been changed", async () => {
    //     // Adding two user
    //     const settingsPage = await browser.createNewPage(SettingsPage, urls.settingsUrl)
    //     await settingsPage.navigateToUserTab();
    //     await settingsPage.addOneUser(user.user1);
    //     await settingsPage.refreshPage()
    //     await settingsPage.navigateToUserTab()
    //     await settingsPage.addOneUser(user.user2);
        
    //     // modify users roles
    //     await settingsPage.modifyTwoUsersRolesByCheckbox()
    //     await settingsPage.refreshPage()
    //     await settingsPage.navigateToUserTab()
    //     const newSecondUserRole = await settingsPage.getSecondNewUserRole()
    //     const newThirdUserRole = await settingsPage.getThirdNewUserRole()
    //     console.log("newRole2: ",newSecondUserRole);
    //     console.log("newRole3: ",newThirdUserRole);
        
    //     expect([newSecondUserRole, newThirdUserRole]).toEqual(["Read-Only", "Read-Only"])
            
    // })

    test("Add two users -> delete the two users -> Validate that the users have been deleted", async () => {
        // Adding two user
        const settingsPage = await browser.createNewPage(SettingsPage, urls.settingsUrl)
        await settingsPage.navigateToUserTab();
        const preUsersCount = await settingsPage.countUsersInTable();
        await settingsPage.addOneUser(user.user1);
        await settingsPage.refreshPage();
        await settingsPage.navigateToUserTab()
        await settingsPage.addOneUser(user.user2);
        
        // delete two users
        await settingsPage.deleteTwoUsersByCheckbox()
        const currentUserCount = await settingsPage.countUsersInTable()
        expect(currentUserCount).toEqual(preUsersCount)
            
    })


})
