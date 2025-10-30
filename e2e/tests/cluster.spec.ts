import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import LoginPage from "../logic/POM/loginPage";
import GraphPage from "../logic/POM/graphPage";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

// Cluster configuration for testing
const CLUSTER_NODES = [
  { host: "localhost", port: "6380" },
  { host: "localhost", port: "6381" },
  { host: "localhost", port: "6382" },
];

test.describe("Cluster Functionality Tests", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test.describe("Connection Management", () => {
    test("@cluster Connect to cluster node via host/port fields", async () => {
      const loginPage = await browser.createNewPage(LoginPage, urls.loginUrl);
      await browser.setPageToFullScreen();

      const node = CLUSTER_NODES[0];
      await loginPage.fillHost(node.host);
      await loginPage.fillPort(node.port);
      await loginPage.clickConnect();
      await loginPage.waitForSuccessfulLogin(urls.graphUrl);

      expect(loginPage.getCurrentURL()).toBe(urls.graphUrl);
    });

    CLUSTER_NODES.forEach((node, index) => {
      test(`@cluster Connect to individual cluster node ${index + 1} (${
        node.host
      }:${node.port})`, async () => {
        const loginPage = await browser.createNewPage(LoginPage, urls.loginUrl);
        await browser.setPageToFullScreen();

        await loginPage.fillHost(node.host);
        await loginPage.fillPort(node.port);
        await loginPage.clickConnect();
        await loginPage.waitForSuccessfulLogin(urls.graphUrl);

        expect(loginPage.getCurrentURL()).toBe(urls.graphUrl);
      });
    });

    test("@cluster Test connection with invalid cluster node address", async () => {
      const loginPage = await browser.createNewPage(LoginPage, urls.loginUrl);
      await browser.setPageToFullScreen();

      await loginPage.fillHost("unreachable-host");
      await loginPage.fillPort("9999");
      await loginPage.clickConnect();
      expect(loginPage.getCurrentURL()).toContain("login");
    });
  });

  test.describe("Host and Port Field Validation", () => {
    test("@cluster Host and port fields accept cluster node configurations", async () => {
      const loginPage = await browser.createNewPage(LoginPage, urls.loginUrl);
      await browser.setPageToFullScreen();
      
      for (const node of CLUSTER_NODES) {
        await loginPage.fillHost(node.host);
        await loginPage.fillPort(node.port);
        expect(await loginPage.getHost()).toBe(node.host);
        expect(await loginPage.getPort()).toBe(node.port);
        await loginPage.fillHost("");
        await loginPage.fillPort("");
      }
      
      expect(CLUSTER_NODES.length).toBeGreaterThan(0);
    });

    test("@cluster Form validation prevents submission with incomplete cluster config", async () => {
      const loginPage = await browser.createNewPage(LoginPage, urls.loginUrl);
      await browser.setPageToFullScreen();
      await loginPage.fillHost(CLUSTER_NODES[0].host);
      await loginPage.clickConnect();
      expect(loginPage.getCurrentURL()).toContain("login");
    });
  });

  test.describe("Navigation and Session Management", () => {
    test("@cluster Session persists across page navigation with cluster connections", async () => {
      const loginPage = await browser.createNewPage(LoginPage, urls.loginUrl);
      await browser.setPageToFullScreen();

      await loginPage.fillHost(CLUSTER_NODES[0].host);
      await loginPage.fillPort(CLUSTER_NODES[0].port);
      await loginPage.clickConnect();
      await loginPage.waitForSuccessfulLogin(urls.graphUrl);
      await loginPage.handleSkipTutorial();
      await loginPage.refreshPage();

      await loginPage.clickOnSettingsBtn();
      expect(loginPage.getCurrentURL()).toContain("/settings");

      await loginPage.clickOnSchemasButton();
      expect(loginPage.getCurrentURL()).toContain("/schema");

      await loginPage.clickOnGraphsButton();
      expect(loginPage.getCurrentURL()).toContain("/graph");

      await loginPage.refreshPage();
      expect(loginPage.getCurrentURL()).toContain("/graph");
    });

    test("@cluster Logout functionality works with cluster connections", async () => {
      const loginPage = await browser.createNewPage(LoginPage, urls.loginUrl);
      await browser.setPageToFullScreen();

      await loginPage.fillHost(CLUSTER_NODES[0].host);
      await loginPage.fillPort(CLUSTER_NODES[0].port);
      await loginPage.clickConnect();
      await loginPage.waitForSuccessfulLogin(urls.graphUrl);
      await loginPage.handleSkipTutorial();
      await loginPage.refreshPage();
      await loginPage.Logout();
      expect(loginPage.getCurrentURL()).toContain("/login");
    });
  });

  test.describe("Graph Operations with Cluster", () => {
    test("@cluster Graph operations work consistently across cluster", async () => {
      const loginPage = await browser.createNewPage(LoginPage, urls.loginUrl);
      await browser.setPageToFullScreen();

      await loginPage.fillHost(CLUSTER_NODES[0].host);
      await loginPage.fillPort(CLUSTER_NODES[0].port);
      await loginPage.clickConnect();
      await loginPage.waitForSuccessfulLogin(urls.graphUrl);
      await loginPage.handleSkipTutorial();

      const graphPage = await browser.createNewPage(GraphPage, urls.graphUrl);
      const graphName = getRandomString("cluster-test");

      await graphPage.addGraph(graphName);
      await graphPage.insertQuery(
        "CREATE (n:Person {name: 'ClusterTest'}) RETURN n"
      );
      await graphPage.clickRunQuery();

      expect(await graphPage.getNodesCount()).toBe("1");
      await apiCall.removeGraph(graphName);
    });
  });
});
