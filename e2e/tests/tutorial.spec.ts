import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import TutorialPanel from "../logic/POM/tutorialPanelComponent";

test.describe(`Tutorial Test`, () => {
  let browser: BrowserWrapper;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test("@admin validate that clicking away doesn't dismisses the tutorial", async () => {
    const tutorial = await browser.createNewPage(TutorialPanel, urls.graphUrl);
    await tutorial.changeLocalStorage("true");
    await tutorial.refreshPage();
    await tutorial.clickAtTopLeftCorner();
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    expect(await tutorial.isTutorialVisible()).toBeTruthy();
    await tutorial.changeLocalStorage("false");
  });
  
  test.only("@admin validate that clicking replay tutorial replay tutorial", async () => {
    const tutorial = await browser.createNewPage(TutorialPanel, urls.settingsUrl);
    await tutorial.clickReplayTutorial()
    expect(await tutorial.isTutorialVisible()).toBeTruthy();
  });
});
