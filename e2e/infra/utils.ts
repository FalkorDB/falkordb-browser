/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import { Locator, Page } from "playwright";

export function delay(ms: number) {
    return new Promise(resolve => { setTimeout(resolve, ms) });
}

export const waitForElementToBeVisible = async (locator: Locator, time = 400, retry = 5): Promise<boolean> => {

    while (retry > 0) {
        if (await locator.isVisible()) {
            return true
        }
        retry -= 1
        await delay(time)
    }
    return false
}

export const waitForTimeOut = async (page: Page, time = 500) => {
    await page.waitForTimeout(time);
}

export async function waitForURL(page: Page, expectedURL: string, timeout: number = 30000, interval: number = 1000): Promise<void> {
    let elapsed = 0;

    while (elapsed < timeout) {
        const currentURL = page.url();
        if (currentURL === expectedURL) {
            return;
        }
        await new Promise(resolve => { setTimeout(resolve, interval) });
        elapsed += interval;
    }

    throw new Error(`Timed out waiting for URL to be ${expectedURL}. Current URL is ${page.url()}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function findNodeByName(nodes: { name: string }[], nodeName: string): any {
    return nodes.find((node) => node.name === nodeName);
}
