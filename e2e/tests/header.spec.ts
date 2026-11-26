import { expect, test } from "../infra/coverage";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import NavBarComponent from "../logic/POM/headerComponent";
import { initializeLocalStorage, normalizeUrl, urlPath } from "../infra/utils";

test.describe(`Header tests`, () => {
  let browser: BrowserWrapper;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test(`@admin Verify clicking on FalkorDB logo redirects to specified URL`, async () => {
    const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl);
    const href = await navBar.getFalkorDBLogoHref();
    expect(normalizeUrl(href)).toBe(normalizeUrl(urls.falkorDBWeb));
  });

  test(`@admin Verify clicking on Graphs button redirects to specified URL`, async () => {
    const navBar = await browser.createNewPage(NavBarComponent, urls.settingsUrl);
    await navBar.clickOnGraphsButton();
    const newUrl = navBar.getCurrentURL();
    // Ignore a `?tab=<id>` query the app may append (see urlPath).
    expect(urlPath(newUrl)).toBe(urlPath(urls.graphUrl));
  });

  test(`@admin Verify header graphs count matches API`, async () => {
    // Fixed responses: the real graph list is shared with parallel workers that
    // create and delete graphs, so comparing it with a second live read races.
    const graphNames = ["header-count-a", "header-count-b", "header-count-c"];
    await browser.createNewPage(NavBarComponent);
    const page = await browser.getPage();
    await page.route("**/api/graph", (route) => route.fulfill({ json: { opts: graphNames } }));
    await page.route("**/api/graph/stubs", (route) => route.fulfill({ json: { stubs: [] } }));
    const navBar = new NavBarComponent(page);
    await page.goto(urls.graphUrl);
    await navBar.waitForGraphsCountValue();

    expect(await navBar.getGraphsCountValue()).toBe(graphNames.length);
  });

  test(`@admin Verify header graphs loader is shown while graph list is fetching`, async ({ browser: pwBrowser }) => {
    const context = await pwBrowser.newContext({
      storageState: 'playwright/.auth/admin.json',
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    try {
      const page = await context.newPage();
      await page.addInitScript(initializeLocalStorage("localhost", 6379));

      let releaseGraphRequest!: () => void;
      const blockGraphRequest = new Promise<void>((resolve) => {
        releaseGraphRequest = resolve;
      });

      await page.route("**/api/graph", async (route) => {
        await blockGraphRequest;
        await route.continue();
      });

      const navBar = new NavBarComponent(page);
      const requestPromise = page.waitForRequest("**/api/graph");
      await page.goto(urls.graphUrl, { waitUntil: 'domcontentloaded' });
      await requestPromise;
      await navBar.waitForGraphsCountLoader();

      releaseGraphRequest();
      await navBar.waitForGraphsCountValue();
    } finally {
      await context.close();
    }
  });

  test(`@admin Verify clicking on help -> Documentation redirects to specified URL`, async () => {
    const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl);
    const href = await navBar.getDocumentationLinkHref();
    expect(href).toBe(urls.documentationUrl);
  });

  test(`@admin Verify clicking on help -> API Documentation redirects to specified URL`, async () => {
    const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl);
    const page = await navBar.clickOnApiDocumentation();
    expect(new URL(page.url()).pathname).toBe('/docs');
  });

  test(`@admin Verify clicking on help -> Support redirects to specified URL`, async () => {
    const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl);
    const href = await navBar.getSupportLinkHref();
    expect(href).toBe(urls.supportUrl);
  });

  test(`@admin Verify Help -> About Popup opens and closes correctly`, async () => {
    const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl);
    await navBar.clickOnAbout();
    expect(await navBar.isAboutPopUp()).toBe(true);
    await navBar.closePopUp();
    expect(await navBar.isAboutPopUp()).toBe(false);
  });
});
