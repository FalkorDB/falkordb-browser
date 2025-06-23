import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import LoginPage from "../logic/POM/loginPage";
import GraphPage from "../logic/POM/graphPage";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

// Cluster configuration for testing
const CLUSTER_NODES = [
    { host: 'node1', port: '6380' },
    { host: 'node2', port: '6381' },
    { host: 'node2', port: '6382' }
];

test.describe('Cluster Functionality Tests', () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apiCall = new ApiCalls();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test.describe('Connection Management', () => {
        test('@cluster Connect to cluster node via host/port fields', async () => {
            const loginPage = await browser.createNewPage(LoginPage, urls.loginUrl);
            await browser.setPageToFullScreen();
            
            const node = CLUSTER_NODES[0];
            await loginPage.fillHost(node.host);
            await loginPage.fillPort(node.port);
            await loginPage.clickConnect();
            await loginPage.waitForSuccessfulLogin(urls.graphUrl);
            
            expect(loginPage.getCurrentURL()).toBe(urls.graphUrl);
        });

        // OPTION 2: Add parameterized test (tests individual node connections)
        CLUSTER_NODES.forEach((node, index) => {
            test(`@cluster Connect to individual cluster node ${index + 1} (${node.host}:${node.port})`, async () => {
                const loginPage = await browser.createNewPage(LoginPage, urls.loginUrl);
                await browser.setPageToFullScreen();
                
                await loginPage.fillHost(node.host);
                await loginPage.fillPort(node.port);
                await loginPage.clickConnect();
                await loginPage.waitForSuccessfulLogin(urls.graphUrl);
                
                expect(loginPage.getCurrentURL()).toBe(urls.graphUrl);
            });
        });

        test('@cluster Test connection with invalid cluster node address', async () => {
            const loginPage = await browser.createNewPage(LoginPage, urls.loginUrl);
            await browser.setPageToFullScreen();
            
            await loginPage.fillHost('unreachable-host');
            await loginPage.fillPort('9999');
            await loginPage.clickConnect();
            // Note: Not adding waitForSuccessfulLogin here since this should fail
            
            // Should remain on login page or show error
            expect(loginPage.getCurrentURL()).toContain('login');
        });
    });
    
});