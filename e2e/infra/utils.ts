import { Locator, Page } from "playwright";

export const waitForElementToBeVisible = async (locator:Locator,time=400,retry=5):Promise<boolean> => {

    while(retry >0){
       if(await locator.isVisible()){
        return true
       }
       retry = retry-1
       await delay(time)
    }
    return false
}

export function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export const waitForTimeOut = async (page: Page, time=500) => {
    await page.waitForTimeout(time);
}

export async function waitForURL(page: Page, expectedURL: string, timeout: number = 30000, interval: number = 1000): Promise<void> {
    let elapsed = 0;

    while (elapsed < timeout) {
        const currentURL = page.url();
        if (currentURL === expectedURL) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
        elapsed += interval;
    }

    throw new Error(`Timed out waiting for URL to be ${expectedURL}. Current URL is ${page.url()}`);
}
