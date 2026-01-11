import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import NavBarComponent from "../logic/POM/headerComponent";
import { normalizeUrl } from "../infra/utils";

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
    const navBar = await browser.createNewPage(NavBarComponent, urls.schemaUrl);
    await navBar.clickOnGraphsButton();
    const newUrl = navBar.getCurrentURL();
    expect(newUrl).toBe(urls.graphUrl);
  });

  // test(`@admin Verify clicking on Schemas button redirects to specified URL`, async () => {
  //   const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl);
  //   await navBar.clickOnSchemasButton();
  //   const newUrl = navBar.getCurrentURL();
  //   expect(newUrl).toBe(urls.schemaUrl);
  // });

  test(`@admin Verify clicking on help -> Documentation redirects to specified URL`, async () => {
    const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl);
    const href = await navBar.getDocumentationLinkHref();
    expect(href).toBe(urls.documentationUrl);
  });

  test(`@admin Verify clicking on help -> API Documentation redirects to specified URL`, async () => {
    const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl);
    const href = await navBar.getApiDocumentationLinkHref();
    expect(href).toContain('/docs');
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
